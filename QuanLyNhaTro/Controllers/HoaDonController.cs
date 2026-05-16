using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using QuanLyNhaTro.Pages.Manager;

namespace QuanLyNhaTro.Controllers
{
    [ApiController]
    [Route("api/hoa-don")]
    [Authorize(Roles = "Admin,Manager")]
    public class HoaDonController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _db;

        public HoaDonController(QuanLyKhuNhaTro db) => _db = db;

        // ============================================================
        // GET /api/hoa-don/danh-sach-dv?ky=MM/yyyy
        // Trả về danh sách hóa đơn dịch vụ (DONDV) của manager đang đăng nhập
        // Chỉ lấy đơn có LoaiDV là "Nước bình" | "Giặt sấy" | "Dịch vụ"
        // (không lấy đơn loại "Hư hỏng" vì đó là bảo trì, không phải hóa đơn thanh toán)
        // ============================================================
        [HttpGet("danh-sach-dv")]
        public async Task<IActionResult> DanhSachDichVu([FromQuery] string? ky = null)
        {
            var kyXem = ky ?? DateTime.Now.ToString("MM/yyyy");

            // Lấy IDManager từ Claims
            var idManagerStr = User.FindFirst("IDUser")?.Value;
            if (!int.TryParse(idManagerStr, out int idManager))
                return Unauthorized();

            // Lấy danh sách phòng được phân công cho manager này
            var idPhongList = await _db.PHONG_MANAGER
                .Where(pm => pm.IDManager == idManager && pm.IsActive)
                .Select(pm => pm.IDPhong)
                .ToListAsync();

            // Xác định khoảng thời gian của kỳ
            if (!DateTime.TryParseExact(kyXem, "MM/yyyy",
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.None, out var kyDate))
                kyDate = DateTime.Now;

            var startOfMonth = new DateTime(kyDate.Year, kyDate.Month, 1);
            var endOfMonth   = startOfMonth.AddMonths(1).AddDays(-1);

            // Query DONDV của tháng đó, lọc theo phòng được giao, chỉ lấy DV có thanh toán
            var donDVList = await _db.DONDV
                .Where(d =>
                    idPhongList.Contains(d.IDPhong) &&
                    d.LoaiDV != "Hư hỏng" &&                      // bỏ đơn bảo trì
                    d.NgayTao >= startOfMonth && d.NgayTao <= endOfMonth)
                .Include(d => d.Tenant)
                .Include(d => d.Phong)
                .OrderByDescending(d => d.NgayTao)
                .ToListAsync();

            var today = DateTime.Today;

            var result = donDVList.Select(d =>
            {
                // Xác định trạng thái dựa trên TrangThai_DV của DONDV
                string trangThai = d.TrangThai_DV switch
                {
                    "Thành công"       => "hoan-thanh",
                    "Chờ thanh toán"   => "cho-xac-nhan",    // khách đã upload ảnh
                    "Đang xử lý"       => "sap-den",          // đang trong hạn
                    "Đã hủy"           => "qua-han",
                    _                  => DinhTrangThaiDV(d.NgayHoanThanh, today)
                };

                return new HoaDonDichVuViewModel
                {
                    Id            = d.IDDonDV,
                    SoPhong       = d.Phong.SoPhong,
                    TenNguoiThue  = d.Tenant.FullName,
                    TrangThai     = trangThai,
                    LoaiDV        = d.LoaiDV,
                    HanNop        = d.NgayHoanThanh?.ToString("dd/MM/yyyy") ?? endOfMonth.ToString("dd/MM/yyyy"),
                    NgayNop       = d.NgayHoanThanh?.ToString("dd/MM/yyyy HH:mm"),
                    TongTien      = d.TongTien,
                    SoDienThoai   = d.Tenant.Phone,
                    AnhBienLai    = d.AnhBienLai,
                    GhiChu        = d.GhiChuXuLy,
                };
            }).ToList();

            return Ok(result);
        }

        // ============================================================
        // POST /api/hoa-don/dv/xac-nhan
        // Quản lý xác nhận thanh toán hóa đơn dịch vụ
        // ============================================================
        [HttpPost("dv/xac-nhan")]
        public async Task<IActionResult> XacNhanDichVu([FromBody] IdRequest req)
        {
            var don = await _db.DONDV.FindAsync(req.Id);
            if (don is null) return NotFound();

            var idManagerStr = User.FindFirst("IDUser")?.Value;
            int.TryParse(idManagerStr, out int idManager);

            don.TrangThai_DV   = "Thành công";
            don.IDManagerXuLy  = idManager;
            don.NgayHoanThanh  = DateTime.Now;
            don.UpdatedAt      = DateTime.Now;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Đã xác nhận thanh toán dịch vụ" });
        }

        // ============================================================
        // POST /api/hoa-don/dv/tu-choi
        // Từ chối ảnh chuyển khoản – yêu cầu khách gửi lại
        // ============================================================
        [HttpPost("dv/tu-choi")]
        public async Task<IActionResult> TuChoiDichVu([FromBody] IdRequest req)
        {
            var don = await _db.DONDV.FindAsync(req.Id);
            if (don is null) return NotFound();

            don.TrangThai_DV = "Chờ thanh toán";  // reset để khách upload lại
            don.AnhBienLai   = null;
            don.UpdatedAt    = DateTime.Now;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Đã từ chối, yêu cầu khách gửi lại ảnh" });
        }

        // ============================================================
        // POST /api/hoa-don/dv/thu-tien-mat
        // Ghi nhận thu tiền mặt cho hóa đơn dịch vụ
        // ============================================================
        [HttpPost("dv/thu-tien-mat")]
        public async Task<IActionResult> ThuTienMatDV([FromBody] IdRequest req)
        {
            var don = await _db.DONDV.FindAsync(req.Id);
            if (don is null) return NotFound();

            var idManagerStr = User.FindFirst("IDUser")?.Value;
            int.TryParse(idManagerStr, out int idManager);

            don.TrangThai_DV   = "Thành công";
            don.IDManagerXuLy  = idManager;
            don.NgayHoanThanh  = DateTime.Now;
            don.GhiChuXuLy     = "Thu tiền mặt trực tiếp";
            don.UpdatedAt      = DateTime.Now;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Đã ghi nhận thu tiền mặt" });
        }

        // ============================================================
        // POST /api/hoa-don/xac-nhan
        // Quản lý xác nhận thanh toán hóa đơn cuối tháng (HDTHANG)
        // ============================================================
        [HttpPost("xac-nhan")]
        public async Task<IActionResult> XacNhanHoaDonThang([FromBody] IdRequest req)
        {
            var hd = await _db.HDTHANG.FindAsync(req.Id);
            if (hd is null) return NotFound();

            var idManagerStr = User.FindFirst("IDUser")?.Value;
            int.TryParse(idManagerStr, out int idManager);

            hd.TrangThai_TT    = "Đã hoàn thành";
            hd.IDManagerDuyet  = idManager;
            hd.NgayDuyet       = DateTime.Now;
            hd.UpdatedAt       = DateTime.Now;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Đã xác nhận hóa đơn cuối tháng" });
        }

        // ============================================================
        // POST /api/hoa-don/tu-choi
        // Từ chối ảnh chuyển khoản của hóa đơn cuối tháng
        // ============================================================
        [HttpPost("tu-choi")]
        public async Task<IActionResult> TuChoiHoaDonThang([FromBody] IdRequest req)
        {
            var hd = await _db.HDTHANG.FindAsync(req.Id);
            if (hd is null) return NotFound();

            hd.TrangThai_TT    = "Chưa đóng";
            hd.AnhChuyenKhoan  = null;
            hd.UpdatedAt       = DateTime.Now;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Đã từ chối, yêu cầu khách gửi lại ảnh" });
        }

        // ============================================================
        // POST /api/hoa-don/thu-tien-mat
        // Ghi nhận thu tiền mặt cho hóa đơn cuối tháng
        // ============================================================
        [HttpPost("thu-tien-mat")]
        public async Task<IActionResult> ThuTienMat([FromBody] IdRequest req)
        {
            var hd = await _db.HDTHANG.FindAsync(req.Id);
            if (hd is null) return NotFound();

            var idManagerStr = User.FindFirst("IDUser")?.Value;
            int.TryParse(idManagerStr, out int idManager);

            hd.TrangThai_TT    = "Đã hoàn thành";
            hd.IDManagerDuyet  = idManager;
            hd.NgayDuyet       = DateTime.Now;
            hd.GhiChuDuyet     = "Thu tiền mặt trực tiếp";
            hd.UpdatedAt       = DateTime.Now;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Đã ghi nhận thu tiền mặt" });
        }

        // ============================================================
        // HELPER: xác định trạng thái DV khi TrangThai_DV chưa rõ
        // ============================================================
        private static string DinhTrangThaiDV(DateTime? hanNop, DateTime today)
        {
            if (hanNop is null) return "sap-den";
            var con = (hanNop.Value.Date - today).TotalDays;
            if (con < 0) return "qua-han";
            if (con <= 5) return "sap-den";
            return "sap-den";
        }

        // ============================================================
        // DTO
        // ============================================================
        public class IdRequest
        {
            public int Id { get; set; }
        }
    }
}
