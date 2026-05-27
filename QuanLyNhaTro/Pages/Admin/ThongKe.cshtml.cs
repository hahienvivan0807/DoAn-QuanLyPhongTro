using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.Admin
{
    [Authorize(Roles = "Admin")]

    // ================================================================
    // DTOs trả về cho các API endpoint (được fetch() trong JS gọi)
    // ================================================================

    /// <summary>
    /// Mirrors THONGKE_DOANHTHU_THANG – trả về bởi GET ?handler=DoanhThu
    /// </summary>
    public class DoanhThuThangDto
    {
        public short Nam { get; set; }
        public byte Thang { get; set; }
        public decimal TongTienPhong { get; set; }
        public decimal TongTienDien { get; set; }
        public decimal TongTienNuoc { get; set; }
        public decimal TongTienDV { get; set; }
        public decimal TongCong { get; set; }
        public int SoHoaDonDaDong { get; set; }
        public decimal ChiPhiThang { get; set; }
    }

    /// <summary>
    /// Mirrors THONGKE_TONG – trả về bởi GET ?handler=TongQuan
    /// </summary>
    public class TongQuanDto
    {
        public int TongSoPhong { get; set; }
        public int PhongDangThue { get; set; }
        public int PhongConTrong { get; set; }
        public int PhongDangSua { get; set; }
        public decimal TiLeLapDay { get; set; }
        public decimal DoanhThuThangNay { get; set; }
        public decimal DoanhThuThangTruoc { get; set; }
        public decimal TangTruongDoanhThu { get; set; }
        public int HoaDonChuaDong { get; set; }
        public int HoaDonSapDenHan { get; set; }
        public int HoaDonQuaHan { get; set; }
        public int DonDVChoXuLy { get; set; }
        public int DonDVKhanCap { get; set; }
        public DateTime NgayCapNhat { get; set; }
    }

    /// <summary>
    /// Trả về bởi GET ?handler=AdminInfo
    /// </summary>
    public class AdminInfoDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? Avatar { get; set; }
    }

    // ================================================================
    // PAGE MODEL
    // ================================================================
    public class ThongKeModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;
        private readonly ILogger<ThongKeModel> _logger;

        public ThongKeModel(QuanLyKhuNhaTro db, ILogger<ThongKeModel> logger)
        {
            _db = db;
            _logger = logger;
        }

        // ================================================================
        // OnGet — Tự động refresh snapshot mỗi khi trang được load
        // ================================================================
        public async Task<IActionResult> OnGetAsync()
        {
            try
            {
                await RefreshSnapshotAsync();
            }
            catch (Exception ex)
            {
                // Không chặn trang nếu refresh thất bại, chỉ ghi log
                _logger.LogWarning(ex, "RefreshSnapshotAsync thất bại khi load trang, bỏ qua.");
            }

            return Page();
        }

        // ================================================================
        // API: GET ?handler=AdminInfo
        // ================================================================
        public async Task<IActionResult> OnGetAdminInfoAsync()
        {
            try
            {
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                               ?? User.FindFirstValue("IDUser");

                ACCOUNT? account = null;

                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
                {
                    account = await _db.ACCOUNT
                        .AsNoTracking()
                        .Where(a => a.IDUser == userId && a.IsActive)
                        .Select(a => new ACCOUNT { FullName = a.FullName, Avatar = a.Avatar })
                        .FirstOrDefaultAsync();
                }

                // Fallback: tài khoản Admin/Manager đầu tiên
                account ??= await _db.ACCOUNT
                    .AsNoTracking()
                    .Where(a => (a.Roles == "Admin" || a.Roles == "Manager") && a.IsActive)
                    .OrderBy(a => a.IDUser)
                    .Select(a => new ACCOUNT { FullName = a.FullName, Avatar = a.Avatar })
                    .FirstOrDefaultAsync();

                var dto = new AdminInfoDto
                {
                    FullName = account?.FullName ?? "Chủ Trọ",
                    Avatar = account?.Avatar
                };

                return new JsonResult(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OnGetAdminInfoAsync thất bại");
                return new JsonResult(new AdminInfoDto { FullName = "Chủ Trọ" });
            }
        }

        // ================================================================
        // API: GET ?handler=TongQuan
        // Luôn đọc từ snapshot (đã được refresh ở OnGetAsync)
        // ================================================================
        public async Task<IActionResult> OnGetTongQuanAsync()
        {
            try
            {
                var snap = await _db.THONGKE_TONG
                    .AsNoTracking()
                    .FirstOrDefaultAsync(t => t.ID == 1);

                if (snap != null)
                {
                    return new JsonResult(new TongQuanDto
                    {
                        TongSoPhong = snap.TongSoPhong,
                        PhongDangThue = snap.PhongDangThue,
                        PhongConTrong = snap.PhongConTrong,
                        PhongDangSua = snap.PhongDangSua,
                        TiLeLapDay = snap.TiLeLapDay,
                        DoanhThuThangNay = snap.DoanhThuThangNay,
                        DoanhThuThangTruoc = snap.DoanhThuThangTruoc,
                        TangTruongDoanhThu = snap.TangTruongDoanhThu,
                        HoaDonChuaDong = snap.HoaDonChuaDong,
                        HoaDonSapDenHan = snap.HoaDonSapDenHan,
                        HoaDonQuaHan = snap.HoaDonQuaHan,
                        DonDVChoXuLy = snap.DonDVChoXuLy,
                        DonDVKhanCap = snap.DonDVKhanCap,
                        NgayCapNhat = snap.NgayCapNhat
                    });
                }

                // Fallback an toàn: tính live nếu snapshot không tồn tại
                return new JsonResult(await ComputeLiveTongQuanAsync());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OnGetTongQuanAsync thất bại");
                return StatusCode(500, "Lỗi khi tải tổng quan.");
            }
        }

        // ================================================================
        // API: GET ?handler=DoanhThu&nam=2026
        // ================================================================
        public async Task<IActionResult> OnGetDoanhThuAsync([FromQuery] int nam = 0)
        {
            try
            {
                if (nam <= 0) nam = DateTime.Now.Year;

                // Thử đọc từ bảng snapshot trước (fast path)
                var rows = await _db.THONGKE_DOANHTHU_THANG
                    .AsNoTracking()
                    .Where(t => t.Nam == (short)nam)
                    .OrderBy(t => t.Thang)
                    .Select(t => new DoanhThuThangDto
                    {
                        Nam = t.Nam,
                        Thang = t.Thang,
                        TongTienPhong = t.TongTienPhong,
                        TongTienDien = t.TongTienDien,
                        TongTienNuoc = t.TongTienNuoc,
                        TongTienDV = t.TongTienDV,
                        TongCong = t.TongCong,
                        SoHoaDonDaDong = t.SoHoaDonDaDong,
                        ChiPhiThang = t.ChiPhiThang
                    })
                    .ToListAsync();

                if (rows.Any())
                    return new JsonResult(rows);

                // Fallback: tổng hợp từ HDTHANG
                rows = await ComputeDoanhThuFromHdThangAsync(nam);
                return new JsonResult(rows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OnGetDoanhThuAsync thất bại cho năm {Nam}", nam);
                return StatusCode(500, "Lỗi khi tải doanh thu.");
            }
        }

        // ================================================================
        // CORE: Tính toán dữ liệu thực tế và ghi vào THONGKE_TONG
        // Được gọi mỗi lần OnGetAsync() chạy
        // ================================================================
        private async Task RefreshSnapshotAsync()
        {
            var live = await ComputeLiveTongQuanAsync();

            var snap = await _db.THONGKE_TONG.FirstOrDefaultAsync(t => t.ID == 1);

            if (snap == null)
            {
                // Chưa có bản ghi → tạo mới
                snap = new THONGKE_TONG { ID = 1 };
                _db.THONGKE_TONG.Add(snap);
            }

            // Ghi đè toàn bộ giá trị từ dữ liệu thực
            snap.TongSoPhong = live.TongSoPhong;
            snap.PhongDangThue = live.PhongDangThue;
            snap.PhongConTrong = live.PhongConTrong;
            snap.PhongDangSua = live.PhongDangSua;
            snap.TiLeLapDay = live.TiLeLapDay;
            snap.DoanhThuThangNay = live.DoanhThuThangNay;
            snap.DoanhThuThangTruoc = live.DoanhThuThangTruoc;
            snap.TangTruongDoanhThu = live.TangTruongDoanhThu;
            snap.HoaDonChuaDong = live.HoaDonChuaDong;
            snap.HoaDonSapDenHan = live.HoaDonSapDenHan;
            snap.HoaDonQuaHan = live.HoaDonQuaHan;
            snap.DonDVChoXuLy = live.DonDVChoXuLy;
            snap.DonDVKhanCap = live.DonDVKhanCap;
            snap.NgayCapNhat = live.NgayCapNhat;

            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "Snapshot THONGKE_TONG đã được refresh lúc {Time}. TongSoPhong={Phong}, PhongDangThue={DangThue}",
                live.NgayCapNhat, live.TongSoPhong, live.PhongDangThue);
        }

        // ================================================================
        // PRIVATE: Tính tổng quan trực tiếp từ các bảng nguồn
        // ================================================================
        private async Task<TongQuanDto> ComputeLiveTongQuanAsync()
        {
            var now = DateTime.Now;
            var kyNay = $"{now.Month:D2}/{now.Year}";
            var prevDate = now.AddMonths(-1);
            var kyTruoc = $"{prevDate.Month:D2}/{prevDate.Year}";

            // ── Trạng thái phòng ───────────────────────────────────────
            var trangThaiPhongs = await _db.PHONG
                .AsNoTracking()
                .Select(p => p.TrangThai)
                .ToListAsync();

            int tongPhong = trangThaiPhongs.Count;
            int dangThue = trangThaiPhongs.Count(s => s == "Đã thuê");
            int conTrong = trangThaiPhongs.Count(s => s == "Trống");
            int dangSua = trangThaiPhongs.Count(s => s == "Đang sửa");
            decimal tiLe = tongPhong > 0
                ? Math.Round((decimal)dangThue / tongPhong * 100, 2)
                : 0;

            // ── Doanh thu tháng này / tháng trước ─────────────────────
            var dtNay = await RevenueForPeriod(kyNay);
            var dtTruoc = await RevenueForPeriod(kyTruoc);
            decimal tang = dtTruoc > 0
                ? Math.Round((dtNay - dtTruoc) / dtTruoc * 100, 2)
                : 0;

            // ── Hóa đơn ───────────────────────────────────────────────
            var invoices = await _db.HDTHANG
                .AsNoTracking()
                .Select(h => new { h.TrangThai_TT, h.HanDong })
                .ToListAsync();

            int chuaDong = invoices.Count(h => h.TrangThai_TT == "Chưa đóng");
            int sapDenHan = invoices.Count(h =>
                h.TrangThai_TT == "Chưa đóng" &&
                h.HanDong >= now &&
                h.HanDong <= now.AddDays(7));
            int quaHan = invoices.Count(h => h.TrangThai_TT == "Quá hạn");

            // ── Đơn dịch vụ ───────────────────────────────────────────
            var mucDoDVList = await _db.DONDV
                .AsNoTracking()
                .Where(d => d.TrangThai_DV == "Chờ xử lý")
                .Select(d => d.MucDo)
                .ToListAsync();

            int choXuLy = mucDoDVList.Count;
            int khanCap = mucDoDVList.Count(m => m == "Khẩn cấp");

            return new TongQuanDto
            {
                TongSoPhong = tongPhong,
                PhongDangThue = dangThue,
                PhongConTrong = conTrong,
                PhongDangSua = dangSua,
                TiLeLapDay = tiLe,
                DoanhThuThangNay = dtNay,
                DoanhThuThangTruoc = dtTruoc,
                TangTruongDoanhThu = tang,
                HoaDonChuaDong = chuaDong,
                HoaDonSapDenHan = sapDenHan,
                HoaDonQuaHan = quaHan,
                DonDVChoXuLy = choXuLy,
                DonDVKhanCap = khanCap,
                NgayCapNhat = now
            };
        }

        // ================================================================
        // PRIVATE: Tổng doanh thu theo kỳ thanh toán
        // ================================================================
        private async Task<decimal> RevenueForPeriod(string ky)
        {
            return await _db.HDTHANG
                .AsNoTracking()
                .Where(h => h.KyThanhToan == ky
                         && (h.TrangThai_TT == "Đã hoàn thành" || h.TrangThai_TT == "Chờ duyệt"))
                .SumAsync(h => (decimal?)h.TongCong) ?? 0;
        }

        // ================================================================
        // PRIVATE: Tổng hợp doanh thu từ HDTHANG khi bảng snapshot thiếu
        // ================================================================
        private async Task<List<DoanhThuThangDto>> ComputeDoanhThuFromHdThangAsync(int nam)
        {
            var suffix = $"/{nam}";

            var allRows = await _db.HDTHANG
                .AsNoTracking()
                .Where(h => h.KyThanhToan != null && h.KyThanhToan.EndsWith(suffix))
                .ToListAsync();

            var grouped = allRows
                .GroupBy(h =>
                {
                    if (h.KyThanhToan != null
                        && int.TryParse(h.KyThanhToan.Split('/')[0], out int m))
                        return m;
                    return 0;
                })
                .Where(g => g.Key > 0)
                .OrderBy(g => g.Key)
                .Select(g =>
                {
                    var paid = g.Where(h =>
                        h.TrangThai_TT == "Đã hoàn thành" ||
                        h.TrangThai_TT == "Chờ duyệt").ToList();

                    return new DoanhThuThangDto
                    {
                        Nam = (short)nam,
                        Thang = (byte)g.Key,
                        TongTienPhong = paid.Sum(h => h.TienPhong ?? 0),
                        TongTienDien = paid.Sum(h => h.TienDienSum ?? 0),
                        TongTienNuoc = paid.Sum(h => h.TienNuocSum ?? 0),
                        TongTienDV = paid.Sum(h => (h.TienDV ?? 0) + (h.TienNoDV ?? 0)),
                        TongCong = paid.Sum(h => h.TongCong),
                        SoHoaDonDaDong = paid.Count(h => h.TrangThai_TT == "Đã hoàn thành"),
                        ChiPhiThang = 0
                    };
                })
                .ToList();

            return grouped;
        }
    }
}
