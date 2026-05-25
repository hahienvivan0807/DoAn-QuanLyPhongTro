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
        // HELPER: Tính trạng thái hiển thị (JS-friendly)
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
        // Trả về danh sách hợp đồng – khớp 100% với fetchContracts() trong JS
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
                    // FIX 1: trả về giá chốt cứng lúc ký, KHÔNG lấy từ PHONG nữa
                    monthlyRent = hd.GiaThueChot,
                    deposit = hd.TienCocBanDau,
                    trangThaiHD = hd.TrangThaiHD,
                    note = hd.GhiChu,
                })
                .ToListAsync();

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
        // Chi tiết 1 hợp đồng – dùng cho openDetailModal() và openEditModal()
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

            var khachThue = await _db.KHACH_THUE
                .AsNoTracking()
                .FirstOrDefaultAsync(k => k.IDUser == hd.IDUser);

            // FIX 2: Đếm số người đang ở ghép hiện tại
            var soKhachGhep = await _db.HOPDONG_KHACHO
                .CountAsync(k => k.IDHopDong == id && k.NgayRa == null);

            // FIX 4: Danh sách dịch vụ đang dùng
            var dichVu = await _db.HOPDONG_DICHVU
                .Where(dv => dv.IDHopDong == id && dv.TrangThai == "Đang dùng")
                .Select(dv => new
                {
                    dv.IDHDDichVu,
                    dv.MaDichVu,
                    dv.TenDichVu,
                    dv.DonGiaChot,
                    dv.DonVi,
                    dv.SoLuong,
                    tongTien = dv.DonGiaChot * dv.SoLuong,
                })
                .ToListAsync();

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
                // FIX 1: giá chốt cứng lúc ký
                monthlyRent = hd.GiaThueChot,
                deposit = hd.TienCocBanDau,
                note = hd.GhiChu,
                paymentCycle = "Hàng tháng",
                status = TinhTrangThai(hd.TrangThaiHD, hd.NgayKetThuc),
                // FIX 2: số người ở ghép
                soKhachGhep,
                // FIX 4: dịch vụ đang dùng
                dichVu,
                // FIX 3: thông tin thanh lý (nếu đã kết thúc)
                ngayThanhLy = hd.NgayThanhLy?.ToString("yyyy-MM-dd"),
                tienCocHoanTra = hd.TienCocHoanTra,
                lyDoKetThuc = hd.LyDoKetThuc,
            });
        }

        // ================================================================
        // POST /api/HopDong/them-hop-dong
        // Tạo hợp đồng mới – khớp với createContract() trong JS
        // ================================================================
        [HttpPost("them-hop-dong")]
        public async Task<IActionResult> ThemHopDong([FromBody] HopDongRequest req)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var phong = await _db.PHONG.FindAsync(req.RoomId);
            if (phong == null)
                return BadRequest(new { message = "Phòng không tồn tại" });

            var tenant = await _db.ACCOUNT.FindAsync(req.TenantId);
            if (tenant == null)
                return BadRequest(new { message = "Người thuê không tồn tại" });

            var hopDongHienTai = await _db.HOPDONG
                .AnyAsync(h => h.IDPhong == req.RoomId && h.TrangThaiHD == "Đang hiệu lực");
            if (hopDongHienTai)
                return BadRequest(new { message = "Phòng này đang có hợp đồng hiệu lực" });

            // FIX 1: Snapshot giá tại thời điểm ký – KHÔNG phụ thuộc PHONG sau này
            // Ưu tiên giá từ form (monthlyRent), fallback về GiaPhongFix
            var giaThueChot = req.MonthlyRent > 0 ? req.MonthlyRent : phong.GiaPhongFix;

            var hopDong = new HOPDONG
            {
                IDUser = req.TenantId,
                IDPhong = req.RoomId,
                NgayBatDau = req.StartDate,
                NgayKetThuc = req.EndDate,
                TienCocBanDau = req.Deposit,
                GiaThueChot = giaThueChot,   // FIX 1
                TrangThaiHD = "Đang hiệu lực",
                GhiChu = req.Note,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            _db.HOPDONG.Add(hopDong);
            await _db.SaveChangesAsync(); // SaveChanges để lấy IDHopDong

            // FIX 2: Tự động thêm người đại diện vào HOPDONG_KHACHO
            var khachThue = await _db.KHACH_THUE
                .AsNoTracking()
                .FirstOrDefaultAsync(k => k.IDUser == req.TenantId);

            _db.HOPDONG_KHACHO.Add(new HOPDONG_KHACHO
            {
                IDHopDong = hopDong.IDHopDong,
                IDUser = req.TenantId,
                HoTen = tenant.FullName,
                SoCCCD = khachThue?.SoCCCD,
                SoDienThoai = tenant.Phone,
                QuanHe = "Đại diện",
                IsChinhChu = true,
                NgayVao = req.StartDate,
                CreatedAt = DateTime.UtcNow,
            });

            // Cập nhật trạng thái phòng
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
        // Cập nhật thông tin hợp đồng – khớp với updateContract() trong JS
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

            // FIX 1: Chỉ cập nhật GiaThueChot nếu người dùng truyền lên (> 0)
            // Không ghi đè snapshot cũ nếu form không truyền giá mới
            if (req.MonthlyRent > 0)
                hd.GiaThueChot = req.MonthlyRent;

            await _db.SaveChangesAsync();

            return Ok(new { message = "Cập nhật hợp đồng thành công" });
        }
    }
}