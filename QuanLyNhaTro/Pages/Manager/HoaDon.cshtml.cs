using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Text.Json;

namespace QuanLyNhaTro.Pages.Manager
{
    // ================================================================
    // VIEW MODEL – HÓA ĐƠN DỊCH VỤ (DONDV)
    // ================================================================
    public class HoaDonDichVuViewModel
    {
        public int Id { get; set; }
        public string SoPhong { get; set; } = "";
        public string TenNguoiThue { get; set; } = "";
        /// <summary>"qua-han" | "sap-den" | "cho-xac-nhan" | "hoan-thanh"</summary>
        public string TrangThai { get; set; } = "";
        public string LoaiDV { get; set; } = "";   // "Nước bình" | "Giặt sấy" | "Dịch vụ"
        public string HanNop { get; set; } = "";
        public string? NgayNop { get; set; }
        public decimal TongTien { get; set; }
        public string SoDienThoai { get; set; } = "";
        public string? AnhBienLai { get; set; }         // ảnh upload từ khách
        public string? GhiChu { get; set; }
    }

    // ================================================================
    // VIEW MODEL – HÓA ĐƠN CUỐI THÁNG (HDTHANG)
    // Nếu khách nợ dịch vụ (TienNoDV > 0 | TienDV của đơn chưa đóng),
    // phần nợ đó đã được cộng vào TienDichVu để hiển thị.
    // ================================================================
    public class HoaDonThangViewModel
    {
        public int Id { get; set; }
        public string SoPhong { get; set; } = "";
        public string TenNguoiThue { get; set; } = "";
        public string TrangThai { get; set; } = "";
        public string KyThanhToan { get; set; } = "";
        public string HanNop { get; set; } = "";
        public string? NgayNop { get; set; }
        public decimal TienPhong { get; set; }
        public decimal TienDien { get; set; }
        public decimal TienNuoc { get; set; }
        /// <summary>
        /// Tổng nợ dịch vụ được cộng dồn vào hóa đơn cuối tháng.
        /// = TienDV (đúng hạn trong tháng) + TienNoDV (nợ quá hạn chuyển sang).
        /// = 0 nếu khách không nợ.
        /// </summary>
        public decimal TienDichVu { get; set; }
        public string SoDienThoai { get; set; } = "";
        public string? GhiChu { get; set; }
        public string? AnhChuyenKhoan { get; set; }
    }

    // ================================================================
    // PAGE MODEL
    // ================================================================
    public class HoaDonModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public HoaDonModel(QuanLyKhuNhaTro db) => _db = db;

        // ── Dữ liệu hóa đơn cuối tháng ───────────────────────────────
        public List<HoaDonThangViewModel> DanhSachHoaDon { get; set; } = new();
        public string DanhSachHoaDonJson { get; set; } = "[]";

        // ── Hóa đơn dịch vụ (tải riêng qua API /api/hoa-don/danh-sach-dv)
        // Trang Razor không render trực tiếp list DV, chỉ phục vụ JS fetch.

        // ── Thống kê tổng (gộp cả 2 loại, hiển thị trên stats cards) ─
        public int TongHoaDon => DanhSachHoaDon.Count;
        public int SoQuaHan => DanhSachHoaDon.Count(h => h.TrangThai == "qua-han");
        public int SoSapDen => DanhSachHoaDon.Count(h => h.TrangThai == "sap-den");
        public int SoChoXacNhan => DanhSachHoaDon.Count(h => h.TrangThai == "cho-xac-nhan");
        public int SoHoanThanh => DanhSachHoaDon.Count(h => h.TrangThai == "hoan-thanh");

        // ── Thông tin manager ─────────────────────────────────────────
        public string TenManager { get; set; } = "Admin";
        public string ChucVuManager { get; set; } = "Quản trị viên";

        // ── Kỳ xem (mặc định tháng hiện tại) ─────────────────────────
        [BindProperty(SupportsGet = true)]
        public string KyXem { get; set; } = DateTime.Now.ToString("MM/yyyy");

        // ================================================================
        // ON GET
        // ================================================================
        public async Task OnGetAsync()
        {
            // ── Thông tin manager từ Claims ───────────────────────────
            var idManagerStr = User.FindFirst("IDUser")?.Value;
            if (int.TryParse(idManagerStr, out int idManager))
            {
                var acc = await _db.ACCOUNT.FindAsync(idManager);
                if (acc != null)
                {
                    TenManager = acc.FullName;
                    ChucVuManager = acc.Roles == "Admin" ? "Quản trị viên" : "Quản lý";
                }
            }

            // ── Truy vấn HDTHANG theo kỳ ─────────────────────────────
            var query = await _db.HDTHANG
                .Where(h => h.KyThanhToan == KyXem)
                .Include(h => h.Phong)
                    .ThenInclude(p => p.HopDongs.Where(hd => hd.TrangThaiHD == "Đang hiệu lực"))
                        .ThenInclude(hd => hd.Tenant)
                .ToListAsync();

            DanhSachHoaDon = query.Select(h =>
            {
                var hopDong = h.Phong.HopDongs.FirstOrDefault();
                var tenant = hopDong?.Tenant;

                // ── Map trạng thái ─────────────────────────────────
                var trangThai = h.TrangThai_TT switch
                {
                    "Quá hạn" => "qua-han",
                    "Chờ duyệt" => "cho-xac-nhan",
                    "Đã hoàn thành" => "hoan-thanh",
                    _ => IsSapDen(h.HanDong) ? "sap-den" : "qua-han"
                };

                // ── Tính nợ DV cộng dồn ────────────────────────────
                // TienDV      : dịch vụ đúng hạn trong tháng (đã thanh toán)
                // TienNoDV    : nợ dịch vụ quá hạn chuyển sang tháng này
                // → TienDichVu = TienDV + TienNoDV
                //   Nếu cả hai đều = 0 thì khách không nợ → không cộng vào hóa đơn
                var noDV = (h.TienDV ?? 0) + (h.TienNoDV ?? 0);

                return new HoaDonThangViewModel
                {
                    Id = h.IDHDThang,
                    SoPhong = h.Phong.SoPhong,
                    TenNguoiThue = tenant?.FullName ?? "—",
                    TrangThai = trangThai,
                    KyThanhToan = $"Tháng {h.KyThanhToan}",
                    HanNop = h.HanDong.ToString("dd/MM/yyyy"),
                    NgayNop = h.NgayDuyet?.ToString("dd/MM/yyyy HH:mm"),
                    TienPhong = h.TienPhong ?? 0,
                    TienDien = h.TienDienSum ?? 0,
                    TienNuoc = h.TienNuocSum ?? 0,
                    TienDichVu = noDV,   // = 0 nếu không nợ → không cộng
                    SoDienThoai = tenant?.Phone ?? "",
                    GhiChu = h.GhiChuDuyet,
                    AnhChuyenKhoan = h.AnhChuyenKhoan,
                };
            }).ToList();

            // ── Serialize JSON cho JS ─────────────────────────────────
            DanhSachHoaDonJson = JsonSerializer.Serialize(DanhSachHoaDon, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
        }

        // ================================================================
        // HELPER
        // ================================================================
        private static bool IsSapDen(DateTime hanDong)
        {
            var con = (hanDong.Date - DateTime.Today).TotalDays;
            return con >= 0 && con <= 5;
        }
    }
}
