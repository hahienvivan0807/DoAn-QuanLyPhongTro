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
    // DTOs returned by the API endpoints (consumed by fetch() in JS)
    // ================================================================

    /// <summary>
    /// Mirrors THONGKE_DOANHTHU_THANG – returned by GET /api/thongke/doanh-thu
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
    /// Mirrors THONGKE_TONG – returned by GET /api/thongke/tong-quan
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
    /// Returned by GET /api/thongke/admin-info
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



        public IActionResult OnGet()
        {
 
            return Page();
        }


        public async Task<IActionResult> OnGetAdminInfoAsync()
        {
            try
            {
                // Try to read the current user's ID from claims
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

                // Fallback: first Admin/Manager account
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
                _logger.LogError(ex, "OnGetAdminInfoAsync failed");
                return new JsonResult(new AdminInfoDto { FullName = "Chủ Trọ" });
            }
        }


        public async Task<IActionResult> OnGetTongQuanAsync()
        {
            try
            {
                // 1. Try the pre-computed snapshot first (fast path)
                var snap = await _db.THONGKE_TONG
                    .AsNoTracking()
                    .FirstOrDefaultAsync(t => t.ID == 1);

                if (snap != null)
                {
                    var dto = new TongQuanDto
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
                    };
                    return new JsonResult(dto);
                }

                // 2. Fallback: compute live from source tables
                return new JsonResult(await ComputeLiveTongQuanAsync());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OnGetTongQuanAsync failed");
                return StatusCode(500, "Lỗi khi tải tổng quan.");
            }
        }


        public async Task<IActionResult> OnGetDoanhThuAsync([FromQuery] int nam = 0)
        {
            try
            {
                if (nam <= 0) nam = DateTime.Now.Year;

                // 1. Try snapshot table
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

                // 2. Fallback: aggregate from HDTHANG
                rows = await ComputeDoanhThuFromHdThangAsync(nam);
                return new JsonResult(rows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OnGetDoanhThuAsync failed for year {Nam}", nam);
                return StatusCode(500, "Lỗi khi tải doanh thu.");
            }
        }

        // ================================================================
        // PRIVATE 
        // ================================================================


        private async Task<TongQuanDto> ComputeLiveTongQuanAsync()
        {
            var now = DateTime.Now;
            var month = now.Month;
            var year = now.Year;

            // Current period key e.g. "05/2025"
            var kyNay = $"{month:D2}/{year}";
            var prevDate = now.AddMonths(-1);
            var kyTruoc = $"{prevDate.Month:D2}/{prevDate.Year}";

            // ── Rooms ──────────────────────────────────────────────
            var phongs = await _db.PHONG.AsNoTracking()
                .Select(p => p.TrangThai).ToListAsync();

            int tongPhong = phongs.Count;
            int dangThue = phongs.Count(s => s == "Đã thuê");
            int conTrong = phongs.Count(s => s == "Trống");
            int dangSua = phongs.Count(s => s == "Đang sửa");
            decimal tiLe = tongPhong > 0 ? Math.Round((decimal)dangThue / tongPhong * 100, 2) : 0;

            // ── Revenue this month / last month ────────────────────
            var dtNay = await RevenueForPeriod(kyNay);
            var dtTruoc = await RevenueForPeriod(kyTruoc);
            decimal tang = dtTruoc > 0 ? Math.Round((dtNay - dtTruoc) / dtTruoc * 100, 2) : 0;

            // ── Invoices ───────────────────────────────────────────
            var invoices = await _db.HDTHANG.AsNoTracking()
                .Select(h => new { h.TrangThai_TT, h.HanDong }).ToListAsync();

            int chuaDong = invoices.Count(h => h.TrangThai_TT == "Chưa đóng");
            int sapDenHan = invoices.Count(h => h.TrangThai_TT == "Chưa đóng"
                                                && h.HanDong >= now
                                                && h.HanDong <= now.AddDays(7));
            int quaHan = invoices.Count(h => h.TrangThai_TT == "Quá hạn");

            // ── Service orders ─────────────────────────────────────
            var dvList = await _db.DONDV.AsNoTracking()
                .Where(d => d.TrangThai_DV == "Chờ xử lý")
                .Select(d => d.MucDo).ToListAsync();

            int choXuLy = dvList.Count;
            int khanCap = dvList.Count(m => m == "Khẩn cấp");

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

        private async Task<decimal> RevenueForPeriod(string ky)
        {
            return await _db.HDTHANG.AsNoTracking()
                .Where(h => h.KyThanhToan == ky
                         && (h.TrangThai_TT == "Đã hoàn thành" || h.TrangThai_TT == "Chờ duyệt"))
                .SumAsync(h => (decimal?)h.TongCong) ?? 0;
        }

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
                    var paid = g.Where(h => h.TrangThai_TT == "Đã hoàn thành"
                                         || h.TrangThai_TT == "Chờ duyệt").ToList();
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