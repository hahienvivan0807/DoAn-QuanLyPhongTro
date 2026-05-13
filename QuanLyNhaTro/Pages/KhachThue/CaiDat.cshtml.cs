using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.KhachThue
{
    public class CaiDatModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public CaiDatModel(QuanLyKhuNhaTro db)
        {
            _db = db;
        }

        // ── Thông tin khách thuê ──────────────────────────────────────
        public string HoTen { get; set; } = "";
        public string ChuCaiDaiDien { get; set; } = "?";
        public string SoPhong { get; set; } = "";
        public string TangPhong { get; set; } = "";

        // ── Số thông báo chưa đọc ────────────────────────────────────
        public int SoThongBaoChuaDoc { get; set; }

        // ── Trạng thái toggle bảo mật ─────────────────────────────────
        public bool Bat2FA { get; set; } = false;
        public bool BatThongBaoDangNhap { get; set; } = true;
        public bool BatNhacHoaDon { get; set; } = true;
        public bool BatThongBaoSuCo { get; set; } = true;

        // ── Kết quả đổi mật khẩu (trả về cho JS) ─────────────────────
        [TempData]
        public string? KetQuaDoiMatKhau { get; set; }

        // ── BindProperty cho form đổi mật khẩu ───────────────────────
        [BindProperty]
        public string MatKhauHienTai { get; set; } = "";

        [BindProperty]
        public string MatKhauMoi { get; set; } = "";

        [BindProperty]
        public string MatKhauXacNhan { get; set; } = "";

        // =============================================================
        // GET
        // =============================================================
        public async Task<IActionResult> OnGetAsync()
        {
            var idUserStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idUserStr, out int idUser))
                return RedirectToPage("/Index");

            HoTen = User.FindFirst("FullName")?.Value ?? "";

            if (!string.IsNullOrWhiteSpace(HoTen))
            {
                var parts = HoTen.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                ChuCaiDaiDien = parts[^1][0].ToString().ToUpper();
            }

            var hopDong = await _db.HOPDONG
                .AsNoTracking()
                .Include(h => h.Phong)
                .FirstOrDefaultAsync(h => h.IDUser == idUser && h.TrangThaiHD == "Đang hiệu lực");

            if (hopDong != null)
            {
                SoPhong = hopDong.Phong.SoPhong;
                TangPhong = $"Tầng {hopDong.Phong.Tang}";
            }

            SoThongBaoChuaDoc = await _db.THONGBAO
                .CountAsync(t => t.IDUser == idUser && !t.DaDoc);

            Bat2FA = false;
            BatThongBaoDangNhap = true;
            BatNhacHoaDon = true;
            BatThongBaoSuCo = true;

            return Page();
        }

        // =============================================================
        // POST: Đổi mật khẩu — gọi từ JS bằng fetch("/KhachThue/CaiDat?handler=DoiMatKhau")
        // =============================================================
        public async Task<IActionResult> OnPostDoiMatKhauAsync()
        {
            var idUserStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idUserStr, out int idUser))
                return new JsonResult(new { success = false, message = "Phiên đăng nhập đã hết hạn." });

            // Validate đầu vào
            if (string.IsNullOrWhiteSpace(MatKhauHienTai))
                return new JsonResult(new { success = false, message = "Vui lòng nhập mật khẩu hiện tại!" });

            if (string.IsNullOrWhiteSpace(MatKhauMoi) || MatKhauMoi.Length < 8)
                return new JsonResult(new { success = false, message = "Mật khẩu mới phải có ít nhất 8 ký tự!" });

            if (MatKhauMoi != MatKhauXacNhan)
                return new JsonResult(new { success = false, message = "Mật khẩu xác nhận không khớp!" });

            // Lấy tài khoản từ DB
            var account = await _db.ACCOUNT.FirstOrDefaultAsync(a => a.IDUser == idUser);
            if (account == null)
                return new JsonResult(new { success = false, message = "Không tìm thấy tài khoản!" });

            // Kiểm tra mật khẩu hiện tại bằng BCrypt (giống XuLyDangNhap.cs)
            bool hopLe = BCrypt.Net.BCrypt.Verify(MatKhauHienTai, account.Passwords);
            if (!hopLe)
                return new JsonResult(new { success = false, message = "Mật khẩu hiện tại không đúng!" });

            // Hash mật khẩu mới và lưu
            account.Passwords = BCrypt.Net.BCrypt.HashPassword(MatKhauMoi);
            account.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return new JsonResult(new { success = true, message = "Mật khẩu đã được cập nhật thành công!" });
        }
    }
}
