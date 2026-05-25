using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

namespace QuanLyNhaTro.Controllers.ChuTro
{
    [Route("api/[controller]")]
    [ApiController]

    public class ChuTroDichVu : ControllerBase
    {

        private readonly QuanLyKhuNhaTro _context;

        public ChuTroDichVu(QuanLyKhuNhaTro context)
        {
            _context = context;
        }
        [HttpGet("danh-sach-dich-vu")]
        public async Task<IActionResult> OnGetDanhSachDichVuAsync()
        {
            var danhSach = await _context.CONFIG_GIA
                .Where(c => c.IsActive)
                .OrderBy(c => c.MaDichVu)
                .Select(c => new
                {
                    c.MaDichVu,
                    c.TenDichVu,
                    c.DonGia,
                    c.DonVi
                })
                .ToListAsync();

            return Ok(danhSach);
        }
        [HttpPut("cap-nhat-dich-vu")]
        public async Task<IActionResult> CapNhatDichVu([FromBody] CapNhatDichVuDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.MaDichVu))
                return BadRequest(new { message = "Dữ liệu không hợp lệ!" });

            var existing = await _context.CONFIG_GIA
                .FirstOrDefaultAsync(c => c.MaDichVu == dto.MaDichVu);

            if (existing == null)
                return NotFound(new { message = $"Không tìm thấy dịch vụ '{dto.MaDichVu}'!" });

            // Đè lên (update)
            existing.TenDichVu = dto.TenDichVu;
            existing.DonGia = dto.DonGia;
            existing.DonVi = dto.DonVi;
            existing.NgayApDung = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thành công!" });
        }

        public class CapNhatDichVuDto
        {
            public string MaDichVu { get; set; } = null!;
            public string TenDichVu { get; set; } = null!;
            public decimal DonGia { get; set; }
            public string DonVi { get; set; } = null!;
        }
    }
}