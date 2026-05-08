using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

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
        //Xử lý đăng nhập đầu vào
        public class XuLyDangNhapRequest
        {
            public string UserName { get; set; }
            public string PassWord { get; set; }
        }
        // Chi tiết kết nối đăng nhập
        [HttpPost("DangNhap")]
        public IActionResult DangNhap([FromBody] XuLyDangNhapRequest request)
        {
            if (string.IsNullOrEmpty(request.UserName) || string.IsNullOrEmpty(request.PassWord))
            {
                return BadRequest(new { message = "Không được để trống username và password" });
            }
             var user = _context.ACCOUNT.FirstOrDefault(u => u.Username == request.UserName);
            // kiểm tra xem user có rỗng
            if (user == null)
            {
                return BadRequest(new { message = "Không có tài khoản này!" });                
            }
           bool isValid = BCrypt.Net.BCrypt.Verify(request.PassWord, user.Passwords);
            //kiểm tra mặt khẩu
            if (!isValid)
            {
                return BadRequest(new { message = "Mật khẩu sai vui lòng nhập lại" });
            }
            return Ok(new { message = "Đăng nhập thành công!", chucVu = user.Roles });
        }
        public class XuLyDangKyRequest
        {
            public string UserNameDK { get; set; }
            public string PassWordDK { get; set; }
        }
        [HttpPost("DangKy")]
        public IActionResult DangKy([FromBody] XuLyDangKyRequest request)
        {
            //Kiểm tra username có tồn tại chưa
            var user = _context.ACCOUNT.FirstOrDefault(u => u.Username == request.UserNameDK);
            if(user != null)
            {
                return BadRequest(new { message = "Tài khoản đã tồn tại!"});
            }
            //Bắt đầu băm mật khẩu
            string HashPassword = BCrypt.Net.BCrypt.HashPassword(request.PassWordDK);
            //Tạo tài khoản mới
            var NewUser = new ACCOUNT
            {
                Username = request.UserNameDK,
                Passwords = HashPassword,
                Roles = "User",
                CreatedAt = DateTime.Now,
                FullName = "Pin Vũ Trụ",
                Phone = "0123456789",
                QR_Link = "abc.com"
            };
            _context.ACCOUNT.Add(NewUser);
            _context.SaveChanges();
            return Ok(new { message = "Đăng ký thành công!" });
        }
    }
}