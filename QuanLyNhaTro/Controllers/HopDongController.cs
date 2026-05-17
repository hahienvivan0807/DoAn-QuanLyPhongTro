using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

namespace QuanLyNhaTro.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class HopDongController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _db;

        public HopDongController(QuanLyKhuNhaTro db)
        {
            _db = db;
        }

        // ================================================================
        // Helper: Tính trạng thái hiển thị từ TrangThaiHD + ngày kết thúc
        // ================================================================
        private static string TinhTrangThai(string trangThaiHD, DateTime? ngayKetThuc)
        {
            if (trangThaiHD == "Đã kết thúc" || trangThaiHD == "Đã hủy")
                return "settled";

            if (ngayKetThuc.HasValue)
            {
                var daysLeft = (ngayKetThuc.Value.Date - DateTime.Today).Days;
                if (daysLeft < 0) return "expired";
                if (daysLeft <= 30) return "expiring";
            }
            return "active";
        }

        // ================================================================
        // GET /api/HopDong/danh-sach-hop-dong
        // Trả về toàn bộ hợp đồng kèm thông tin phòng + người thuê
        // ================================================================
        [HttpGet("danh-sach-hop-dong")]
        public async Task<IActionResult> DanhSachHopDong()
        {
            var list = await _db.HOPDONG
                .AsNoTracking()
                .Include(hd => hd.Phong)
                .Include(hd => hd.Tenant)
                .OrderByDescending(hd => hd.CreatedAt)
                .Select(hd => new
                {
                    contractId = hd.IDHopDong,
                    contractCode = $"HD-{hd.IDHopDong:D4}",
                    tenantName = hd.Tenant.FullName,
                    tenantPhone = hd.Tenant.Phone,
                    tenantEmail = hd.Tenant.Email,
                    roomName = hd.Phong.SoPhong,
                    roomId = hd.IDPhong,
                    tenantId = hd.IDUser,
                    startDate = hd.NgayBatDau,
                    endDate = hd.NgayKetThuc,
                    monthlyRent = hd.Phong.GiaPhongFix,
                    deposit = hd.TienCocBanDau,
                    trangThaiHD = hd.TrangThaiHD,
                    note = hd.GhiChu,
                })
                .ToListAsync();

            // Gắn status JS-friendly sau khi query
            var result = list.Select(hd => new
            {
                hd.contractId,
                hd.contractCode,
                hd.tenantName,
                hd.tenantPhone,
                hd.tenantEmail,
                hd.roomName,
                hd.roomId,
                hd.tenantId,
                startDate = hd.startDate.ToString("yyyy-MM-dd"),
                endDate = hd.endDate?.ToString("yyyy-MM-dd"),
                hd.monthlyRent,
                hd.deposit,
                hd.note,
                status = TinhTrangThai(hd.trangThaiHD, hd.endDate),
            });

            return Ok(result);
        }

        // ================================================================
        // GET /api/HopDong/chi-tiet/{id}
        // Trả về chi tiết 1 hợp đồng (kèm CCCD, email từ KHACH_THUE)
        // ================================================================
        [HttpGet("chi-tiet/{id:int}")]
        public async Task<IActionResult> ChiTiet(int id)
        {
            var hd = await _db.HOPDONG
                .AsNoTracking()
                .Include(h => h.Phong)
                .Include(h => h.Tenant)
                .FirstOrDefaultAsync(h => h.IDHopDong == id);

            if (hd == null) return NotFound(new { message = "Không tìm thấy hợp đồng" });

            // Lấy thêm CCCD từ bảng KHACH_THUE nếu có
            var khachThue = await _db.KHACH_THUE
                .AsNoTracking()
                .FirstOrDefaultAsync(k => k.IDUser == hd.IDUser);

            return Ok(new
            {
                contractId = hd.IDHopDong,
                contractCode = $"HD-{hd.IDHopDong:D4}",
                tenantName = hd.Tenant.FullName,
                tenantPhone = hd.Tenant.Phone,
                tenantEmail = hd.Tenant.Email,
                tenantIdCard = khachThue?.SoCCCD,
                roomName = hd.Phong.SoPhong,
                roomId = hd.IDPhong,
                tenantId = hd.IDUser,
                startDate = hd.NgayBatDau.ToString("yyyy-MM-dd"),
                endDate = hd.NgayKetThuc?.ToString("yyyy-MM-dd"),
                monthlyRent = hd.Phong.GiaPhongFix,
                deposit = hd.TienCocBanDau,
                note = hd.GhiChu,
                paymentCycle = "Hàng tháng",
                status = TinhTrangThai(hd.TrangThaiHD, hd.NgayKetThuc),
            });
        }

        // ================================================================
        // POST /api/HopDong/them-hop-dong
        // Tạo hợp đồng mới
        // ================================================================
        [HttpPost("them-hop-dong")]
        public async Task<IActionResult> ThemHopDong([FromBody] HopDongRequest req)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra phòng tồn tại
            var phong = await _db.PHONG.FindAsync(req.RoomId);
            if (phong == null)
                return BadRequest(new { message = "Phòng không tồn tại" });

            // Kiểm tra người thuê tồn tại
            var tenant = await _db.ACCOUNT.FindAsync(req.TenantId);
            if (tenant == null)
                return BadRequest(new { message = "Người thuê không tồn tại" });

            // Kiểm tra phòng đã có hợp đồng đang hiệu lực chưa
            var hopDongHienTai = await _db.HOPDONG
                .AnyAsync(h => h.IDPhong == req.RoomId && h.TrangThaiHD == "Đang hiệu lực");
            if (hopDongHienTai)
                return BadRequest(new { message = "Phòng này đang có hợp đồng hiệu lực" });

            var hopDong = new HOPDONG
            {
                IDUser = req.TenantId,
                IDPhong = req.RoomId,
                NgayBatDau = req.StartDate,
                NgayKetThuc = req.EndDate,
                TienCocBanDau = req.Deposit,
                TrangThaiHD = "Đang hiệu lực",
                GhiChu = req.Note,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            _db.HOPDONG.Add(hopDong);

            // Cập nhật trạng thái phòng → Đã thuê
            phong.TrangThai = "Đã thuê";

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Tạo hợp đồng thành công",
                contractId = hopDong.IDHopDong,
                contractCode = $"HD-{hopDong.IDHopDong:D4}",
            });
        }

        // ================================================================
        // PUT /api/HopDong/cap-nhat/{id}
        // Cập nhật hợp đồng
        // ================================================================
        [HttpPut("cap-nhat/{id:int}")]
        public async Task<IActionResult> CapNhat(int id, [FromBody] HopDongRequest req)
        {
            var hd = await _db.HOPDONG.FindAsync(id);
            if (hd == null) return NotFound(new { message = "Không tìm thấy hợp đồng" });

            hd.NgayBatDau = req.StartDate;
            hd.NgayKetThuc = req.EndDate;
            hd.TienCocBanDau = req.Deposit;
            hd.GhiChu = req.Note;
            hd.UpdatedAt = DateTime.UtcNow;

            // Map status từ JS về TrangThaiHD
            hd.TrangThaiHD = req.Status switch
            {
                "settled" => "Đã kết thúc",
                "expired" => "Đã hết hạn",
                _ => "Đang hiệu lực",
            };

            await _db.SaveChangesAsync();

            return Ok(new { message = "Cập nhật hợp đồng thành công" });
        }

        // ================================================================
        // DELETE /api/HopDong/xoa/{id}
        // Xóa (thanh lý) hợp đồng – chuyển trạng thái, không xóa vật lý
        // ================================================================
        [HttpDelete("xoa/{id:int}")]
        public async Task<IActionResult> Xoa(int id)
        {
            var hd = await _db.HOPDONG
                .Include(h => h.Phong)
                .FirstOrDefaultAsync(h => h.IDHopDong == id);

            if (hd == null) return NotFound(new { message = "Không tìm thấy hợp đồng" });

            // Soft delete: đổi trạng thái thay vì xóa thật
            hd.TrangThaiHD = "Đã hủy";
            hd.NgayKetThuc = DateTime.Today;
            hd.UpdatedAt = DateTime.UtcNow;

            // Trả phòng về trống nếu không còn HĐ nào hiệu lực
            var conHdKhac = await _db.HOPDONG
                .AnyAsync(h => h.IDPhong == hd.IDPhong
                            && h.IDHopDong != id
                            && h.TrangThaiHD == "Đang hiệu lực");
            if (!conHdKhac)
                hd.Phong.TrangThai = "Trống";

            await _db.SaveChangesAsync();

            return Ok(new { message = "Đã hủy hợp đồng thành công" });
        }
    }

    // ================================================================
    // DTO – Request body cho thêm / cập nhật
    // ================================================================
    public class HopDongRequest
    {
        public int TenantId { get; set; }
        public int RoomId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Deposit { get; set; }
        public string? Note { get; set; }
        public string? Status { get; set; }
    }
}
