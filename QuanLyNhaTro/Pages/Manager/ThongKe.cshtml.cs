using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.Manager
{
    // ================================================================
    // DTO nội bộ
    // ================================================================
    public class TopPhongDto
    {
        public string SoPhong { get; set; } = "";
        public decimal TongDoanhThu { get; set; }
        public int SoHoaDon { get; set; }
    }

    public class ThongKeLoaiDonDVDto
    {
        public string Loai { get; set; } = "";
        public int ChoXuLy { get; set; }
        public int DangXuLy { get; set; }
        public int ThanhCong { get; set; }
        public int DaHuy { get; set; }
    }

    public class HoatDongDto
    {
        public string TieuDe { get; set; } = "";
        public string ThoiGian { get; set; } = "";
        public string Icon { get; set; } = "fa-circle";
        public string CssClass { get; set; } = "hd";
    }

    // ================================================================
    // PAGE MODEL
    // ================================================================
    public class ThongKeModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _context;

        public ThongKeModel(QuanLyKhuNhaTro context)
        {
            _context = context;
        }

        // ── Thông tin user ────────────────────────────────────────────
        public ACCOUNT? CurrentUser { get; set; }
        public int SoThongBaoChuaDoc { get; set; }
        public int SoSuCoChoXuLy { get; set; }

        // ── Bộ lọc ────────────────────────────────────────────────────
        /// <summary>Filter hiện tại: hom-nay | 7-ngay | thang-nay | nam-nay</summary>
        [BindProperty(SupportsGet = true)]
        public string Filter { get; set; } = "thang-nay";

        // ── Thống kê phòng ────────────────────────────────────────────
        public int TongSoPhong { get; set; }
        public int PhongDangThue { get; set; }
        public int PhongConTrong { get; set; }
        public int PhongDangSua { get; set; }
        public decimal TiLeLapDay { get; set; }

        // ── Thống kê người thuê ───────────────────────────────────────
        public int SoNguoiThue { get; set; }

        // ── Doanh thu ─────────────────────────────────────────────────
        public decimal DoanhThuThangNay { get; set; }
        public decimal DoanhThuThangTruoc { get; set; }
        public decimal TangTruongDoanhThu { get; set; }
        public decimal DoanhThuNamNay { get; set; }
        public decimal TongTienPhongNam { get; set; }
        public decimal TongTienDienNuocNam { get; set; }
        public decimal TongTienDVNam { get; set; }
        public string ThangTotNhat { get; set; } = "—";
        public int SoHoaDonDaDong { get; set; }

        // Cơ cấu doanh thu tháng này (cho biểu đồ bánh)
        public decimal DoanhThuThangNay_TienPhong { get; set; }
        public decimal DoanhThuThangNay_TienDien { get; set; }
        public decimal DoanhThuThangNay_TienNuoc { get; set; }
        public decimal DoanhThuThangNay_TienDV { get; set; }

        // ── Hóa đơn ───────────────────────────────────────────────────
        public int HoaDonChuaDong { get; set; }
        public int HoaDonChoDuyet { get; set; }
        public int HoaDonQuaHan { get; set; }
        public int HoaDonDaHoanThanh { get; set; }

        // ── Đơn dịch vụ ───────────────────────────────────────────────
        public int DonDVChoXuLy { get; set; }
        public int DonDVKhanCap { get; set; }

        // ── Dữ liệu biểu đồ ──────────────────────────────────────────
        /// <summary>Mảng 12 phần tử — doanh thu từng tháng trong năm</summary>
        public List<decimal> DoanhThuTheoThang { get; set; } = new();

        /// <summary>Thống kê đơn DV theo loại</summary>
        public List<ThongKeLoaiDonDVDto> ThongKeLoaiDonDV { get; set; } = new();

        // ── Top phòng doanh thu ───────────────────────────────────────
        public List<TopPhongDto> TopPhongDoanhThu { get; set; } = new();

        // ── Hoạt động gần đây ─────────────────────────────────────────
        public List<HoatDongDto> HoatDongGanDay { get; set; } = new();

        // ================================================================
        // ON GET
        // ================================================================
        public async Task<IActionResult> OnGetAsync()
        {
            // ── Xác thực ─────────────────────────────────────────────
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idUser))
                return RedirectToPage("/Login");

            CurrentUser = await _context.ACCOUNT
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.IDUser == idUser);

            // ── Xác định khoảng thời gian theo filter ─────────────────
            var now = DateTime.Now;
            DateTime tuNgay = Filter switch
            {
                "hom-nay" => now.Date,
                "7-ngay" => now.Date.AddDays(-6),
                "nam-nay" => new DateTime(now.Year, 1, 1),
                _ => new DateTime(now.Year, now.Month, 1) // thang-nay (default)
            };
            DateTime denNgay = now;

            // ── Kỳ thanh toán hiện tại (MM/yyyy) ─────────────────────
            string kyHienTai = $"{now.Month:D2}/{now.Year}";
            string kyThangTruoc = $"{now.AddMonths(-1).Month:D2}/{now.AddMonths(-1).Year}";

            // ── THÔNG BÁO CHƯA ĐỌC ───────────────────────────────────
            SoThongBaoChuaDoc = await _context.THONGBAO
                .Where(t => t.IDUser == idUser && !t.DaDoc)
                .CountAsync();

            // ── SỰ CỐ CHỜ XỬ LÝ (badge sidebar) ──────────────────────
            SoSuCoChoXuLy = await _context.DONDV
                .Where(d => d.LoaiDV == "Hư hỏng" && d.TrangThai_DV == "Chờ xử lý")
                .CountAsync();

            // ================================================================
            // THỐNG KÊ PHÒNG
            // ================================================================
            var danhSachPhong = await _context.PHONG.AsNoTracking().ToListAsync();
            TongSoPhong = danhSachPhong.Count;
            PhongDangThue = danhSachPhong.Count(p => p.TrangThai == "Đã thuê");
            PhongConTrong = danhSachPhong.Count(p => p.TrangThai == "Trống");
            PhongDangSua = danhSachPhong.Count(p => p.TrangThai == "Đang sửa");
            TiLeLapDay = TongSoPhong > 0
                ? Math.Round((decimal)PhongDangThue / TongSoPhong * 100, 1)
                : 0;

            // ================================================================
            // THỐNG KÊ NGƯỜI THUÊ
            // Đếm hợp đồng đang hiệu lực (mỗi hợp đồng = 1 người thuê chính)
            // ================================================================
            SoNguoiThue = await _context.HOPDONG
                .Where(h => h.TrangThaiHD == "Đang hiệu lực")
                .CountAsync();

            // ================================================================
            // DOANH THU — THÁNG NÀY (từ HDTHANG đã hoàn thành)
            // ================================================================
            var hdThangNay = await _context.HDTHANG
                .Where(h => h.KyThanhToan == kyHienTai && h.TrangThai_TT == "Đã hoàn thành")
                .AsNoTracking()
                .ToListAsync();

            DoanhThuThangNay = hdThangNay.Sum(h => h.TongCong);
            DoanhThuThangNay_TienPhong = hdThangNay.Sum(h => h.TienPhong ?? 0);
            DoanhThuThangNay_TienDien = hdThangNay.Sum(h => h.TienDienSum ?? 0);
            DoanhThuThangNay_TienNuoc = hdThangNay.Sum(h => h.TienNuocSum ?? 0);
            DoanhThuThangNay_TienDV = hdThangNay.Sum(h => (h.TienDV ?? 0) + (h.TienNoDV ?? 0));

            // ── Tháng trước (để tính tăng trưởng) ─────────────────────
            DoanhThuThangTruoc = await _context.HDTHANG
                .Where(h => h.KyThanhToan == kyThangTruoc && h.TrangThai_TT == "Đã hoàn thành")
                .SumAsync(h => h.TongCong);

            if (DoanhThuThangTruoc > 0)
                TangTruongDoanhThu = Math.Round((DoanhThuThangNay - DoanhThuThangTruoc) / DoanhThuThangTruoc * 100, 1);
            else
                TangTruongDoanhThu = DoanhThuThangNay > 0 ? 100 : 0;

            // ================================================================
            // DOANH THU NĂM NAY — từ THONGKE_DOANHTHU_THANG
            // (Fallback: tính trực tiếp từ HDTHANG nếu bảng snapshot rỗng)
            // ================================================================
            var thongKeNam = await _context.THONGKE_DOANHTHU_THANG
                .Where(t => t.Nam == now.Year)
                .AsNoTracking()
                .ToListAsync();

            if (thongKeNam.Any())
            {
                DoanhThuNamNay = thongKeNam.Sum(t => t.TongCong);
                TongTienPhongNam = thongKeNam.Sum(t => t.TongTienPhong);
                TongTienDienNuocNam = thongKeNam.Sum(t => t.TongTienDien + t.TongTienNuoc);
                TongTienDVNam = thongKeNam.Sum(t => t.TongTienDV);
                SoHoaDonDaDong = thongKeNam.Sum(t => t.SoHoaDonDaDong);

                // Tháng tốt nhất
                var thangMax = thongKeNam.OrderByDescending(t => t.TongCong).FirstOrDefault();
                if (thangMax != null && thangMax.TongCong > 0)
                    ThangTotNhat = $"Tháng {thangMax.Thang}";

                // Mảng 12 tháng cho biểu đồ
                DoanhThuTheoThang = Enumerable.Range(1, 12)
                    .Select(m => thongKeNam.FirstOrDefault(t => t.Thang == m)?.TongCong ?? 0)
                    .ToList();
            }
            else
            {
                // Fallback: query trực tiếp HDTHANG
                var hdNam = await _context.HDTHANG
                    .Where(h => h.TrangThai_TT == "Đã hoàn thành"
                             && h.KyThanhToan != null
                             && h.KyThanhToan.EndsWith("/" + now.Year.ToString()))
                    .AsNoTracking()
                    .ToListAsync();

                DoanhThuNamNay = hdNam.Sum(h => h.TongCong);
                TongTienPhongNam = hdNam.Sum(h => h.TienPhong ?? 0);
                TongTienDienNuocNam = hdNam.Sum(h => (h.TienDienSum ?? 0) + (h.TienNuocSum ?? 0));
                TongTienDVNam = hdNam.Sum(h => (h.TienDV ?? 0) + (h.TienNoDV ?? 0));
                SoHoaDonDaDong = hdNam.Count;

                // Nhóm theo tháng
                var nhomThang = hdNam
                    .Where(h => h.KyThanhToan != null)
                    .GroupBy(h =>
                    {
                        // Parse "MM/yyyy" → lấy tháng
                        var parts = h.KyThanhToan!.Split('/');
                        return parts.Length == 2 && int.TryParse(parts[0], out int thang) ? thang : 0;
                    })
                    .ToDictionary(g => g.Key, g => g.Sum(h => h.TongCong));

                DoanhThuTheoThang = Enumerable.Range(1, 12)
                    .Select(m => nhomThang.TryGetValue(m, out var v) ? v : 0)
                    .ToList();

                var thangMaxIdx = DoanhThuTheoThang.IndexOf(DoanhThuTheoThang.Max());
                if (DoanhThuTheoThang.Max() > 0)
                    ThangTotNhat = $"Tháng {thangMaxIdx + 1}";
            }

            // ================================================================
            // HÓA ĐƠN TRẠNG THÁI — THÁNG NÀY
            // ================================================================
            var tatCaHdThang = await _context.HDTHANG
                .Where(h => h.KyThanhToan == kyHienTai)
                .AsNoTracking()
                .ToListAsync();

            HoaDonDaHoanThanh = tatCaHdThang.Count(h => h.TrangThai_TT == "Đã hoàn thành");
            HoaDonChuaDong = tatCaHdThang.Count(h => h.TrangThai_TT == "Chưa đóng");
            HoaDonChoDuyet = tatCaHdThang.Count(h => h.TrangThai_TT == "Chờ duyệt");
            HoaDonQuaHan = tatCaHdThang.Count(h => h.TrangThai_TT == "Quá hạn");

            // ================================================================
            // ĐƠN DỊCH VỤ CHỜ XỬ LÝ (theo filter thời gian)
            // ================================================================
            var donDVFilter = await _context.DONDV
                .Where(d => d.NgayTao >= tuNgay && d.NgayTao <= denNgay)
                .AsNoTracking()
                .ToListAsync();

            DonDVChoXuLy = donDVFilter.Count(d => d.TrangThai_DV == "Chờ xử lý");
            DonDVKhanCap = donDVFilter.Count(d => d.MucDo == "Khẩn cấp"
                                               && d.TrangThai_DV != "Thành công"
                                               && d.TrangThai_DV != "Đã hủy");

            // ================================================================
            // THỐNG KÊ LOẠI ĐƠN DV (cho biểu đồ cột)
            // Tất cả đơn trong filter, nhóm theo LoaiDV
            // ================================================================
            var loaiDVList = new[] { "Nước bình", "Giặt sấy", "Hư hỏng", "Dịch vụ" };
            ThongKeLoaiDonDV = loaiDVList.Select(loai =>
            {
                var nhom = donDVFilter.Where(d => d.LoaiDV == loai).ToList();
                return new ThongKeLoaiDonDVDto
                {
                    Loai = loai,
                    ChoXuLy = nhom.Count(d => d.TrangThai_DV == "Chờ xử lý"),
                    DangXuLy = nhom.Count(d => d.TrangThai_DV == "Đang xử lý"),
                    ThanhCong = nhom.Count(d => d.TrangThai_DV == "Thành công"),
                    DaHuy = nhom.Count(d => d.TrangThai_DV == "Đã hủy")
                };
            }).ToList();

            // ================================================================
            // TOP 5 PHÒNG DOANH THU CAO NHẤT — NĂM NAY
            // ================================================================
            TopPhongDoanhThu = await _context.HDTHANG
                .Where(h => h.TrangThai_TT == "Đã hoàn thành"
                         && h.KyThanhToan != null
                         && h.KyThanhToan.EndsWith("/" + now.Year.ToString()))
                .Include(h => h.Phong)
                .AsNoTracking()
                .GroupBy(h => new { h.IDPhong, h.Phong.SoPhong })
                .Select(g => new TopPhongDto
                {
                    SoPhong = g.Key.SoPhong,
                    TongDoanhThu = g.Sum(h => h.TongCong),
                    SoHoaDon = g.Count()
                })
                .OrderByDescending(t => t.TongDoanhThu)
                .Take(5)
                .ToListAsync();

            // ================================================================
            // HOẠT ĐỘNG GẦN ĐÂY (gộp từ nhiều bảng, lấy 10 mục mới nhất)
            // ================================================================
            var hoatDongList = new List<HoatDongDto>();

            // Hóa đơn mới nhất đã hoàn thành
            var hdMoiNhat = await _context.HDTHANG
                .Where(h => h.TrangThai_TT == "Đã hoàn thành" && h.NgayDuyet.HasValue)
                .Include(h => h.Phong)
                .OrderByDescending(h => h.NgayDuyet)
                .Take(4)
                .AsNoTracking()
                .ToListAsync();

            foreach (var hd in hdMoiNhat)
            {
                hoatDongList.Add(new HoatDongDto
                {
                    TieuDe = $"Hóa đơn phòng {hd.Phong?.SoPhong ?? "?"} — {hd.KyThanhToan} đã thanh toán",
                    ThoiGian = hd.NgayDuyet!.Value.ToString("HH:mm dd/MM/yyyy"),
                    Icon = "fa-file-invoice-dollar",
                    CssClass = "hd"
                });
            }

            // Hợp đồng mới ký
            var hdMoiKy = await _context.HOPDONG
                .Where(h => h.TrangThaiHD == "Đang hiệu lực")
                .Include(h => h.Phong)
                .Include(h => h.Tenant)
                .OrderByDescending(h => h.CreatedAt)
                .Take(3)
                .AsNoTracking()
                .ToListAsync();

            foreach (var hd in hdMoiKy)
            {
                hoatDongList.Add(new HoatDongDto
                {
                    TieuDe = $"Hợp đồng mới: {hd.Tenant?.FullName ?? "?"} — Phòng {hd.Phong?.SoPhong ?? "?"}",
                    ThoiGian = hd.CreatedAt.ToString("HH:mm dd/MM/yyyy"),
                    Icon = "fa-file-contract",
                    CssClass = "hop"
                });
            }

            // Đơn DV mới
            var donDVMoi = await _context.DONDV
                .Include(d => d.Phong)
                .OrderByDescending(d => d.NgayTao)
                .Take(3)
                .AsNoTracking()
                .ToListAsync();

            foreach (var don in donDVMoi)
            {
                bool laSuCo = don.LoaiDV == "Hư hỏng";
                hoatDongList.Add(new HoatDongDto
                {
                    TieuDe = $"{(laSuCo ? "Sự cố" : "Đơn DV")} phòng {don.Phong?.SoPhong ?? "?"}: {(don.NoiDung?.Length > 35 ? don.NoiDung.Substring(0, 35) + "..." : don.NoiDung ?? don.LoaiDV)}",
                    ThoiGian = don.NgayTao.ToString("HH:mm dd/MM/yyyy"),
                    Icon = laSuCo ? "fa-tools" : "fa-concierge-bell",
                    CssClass = laSuCo ? "sc" : "dv"
                });
            }

            // Sắp xếp theo thời gian, lấy 10 mục
            HoatDongGanDay = hoatDongList
                .OrderByDescending(h =>
                {
                    if (DateTime.TryParseExact(h.ThoiGian, "HH:mm dd/MM/yyyy",
                        System.Globalization.CultureInfo.InvariantCulture,
                        System.Globalization.DateTimeStyles.None, out var dt))
                        return dt;
                    return DateTime.MinValue;
                })
                .Take(10)
                .ToList();

            return Page();
        }
    }
}