using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

namespace QuanLyNhaTro.Pages
{
    // ViewModel gộp thông tin Phòng + HopDong đang hiệu lực (chỉ Manager)
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
            if (string.IsNullOrEmpty(userIdClaim))
                return RedirectToPage("/Index");

            int idUser = int.Parse(userIdClaim);

            // 2. Lấy thông tin người dùng hiện tại từ DB
            CurrentUser = await _db.ACCOUNT
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.IDUser == idUser);

            // 3. DATA ISOLATION: Chỉ lấy phòng được phân công cho Manager này
            var idPhongDuocPhanCong = await _db.PHONG_MANAGER
                .AsNoTracking()
                .Where(pm => pm.IDManager == idUser && pm.IsActive)
                .Select(pm => pm.IDPhong)
                .ToListAsync();

            var phongs = await _db.PHONG
                .AsNoTracking()
                .Where(p => idPhongDuocPhanCong.Contains(p.IDPhong))
                .OrderBy(p => p.Khu)
                .ThenBy(p => p.SoPhong)
                .ToListAsync();

            var hopDongs = await _db.HOPDONG
                .AsNoTracking()
                .Include(hd => hd.Tenant)
                .Where(hd => hd.TrangThaiHD == "Đang hiệu lực"
                          && idPhongDuocPhanCong.Contains(hd.IDPhong))
                .ToListAsync();

            var hopDongDict = hopDongs
                .GroupBy(hd => hd.IDPhong)
                .ToDictionary(g => g.Key, g => g.First());

            DanhSachPhong = phongs.Select(p => new PhongViewModel
            {
                Phong = p,
                HopDongHienTai = hopDongDict.TryGetValue(p.IDPhong, out var hd) ? hd : null
            }).ToList();

            // 4. Thống kê nhanh (chỉ trên tập phòng của Manager)
            TongSoPhong = phongs.Count;
            SoPhongDangThue = phongs.Count(p => p.TrangThai == "Đã thuê");
            SoPhongConTrong = phongs.Count(p => p.TrangThai == "Trống");

            // 5. Badge sidebar
            // Data isolation: chỉ đếm phòng được phân công
            SoDonDVChoXuLy = await _db.DONDV
                .AsNoTracking()
                .CountAsync(d => d.TrangThai_DV == "Chờ xử lý"
                              && idPhongDuocPhanCong.Contains(d.IDPhong));

            // Data isolation: chỉ đếm phòng được phân công
            SoDonBaoTriChoXuLy = await _db.DONDV
                .AsNoTracking()
                .CountAsync(d => d.LoaiDV == "Hư hỏng"
                              && d.TrangThai_DV == "Chờ xử lý"
                              && idPhongDuocPhanCong.Contains(d.IDPhong));

            SoThongBaoChuaDoc = await _db.THONGBAO
                .AsNoTracking()
                .CountAsync(tb => tb.IDUser == idUser && !tb.DaDoc);

            return Page();
        }

        // ─────────────────────────────────────────────────────────────
        // NAMED HANDLER 1: Chi tiết phòng (Người ở + Cơ sở vật chất)
        // GET /Manager/QuanLyPhong?handler=RoomDetail&idPhong=5
        // ─────────────────────────────────────────────────────────────
        public async Task<IActionResult> OnGetRoomDetailAsync(int idPhong)
        {
            // Xác thực Manager
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return new JsonResult(new { error = "Chưa đăng nhập" }) { StatusCode = 401 };

            int idUser = int.Parse(userIdClaim);

            // DATA ISOLATION: Kiểm tra phòng có thuộc quyền quản lý không
            bool coQuyen = await _db.PHONG_MANAGER
                .AsNoTracking()
                .AnyAsync(pm => pm.IDPhong == idPhong && pm.IDManager == idUser && pm.IsActive);

            if (!coQuyen)
                return new JsonResult(new { error = "Không có quyền xem phòng này" }) { StatusCode = 403 };

            // Lấy thông tin phòng (Cơ sở vật chất = MoTa + thông số)
            var phong = await _db.PHONG
                .AsNoTracking()
                .Where(p => p.IDPhong == idPhong)
                .Select(p => new
                {
                    p.IDPhong,
                    p.SoPhong,
                    p.Khu,
                    p.DienTich,
                    p.GiaPhongFix,
                    p.TrangThai,
                    p.MoTa,
                    p.soluong
                })
                .FirstOrDefaultAsync();

            if (phong == null)
                return new JsonResult(new { error = "Không tìm thấy phòng" }) { StatusCode = 404 };

            // Lấy hợp đồng đang hiệu lực
            // ✅ Trim + ToLower để tránh lỗi khoảng trắng / chữ hoa thường không khớp trong DB
            var hopDong = await _db.HOPDONG
                .AsNoTracking()
                .Where(hd => hd.IDPhong == idPhong
                          && hd.TrangThaiHD.Trim().ToLower() == "đang hiệu lực")
                .Select(hd => new { hd.IDHopDong })
                .FirstOrDefaultAsync();

            // Lấy danh sách người đang ở
            List<object> danhSachNguoiO = new();
            if (hopDong != null)
            {
                // ✅ Sửa: bỏ so sánh DateTime.MinValue vì EF Core không dịch sang SQL đúng
                // Dùng ngưỡng năm 1900 để bắt cả trường hợp DB lưu MinValue thay vì NULL
                var minDate = new DateTime(1900, 1, 1);
                danhSachNguoiO = await _db.HOPDONG_KHACHO
                    .AsNoTracking()
                    .Where(ko => ko.IDHopDong == hopDong.IDHopDong
                              && (ko.NgayRa == null || ko.NgayRa < minDate))
                    .OrderByDescending(ko => ko.IsChinhChu)
                    .Select(ko => (object)new
                    {
                        hoTen = ko.HoTen ?? "—",
                        soDienThoai = ko.SoDienThoai ?? "",
                        quanHe = ko.QuanHe ?? "Người ở",
                        isChinhChu = ko.IsChinhChu,
                        gioiTinh = ko.GioiTinh ?? "—"
                    })
                    .ToListAsync();
            }

            var trangThaiHienThi = (hopDong != null) ? "Đã thuê" : phong.TrangThai;

            // Lấy lịch sử người đã rời phòng (NgayRa != null) — join rõ ràng để tránh lỗi navigation property
            var idHopDongCuaPhong = await _db.HOPDONG
                .AsNoTracking()
                .Where(hd => hd.IDPhong == idPhong)
                .Select(hd => hd.IDHopDong)
                .ToListAsync();

            var lichSuNguoiO = await _db.HOPDONG_KHACHO
                .AsNoTracking()
                .Where(ko => idHopDongCuaPhong.Contains(ko.IDHopDong) && ko.NgayRa != null)
                .OrderByDescending(ko => ko.NgayRa)
                .Select(ko => new
                {
                    hoTen = ko.HoTen ?? "—",
                    ngayVao = ko.NgayVao != null ? ko.NgayVao.ToString("dd/MM/yyyy") : "—",
                    ngayRa = ko.NgayRa != null ? ko.NgayRa.Value.ToString("dd/MM/yyyy") : "—",
                    quanHe = ko.QuanHe ?? "—",
                    isChinhChu = ko.IsChinhChu
                })
                .ToListAsync();

            return new JsonResult(new
            {
                phong = new
                {
                    soPhong = phong.SoPhong,
                    khu = phong.Khu,
                    dienTich = phong.DienTich.HasValue ? $"{phong.DienTich:0.#} m²" : "Chưa cập nhật",
                    giaPhong = phong.GiaPhongFix,
                    trangThai = trangThaiHienThi,
                    coSoVatChat = string.IsNullOrWhiteSpace(phong.MoTa) ? "Chưa có mô tả" : phong.MoTa,
                    soLuongToiDa = phong.soluong
                },
                danhSachNguoiO = danhSachNguoiO,
                lichSuNguoiO = lichSuNguoiO
            });
        }

        // ─────────────────────────────────────────────────────────────
        // NAMED HANDLER 2: Hợp đồng cơ bản (ẩn điều khoản chi tiết)
        // GET /Manager/QuanLyPhong?handler=BasicContract&idPhong=5
        // ─────────────────────────────────────────────────────────────
        public async Task<IActionResult> OnGetBasicContractAsync(int idPhong)
        {
            // Xác thực Manager
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return new JsonResult(new { error = "Chưa đăng nhập" }) { StatusCode = 401 };

            int idUser = int.Parse(userIdClaim);

            // DATA ISOLATION: Kiểm tra quyền
            bool coQuyen = await _db.PHONG_MANAGER
                .AsNoTracking()
                .AnyAsync(pm => pm.IDPhong == idPhong && pm.IDManager == idUser && pm.IsActive);

            if (!coQuyen)
                return new JsonResult(new { error = "Không có quyền xem phòng này" }) { StatusCode = 403 };

            // Chỉ SELECT các cột cơ bản — ẨN GhiChu, LyDoKetThuc, điều khoản chi tiết
            var hopDong = await _db.HOPDONG
                .AsNoTracking()
                .Where(hd => hd.IDPhong == idPhong && hd.TrangThaiHD == "Đang hiệu lực")
                .Select(hd => new
                {
                    TenNguoiThue = hd.Tenant.FullName,
                    SdtNguoiThue = hd.Tenant.Phone,
                    NgayBatDau = hd.NgayBatDau,
                    NgayKetThuc = hd.NgayKetThuc,
                    TienCoc = hd.TienCocBanDau,
                    GiaThue = hd.GiaThueChot,
                    TrangThai = hd.TrangThaiHD
                    // KHÔNG select: GhiChu, LyDoKetThuc, TienCocHoanTra, IDManagerThanhLy
                })
                .FirstOrDefaultAsync();

            if (hopDong == null)
                return new JsonResult(new { coHopDong = false });

            return new JsonResult(new
            {
                coHopDong = true,
                tenNguoiThue = hopDong.TenNguoiThue,
                sdtNguoiThue = hopDong.SdtNguoiThue,
                ngayBatDau = hopDong.NgayBatDau.ToString("dd/MM/yyyy"),
                ngayKetThuc = hopDong.NgayKetThuc.HasValue
                    ? hopDong.NgayKetThuc.Value.ToString("dd/MM/yyyy")
                    : "Không thời hạn",
                tienCoc = hopDong.TienCoc,
                giaThue = hopDong.GiaThue,
                trangThai = hopDong.TrangThai
            });
        }

        // ─────────────────────────────────────────────────────────────
        // HANDLER: Đổi mật khẩu (giữ nguyên logic từ file gốc)
        // ─────────────────────────────────────────────────────────────
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
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
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