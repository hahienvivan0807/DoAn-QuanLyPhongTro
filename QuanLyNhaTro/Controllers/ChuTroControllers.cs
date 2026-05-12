using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;
using System.Text.RegularExpressions; //Thư viện kiểm tra ký tự

namespace QuanLyNhaTro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class ChuTroController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;
        private readonly IConfiguration _configuration;

        public ChuTroController(QuanLyKhuNhaTro context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        public class TaoTaiKhoangRequest
        {
            public string Username { get; set; }
            public string Passwords { get; set; }
            public string FullName { get; set; }
            public string Phone { get; set; }
            public string Roles { get; set; }
        }
        [HttpPost("tao-tai-khoan")]
        public async Task<IActionResult> TaoTaiKhoan([FromBody] TaoTaiKhoangRequest request)
        {
            //Kiểm tra input rỗng
            if(string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Passwords) || string.IsNullOrWhiteSpace(request.Phone) || string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest(new { message = "Không được phép bỏ trống!" });
            }
            //Kiểm tra độ tên
            if (request.Username.Length > 50)
            {
                return BadRequest(new { message = "Username quá dài" });
            }
            //Kiểm tra các ký tự khi tạo tài khoản
            bool username_hopLe = Regex.IsMatch(request.Username, @"^[a-zA-Z0-9]+$");
            bool fullname_hople = Regex.IsMatch(request.FullName, @"^[\p{L}\s]+$");
            bool phone_hople = Regex.IsMatch(request.Phone, @"^[0-9]{10}$");

            if (!username_hopLe)
            {
                return BadRequest(new { message = "Username không hợp lệ!"});
            }
            if (!fullname_hople)
            { 
                return BadRequest(new { message = "FullName không hợp lệ!" });
            }
            if (!phone_hople)
            {
                return BadRequest(new { message = "Phone không hợp lệ!"});
            }
            // Xóa Khoảng trắng
            request.Username = request.Username.Trim();
            request.FullName = request.FullName.Trim();
            request.Phone = request.Phone.Trim();

            var user = _context.ACCOUNT.FirstOrDefault(u =>u.Username == request.Username ||u.Phone == request.Phone);

            if (user != null)
            {
                return BadRequest(new { message = "Tên đăng nhập hoặc đã tồn tại" });
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Passwords);
            var NewUser = new ACCOUNT {
                Username = request.Username,
                FullName = request.FullName,
                Passwords = passwordHash,
                Phone = request.Phone,
                Roles = request.Roles,
                QR_Link = "abc",
                CreatedAt = DateTime.Now
            };
            _context.Add(NewUser);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Tạo tài khoản thành công" });
        }
        [HttpGet("danh-sach-quan-ly")]
        public async Task<IActionResult> LayDanhSachQuanLy()
        {
            var ds = await _context.ACCOUNT
                .Where(u => u.Roles == "Manager" && u.IsActive)   // ✅ "Manager", có lọc IsActive
                .OrderBy(u => u.FullName)
                .Select(u => new {
                    u.IDUser,
                    u.Username,
                    u.FullName,
                    u.Phone,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(ds);
        }
        [HttpGet("danh-sach-nguoi-thue")]
        public async Task<IActionResult> LayDanhSachNguoiThue()
        {
            var ds = await _context.ACCOUNT
                .Where(u => u.Roles == "Tenant" && u.IsActive)
                .OrderBy(u => u.FullName)
                .Select(u => new {
                    u.IDUser,
                    u.Username,
                    u.FullName,
                    u.Phone,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(ds);
        }
        [HttpGet("chi-tiet-nguoi-thue/{id}")]
        public async Task<IActionResult> LayChiTietNguoiThue(int id)
        {
            // 1. JOIN Account -> HopDong -> Phong để lấy thông tin phòng hiện tại
            var chiTiet = await _context.ACCOUNT
                .Where(u => u.IDUser == id && u.Roles == "Tenant" && u.IsActive)
                .Select(u => new
                {
                    u.IDUser,
                    u.FullName,
                    u.Phone,
                    u.Username,
                    u.Email,
                    // Tìm hợp đồng đang hiệu lực của người này để lấy thông tin phòng
                    HopDongHienTai = u.HopDongTenants
                        .Where(hd => hd.TrangThaiHD == "Đang hiệu lực")
                        .Select(hd => new
                        {
                            hd.Phong.SoPhong,
                            hd.Phong.GiaPhongFix
                        }).FirstOrDefault() // Mỗi người thường chỉ có 1 hợp đồng đang active
                })
                .FirstOrDefaultAsync();

            if (chiTiet == null)
            {
                return NotFound(new { message = "Không tìm thấy người thuê hoặc tài khoản đã bị khóa." });
            }

            // 2. Lấy đơn giá điện, nước, rác từ bảng CONFIG_GIA (nếu có)
            var configGia = await _context.CONFIG_GIA
                .Where(c => c.IsActive)
                .ToListAsync();

            // Dựa vào MaDichVu của bạn để lấy đúng giá (Giả sử mã của bạn là DIEN, NUOC, RAC)
            var giaDien = configGia.FirstOrDefault(c => c.MaDichVu == "DIEN")?.DonGia ?? 0;
            var giaNuoc = configGia.FirstOrDefault(c => c.MaDichVu == "NUOC")?.DonGia ?? 0;
            var giaRac = configGia.FirstOrDefault(c => c.MaDichVu == "RAC")?.DonGia ?? 0;

            // 3. Map dữ liệu thành object JSON khớp chính xác với biến JS ở Frontend
            var result = new
            {
                idUser = chiTiet.IDUser,
                fullName = chiTiet.FullName,
                sdt = chiTiet.Phone, // Frontend của bạn đang gọi nt.sdt nên ở đây trả về 'sdt'
                cccd = "Chưa cập nhật (Thiếu trong DB)", // TODO: Thêm cột CCCD vào DB
        
                // Trích xuất từ Hợp Đồng/Phòng
                soPhong = chiTiet.HopDongHienTai != null ? chiTiet.HopDongHienTai.SoPhong : "Chưa xếp phòng",
                giaPhong = chiTiet.HopDongHienTai != null ? chiTiet.HopDongHienTai.GiaPhongFix : 0,
        
                // Trích xuất từ Config Giá
                tienDien = giaDien,
                tienNuoc = giaNuoc,
                tienRac = giaRac,
                email = chiTiet.Email
            };

            return Ok(result);
        }
    }

}
