using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

namespace QuanLyNhaTro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HopDongController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;

        public HopDongController(QuanLyKhuNhaTro context)
        {
            _context = context;
        }
        [HttpGet("danh-sach-hop-dong")]
        public async Task<IActionResult> GetDanhSachHopDong()
        {
            var danhSachHopDong = await _context.HOPDONG
                .Include(hd => hd.Phong)
                .Include(hd => hd.Tenant)
                .Select(hd => new
                {
                    hd.IDHopDong,           // ← thêm: ID để view/edit/delete
                    hd.GhiChu,              // ← thêm: ghi chú
                    hd.TrangThaiHD,         // ← thêm: trạng thái để map status
                    hd.NgayBatDau,
                    hd.NgayKetThuc,
                    hd.TienCocBanDau,
                    Phong = new
                    {
                        hd.Phong.IDPhong,   // ← thêm: ID phòng
                        hd.Phong.SoPhong,
                        hd.Phong.GiaPhongFix  // ← thêm: giá phòng/tháng
                    },
                    NguoiThue = new
                    {
                        hd.Tenant.IDUser,
                        hd.Tenant.FullName,
                        hd.Tenant.Phone
                    }
                })
                .ToListAsync();

            return Ok(danhSachHopDong);
        }
    }
}