using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.Admin
{

    [Authorize(Roles = "Admin,Manager")]
    public class CaiDatModel : PageModel
    {
        // ── DI: DbContext ──────────────────────────────────────────
        private readonly QuanLyKhuNhaTro _context;

        public CaiDatModel(QuanLyKhuNhaTro context)
        {
            _context = context;
        }

        // ── Thuộc tính truyền xuống View ───────────────────────────
        public string TenHienThi { get; private set; } = string.Empty;
        public string UserName { get; private set; } = string.Empty;
        public string SoDienThoai { get; private set; } = string.Empty;
        public string? Email { get; private set; }
        public string VaiTro { get; private set; } = string.Empty;
        public DateTime NgayTao { get; private set; }

        // ===========================================================
        // GET – Tải thông tin tài khoản từ SQL qua DbContext
        // ===========================================================
        public IActionResult OnGet()
        {
            // Lấy IDUser từ Cookie Claims
            var chuoiId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(chuoiId) || !int.TryParse(chuoiId, out int idUser))
            {
                // Nếu không có claim hợp lệ thì chuyển về trang đăng nhập
                return RedirectToPage("/Index");
            }

            // Truy vấn ACCOUNT từ SQL Server qua EF Core
            var taiKhoan = _context.ACCOUNT.FirstOrDefault(a => a.IDUser == idUser);
            if (taiKhoan == null)
            {
                return RedirectToPage("/Index");
            }

            // Gán dữ liệu vào các thuộc tính để Razor render
            TenHienThi = taiKhoan.FullName;
            UserName = taiKhoan.Username;
            SoDienThoai = taiKhoan.Phone;
            Email = taiKhoan.Email;
            VaiTro = taiKhoan.Roles;
            NgayTao = taiKhoan.CreatedAt;

            return Page();
        }
    }
}


// ================================================================
// API CONTROLLER – XỬ LÝ ĐỔI MẬT KHẨU
// Route: POST /api/CaiDatTaiKhoan/DoiMatKhau
// ================================================================
namespace QuanLyNhaTro.Controllers
{
    using QuanLyNhaTro.Models;
    using System.Security.Claims;

    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class CaiDatTaiKhoanController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;

        public CaiDatTaiKhoanController(QuanLyKhuNhaTro context)
        {
            _context = context;
        }

        // ── DTO request đổi mật khẩu ──────────────────────────────
        public class YeuCauDoiMatKhau
        {
            public string MatKhauHienTai { get; set; } = string.Empty;
            public string MatKhauMoi { get; set; } = string.Empty;
            public string XacNhanMatKhau { get; set; } = string.Empty;
        }

        // ===========================================================
        // POST /api/CaiDatTaiKhoan/DoiMatKhau
        // Kiểm tra mật khẩu cũ → mã hóa BCrypt → cập nhật SQL
        // ===========================================================
        [HttpPost("DoiMatKhau")]
        public async Task<IActionResult> DoiMatKhau([FromBody] YeuCauDoiMatKhau yeuCau)
        {
            // ── 1. Kiểm tra đầu vào cơ bản ────────────────────────
            if (string.IsNullOrWhiteSpace(yeuCau.MatKhauHienTai) ||
                string.IsNullOrWhiteSpace(yeuCau.MatKhauMoi) ||
                string.IsNullOrWhiteSpace(yeuCau.XacNhanMatKhau))
            {
                return BadRequest(new { message = "Vui lòng điền đầy đủ tất cả các trường!" });
            }

            if (yeuCau.MatKhauMoi.Length < 8)
            {
                return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 8 ký tự!" });
            }

            if (yeuCau.MatKhauMoi != yeuCau.XacNhanMatKhau)
            {
                return BadRequest(new { message = "Mật khẩu xác nhận không khớp!" });
            }

            // ── 2. Xác định người dùng từ Cookie Claims ────────────
            var chuoiId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(chuoiId, out int idUser))
            {
                return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ!" });
            }

            // ── 3. Truy vấn ACCOUNT từ SQL Server ─────────────────
            var taiKhoan = _context.ACCOUNT.FirstOrDefault(a => a.IDUser == idUser);
            if (taiKhoan == null)
            {
                return NotFound(new { message = "Không tìm thấy tài khoản!" });
            }

            // ── 4. Xác minh mật khẩu hiện tại bằng BCrypt ─────────
            bool matKhauDung = BCrypt.Net.BCrypt.Verify(yeuCau.MatKhauHienTai, taiKhoan.Passwords);
            if (!matKhauDung)
            {
                return BadRequest(new { message = "Mật khẩu hiện tại không đúng!" });
            }

            // ── 5. Không cho đổi sang mật khẩu trùng mật khẩu cũ ─
            bool trungMatKhauCu = BCrypt.Net.BCrypt.Verify(yeuCau.MatKhauMoi, taiKhoan.Passwords);
            if (trungMatKhauCu)
            {
                return BadRequest(new { message = "Mật khẩu mới không được trùng mật khẩu hiện tại!" });
            }

            // ── 6. Mã hóa và cập nhật vào SQL ─────────────────────
            taiKhoan.Passwords = BCrypt.Net.BCrypt.HashPassword(yeuCau.MatKhauMoi);
            taiKhoan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }
    }
}
