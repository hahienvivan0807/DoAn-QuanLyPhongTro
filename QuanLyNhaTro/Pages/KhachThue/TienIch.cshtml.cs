using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

namespace QuanLyNhaTro.Pages.KhachThue
{
    public class TienIchModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public TienIchModel(QuanLyKhuNhaTro db)
        {
            _db = db;
        }

        // ── Thông tin khách thuê hiện tại ──────────────────────────
        public string TenKhach { get; set; } = "";
        public string SoPhong { get; set; } = "";
        public string TangPhong { get; set; } = "";
        public string ChuVietTat { get; set; } = ""; // chữ cái đầu tên

        // ── Chỉ số điện/nước kỳ trước (readonly trong form) ────────
        public int ChiSoDienCu { get; set; }
        public int ChiSoNuocCu { get; set; }

        // ── Thông tin QR thanh toán của Manager ────────────────────
        public string? QrLink { get; set; }
        public string NganHang { get; set; } = "";
        public string SoTaiKhoan { get; set; } = "";
        public string ChuTaiKhoan { get; set; } = "";

        // ── Số thông báo chưa đọc ──────────────────────────────────
        public int SoThongBaoChuaDoc { get; set; }

        // ── Đơn dịch vụ đang hoạt động (để hiển thị badge) ─────────
        public DONDV? DonGiatSay { get; set; }
        public DONDV? DonNuocBinh { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            // Lấy IDUser từ Claims (JWT / Cookie auth)
            var userIdClaim = User.FindFirst("IDUser")?.Value
                           ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out int idUser))
                return RedirectToPage("/Account/Login");

            // ── Hợp đồng đang hiệu lực ─────────────────────────────
            var hopDong = await _db.HOPDONG
                .Include(h => h.Tenant)
                .Include(h => h.Phong)
                .FirstOrDefaultAsync(h => h.IDUser == idUser && h.TrangThaiHD == "Đang hiệu lực");

            if (hopDong == null)
                return RedirectToPage("/KhachThue/KhachThue");

            TenKhach = hopDong.Tenant.FullName;
            SoPhong = "Phòng " + hopDong.Phong.SoPhong;
            TangPhong = "Tầng " + hopDong.Phong.Tang;
            ChuVietTat = TenKhach.Length > 0 ? TenKhach[0].ToString().ToUpper() : "K";

            // ── Chỉ số điện/nước kỳ trước ──────────────────────────
            var dienNuocCu = await _db.DIENNUOC
                .Where(d => d.IDPhong == hopDong.IDPhong && d.TrangThaiDuyet == 1)
                .OrderByDescending(d => d.NgayGhi)
                .FirstOrDefaultAsync();

            ChiSoDienCu = dienNuocCu?.SoDienMoi ?? hopDong.DienDauKy;
            ChiSoNuocCu = dienNuocCu?.SoNuocMoi ?? hopDong.NuocDauKy;

            // ── Thông báo chưa đọc ─────────────────────────────────
            SoThongBaoChuaDoc = await _db.THONGBAO
                .CountAsync(t => t.IDUser == idUser && !t.DaDoc);

            // ── Đơn dịch vụ đang xử lý ────────────────────────────
            var donDangXuLy = await _db.DONDV
                .Where(d => d.IDPhong == hopDong.IDPhong
                         && !new[] { "Thành công", "Đã hủy" }.Contains(d.TrangThai_DV))
                .ToListAsync();

            DonGiatSay = donDangXuLy.FirstOrDefault(d => d.LoaiDV == "Giặt sấy");
            DonNuocBinh = donDangXuLy.FirstOrDefault(d => d.LoaiDV == "Nước bình");

            // ── QR Manager ─────────────────────────────────────────
            var manager = await _db.PHONG_MANAGER
                .Include(pm => pm.Manager)
                .Where(pm => pm.IDPhong == hopDong.IDPhong && pm.IsActive)
                .Select(pm => pm.Manager)
                .FirstOrDefaultAsync();

            if (manager != null)
            {
                QrLink = manager.QR_Link;
                ChuTaiKhoan = manager.FullName;
                // SoTaiKhoan / NganHang: mở rộng từ bảng cấu hình nếu có
            }

            return Page();
        }
    }
}
