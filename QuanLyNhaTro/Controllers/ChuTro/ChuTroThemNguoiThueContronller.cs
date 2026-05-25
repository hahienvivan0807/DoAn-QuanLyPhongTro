using BCrypt.Net;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace QuanLyNhaTro.Controllers.ChuTro
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
            // Tab 1: Thông tin cơ bản
            public string HoTen { get; set; }
            public string SoDienThoai { get; set; }
            public string? Email { get; set; }
            public DateTime? NgaySinh { get; set; }
            public string? GioiTinh { get; set; }
            public string? SoCCCD { get; set; }
            public DateTime? NgayCapCCCD { get; set; }
            public string? NoiCapCCCD { get; set; }
            public string? NgheNghiep { get; set; }
            public string? LienHeKhan { get; set; }
            public string? SDTKhan { get; set; }

            // Tab 2: Cư trú & Tài khoản
            public string? DiaChi { get; set; }
            public string? TinhThanh { get; set; }
            public string? QueQuan { get; set; }
            public string? GhiChu { get; set; }
            public string Username { get; set; }
            public string Password { get; set; }

            // Tab 3: Phòng & Hợp đồng
            public DateTime NgayVaoO { get; set; }
            public int IDPhong { get; set; }
            public decimal TienCoc { get; set; } = 0;
            public DateTime? NgayKetThuc { get; set; }
            public int DienDauKy { get; set; } = 0;
            public int NuocDauKy { get; set; } = 0;
            public string? GhiChuHD { get; set; }

            // Ảnh
            public string? AnhChanDung { get; set; }
        }
        [HttpPost("them-nguoi-thue")]
        public async Task<IActionResult> ThemNguoiThue([FromBody] NguoiThueRequest req)
        {
            // ── Validate bắt buộc ──
            if (string.IsNullOrWhiteSpace(req.HoTen))
                return BadRequest(new { message = "Họ tên không được để trống" });
            if (string.IsNullOrWhiteSpace(req.SoDienThoai))
                return BadRequest(new { message = "Số điện thoại không được để trống" });
            if (string.IsNullOrWhiteSpace(req.Username))
                return BadRequest(new { message = "Tên đăng nhập không được để trống" });
            if (string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(new { message = "Mật khẩu không được để trống" });
            if (req.IDPhong <= 0)
                return BadRequest(new { message = "Vui lòng chọn phòng" });

            // ── Validate ngày ──
            if (req.NgayKetThuc.HasValue && req.NgayKetThuc.Value.Date <= req.NgayVaoO.Date)
                return BadRequest(new { message = "Ngày hết hạn HĐ phải sau ngày vào ở" });

            // ── Validate trùng ──
            bool sdtTrung = await _context.ACCOUNT.AnyAsync(u => u.Phone == req.SoDienThoai);
            if (sdtTrung)
                return BadRequest(new { message = "Số điện thoại đã tồn tại" });

            bool usernameTrung = await _context.ACCOUNT.AnyAsync(u => u.Username == req.Username);
            if (usernameTrung)
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });

            // ── Validate phòng ──
            var phong = await _context.PHONG.FirstOrDefaultAsync(p => p.IDPhong == req.IDPhong);
            if (phong == null)
                return BadRequest(new { message = "Phòng không tồn tại" });
            if (phong.TrangThai != "Trống")
                return BadRequest(new { message = "Phòng này đã có người thuê" });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. INSERT ACCOUNT
                var newAccount = new ACCOUNT
                {
                    FullName = req.HoTen.Trim(),
                    Username = req.Username.Trim(),
                    Passwords = BCrypt.Net.BCrypt.HashPassword(req.Password),
                    Phone = req.SoDienThoai.Trim(),
                    Email = req.Email?.Trim(),
                    Roles = "Tenant",
                    QR_Link = "",
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                };
                _context.ACCOUNT.Add(newAccount);
                await _context.SaveChangesAsync();

                // 2. INSERT KHACH_THUE
                var newKhachThue = new KHACH_THUE
                {
                    IDUser = newAccount.IDUser,
                    HoTen = req.HoTen.Trim(),
                    SoDienThoai = req.SoDienThoai.Trim(),
                    SoCCCD = req.SoCCCD?.Trim(),
                    NgaySinh = req.NgaySinh,
                    GioiTinh = req.GioiTinh,
                    QueQuan = req.QueQuan?.Trim(),
                    DiaChiThuongTru = req.DiaChi?.Trim(),
                    GhiChu = req.GhiChu?.Trim(),
                    AnhChanDung = req.AnhChanDung,
                    NgayVaoO = req.NgayVaoO,
                };
                _context.KHACH_THUE.Add(newKhachThue);

                // 3. INSERT HOPDONG
                var newHopDong = new HOPDONG
                {
                    IDUser = newAccount.IDUser,
                    IDPhong = req.IDPhong,
                    NgayBatDau = req.NgayVaoO,
                    NgayKetThuc = req.NgayKetThuc,
                    TienCocBanDau = req.TienCoc,
                    DienDauKy = req.DienDauKy,
                    NuocDauKy = req.NuocDauKy,
                    TrangThaiHD = "Đang hiệu lực",
                    GhiChu = req.GhiChuHD?.Trim(),
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                };
                _context.HOPDONG.Add(newHopDong);

                // 4. UPDATE PHONG → Đã thuê
                phong.TrangThai = "Đã thuê";

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
        public class ResetPasswordRequest
        {
            public string SDTKhach { get; set; }
            public string NewPassword { get; set; }
        }
        [HttpPost("reset-password")]
        public async Task<IActionResult> UpdateUser([FromBody] ResetPasswordRequest request)
        {
            var user = await _context.ACCOUNT.FirstOrDefaultAsync(u => u.Phone == request.SDTKhach);
            if(user == null)
            {
                return BadRequest(new { message = "Không tồn tại số điện thoại" });
            }
            string hashPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.Passwords = hashPassword;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật mật khẩu thành công" });
        }
    }
}
