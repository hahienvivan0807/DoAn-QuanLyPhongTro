using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.Manager
{
    [Authorize(Roles = "Manager,Admin")]
    public class CaiDatModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public CaiDatModel(QuanLyKhuNhaTro db)
        {
            _db = db;
        }

        // ─── Thông tin hiển thị trên Sidebar / Header ───────────────
        public string TenNguoiDung { get; private set; } = "Quản lý";
        public string ChucVu { get; private set; } = "Quản lý hệ thống";
        public string? Avatar { get; private set; }
        public string ChuCaiDaiDien { get; private set; } = "Q";
        public string Email { get; private set; } = "";
        public int SoThongBaoChuaDoc { get; private set; }

        // ─── OnGetAsync ─────────────────────────────────────────────
        public async Task<IActionResult> OnGetAsync()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idStr, out int userId))
                return RedirectToPage("/Index");

            var acc = await _db.ACCOUNT
                               .AsNoTracking()
                               .FirstOrDefaultAsync(a => a.IDUser == userId && a.IsActive);
            if (acc == null) return RedirectToPage("/Index");

            TenNguoiDung = acc.FullName;
            ChucVu = acc.Roles == "Admin" ? "Quản trị viên" : "Quản lý hệ thống";
            Avatar = acc.Avatar;
            ChuCaiDaiDien = acc.FullName.Length > 0
                            ? acc.FullName[0].ToString().ToUpper()
                            : "Q";
            Email = acc.Email ?? "";

            SoThongBaoChuaDoc = await _db.THONGBAO
                .CountAsync(t => (t.IDUser == userId || t.IDUser == null) && !t.DaDoc);

            return Page();
        }

        // ─── Handler: Đổi mật khẩu (AJAX / fetch) ──────────────────
        public async Task<IActionResult> OnPostDoiMatKhauAsync(
            [FromForm] string MatKhauHienTai,
            [FromForm] string MatKhauMoi,
            [FromForm] string MatKhauXacNhan)
        {
            // --- Validate cơ bản ---
            if (string.IsNullOrWhiteSpace(MatKhauHienTai) ||
                string.IsNullOrWhiteSpace(MatKhauMoi) ||
                string.IsNullOrWhiteSpace(MatKhauXacNhan))
                return new JsonResult(new { success = false, message = "Vui lòng điền đầy đủ thông tin!" });

            if (MatKhauMoi.Length < 6)
                return new JsonResult(new { success = false, message = "Mật khẩu mới phải có ít nhất 6 ký tự!" });

            if (MatKhauMoi != MatKhauXacNhan)
                return new JsonResult(new { success = false, message = "Mật khẩu xác nhận không khớp!" });

            // --- Lấy tài khoản ---
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idStr, out int userId))
                return new JsonResult(new { success = false, message = "Phiên đăng nhập không hợp lệ!" });

            var acc = await _db.ACCOUNT.FirstOrDefaultAsync(a => a.IDUser == userId && a.IsActive);
            if (acc == null)
                return new JsonResult(new { success = false, message = "Tài khoản không tồn tại!" });

            // --- Xác minh mật khẩu hiện tại (BCrypt) ---
            bool valid;
            try
            {
                valid = BCrypt.Net.BCrypt.Verify(MatKhauHienTai, acc.Passwords);
            }
            catch
            {
                // Nếu hash cũ không phải BCrypt (plain-text fallback cho dev)
                valid = (MatKhauHienTai == acc.Passwords);
            }

            if (!valid)
                return new JsonResult(new { success = false, message = "Mật khẩu hiện tại không đúng!" });

            // --- Cập nhật mật khẩu mới ---
            acc.Passwords = BCrypt.Net.BCrypt.HashPassword(MatKhauMoi);
            acc.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return new JsonResult(new { success = true, message = "Mật khẩu đã được cập nhật thành công!" });
        }
    }
}
