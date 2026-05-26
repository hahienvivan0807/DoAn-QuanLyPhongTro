using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Cryptography;
using System.Text;
namespace QuanLyNhaTro.Pages
{
    [Authorize(Roles = "Manager")]
    public class ManagerModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public ManagerModel(QuanLyKhuNhaTro db)
        {
            _db = db;
        }

        // ── Thông tin người dùng đăng nhập ──────────────────────────
        public string TenNguoiDung { get; set; } = "Admin";
        public string ChucVu { get; set; } = "Manager";
        public string? Avatar { get; set; }

        // ── Thống kê tổng quan ──────────────────────────────────────
        public THONGKE_TONG ThongKeTong { get; set; } = new();

        // ── Doanh thu 12 tháng (cho Chart.js) ──────────────────────
        public decimal[] DoanhThuTheoThang { get; set; } = new decimal[12];
        public int NamBieuDo { get; set; }

        // ── Số thông báo chưa đọc ───────────────────────────────────
        public int SoThongBaoChuaDoc { get; set; }

        // ── Số sự cố chưa xử lý (badge sidebar) ────────────────────
        public int SoDonDVChoXuLy { get; set; }

        // ── Số dịch vụ mới (badge sidebar) ──────────────────────────
        public int SoDichVuMoi { get; set; }

        // ── Danh sách tất cả thông báo của Manager (tối đa 20) ──────
        public List<ThongBaoViewModel> DanhSachThongBao { get; set; } = new();

        // ── Thông báo từ chủ trọ mới nhất (hiển thị trong dashboard) ─
        public List<ThongBaoViewModel> ThongBaoChuTroMoiNhat { get; set; } = new();

        // ── Số thông báo từ chủ trọ chưa đọc ───────────────────────
        public int SoThongBaoChuTroChuaDoc { get; set; }

        // ── Danh sách sự cố mới nhất (tối đa 4) ────────────────────
        public List<DONDV> SuCoMoiNhat { get; set; } = new();

        // ── Hóa đơn sắp đến hạn / quá hạn (tối đa 5) ──────────────
        public List<HoaDonViewModel> HoaDonSapDenHan { get; set; } = new();

        // ── Danh sách phòng trống (tối đa 5) ────────────────────────
        public List<PHONG> PhongConTrong { get; set; } = new();

        // ── Danh sách tất cả phòng (cho modal) ──────────────────────
        public List<PHONG> TatCaPhong { get; set; } = new();

        public async Task OnGetAsync()
        {
            NamBieuDo = DateTime.Now.Year;

            var claim = User.FindFirst("FullName") ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name);
            if (claim != null) TenNguoiDung = claim.Value;

            ThongKeTong = await _db.THONGKE_TONG.FirstOrDefaultAsync() ?? new THONGKE_TONG();

            var doanhThuNam = await _db.THONGKE_DOANHTHU_THANG
                .Where(x => x.Nam == NamBieuDo)
                .ToListAsync();
            for (int i = 0; i < 12; i++)
            {
                var thang = doanhThuNam.FirstOrDefault(x => x.Thang == i + 1);
                DoanhThuTheoThang[i] = thang != null
                    ? Math.Round(thang.TongCong / 1_000_000m, 2)
                    : 0;
            }

            // Thông báo chưa đọc
            var userId = GetCurrentUserId();
            SoThongBaoChuaDoc = await _db.THONGBAO
                .CountAsync(x => x.IDUser == userId && !x.DaDoc);

            // Badge sự cố chờ xử lý
            SoDonDVChoXuLy = await _db.DONDV
                .CountAsync(x => x.TrangThai_DV == "Chờ xử lý");

            // Badge dịch vụ mới (đơn tạo trong 7 ngày gần nhất, chờ xử lý)
            SoDichVuMoi = await _db.DONDV
                .CountAsync(x => x.NgayTao >= DateTime.Now.AddDays(-7)
                              && x.TrangThai_DV == "Chờ xử lý");

            // Sự cố mới nhất (4 bản ghi, sắp xếp theo ngày tạo)
            SuCoMoiNhat = await _db.DONDV
                .Include(x => x.Phong)
                .Where(x => x.LoaiDV == "Hư hỏng" || x.TrangThai_DV != "Thành công")
                .OrderByDescending(x => x.NgayTao)
                .Take(4)
                .ToListAsync();

            // Hóa đơn sắp đến hạn / quá hạn
            var ngayCutoff = DateTime.Today.AddDays(7);
            HoaDonSapDenHan = await _db.HDTHANG
                .Include(x => x.Phong)
                .Where(x => x.TrangThai_TT != "Đã hoàn thành"
                         && x.HanDong <= ngayCutoff)
                .OrderBy(x => x.HanDong)
                .Take(5)
                .Select(x => new HoaDonViewModel
                {
                    SoPhong = x.Phong.SoPhong,
                    TenNguoiThue = _db.HOPDONG
                        .Where(hd => hd.IDPhong == x.IDPhong && hd.TrangThaiHD == "Đang hiệu lực")
                        .Select(hd => hd.Tenant.FullName)
                        .FirstOrDefault() ?? "—",
                    TongCong = x.TongCong,
                    HanDong = x.HanDong,
                    TrangThai = x.TrangThai_TT
                })
                .ToListAsync();

            // Phòng còn trống
            PhongConTrong = await _db.PHONG
                .Where(x => x.TrangThai == "Trống")
                .OrderBy(x => x.SoPhong)
                .Take(5)
                .ToListAsync();

            // Tất cả phòng (dùng cho modal danh sách phòng)
            TatCaPhong = await _db.PHONG
                .OrderBy(x => x.Khu).ThenBy(x => x.SoPhong)
                .ToListAsync();

            // ── THÔNG BÁO: Load danh sách thông báo dành cho Manager ─────
            // Lấy tất cả thông báo gửi tới Manager này (IDUser == userId),
            // bao gồm cả thông báo từ chủ trọ (LoaiTB == "ChuTro")
            var rawTB = await _db.THONGBAO
                .Where(x => x.IDUser == userId)
                .OrderByDescending(x => x.NgayTao)
                .Take(30)
                .ToListAsync();

            // Join với ACCOUNT để lấy tên người gửi
            var nguoiGuiIds = rawTB
                .Where(x => x.IDNguoiGui.HasValue)
                .Select(x => x.IDNguoiGui!.Value)
                .Distinct()
                .ToList();

            var nguoiGuiDict = await _db.ACCOUNT
                .Where(a => nguoiGuiIds.Contains(a.IDUser))
                .ToDictionaryAsync(a => a.IDUser, a => a.FullName);

            // Với thông báo từ chủ trọ, lấy thêm số phòng từ PHONG_MANAGER
            // (người gửi là Manager được phân công phòng)
            var phongManagerDict = new Dictionary<int, string>();
            foreach (var id in nguoiGuiIds)
            {
                var soPhong = await _db.PHONG_MANAGER
                    .Include(pm => pm.Phong)
                    .Where(pm => pm.IDManager == id && pm.IsActive)
                    .Select(pm => pm.Phong.SoPhong)
                    .FirstOrDefaultAsync();
                if (soPhong != null)
                    phongManagerDict[id] = soPhong;
            }

            DanhSachThongBao = rawTB.Select(tb => new ThongBaoViewModel
            {
                IDThongBao = tb.IDThongBao,
                TieuDe = tb.TieuDe,
                NoiDung = tb.NoiDung ?? "",
                LoaiTB = tb.LoaiTB,
                DaDoc = tb.DaDoc,
                NgayTao = tb.NgayTao,
                TenNguoiGui = tb.IDNguoiGui.HasValue && nguoiGuiDict.TryGetValue(tb.IDNguoiGui.Value, out var ten)
                                   ? ten : "Hệ thống",
                SoPhongNguoiGui = tb.IDNguoiGui.HasValue && phongManagerDict.TryGetValue(tb.IDNguoiGui.Value, out var sp)
                                   ? sp : null
            }).ToList();

            // Lọc thông báo từ chủ trọ để hiển thị riêng trên dashboard
            ThongBaoChuTroMoiNhat = DanhSachThongBao
                .Where(x => x.LoaiTB == "ChuTro")
                .Take(6)
                .ToList();

            SoThongBaoChuTroChuaDoc = ThongBaoChuTroMoiNhat.Count(x => !x.DaDoc);

            // Cập nhật lại tổng số thông báo chưa đọc (bao gồm mọi loại)
            SoThongBaoChuaDoc = DanhSachThongBao.Count(x => !x.DaDoc);
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst("IDUser") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
        }

        // ── Handler: Đánh dấu một thông báo đã đọc ─────────────────
        public async Task<IActionResult> OnPostMarkReadAsync(int id)
        {
            var userId = GetCurrentUserId();
            var tb = await _db.THONGBAO
                .FirstOrDefaultAsync(x => x.IDThongBao == id && x.IDUser == userId);
            if (tb != null && !tb.DaDoc)
            {
                tb.DaDoc = true;
                await _db.SaveChangesAsync();
            }
            return new OkResult();
        }

        // ── Handler: Đánh dấu tất cả thông báo đã đọc ──────────────
        public async Task<IActionResult> OnPostMarkAllReadAsync()
        {
            var userId = GetCurrentUserId();
            var dsChuaDoc = await _db.THONGBAO
                .Where(x => x.IDUser == userId && !x.DaDoc)
                .ToListAsync();
            foreach (var tb in dsChuaDoc)
                tb.DaDoc = true;
            await _db.SaveChangesAsync();
            return new OkResult();
        }
        public async Task<IActionResult> OnPostChangePasswordAsync(
    string oldPassword, string newPassword, string confirmPassword)
        {
            // 1. Lấy ID người dùng hiện tại
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                TempData["ErrorMessage"] = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
                return RedirectToPage();
            }

            // 2. Validate đầu vào server-side
            if (string.IsNullOrWhiteSpace(oldPassword) ||
                string.IsNullOrWhiteSpace(newPassword) ||
                string.IsNullOrWhiteSpace(confirmPassword))
            {
                TempData["ErrorMessage"] = "Vui lòng điền đầy đủ tất cả các trường.";
                return RedirectToPage();
            }

            if (newPassword.Length < 6)
            {
                TempData["ErrorMessage"] = "Mật khẩu mới phải có ít nhất 6 ký tự.";
                return RedirectToPage();
            }

            if (newPassword != confirmPassword)
            {
                TempData["ErrorMessage"] = "Mật khẩu xác nhận không khớp.";
                return RedirectToPage();
            }

            if (newPassword == oldPassword)
            {
                TempData["ErrorMessage"] = "Mật khẩu mới phải khác mật khẩu hiện tại.";
                return RedirectToPage();
            }

            // 3. Truy vấn tài khoản — chỉ lấy đúng record cần thiết
            var user = await _db.ACCOUNT
                .FirstOrDefaultAsync(a => a.IDUser == userId && a.IsActive);
            if (user == null)
            {
                TempData["ErrorMessage"] = "Không tìm thấy tài khoản hoặc tài khoản đã bị vô hiệu hóa.";
                return RedirectToPage();
            }

            // 4. Kiểm tra mật khẩu cũ
            var hashedOld = HashPassword(oldPassword);
            bool isMatch = user.Passwords == hashedOld
                        || user.Passwords == oldPassword;
            if (!isMatch)
            {
                TempData["ErrorMessage"] = "Mật khẩu hiện tại không đúng.";
                return RedirectToPage();
            }

            // 5. Lưu mật khẩu mới dạng SHA-256
            //    Passwords có [StringLength(255)] — SHA-256 hex = 64 ký tự, hoàn toàn phù hợp
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

        // SHA-256 hex — 64 ký tự, nằm gọn trong StringLength(255) của cột Passwords
        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes).ToLower();
        }
    }

    // ── ViewModel phụ cho hóa đơn ──────────────────────────────────
    public class HoaDonViewModel
    {
        public string SoPhong { get; set; } = "";
        public string TenNguoiThue { get; set; } = "";
        public decimal TongCong { get; set; }
        public DateTime HanDong { get; set; }
        public string TrangThai { get; set; } = "";

        public string CssClass => TrangThai switch
        {
            "Quá hạn" => "chua-thanh-toan",
            "Chưa đóng" => "chua-thanh-toan",
            "Chờ duyệt" => "sap-den-han",
            "Đã hoàn thành" => "da-thanh-toan",
            _ => "sap-den-han"
        };

        public string NutHanhDong => TrangThai == "Đã hoàn thành" ? "Xem" : "Nhắc";
        public string NutOnClick => TrangThai == "Đã hoàn thành"
            ? $"xemHoaDon('P.{SoPhong}')"
            : $"nhacNhoThanhToan('P.{SoPhong}')";
    }

    // ── ViewModel phụ cho thông báo ────────────────────────────────
    public class ThongBaoViewModel
    {
        public int IDThongBao { get; set; }
        public string TieuDe { get; set; } = "";
        public string NoiDung { get; set; } = "";
        public string LoaiTB { get; set; } = "";
        public bool DaDoc { get; set; }
        public DateTime NgayTao { get; set; }
        public string TenNguoiGui { get; set; } = "Hệ thống";
        public string? SoPhongNguoiGui { get; set; }
    }

}
