using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages
{
    // ViewModel gộp thông tin Phòng + HopDong đang hiệu lực
    public class PhongViewModel
    {
        public PHONG Phong { get; set; } = null!;
        public HOPDONG? HopDongHienTai { get; set; }
    }

    public class ChiTietPhongModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public ChiTietPhongModel(QuanLyKhuNhaTro db)
        {
            _db = db;
        }

        // ── Dữ liệu trang chính ──────────────────────────────────────
        public List<PhongViewModel> DanhSachPhong { get; set; } = new();

        // ── Thống kê nhanh (3 thẻ) ───────────────────────────────────
        public int TongSoPhong { get; set; }
        public int SoPhongDangThue { get; set; }
        public int SoPhongConTrong { get; set; }

        // ── Huy hiệu sidebar ─────────────────────────────────────────
        public int SoDonDVChoXuLy { get; set; }
        public int SoDonBaoTriChoXuLy { get; set; }

        // ── Thông báo header ─────────────────────────────────────────
        public int SoThongBaoChuaDoc { get; set; }

        // ── Thông tin người dùng đang đăng nhập ──────────────────────
        public ACCOUNT? CurrentUser { get; set; }

        // ─────────────────────────────────────────────────────────────
        public async Task<IActionResult> OnGetAsync()
        {

            // 1. Lấy ID người dùng từ Claims (Cookie)
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            // Nếu không thấy thông tin đăng nhập, đẩy về trang chủ (Index)
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return RedirectToPage("/Index");
            }

            // Chuyển ID từ chuỗi sang số nguyên để dùng cho Database
            int idUser = int.Parse(userIdClaim);

            var fullNameClaim = User.FindFirst("FullName")?.Value;

            // 2. Lấy thông tin người dùng hiện tại từ DB
            CurrentUser = await _db.ACCOUNT
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.IDUser == idUser);

            // 3. Lấy danh sách phòng và sắp xếp
            var phongs = await _db.PHONG
                .AsNoTracking()
                .OrderBy(p => p.Tang)
                .ThenBy(p => p.SoPhong)
                .ToListAsync();

            // 4. Lấy tất cả hợp đồng đang hiệu lực kèm thông tin khách thuê (Tenant)
            var hopDongs = await _db.HOPDONG
                .AsNoTracking()
                .Include(hd => hd.Tenant)
                .Where(hd => hd.TrangThaiHD == "Đang hiệu lực")
                .ToListAsync();

            // Tạo Dictionary để tra cứu nhanh Hợp đồng theo IDPhong
            var hopDongDict = hopDongs
                .GroupBy(hd => hd.IDPhong)
                .ToDictionary(g => g.Key, g => g.First());

            // Đổ dữ liệu vào ViewModel để hiển thị ra View
            DanhSachPhong = phongs.Select(p => new PhongViewModel
            {
                Phong = p,
                HopDongHienTai = hopDongDict.TryGetValue(p.IDPhong, out var hd) ? hd : null
            }).ToList();

            // 5. Tính toán Thống kê nhanh
            TongSoPhong = phongs.Count;
            SoPhongDangThue = phongs.Count(p => p.TrangThai == "Đã thuê");
            SoPhongConTrong = phongs.Count(p => p.TrangThai == "Trống");

            // 6. Cập nhật số liệu thông báo/huy hiệu trên Sidebar
            SoDonDVChoXuLy = await _db.DONDV
                .AsNoTracking()
                .CountAsync(d => d.TrangThai_DV == "Chờ xử lý");

            SoDonBaoTriChoXuLy = await _db.DONDV
                .AsNoTracking()
                .CountAsync(d => d.LoaiDV == "Hư hỏng" && d.TrangThai_DV == "Chờ xử lý");

            // Lấy số thông báo chưa đọc của chính User này
            SoThongBaoChuaDoc = await _db.THONGBAO
                .AsNoTracking()
                .CountAsync(tb => tb.IDUser == idUser && !tb.DaDoc);

            return Page();
        }
    }
}
