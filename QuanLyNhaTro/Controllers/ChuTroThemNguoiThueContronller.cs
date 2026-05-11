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
    public class ChuTroThemNguoiThueContronller : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;
        private readonly IConfiguration _configuration;

        public ChuTroThemNguoiThueContronller(QuanLyKhuNhaTro context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        public class NguoiThueRequest
        {
            public string hoTen { get; set; }
            public string soPhong { get; set; }
            public string sdt { get; set; }
            public string matKhau { get; set; }
            public int dienDauKy { get; set; }
            public int nuocDauKy { get; set; }
            public string username { get; set; }

        }
        [HttpPost("them-nguoi-thue")]
        public async Task<IActionResult> ThemNguoiThue([FromBody] NguoiThueRequest request)
        {
            // Validate SĐT trùng
            var user = await _context.ACCOUNT.FirstOrDefaultAsync(u => u.Phone == request.sdt);
            if (user != null)
                return BadRequest(new { message = "Số điện thoại đã tồn tại!" });

            // Validate username trùng
            var usernameTrung = await _context.ACCOUNT.FirstOrDefaultAsync(u => u.Username == request.username);
            if (usernameTrung != null)
                return BadRequest(new { message = "Username đã tồn tại!" });

            // Validate phòng tồn tại và còn trống
            var phong = await _context.PHONG.FirstOrDefaultAsync(p => p.SoPhong == request.soPhong);
            if (phong == null)
                return BadRequest(new { message = "Phòng không tồn tại!" });
            if (phong.TrangThai != "Trống")
                return BadRequest(new { message = "Phòng này đã có người thuê!" });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. INSERT ACCOUNT
                string hashPassword = BCrypt.Net.BCrypt.HashPassword(request.matKhau);
                var newAccount = new ACCOUNT
                {
                    FullName = request.hoTen,
                    Passwords = hashPassword,
                    Phone = request.sdt,
                    Roles = "User", 
                    Username = request.username,
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
                    IDUser = newAccount.IDUser,    // ← lấy từ bước 1
                    IDPhong = phong.IDPhong,        // ← lấy từ validate phòng
                    NgayBatDau = DateTime.Now,
                    DienDauKy = request.dienDauKy,
                    NuocDauKy = request.nuocDauKy,
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
