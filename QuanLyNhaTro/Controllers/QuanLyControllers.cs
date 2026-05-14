using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;
namespace QuanLyNhaTro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class QuanLyController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;
        private readonly IConfiguration _configuration;

        public QuanLyController(QuanLyKhuNhaTro context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("DanhSachPhong")]
        public async Task<IActionResult> DanhSachPhong()
        {
            var danhSach = await _context.PHONG
                .Select(p => new {
                    idPhong = p.IDPhong,
                    soPhong = p.SoPhong,
                    tang = p.Tang,
                    dienTich = p.DienTich,
                    giaPhong = p.GiaPhongFix,
                    trangThai = p.TrangThai,

                    // Lấy tên người thuê từ hợp đồng đang hiệu lực
                    tenNguoiThue = p.HopDongs
                        .Where(h => h.TrangThaiHD == "Đang hiệu lực")
                        .Select(h => h.Tenant.FullName)
                        .FirstOrDefault()
                })
                .OrderBy(p => p.tang)
                .ThenBy(p => p.soPhong)
                .ToListAsync();

            return Ok(danhSach);
        }
        [HttpGet("ChiTietPhong/{id}")]
        public async Task<IActionResult> ChiTietPhong(int id)
        {
            // Lấy thông tin phòng
            var phong = await _context.PHONG
                .Where(p => p.IDPhong == id)
                .FirstOrDefaultAsync();

            if (phong == null) return NotFound();

            // Lấy hợp đồng đang hiệu lực → tìm người thuê
            var hopDong = await _context.HOPDONG
                .Where(h => h.IDPhong == id && h.TrangThaiHD == "Đang hiệu lực")
                .Include(h => h.Tenant) // ACCOUNT
                .FirstOrDefaultAsync();

            // Lấy thông tin chi tiết khách thuê (KHACH_THUE)
            KHACH_THUE? khachThue = null;
            if (hopDong != null)
            {
                var ktInfo = await _context.KHACH_THUE
                    .Where(k => k.IDUser == hopDong.IDUser)
                    .Select(k => new {
                        k.HoTen,
                        k.SoDienThoai,
                        k.SoCCCD,
                        k.NgaySinh,
                        k.GioiTinh,
                        k.QueQuan
                    })
                    .FirstOrDefaultAsync();
            }

            // Lấy 6 hóa đơn gần nhất
            var hoaDons = await _context.HDTHANG
                .Where(h => h.IDPhong == id)
                .OrderByDescending(h => h.KyThanhToan)
                .Take(6)
                .Select(h => new {
                    thang = h.KyThanhToan,
                    tongTien = h.TongCong,
                    trangThai = h.TrangThai_TT
                })
                .ToListAsync();

            // Lấy 5 sự cố / đơn dịch vụ gần nhất
            var suCos = await _context.DONDV
                .Where(d => d.IDPhong == id)
                .OrderByDescending(d => d.NgayTao)
                .Take(5)
                .Select(d => new {
                    moTa = d.NoiDung,
                    ngay = d.NgayTao.ToString("dd/MM/yyyy"),
                    trangThai = d.TrangThai_DV
                })
                .ToListAsync();

            // Tổng hợp response
            var result = new
            {
                idPhong = phong.IDPhong,
                soPhong = phong.SoPhong,
                tang = phong.Tang,
                dienTich = phong.DienTich,
                giaPhong = phong.GiaPhongFix,
                trangThai = phong.TrangThai,
                moTa = phong.MoTa,

                nguoiThue = khachThue != null ? new
                {
                    hoTen = khachThue.HoTen,
                    soDienThoai = khachThue.SoDienThoai,
                    ngayBatDau = hopDong!.NgayBatDau.ToString("dd/MM/yyyy"),
                    ngayKetThuc = hopDong.NgayKetThuc.HasValue
                                       ? hopDong.NgayKetThuc.Value.ToString("dd/MM/yyyy")
                                       : "—",
                    tienDatCoc = hopDong.TienCocBanDau,
                    trangThaiHD = hopDong.TrangThaiHD
                } : null,

                hoaDons = hoaDons,
                suCos = suCos
            };

            return Ok(result);
        }
    }
}