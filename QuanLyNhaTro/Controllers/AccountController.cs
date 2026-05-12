using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

namespace QuanLyNhaTro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;

        public AccountController(QuanLyKhuNhaTro context)
        {
            _context = context;
        }
        public class RegisterRequest
        {
            public string Username { get; set; } = null!;
            public string Passwords { get; set; } = null!;
            public string FullName { get; set; } = null!;
            public string Phone { get; set; } = null!;
            public string? Email { get; set; }
            public string Roles { get; set; } = null!;
        }

        // POST: api/Account/Register
        [AllowAnonymous]
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // 1. Kiểm tra username đã tồn tại chưa
            if (await _context.ACCOUNT.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại!" });
            }

            // 2. Tạo đối tượng ACCOUNT mới
            var newAccount = new ACCOUNT
            {
                Username = request.Username,
                // Hash mật khẩu trước khi lưu
                Passwords = BCrypt.Net.BCrypt.HashPassword(request.Passwords),
                FullName = request.FullName,
                Phone = request.Phone,
                Email = request.Email,
                Roles = request.Roles, // 'Admin', 'Manager', hoặc 'Tenant'
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            try
            {
                _context.ACCOUNT.Add(newAccount);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Đăng ký tài khoản thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }

}