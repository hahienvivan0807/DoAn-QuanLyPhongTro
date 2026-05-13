using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;
using BCrypt.Net;
namespace QuanLyNhaTro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChuTroThemNguoiThueController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;
        private readonly IConfiguration _configuration;

        public ChuTroThemNguoiThueController(QuanLyKhuNhaTro context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        public class NguoiThueRequest
        {
            public string HoTen { get; set; }
            public string Username { get; set; }
            public string SoDienThoai { get; set; }
            public string MatKhau { get; set; }

            public string SoPhong { get; set; }
            public string Email { get; set; }

            public DateTime NgayBatDau { get; set; }
            public DateTime? NgayKetThuc { get; set; }

            public decimal TienCoc { get; set; }
            public decimal GiaThue { get; set; }

            public int ChiSoDien { get; set; }
            public int ChiSoNuoc { get; set; }
        }
        [HttpPost("them-nguoi-thue")]
        public async Task<IActionResult> ThemNguoiThue([FromBody] NguoiThueRequest request)
        {

            if (request.NgayKetThuc.HasValue)
            {
                if (request.NgayKetThuc.Value.Date <= request.NgayBatDau.Date)
                    return BadRequest(new { message = "Ngày kết thúc phải lớn hơn ngày bắt đầu!" });
            }
            // Validate SĐT trùng
            var user = await _context.ACCOUNT.FirstOrDefaultAsync(u => u.Phone == request.SoDienThoai);
            if (string.IsNullOrWhiteSpace(request.SoDienThoai))
                return BadRequest(new { message = "SĐT rỗng" });
            if(string.IsNullOrWhiteSpace(request.HoTen))
                return BadRequest(new { message = "Họ Tên rỗng" });
            if (string.IsNullOrWhiteSpace(request.Username))
                return BadRequest(new { message = "Username rỗng" });
            if (user != null) {
                return BadRequest(new { message = "Số điện thoại đã tồn tại!" });
            }
            if (string.IsNullOrWhiteSpace(request.MatKhau))
                return BadRequest(new { message = "Mật khẩu rỗng" });
            if (string.IsNullOrWhiteSpace(request.SoPhong))
                return BadRequest(new { message = "Số phòng rỗng" });
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new { message = "Email rỗng" });
            if (request.ChiSoDien < 0)
                return BadRequest(new { message = "Chỉ số điện không hợp lệ" });
            if (request.ChiSoNuoc < 0)
                return BadRequest(new { message = "Chỉ số nước không hợp lệ" });

            // Validate username trùng
            var usernameTrung = await _context.ACCOUNT.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (usernameTrung != null)
                return BadRequest(new { message = "Username đã tồn tại!" });

            // Validate phòng tồn tại và còn trống
            var phong = await _context.PHONG.FirstOrDefaultAsync(p => p.SoPhong == request.SoPhong);
            if (phong == null)
                return BadRequest(new { message = "Phòng không tồn tại!" });
            if (phong.TrangThai != "Trống")
                return BadRequest(new { message = "Phòng này đã có người thuê!" });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. INSERT ACCOUNT
                string hashPassword = BCrypt.Net.BCrypt.HashPassword(request.MatKhau);
                var newAccount = new ACCOUNT
                {
                    FullName = request.HoTen,
                    Passwords = hashPassword,
                    Phone = request.SoDienThoai,
                    Roles = "Tenant", 
                    Email = request.Email,
                    Username = request.Username,
                    QR_Link = "abc",
                    CreatedAt = DateTime.Now
                };
                _context.ACCOUNT.Add(newAccount);
                await _context.SaveChangesAsync();  
                
                // 2. UPDATE PHONG
                phong.TrangThai = "Đã thuê";
                await _context.SaveChangesAsync();

                // 3. INSERT HOPDONG
                var newHopDong = new HOPDONG
                {
                    IDUser = newAccount.IDUser,    
                    IDPhong = phong.IDPhong,     
                    NgayBatDau = request.NgayBatDau,
                    NgayKetThuc = request.NgayKetThuc,
                    DienDauKy = request.ChiSoDien,
                    NuocDauKy = request.ChiSoNuoc,
                    TrangThaiHD = "Đang hiệu lực"
                };
                _context.HOPDONG.Add(newHopDong);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { message = "Thêm người thuê thành công!", idUser = newAccount.IDUser });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Lỗi hệ thống!", detail = ex.Message });
            }
        }
    }
}
