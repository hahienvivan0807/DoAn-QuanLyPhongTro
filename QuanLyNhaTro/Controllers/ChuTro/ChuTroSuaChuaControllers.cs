using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

namespace QuanLyNhaTro.Controllers.ChuTro
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChuTroSuaChuaController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;

        public ChuTroSuaChuaController(QuanLyKhuNhaTro context)
        {
            _context = context;
        }

        // ================================================================
        // GET /api/ChuTroSuaChua/danh-sach-
        // Lấy danh sách đơn DV cần phê duyệt (Chờ xử lý)
        // JOIN: DONDV → PHONG (SoPhong), ACCOUNT (FullName người báo)
        // Query param: trangThai (mặc định "Chờ xử lý")
        // ================================================================
        [HttpGet("danh-sach")]
        public async Task<IActionResult> LayDanhSachSuaChua(
            [FromQuery] string trangThai = "Chờ xử lý")
        {
            var result = await _context.DONDV
                .Where(d => d.TrangThai_DV == trangThai)
                .Join(
                    _context.PHONG,
                    d => d.IDPhong,
                    p => p.IDPhong,
                    (d, p) => new { d, p }
                )
                .Join(
                    _context.ACCOUNT,
                    x => x.d.IDUser,
                    a => a.IDUser,
                    (x, a) => new
                    {
                        idDonDV = x.d.IDDonDV,
                        soPhong = x.p.SoPhong,
                        loaiDV = x.d.LoaiDV,
                        mucDo = x.d.MucDo,
                        noiDung = x.d.NoiDung,
                        fullName = a.FullName,
                        ngayTao = x.d.NgayTao,
                        tongTien = x.d.TongTien,
                        trangThai_DV = x.d.TrangThai_DV,
                        anhBienLai = x.d.AnhBienLai,
                        anhKetQua = x.d.AnhKetQua
                    }
                )
                .OrderByDescending(x => x.ngayTao)
                .ToListAsync();

            return Ok(result);
        }

        // ================================================================
        // POST /api/ChuTroSuaChua/phe-duyet/{id}
        // Phê duyệt 1 đơn → TrangThai_DV = "Đang xử lý"
        // ================================================================
        [HttpPost("phe-duyet/{id}")]
        public async Task<IActionResult> PheDuyetSuaChua(int id)
        {
            var don = await _context.DONDV.FirstOrDefaultAsync(d => d.IDDonDV == id);

            if (don == null)
                return NotFound(new { message = "Không tìm thấy đơn." });

            if (don.TrangThai_DV != "Chờ xử lý")
                return BadRequest(new { message = "Đơn không ở trạng thái Chờ xử lý." });

            don.TrangThai_DV = "Đang xử lý";
            don.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã phê duyệt.", idDonDV = id });
        }

        // ================================================================
        // POST /api/ChuTroSuaChua/tu-choi/{id}
        // Từ chối 1 đơn → TrangThai_DV = "Đã hủy" + lưu LyDoHuy
        // Body: { lyDo: string }
        // ================================================================
        [HttpPost("tu-choi/{id}")]
        public async Task<IActionResult> TuChoiSuaChua(int id, [FromBody] TuChoiRequest request)
        {
            var don = await _context.DONDV.FirstOrDefaultAsync(d => d.IDDonDV == id);

            if (don == null)
                return NotFound(new { message = "Không tìm thấy đơn." });

            if (don.TrangThai_DV != "Chờ xử lý")
                return BadRequest(new { message = "Đơn không ở trạng thái Chờ xử lý." });

            don.TrangThai_DV = "Đã hủy";
            don.LyDoHuy = request?.LyDo ?? "Chủ trọ từ chối";
            don.NguoiHuy = "Admin";
            don.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã từ chối.", idDonDV = id });
        }

        // ================================================================
        // POST /api/ChuTroSuaChua/phe-duyet-tat-ca
        // Duyệt tất cả đơn đang "Chờ xử lý" → "Đang xử lý"
        // ================================================================
        [HttpPost("phe-duyet-tat-ca")]
        public async Task<IActionResult> PheDuyetTatCa()
        {
            var danhSach = await _context.DONDV
                .Where(d => d.TrangThai_DV == "Chờ xử lý")
                .ToListAsync();

            if (!danhSach.Any())
                return Ok(new { message = "Không có đơn nào cần duyệt.", soLuong = 0 });

            var now = DateTime.Now;
            foreach (var don in danhSach)
            {
                don.TrangThai_DV = "Đang xử lý";
                don.UpdatedAt = now;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã duyệt tất cả.", soLuong = danhSach.Count });
        }

        // ================================================================
        // Request model cho từ chối
        // ================================================================
        public class TuChoiRequest
        {
            public string? LyDo { get; set; }
        }
    }
}