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
                .OrderBy(p => p.Tang)
                .ThenBy(p => p.SoPhong)
                .Select(p => new
                {
                    idPhong = p.IDPhong,
                    soPhong = p.SoPhong,
                    tang = p.Tang,
                    dienTich = p.DienTich,
                    giaPhong = p.GiaPhongFix,
                    trangThai = p.TrangThai
                })
                .ToListAsync();

            return Ok(danhSach);
        }
    }
}