using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages
{

    // ViewModel gộp thông tin Phòng + HopDong đang hiệu lực
    public class PhongViewModel
    {
        public PHONG Phong { get; set; } = null!;
        public HOPDONG? HopDongHienTai { get; set; }
    }

    public class ChiTietPhongModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public ChiTietPhongModel(QuanLyKhuNhaTro db)
        {
            _db = db;
        }

        // ── Dữ liệu trang chính ──────────────────────────────────────
        public List<PhongViewModel> DanhSachPhong { get; set; } = new();

        // ── Thống kê nhanh (3 thẻ) ───────────────────────────────────
        public int TongSoPhong { get; set; }
        public int SoPhongDangThue { get; set; }
        public int SoPhongConTrong { get; set; }

        // ── Huy hiệu sidebar ─────────────────────────────────────────
        public int SoDonDVChoXuLy { get; set; }
        public int SoDonBaoTriChoXuLy { get; set; }

        // ── Thông báo header ─────────────────────────────────────────
        public int SoThongBaoChuaDoc { get; set; }

        // ── Thông tin người dùng đang đăng nhập ──────────────────────
        public ACCOUNT? CurrentUser { get; set; }

        // ─────────────────────────────────────────────────────────────
        public async Task<IActionResult> OnGetAsync()
        {

            // 1. Lấy ID người dùng từ Claims (Cookie)
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            // Nếu không thấy thông tin đăng nhập, đẩy về trang chủ (Index)
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return RedirectToPage("/Index");
            }

            int idUser = int.Parse(userIdClaim);

            var fullNameClaim = User.FindFirst("FullName")?.Value;

            // 2. Lấy thông tin người dùng hiện tại từ DB
            CurrentUser = await _db.ACCOUNT
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.IDUser == idUser);


            var phongs = await _db.PHONG
                .AsNoTracking()
                .OrderBy(p => p.Khu)
                .ThenBy(p => p.SoPhong)
                .ToListAsync();

            var hopDongs = await _db.HOPDONG
                .AsNoTracking()
                .Include(hd => hd.Tenant)
                .Where(hd => hd.TrangThaiHD == "Đang hiệu lực")
                .ToListAsync();

            var hopDongDict = hopDongs
                .GroupBy(hd => hd.IDPhong)
                .ToDictionary(g => g.Key, g => g.First());

            // Đổ dữ liệu vào ViewModel để hiển thị ra View
            DanhSachPhong = phongs.Select(p => new PhongViewModel
            {
                Phong = p,
                HopDongHienTai = hopDongDict.TryGetValue(p.IDPhong, out var hd) ? hd : null
            }).ToList();

            // 5. Tính toán Thống kê nhanh
            TongSoPhong = phongs.Count;
            SoPhongDangThue = phongs.Count(p => p.TrangThai == "Đã thuê");
            SoPhongConTrong = phongs.Count(p => p.TrangThai == "Trống");

            // 6. Cập nhật số liệu thông báo/huy hiệu trên Sidebar
            SoDonDVChoXuLy = await _db.DONDV
                .AsNoTracking()
                .CountAsync(d => d.TrangThai_DV == "Chờ xử lý");

            SoDonBaoTriChoXuLy = await _db.DONDV
                .AsNoTracking()
                .CountAsync(d => d.LoaiDV == "Hư hỏng" && d.TrangThai_DV == "Chờ xử lý");

            // Lấy số thông báo chưa đọc của chính User này
            SoThongBaoChuaDoc = await _db.THONGBAO
                .AsNoTracking()
                .CountAsync(tb => tb.IDUser == idUser && !tb.DaDoc);

            return Page();
        }
        public async Task<IActionResult> OnPostChangePasswordAsync(
    string oldPassword, string newPassword, string confirmPassword)
        {
            var userIdClaim = User.FindFirst("IDUser")
                           ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim?.Value, out var userId) || userId == 0)
            {
                TempData["ErrorMessage"] = "Phiên đăng nhập đã hết hạn.";
                return RedirectToPage();
            }

            if (string.IsNullOrWhiteSpace(oldPassword) ||
                string.IsNullOrWhiteSpace(newPassword) ||
                string.IsNullOrWhiteSpace(confirmPassword))
            { TempData["ErrorMessage"] = "Vui lòng điền đầy đủ tất cả các trường."; return RedirectToPage(); }

            if (newPassword.Length < 6)
            { TempData["ErrorMessage"] = "Mật khẩu mới phải có ít nhất 6 ký tự."; return RedirectToPage(); }

            if (newPassword != confirmPassword)
            { TempData["ErrorMessage"] = "Mật khẩu xác nhận không khớp."; return RedirectToPage(); }

            if (newPassword == oldPassword)
            { TempData["ErrorMessage"] = "Mật khẩu mới phải khác mật khẩu hiện tại."; return RedirectToPage(); }

            var user = await _db.ACCOUNT.FirstOrDefaultAsync(a => a.IDUser == userId && a.IsActive);
            if (user == null)
            { TempData["ErrorMessage"] = "Không tìm thấy tài khoản."; return RedirectToPage(); }

            var hashedOld = HashPassword(oldPassword);
            if (user.Passwords != hashedOld && user.Passwords != oldPassword)
            { TempData["ErrorMessage"] = "Mật khẩu hiện tại không đúng."; return RedirectToPage(); }

            user.Passwords = HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _db.SaveChangesAsync();
                TempData["SuccessMessage"] = "Đổi mật khẩu thành công!";
            }
            catch (DbUpdateException)
            {
                TempData["ErrorMessage"] = "Lỗi khi lưu dữ liệu. Vui lòng thử lại.";
            }

            return RedirectToPage();
        }

        private static string HashPassword(string password)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes).ToLower();
        }
    }

}
