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
        // GET /api/ChuTro/danh-sach-quan-ly
        [HttpGet("danh-sach-quan-ly")]
        public async Task<IActionResult> LayDanhSachQuanLy()
        {
            var danhSach = await _context.ACCOUNT
                .Where(u => u.Roles == "QuanLy")
                .Select(u => new {
                    u.IDUser,
                    u.Username,
                    u.FullName,
                    u.Phone,
                    u.Roles,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(danhSach);
        }
    }

}
