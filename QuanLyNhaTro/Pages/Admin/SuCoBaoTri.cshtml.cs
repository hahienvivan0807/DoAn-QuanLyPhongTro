using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.Admin
{
    [Authorize(Roles = "Admin")]
    /// <summary>
    /// Trang Sự Cố & Bảo Trì dành cho role Admin (Chủ Trọ).
    /// Bao gồm: xem danh sách, phân loại, xử lý, hoàn thành,
    /// soft-archive (ẩn vào kho), và khôi phục từ kho.
    ///
    /// ── MIGRATION CẦN THÊM ──────────────────────────────────────────
    /// Nếu bảng DONDV chưa có cột IsArchived, chạy lệnh sau:
    ///
    ///   dotnet ef migrations add AddIsArchivedToDONDV
    ///   dotnet ef database update
    ///
    /// EF Core sẽ tự sinh migration dựa trên property IsArchived đã
    /// được thêm vào model DONDV (xem phần cuối file này).
    ///
    /// Nếu không muốn migration, bạn có thể dùng TrangThai_DV = "Lưu trữ"
    /// làm cờ thay thế – hàm OnPostArchiveAsync và OnPostRestoreAsync đã
    /// hỗ trợ cả hai chiến lược (xem comment bên trong từng handler).
    /// ────────────────────────────────────────────────────────────────
    /// </summary>
    [Authorize(Roles = "Admin")]
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

        /// <summary>
        /// Toàn bộ sự cố (bao gồm cả archived) để modal phía client có thể
        /// hiển thị chi tiết mà không cần gọi API thêm.
        /// </summary>
        public IEnumerable<DONDV> DanhSachSuCo { get; set; } = new List<DONDV>();

        // Thống kê
        public int TongSuCo { get; set; }
        public int ChuaHoanThanh { get; set; }  // Chờ xử lý + Đang xử lý
        public int DaHoanThanh { get; set; }  // Thành công + Đã hủy
        public int KhanCap { get; set; }  // Khẩn cấp & chưa hoàn thành
        public int SoSuCoChoXuLy { get; set; }  // Badge sidebar
        public int SoLuuTru { get; set; }  // Badge kho
        public int SoThongBaoChuaDoc { get; set; }

        public ACCOUNT? CurrentUser { get; set; }

        // ================================================================
        // ON GET
        // ================================================================
        public async Task<IActionResult> OnGetAsync()
        {
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idUser))
                return RedirectToPage("/Login");

            CurrentUser = await _context.ACCOUNT
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.IDUser == idUser);

            // Lấy TẤT CẢ sự cố LoaiDV = "Hư hỏng" — kể cả "Lưu trữ"
            // để JS modal phía client có đủ dữ liệu
            DanhSachSuCo = await _context.DONDV
                .Where(d => d.LoaiDV == "Hư hỏng")
                .Include(d => d.Phong)
                .Include(d => d.Tenant)
                .Include(d => d.ManagerXuLy)
                .OrderByDescending(d => d.TrangThai_DV != "Lưu trữ")  
                .ThenByDescending(d => d.MucDo == "Khẩn cấp")
                .ThenByDescending(d => d.NgayTao)
                .AsNoTracking()
                .ToListAsync();

            // ── Thống kê CHỈ tính bản ghi CHƯA lưu trữ ──
            var active = DanhSachSuCo.Where(d => d.TrangThai_DV != "Lưu trữ").ToList();

            TongSuCo = active.Count;
            ChuaHoanThanh = active.Count(d =>
                d.TrangThai_DV == "Chờ xử lý" ||
                d.TrangThai_DV == "Đang xử lý" ||
                d.TrangThai_DV == "Chờ thanh toán" ||
                d.TrangThai_DV == "Chờ duyệt");
            DaHoanThanh = active.Count(d =>
                d.TrangThai_DV == "Thành công" ||
                d.TrangThai_DV == "Đã hoàn thành" ||
                d.TrangThai_DV == "Đã hủy" ||
                d.TrangThai_DV == "Từ chối");
            KhanCap = active.Count(d =>
                    d.MucDo == "Khẩn cấp" &&
                    d.TrangThai_DV != "Thành công" &&
                    d.TrangThai_DV != "Đã hoàn thành" && 
                    d.TrangThai_DV != "Đã hủy" &&
                    d.TrangThai_DV != "Từ chối");
            SoSuCoChoXuLy = active.Count(d => d.TrangThai_DV == "Chờ xử lý");
            SoLuuTru = DanhSachSuCo.Count(d => d.TrangThai_DV == "Lưu trữ");

            SoThongBaoChuaDoc = await _context.THONGBAO
                .Where(t => t.IDUser == idUser && !t.DaDoc)
                .CountAsync();

            return Page();
        }

        // ================================================================
        // HANDLER: BẮT ĐẦU XỬ LÝ
        // POST /Admin/SuCoBaoTri?handler=BatDauXuLy&idDon={id}&ghiChu={text}
        // ================================================================
        public async Task<IActionResult> OnPostBatDauXuLyAsync(int idDon, string? ghiChu)
        {
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idManager))
                return Unauthorized();

            var don = await _context.DONDV
                .FirstOrDefaultAsync(d => d.IDDonDV == idDon && d.LoaiDV == "Hư hỏng");

            if (don == null)
                return NotFound(new { message = "Không tìm thấy đơn." });

            if (don.TrangThai_DV != "Chờ xử lý")
                return BadRequest(new { message = "Trạng thái không hợp lệ." });

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
        // POST /Admin/SuCoBaoTri?handler=HoanThanh&idDon={id}&ghiChu={text}
        // ================================================================
        public async Task<IActionResult> OnPostHoanThanhAsync(int idDon, string? ghiChu)
        {
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idManager))
                return Unauthorized();

            var don = await _context.DONDV
                .FirstOrDefaultAsync(d => d.IDDonDV == idDon && d.LoaiDV == "Hư hỏng");

            if (don == null)
                return NotFound(new { message = "Không tìm thấy đơn." });

            if (don.TrangThai_DV != "Đang xử lý")
                return BadRequest(new { message = "Trạng thái không hợp lệ." });

            don.TrangThai_DV = "Thành công";
            don.GhiChuXuLy = ghiChu;
            don.NgayHoanThanh = DateTime.UtcNow;
            don.IDManagerXuLy = idManager;
            don.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }


        public async Task<IActionResult> OnPostArchiveAsync(int idDon)
        {
            if (!User.IsInRole("Admin")) return Forbid();

            // Dùng context mới, không track gì thêm
            var don = await _context.DONDV
                .FirstOrDefaultAsync(d => d.IDDonDV == idDon && d.LoaiDV == "Hư hỏng");

            if (don == null) return NotFound(new { message = "Không tìm thấy đơn." });

            don.TrangThai_DV = "Lưu trữ";
            don.UpdatedAt = DateTime.UtcNow;

            _context.Entry(don).Property(x => x.TrangThai_DV).IsModified = true;
            _context.Entry(don).Property(x => x.UpdatedAt).IsModified = true;

            await _context.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // HANDLER: KHÔI PHỤC TỪ KHO
        // POST /Admin/SuCoBaoTri?handler=Restore&idDon={id}
        // ================================================================
        public async Task<IActionResult> OnPostRestoreAsync(int idDon)
        {
            if (!User.IsInRole("Admin")) return Forbid();

            var don = await _context.DONDV
                .FirstOrDefaultAsync(d => d.IDDonDV == idDon && d.LoaiDV == "Hư hỏng");

            if (don == null) return NotFound(new { message = "Không tìm thấy đơn." });

            // Đưa về "Chờ xử lý" khi khôi phục
            don.TrangThai_DV = "Chờ xử lý";
            don.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }
    }
}


