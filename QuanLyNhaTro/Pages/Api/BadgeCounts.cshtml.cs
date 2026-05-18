using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

namespace QuanLyNhaTro.Pages.Api
{
    /// <summary>
    /// API endpoint trả về số badge sidebar dùng chung cho tất cả các trang.
    /// Gọi: GET /Api/BadgeCounts
    /// Trả về JSON: { "dichVuMoi": N, "suCoChoXuLy": N }
    /// </summary>
    [Authorize(Roles = "Manager")]
    public class BadgeCountsModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public BadgeCountsModel(QuanLyKhuNhaTro db) => _db = db;

        public async Task<IActionResult> OnGetAsync()
        {
            // Số đơn dịch vụ mới trong 7 ngày gần nhất, đang chờ xử lý
            var dichVuMoi = await _db.DONDV
                .CountAsync(x => x.NgayTao >= DateTime.Now.AddDays(-7)
                              && x.TrangThai_DV == "Chờ xử lý");

            // Tổng số đơn đang chờ xử lý (badge sự cố / bảo trì)
            var suCoChoXuLy = await _db.DONDV
                .CountAsync(x => x.TrangThai_DV == "Chờ xử lý");

            return new JsonResult(new
            {
                dichVuMoi,
                suCoChoXuLy
            });
        }
    }
}