using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

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
        public string ChucVu { get; set; } = "Quản trị viên";
        public string? AvatarUrl { get; set; }

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

            // Tên người dùng từ Claims
            var claim = User.FindFirst("FullName") ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name);
            if (claim != null) TenNguoiDung = claim.Value;

            // Thống kê tổng quan
            ThongKeTong = await _db.THONGKE_TONG.FirstOrDefaultAsync() ?? new THONGKE_TONG();

            // Doanh thu 12 tháng của năm hiện tại
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
                .OrderBy(x => x.Tang).ThenBy(x => x.SoPhong)
                .ToListAsync();
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst("IDUser") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
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
}
