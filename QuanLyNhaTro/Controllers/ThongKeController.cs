    using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Controllers
{
    [ApiController]
    [Route("api/thongke")]
    public class ThongKeController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _db;
        private readonly ILogger<ThongKeController> _logger;

        public ThongKeController(QuanLyKhuNhaTro db, ILogger<ThongKeController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // ================================================================
        // GET /api/thongke/admin-info
        // ================================================================
        [HttpGet("admin-info")]
        public async Task<IActionResult> GetAdminInfo()
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
                        .FirstOrDefaultAsync();
                }

                // Fallback: lấy tài khoản Admin/Manager đầu tiên
                account ??= await _db.ACCOUNT
                    .AsNoTracking()
                    .Where(a => (a.Roles == "Admin" || a.Roles == "Manager") && a.IsActive)
                    .OrderBy(a => a.IDUser)
                    .FirstOrDefaultAsync();

                return Ok(new
                {
                    fullName = account?.FullName ?? "Chủ Trọ",
                    avatar = account?.Avatar
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAdminInfo failed");
                return Ok(new { fullName = "Chủ Trọ", avatar = (string?)null });
            }
        }

        // ================================================================
        // GET /api/thongke/tong-quan
        // ================================================================
        [HttpGet("tong-quan")]
        public async Task<IActionResult> GetTongQuan()
        {
            try
            {
                // 1. Thử lấy từ bảng snapshot trước (nhanh)
                var snap = await _db.THONGKE_TONG
                    .AsNoTracking()
                    .FirstOrDefaultAsync(t => t.ID == 1);

                if (snap != null)
                {
                    return Ok(new
                    {
                        tongSoPhong = snap.TongSoPhong,
                        phongDangThue = snap.PhongDangThue,
                        phongConTrong = snap.PhongConTrong,
                        phongDangSua = snap.PhongDangSua,
                        tiLeLapDay = snap.TiLeLapDay,
                        doanhThuThangNay = snap.DoanhThuThangNay,
                        doanhThuThangTruoc = snap.DoanhThuThangTruoc,
                        tangTruongDoanhThu = snap.TangTruongDoanhThu,
                        hoaDonChuaDong = snap.HoaDonChuaDong,
                        hoaDonSapDenHan = snap.HoaDonSapDenHan,
                        hoaDonQuaHan = snap.HoaDonQuaHan,
                        donDVChoXuLy = snap.DonDVChoXuLy,
                        donDVKhanCap = snap.DonDVKhanCap,
                        ngayCapNhat = snap.NgayCapNhat
                    });
                }

                // 2. Fallback: tính trực tiếp từ các bảng nguồn
                return Ok(await ComputeLiveTongQuan());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetTongQuan failed");
                return StatusCode(500, "Lỗi khi tải tổng quan.");
            }
        }

        // ================================================================
        // GET /api/thongke/doanh-thu?nam=2025
        // ================================================================
        [HttpGet("doanh-thu")]
        public async Task<IActionResult> GetDoanhThu([FromQuery] int nam = 0)
        {
            try
            {
                if (nam <= 0) nam = DateTime.Now.Year;

                // 1. Thử bảng snapshot
                var rows = await _db.THONGKE_DOANHTHU_THANG
                    .AsNoTracking()
                    .Where(t => t.Nam == (short)nam)
                    .OrderBy(t => t.Thang)
                    .Select(t => new
                    {
                        nam = t.Nam,
                        thang = t.Thang,
                        tongTienPhong = t.TongTienPhong,
                        tongTienDien = t.TongTienDien,
                        tongTienNuoc = t.TongTienNuoc,
                        tongTienDV = t.TongTienDV,
                        tongCong = t.TongCong,
                        soHoaDonDaDong = t.SoHoaDonDaDong,
                        chiPhiThang = t.ChiPhiThang
                    })
                    .ToListAsync();

                if (rows.Any())
                    return Ok(rows);

                // 2. Fallback: tổng hợp từ HDTHANG
                var fallback = await ComputeDoanhThuFromHdThang(nam);
                return Ok(fallback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetDoanhThu failed for year {Nam}", nam);
                return StatusCode(500, "Lỗi khi tải doanh thu.");
            }
        }

        // ================================================================
        // PRIVATE HELPERS
        // ================================================================
        private async Task<object> ComputeLiveTongQuan()
        {
            var now = DateTime.Now;
            var kyNay = $"{now.Month:D2}/{now.Year}";
            var prev = now.AddMonths(-1);
            var kyTruoc = $"{prev.Month:D2}/{prev.Year}";

            // Phòng
            var phongs = await _db.PHONG.AsNoTracking().Select(p => p.TrangThai).ToListAsync();
            int tong = phongs.Count;
            int dangThue = phongs.Count(s => s == "Đã thuê");
            int conTrong = phongs.Count(s => s == "Trống");
            int dangSua = phongs.Count(s => s == "Đang sửa");
            decimal tiLe = tong > 0 ? Math.Round((decimal)dangThue / tong * 100, 2) : 0;

            // Doanh thu
            decimal dtNay = await RevenueForPeriod(kyNay);
            decimal dtTruoc = await RevenueForPeriod(kyTruoc);
            decimal tang = dtTruoc > 0 ? Math.Round((dtNay - dtTruoc) / dtTruoc * 100, 2) : 0;

            // Hóa đơn
            var hds = await _db.HDTHANG.AsNoTracking()
                               .Select(h => new { h.TrangThai_TT, h.HanDong }).ToListAsync();
            int chuaDong = hds.Count(h => h.TrangThai_TT == "Chưa đóng");
            int sapHan = hds.Count(h => h.TrangThai_TT == "Chưa đóng"
                                       && h.HanDong >= now && h.HanDong <= now.AddDays(7));
            int quaHan = hds.Count(h => h.TrangThai_TT == "Quá hạn");

            // Dịch vụ
            var dvs = await _db.DONDV.AsNoTracking()
                               .Where(d => d.TrangThai_DV == "Chờ xử lý")
                               .Select(d => d.MucDo).ToListAsync();
            int choXuLy = dvs.Count;
            int khanCap = dvs.Count(m => m == "Khẩn cấp");

            return new
            {
                tongSoPhong = tong,
                phongDangThue = dangThue,
                phongConTrong = conTrong,
                phongDangSua = dangSua,
                tiLeLapDay = tiLe,
                doanhThuThangNay = dtNay,
                doanhThuThangTruoc = dtTruoc,
                tangTruongDoanhThu = tang,
                hoaDonChuaDong = chuaDong,
                hoaDonSapDenHan = sapHan,
                hoaDonQuaHan = quaHan,
                donDVChoXuLy = choXuLy,
                donDVKhanCap = khanCap,
                ngayCapNhat = now
            };
        }

        private async Task<decimal> RevenueForPeriod(string ky)
        {
            return await _db.HDTHANG.AsNoTracking()
                .Where(h => h.KyThanhToan == ky
                         && (h.TrangThai_TT == "Đã hoàn thành" || h.TrangThai_TT == "Chờ duyệt"))
                .SumAsync(h => (decimal?)h.TongCong) ?? 0;
        }

        private async Task<List<object>> ComputeDoanhThuFromHdThang(int nam)
        {
            var suffix = $"/{nam}";
            var allRows = await _db.HDTHANG
                .AsNoTracking()
                .Where(h => h.KyThanhToan != null && h.KyThanhToan.EndsWith(suffix))
                .ToListAsync();

            var result = allRows
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
                    return (object)new
                    {
                        nam = (short)nam,
                        thang = (byte)g.Key,
                        tongTienPhong = paid.Sum(h => h.TienPhong ?? 0),
                        tongTienDien = paid.Sum(h => h.TienDienSum ?? 0),
                        tongTienNuoc = paid.Sum(h => h.TienNuocSum ?? 0),
                        tongTienDV = paid.Sum(h => (h.TienDV ?? 0) + (h.TienNoDV ?? 0)),
                        tongCong = paid.Sum(h => h.TongCong),
                        soHoaDonDaDong = paid.Count(h => h.TrangThai_TT == "Đã hoàn thành"),
                        chiPhiThang = 0m
                    };
                })
                .ToList();

            return result;
        }
    }
}