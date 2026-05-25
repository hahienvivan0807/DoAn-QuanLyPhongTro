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
            // [LỖI 1 ĐÃ SỬA] Chỉ lấy phòng được phân công cho manager này,
            // lọc LoaiDV = 'Hư hỏng' để đảm bảo data isolation.
            // ----------------------------------------------------------------

            // Lấy IDManager từ Claims (hỗ trợ cả claim tùy chỉnh và claim chuẩn)
            var idStr = User.FindFirst("IDUser")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(idStr, out int idManager);

            // Lấy danh sách IDPhong được phân công cho manager
            var idPhong = await _context.PHONG_MANAGER
                .AsNoTracking()
                .Where(pm => pm.IDManager == idManager && pm.IsActive)
                .Select(pm => pm.IDPhong)
                .ToListAsync();

            // Nếu không có phòng nào được phân công, trả về danh sách rỗng
            if (!idPhong.Any())
            {
                DanhSachSuCo = new List<DONDV>();
                TongSuCo = 0;
                DangXuLy = 0;
                DaXuLy = 0;
                KhanCap = 0;
                SoSuCoChoXuLy = 0;
                return Page();
            }

            // Chỉ lấy DONDV có LoaiDV = 'Hư hỏng' và thuộc phòng được phân công
            DanhSachSuCo = await _context.DONDV
                .Where(d => d.LoaiDV == "Hư hỏng" && idPhong.Contains(d.IDPhong))
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
        public async Task<IActionResult> OnPostBatDauXuLyAsync([FromBody] SuCoRequest req)
        {
            // [LỖI 2 ĐÃ SỬA] Kiểm tra quyền trước khi xử lý
            int idManager = LayIdManager();
            if (idManager == 0) return Unauthorized();
            if (!await CoQuyenDonDVAsync(req.IdDon, idManager))
                return new JsonResult(new { message = "Không có quyền thao tác sự cố này." }) { StatusCode = 403 };

            var don = await _context.DONDV
                .FirstOrDefaultAsync(d => d.IDDonDV == req.IdDon && d.LoaiDV == "Hư hỏng");

            if (don == null) return NotFound();

            // Chỉ được bắt đầu xử lý khi đang "Chờ xử lý"
            if (don.TrangThai_DV != "Chờ xử lý")
                return BadRequest("Trạng thái không hợp lệ.");

            don.TrangThai_DV = "Đang xử lý";
            don.IDManagerXuLy = idManager;
            don.NgayXuLy = DateTime.Now;       // [LỖI 2 ĐÃ SỬA] Dùng DateTime.Now thay UtcNow
            don.GhiChuXuLy = req.GhiChu;
            don.UpdatedAt = DateTime.Now;      // [LỖI 2 ĐÃ SỬA] Dùng DateTime.Now thay UtcNow

            await _context.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // HANDLER: HOÀN THÀNH XỬ LÝ
        // POST: /Manager/SuCoBaoTri?handler=HoanThanh
        // ================================================================
        public async Task<IActionResult> OnPostHoanThanhAsync([FromBody] SuCoRequest req)
        {
            // [LỖI 2 ĐÃ SỬA] Kiểm tra quyền trước khi xử lý
            int idManager = LayIdManager();
            if (idManager == 0) return Unauthorized();
            if (!await CoQuyenDonDVAsync(req.IdDon, idManager))
                return new JsonResult(new { message = "Không có quyền thao tác sự cố này." }) { StatusCode = 403 };

            var don = await _context.DONDV
                .FirstOrDefaultAsync(d => d.IDDonDV == req.IdDon && d.LoaiDV == "Hư hỏng");

            if (don == null) return NotFound();

            if (don.TrangThai_DV != "Đang xử lý")
                return BadRequest("Trạng thái không hợp lệ.");

            don.TrangThai_DV = "Thành công";
            don.GhiChuXuLy = req.GhiChu;
            don.NgayHoanThanh = DateTime.Now;  // [LỖI 2 ĐÃ SỬA] Dùng DateTime.Now thay UtcNow
            don.IDManagerXuLy = idManager;
            don.UpdatedAt = DateTime.Now;      // [LỖI 2 ĐÃ SỬA] Dùng DateTime.Now thay UtcNow

            await _context.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // PRIVATE HELPERS — KIỂM TRA QUYỀN
        // ================================================================

        /// <summary>[LỖI 2 ĐÃ SỬA] Lấy IDManager từ Claims (hỗ trợ claim tùy chỉnh và chuẩn)</summary>
        private int LayIdManager()
        {
            var s = User.FindFirst("IDUser")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(s, out int id);
            return id;
        }

        /// <summary>[LỖI 2 ĐÃ SỬA] Kiểm tra manager có quyền thao tác với đơn dịch vụ không</summary>
        private async Task<bool> CoQuyenDonDVAsync(int idDonDV, int idManager) =>
            await _context.DONDV.AsNoTracking()
                .AnyAsync(d => d.IDDonDV == idDonDV
                    && _context.PHONG_MANAGER.Any(pm =>
                        pm.IDPhong == d.IDPhong && pm.IDManager == idManager && pm.IsActive));
    }

    /// <summary>[LỖI 4 ĐÃ SỬA] Request model cho POST handlers dùng JSON body</summary>
    public class SuCoRequest
    {
        public int IdDon { get; set; }
        public string? GhiChu { get; set; }
    }
}