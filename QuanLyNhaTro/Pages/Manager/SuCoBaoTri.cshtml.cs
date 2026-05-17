using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.Manager
{
    public class SuCoBaoTriModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _context;

        public SuCoBaoTriModel(QuanLyKhuNhaTro context)
        {
            _context = context;
        }

        // ================================================================
        // PROPERTIES BINDING CHO VIEW
        // ================================================================

        /// <summary>Danh sách sự cố/bảo trì: DONDV WHERE LoaiDV = 'Hư hỏng'</summary>
        public IEnumerable<DONDV> DanhSachSuCo { get; set; } = new List<DONDV>();

        /// <summary>Thống kê: Tổng số sự cố</summary>
        public int TongSuCo { get; set; }

        /// <summary>Thống kê: Số đang xử lý (TrangThai_DV = 'Đang xử lý')</summary>
        public int DangXuLy { get; set; }

        /// <summary>Thống kê: Số đã xử lý (TrangThai_DV = 'Thành công')</summary>
        public int DaXuLy { get; set; }

        /// <summary>Thống kê: Số khẩn cấp (MucDo = 'Khẩn cấp' AND TrangThai_DV != 'Thành công')</summary>
        public int KhanCap { get; set; }

        /// <summary>Số sự cố chưa xử lý (cho badge sidebar)</summary>
        public int SoSuCoChoXuLy { get; set; }

        /// <summary>Số thông báo chưa đọc</summary>
        public int SoThongBaoChuaDoc { get; set; }

        /// <summary>Thông tin user đang đăng nhập</summary>
        public ACCOUNT? CurrentUser { get; set; }

        // ================================================================
        // ON GET
        // ================================================================
        public async Task<IActionResult> OnGetAsync()
        {
            // Lấy IDUser từ Claims (JWT / Cookie auth)
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idUser))
                return RedirectToPage("/Login");

            // Lấy thông tin user hiện tại
            CurrentUser = await _context.ACCOUNT
                .FirstOrDefaultAsync(a => a.IDUser == idUser);

            // ----------------------------------------------------------------
            // QUERY CHÍNH:
            // Lấy tất cả DONDV có LoaiDV = 'Hư hỏng'
            // Include Phong, Tenant (người gửi), ManagerXuLy (người xử lý)
            // ----------------------------------------------------------------
            DanhSachSuCo = await _context.DONDV
                .Include(d => d.Phong)
                .Include(d => d.Tenant)
                .Include(d => d.ManagerXuLy)
                .OrderByDescending(d => d.MucDo == "Khẩn cấp")   // Khẩn cấp lên đầu
                .ThenByDescending(d => d.NgayTao)
                .AsNoTracking()
                .ToListAsync();

            // ----------------------------------------------------------------
            // THỐNG KÊ
            // ----------------------------------------------------------------
            TongSuCo = DanhSachSuCo.Count();

            DangXuLy = DanhSachSuCo.Count(d =>
                d.TrangThai_DV == "Chờ xử lý" ||
                d.TrangThai_DV == "Đang xử lý");

            DaXuLy = DanhSachSuCo.Count(d => d.TrangThai_DV == "Thành công");

            KhanCap = DanhSachSuCo.Count(d =>
                d.MucDo == "Khẩn cấp" &&
                d.TrangThai_DV != "Thành công" &&
                d.TrangThai_DV != "Đã hủy");

            SoSuCoChoXuLy = DanhSachSuCo.Count(d => d.TrangThai_DV == "Chờ xử lý");

            // Số thông báo chưa đọc
            SoThongBaoChuaDoc = await _context.THONGBAO
                .Where(t => t.IDUser == idUser && !t.DaDoc)
                .CountAsync();

            return Page();
        }

        // ================================================================
        // HANDLER: BẮT ĐẦU XỬ LÝ
        // POST: /Manager/SuCoBaoTri?handler=BatDauXuLy
        // ================================================================
        public async Task<IActionResult> OnPostBatDauXuLyAsync(int idDon, string? ghiChu)
        {
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idManager))
                return Unauthorized();

            var don = await _context.DONDV
                .FirstOrDefaultAsync(d => d.IDDonDV == idDon && d.LoaiDV == "Hư hỏng");

            if (don == null) return NotFound();

            // Chỉ được bắt đầu xử lý khi đang "Chờ xử lý"
            if (don.TrangThai_DV != "Chờ xử lý")
                return BadRequest("Trạng thái không hợp lệ.");

            don.TrangThai_DV = "Đang xử lý";
            don.IDManagerXuLy = idManager;
            don.NgayXuLy = DateTime.UtcNow;
            don.GhiChuXuLy = ghiChu;
            don.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // HANDLER: HOÀN THÀNH XỬ LÝ
        // POST: /Manager/SuCoBaoTri?handler=HoanThanh
        // ================================================================
        public async Task<IActionResult> OnPostHoanThanhAsync(int idDon, string? ghiChu)
        {
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idManager))
                return Unauthorized();

            var don = await _context.DONDV
                .FirstOrDefaultAsync(d => d.IDDonDV == idDon && d.LoaiDV == "Hư hỏng");

            if (don == null) return NotFound();

            if (don.TrangThai_DV != "Đang xử lý")
                return BadRequest("Trạng thái không hợp lệ.");

            don.TrangThai_DV = "Thành công";
            don.GhiChuXuLy = ghiChu;
            don.NgayHoanThanh = DateTime.UtcNow;
            don.IDManagerXuLy = idManager;
            don.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }
    }
}