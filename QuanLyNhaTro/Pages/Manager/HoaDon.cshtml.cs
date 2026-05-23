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
        public string LoaiDV { get; set; } = "";
        public string HanNop { get; set; } = "";
        public string? NgayNop { get; set; }
        public decimal TongTien { get; set; }
        public string SoDienThoai { get; set; } = "";
        public string? AnhBienLai { get; set; }
        public string? GhiChu { get; set; }
    }

    // ================================================================
    // VIEW MODEL – HÓA ĐƠN CUỐI THÁNG (HDTHANG)
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
        public decimal TienDichVu { get; set; }
        public string SoDienThoai { get; set; } = "";
        public string? GhiChu { get; set; }
        public string? AnhChuyenKhoan { get; set; }
        /// <summary>true = khách đã gửi ảnh CK, đang chờ quản lý xác nhận</summary>
        public bool CoAnhChoXacNhan { get; set; }
    }

    // ================================================================
    // PAGE MODEL
    // ================================================================
    public class HoaDonModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public HoaDonModel(QuanLyKhuNhaTro db) => _db = db;

        public List<HoaDonThangViewModel> DanhSachHoaDon { get; set; } = new();
        public string DanhSachHoaDonJson { get; set; } = "[]";

        public List<HoaDonDichVuViewModel> DanhSachDonDVChoXacNhan { get; set; } = new();
        public string DanhSachDonDVChoXacNhanJson { get; set; } = "[]";

        public int TongHoaDon => DanhSachHoaDon.Count;
        public int SoQuaHan => DanhSachHoaDon.Count(h => h.TrangThai == "qua-han");
        public int SoSapDen => DanhSachHoaDon.Count(h => h.TrangThai == "sap-den");
        public int SoChoXacNhan => DanhSachHoaDon.Count(h => h.TrangThai == "cho-xac-nhan")
                                 + DanhSachDonDVChoXacNhan.Count;
        public int SoHoanThanh => DanhSachHoaDon.Count(h => h.TrangThai == "hoan-thanh");

        public string TenManager { get; set; } = "Admin";
        public string ChucVuManager { get; set; } = "Quản trị viên";

        [BindProperty(SupportsGet = true)]
        public string KyXem { get; set; } = DateTime.Now.ToString("MM/yyyy");

        public async Task OnGetAsync()
        {
            var idStr = User.FindFirst("IDUser")?.Value
                     ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(idStr, out int idManager))
            {
                // Truy vấn trực tiếp từ bảng ACCOUNT trong SQL Server
                var acc = await _db.ACCOUNT
                    .Where(a => a.IDUser == idManager && a.IsActive)
                    .Select(a => new { a.FullName, a.Roles })
                    .FirstOrDefaultAsync();

                if (acc != null)
                {
                    TenManager = acc.FullName;
                    ChucVuManager = acc.Roles switch
                    {
                        "Admin" => "Quản trị viên",
                        "Manager" => "Quản lý",
                        _ => acc.Roles
                    };
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

                // ── Map trạng thái ──────────────────────────────────
                // "Chờ duyệt"     = khách đã gửi ảnh CK, quản lý chưa xác nhận → cho-xac-nhan
                // "Đã hoàn thành" = quản lý đã xác nhận HOẶC thu tiền mặt      → hoan-thanh
                // "Quá hạn"       = đã quá hạn thanh toán                       → qua-han
                // Các giá trị khác ("Chưa đóng", null...) → xác định theo ngày hạn
                var trangThai = h.TrangThai_TT switch
                {
                    "Quá hạn" => "qua-han",
                    "Chờ duyệt" => "cho-xac-nhan",
                    "Đã hoàn thành" => "hoan-thanh",
                    _ => IsSapDen(h.HanDong) ? "sap-den" : "qua-han"
                };

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
                    TienDichVu = noDV,
                    SoDienThoai = tenant?.Phone ?? "",
                    GhiChu = h.GhiChuDuyet,
                    // Có ảnh & đang "Chờ duyệt" → hiện nút xác nhận cho manager
                    AnhChuyenKhoan = h.AnhChuyenKhoan,
                    CoAnhChoXacNhan = trangThai == "cho-xac-nhan" && !string.IsNullOrEmpty(h.AnhChuyenKhoan),
                };
            }).ToList();

            DanhSachHoaDonJson = JsonSerializer.Serialize(DanhSachHoaDon, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            var donDVChoXacNhan = await _db.DONDV
                .Where(d => d.TrangThai_DV == "Chờ duyệt" && d.AnhBienLai != null)
                .Include(d => d.Phong)
                .Include(d => d.Tenant)
                .ToListAsync();

            DanhSachDonDVChoXacNhan = donDVChoXacNhan.Select(d => new HoaDonDichVuViewModel
            {
                Id = d.IDDonDV,
                SoPhong = d.Phong.SoPhong,
                TenNguoiThue = d.Tenant?.FullName ?? "—",   
                TrangThai = "cho-xac-nhan",
                LoaiDV = d.LoaiDV,
                HanNop = d.NgayHetHan?.ToString("dd/MM/yyyy") ?? "—", 
                NgayNop = d.UpdatedAt.ToString("dd/MM/yyyy HH:mm"),
                TongTien = d.TongTien,
                SoDienThoai = d.Tenant?.Phone ?? "",
                AnhBienLai = d.AnhBienLai,
                GhiChu = d.GhiChuXuLy,
            }).ToList();

            DanhSachDonDVChoXacNhanJson = JsonSerializer.Serialize(DanhSachDonDVChoXacNhan, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
        }

        // ================================================================
        // API: XÁC NHẬN THANH TOÁN HDTHANG (POST /api/hoa-don/xac-nhan)
        // ================================================================
        public async Task<IActionResult> OnPostXacNhanAsync([FromBody] IdRequest req)
        {
            var hd = await _db.HDTHANG.FindAsync(req.Id);
            if (hd == null) return NotFound();

            if (hd.TrangThai_TT == "Đã hoàn thành")
                return BadRequest(new { message = "Hóa đơn đã được thanh toán trước đó." });

            if (hd.TrangThai_TT != "Chờ duyệt")
                return BadRequest(new { message = "Hóa đơn không ở trạng thái chờ xác nhận." });

            var idStr = User.FindFirst("IDUser")?.Value
                     ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(idStr, out int idManager);

            hd.TrangThai_TT = "Đã hoàn thành";
            hd.NgayDuyet = DateTime.Now;
            hd.IDManagerDuyet = idManager > 0 ? idManager : null;
            hd.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // API: TỪ CHỐI THANH TOÁN HDTHANG (POST /api/hoa-don/tu-choi)
        // ================================================================
        public async Task<IActionResult> OnPostTuChoiAsync([FromBody] IdRequest req)
        {
            var hd = await _db.HDTHANG.FindAsync(req.Id);
            if (hd == null) return NotFound();

            if (hd.TrangThai_TT != "Chờ duyệt")
                return BadRequest(new { message = "Hóa đơn không ở trạng thái chờ xác nhận." });

            // Reset về "Quá hạn" để PageModel map đúng → "qua-han"
            hd.TrangThai_TT = "Quá hạn";
            hd.AnhChuyenKhoan = null;
            hd.NgayDuyet = null;
            hd.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // API: GHI THU TIỀN MẶT HDTHANG (POST /api/hoa-don/thu-tien-mat)
        // ================================================================
        public async Task<IActionResult> OnPostThuTienMatAsync([FromBody] IdRequest req)
        {
            var hd = await _db.HDTHANG.FindAsync(req.Id);
            if (hd == null) return NotFound();

            // Guard: không thu tiền mặt nếu đã hoàn thành
            if (hd.TrangThai_TT == "Đã hoàn thành")
                return BadRequest(new { message = "Hóa đơn đã được thanh toán." });

            var idStr = User.FindFirst("IDUser")?.Value
                     ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(idStr, out int idManager);

            hd.TrangThai_TT = "Đã hoàn thành";
            hd.NgayDuyet = DateTime.Now;
            hd.IDManagerDuyet = idManager > 0 ? idManager : null;
            hd.GhiChuDuyet = "Thu tiền mặt";
            hd.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // API: XÁC NHẬN THANH TOÁN DONDV (POST /api/hoa-don/xac-nhan-dich-vu)
        // Task 3 – approve guest's uploaded receipt for Giặt sấy / Nước bình
        // ================================================================
        public async Task<IActionResult> OnPostXacNhanDichVuAsync([FromBody] IdRequest req)
        {
            var don = await _db.DONDV.FindAsync(req.Id);
            if (don == null) return NotFound();

            if (don.TrangThai_DV == "Thành công")
                return BadRequest(new { message = "Đơn dịch vụ đã được xác nhận trước đó." });

            if (don.TrangThai_DV != "Chờ duyệt")
                return BadRequest(new { message = "Đơn dịch vụ không ở trạng thái chờ xác nhận." });

            var idStr = User.FindFirst("IDUser")?.Value
                     ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(idStr, out int idManager);

            don.TrangThai_DV = "Thành công";   // ← đúng theo constraint DONDV
            don.IDManagerXuLy = idManager > 0 ? idManager : don.IDManagerXuLy;
            don.NgayXuLy = DateTime.Now;
            don.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // API: TỪ CHỐI THANH TOÁN DONDV (POST /api/hoa-don/tu-choi-dich-vu)
        // Task 3 – reject guest's receipt; reset so they can re-upload
        // ================================================================
        public async Task<IActionResult> OnPostTuChoiDichVuAsync([FromBody] IdRequest req)
        {
            var don = await _db.DONDV.FindAsync(req.Id);
            if (don == null) return NotFound();

            if (don.TrangThai_DV != "Chờ duyệt")
                return BadRequest(new { message = "Đơn dịch vụ không ở trạng thái chờ xác nhận." });

            // Reset về "Chờ thanh toán" — xóa ảnh để khách có thể gửi lại
            don.TrangThai_DV = "Chờ thanh toán";
            don.AnhBienLai = null;
            don.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
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

    public class IdRequest
    {
        public int Id { get; set; }
    }
}
