using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class XuLyDangNhap : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;
        private readonly IConfiguration _configuration;

        public XuLyDangNhap(QuanLyKhuNhaTro context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public class XuLyDangNhapRequest
        {
            public string UserName { get; set; }
            public string PassWord { get; set; }
        }

        [HttpPost("DangNhap")]
        [AllowAnonymous]
        public async Task<IActionResult> DangNhap([FromBody] XuLyDangNhapRequest request)
        {
            if (string.IsNullOrEmpty(request.UserName) || string.IsNullOrEmpty(request.PassWord))
            {
                return BadRequest(new { message = "Không được để trống username và password" });
            }

            var user = _context.ACCOUNT.FirstOrDefault(u => u.Username == request.UserName);

            if (user == null)
            {
                return BadRequest(new { message = "Không có tài khoản này!" });
            }

            bool isValid = BCrypt.Net.BCrypt.Verify(request.PassWord, user.Passwords);

            if (!isValid)
            {
                return BadRequest(new { message = "Mật khẩu sai vui lòng nhập lại" });
            }

            // ============================================================
            // BẮT ĐẦU XỬ LÝ LƯU COOKIE PHÂN QUYỀN
            // ============================================================

            // 1. Tạo danh sách các thông tin định danh (Claims)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Roles) // Quan trọng: roles này dùng để check [Authorize(Roles="...")]
            };

            // 2. Tạo Identity (Thẻ căn cước)
            var claimsIdentity = new ClaimsIdentity(claims, "MyCookieAuth");

            // 3. Cấu hình các tùy chọn cho Cookie (Ví dụ: ghi nhớ đăng nhập)
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true, // Ghi nhớ đăng nhập ngay cả khi đóng trình duyệt
                ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(30) // Hết hạn sau 30 phút
            };

            // 4. Thực hiện đăng nhập vào hệ thống
            await HttpContext.SignInAsync(
                "MyCookieAuth",
                new ClaimsPrincipal(claimsIdentity),
                authProperties);

            // ============================================================

            return Ok(new { message = "Đăng nhập thành công!", chucVu = user.Roles });
        }

        // Thêm hàm đăng xuất để xóa Cookie
        [HttpPost("DangXuat")]
        public async Task<IActionResult> DangXuat()
        {
            await HttpContext.SignOutAsync("MyCookieAuth");
            return Ok(new { message = "Đã đăng xuất" });
        }
    }
}