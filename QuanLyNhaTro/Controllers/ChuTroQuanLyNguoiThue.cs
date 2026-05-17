using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

namespace QuanLyNhaTro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChuTroQuanLyNguoiThueController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;
        private readonly IConfiguration _configuration;

        public ChuTroQuanLyNguoiThueController(QuanLyKhuNhaTro context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("ds-phong")]
        public async Task<IActionResult> GetDanhSachPhong([FromQuery] string? trangThai, [FromQuery] string? tuKhoa)
        {
            var query = _context.PHONG.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(trangThai))
                query = query.Where(p => p.TrangThai == trangThai);

            if (!string.IsNullOrWhiteSpace(tuKhoa))
                query = query.Where(p => p.SoPhong.Contains(tuKhoa));

            var dsPhong = await query
                .OrderBy(p => p.Tang)
                .ThenBy(p => p.SoPhong)
                .Select(p => new
                {
                    p.IDPhong,
                    p.SoPhong,
                    p.Tang,
                    p.DienTich,
                    p.GiaPhongFix,
                    p.MoTa,
                    p.TrangThai,
                    p.CreatedAt,

                    HopDong = p.HopDongs
                        .Where(hd => hd.TrangThaiHD == "Đang hiệu lực")
                        .OrderByDescending(hd => hd.NgayBatDau)
                        .Select(hd => new
                        {
                            hd.IDHopDong,
                            hd.IDUser,
                            hd.NgayBatDau,
                            hd.NgayKetThuc,
                            hd.TienCocBanDau,
                            hd.TrangThaiHD,

                            TenKhachThue = hd.Tenant.FullName,
                            SoDienThoai = hd.Tenant.Phone,

                            // ✅ Thêm IsActive từ ACCOUNT
                            IsActive = hd.Tenant.IsActive,

                            SoNgayConLai = hd.NgayKetThuc.HasValue
                                ? (int?)EF.Functions.DateDiffDay(DateTime.UtcNow, hd.NgayKetThuc.Value)
                                : null
                        })
                        .FirstOrDefault()
                })
                .ToListAsync();

            var thongKe = new
            {
                TongPhong = dsPhong.Count,
                PhongTrong = dsPhong.Count(p => p.TrangThai == "Trống"),
                PhongDaThue = dsPhong.Count(p => p.TrangThai == "Đã thuê"),
                PhongDangSua = dsPhong.Count(p => p.TrangThai == "Đang sửa"),
            };

            return Ok(new { success = true, thongKe, danhSach = dsPhong });
        }
        // PUT: api/ChuTroQuanLyNguoiThue/tra-phong/{idUser}
        [HttpPut("tra-phong/{idUser}")]
        public async Task<IActionResult> TraPhong(int idUser, [FromBody] TraPhongDto dto)
        {
            // 1. Khóa tài khoản
            var account = await _context.ACCOUNT.FindAsync(idUser);
            if (account == null) return NotFound(new { success = false, message = "Không tìm tài khoản" });
            account.IsActive = false;

            // 2. Kết thúc hợp đồng đang hiệu lực
            var hopDong = await _context.HOPDONG
                .Where(hd => hd.IDUser == idUser && hd.TrangThaiHD == "Đang hiệu lực")
                .FirstOrDefaultAsync();

            if (hopDong != null)
            {
                hopDong.TrangThaiHD = "Đã kết thúc";
                hopDong.NgayKetThuc = DateTime.Today;
                if (!string.IsNullOrWhiteSpace(dto?.GhiChu))
                    hopDong.GhiChu = dto.GhiChu;

                // 3. Đặt phòng về Trống
                var phong = await _context.PHONG.FindAsync(hopDong.IDPhong);
                if (phong != null) phong.TrangThai = "Trống";
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã trả phòng thành công" });
        }

        // PUT: api/ChuTroQuanLyNguoiThue/khoi-phuc/{idUser}
        [HttpPut("khoi-phuc/{idUser}")]
        public async Task<IActionResult> KhoiPhuc(int idUser)
        {
            var account = await _context.ACCOUNT.FindAsync(idUser);
            if (account == null) return NotFound(new { success = false, message = "Không tìm tài khoản" });

            account.IsActive = true;
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã khôi phục tài khoản" });
        }

        // DTO
        public class TraPhongDto
        {
            public string? GhiChu { get; set; }
        }
        [HttpGet("account/{idUser}")]
        public async Task<IActionResult> GetAccount(int idUser)
        {
            var acc = await _context.ACCOUNT
                .AsNoTracking()
                .Where(a => a.IDUser == idUser)
                .Select(a => new {
                    a.IDUser,
                    a.Username,
                    a.Email,
                    a.FullName,
                    a.Phone,
                    a.IsActive
                })
                .FirstOrDefaultAsync();

            if (acc == null)
                return NotFound(new { success = false });

            return Ok(new { success = true, username = acc.Username, email = acc.Email });
        }
    }
}