using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.KhachThue
{
    public class HoSoModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public HoSoModel(QuanLyKhuNhaTro db) => _db = db;

        // ── Dữ liệu chỉ đọc đổ ra view ──────────────────────────────
        public ACCOUNT? KhachThue { get; set; }
        public HOPDONG? HopDong { get; set; }
        public PHONG? Phong { get; set; }
        public KHACH_THUE? khach { get; set; }

        // ── Thông tin cá nhân – tất cả chỉ đọc từ DB ─────────────────
        public string? HoTen { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }

        // ── Trường chỉ đọc – lấy từ bảng KHACH_THUE ──────────────────
        public string? SoCCCD { get; set; }
        public string? QueQuan { get; set; }
        public string? DiaChiThuongTru { get; set; }

        // Mini stats
        public int SoThangThue { get; set; }
        public int SoHoaDonDaDong { get; set; }
        public int SoSuCoDaBao { get; set; }
        public int SoNgayHDConLai { get; set; }

        // Badge sidebar
        public int SoThongBaoChuaDoc { get; set; }
        public int SoHoaDonChuaDong { get; set; }

        // ── GET ───────────────────────────────────────────────────────
        public async Task<IActionResult> OnGetAsync()
        {
            var idUser = GetCurrentUserId();
            if (idUser == null) return RedirectToPage("/Index");

            await LoadDataAsync(idUser.Value);
            return Page();
        }

        // ── Helpers ───────────────────────────────────────────────────
        private async Task LoadDataAsync(int idUser)
        {
            KhachThue = await _db.ACCOUNT.FindAsync(idUser);

            // Lấy thông tin từ bảng ACCOUNT
            if (KhachThue != null)
            {
                HoTen= KhachThue.FullName;
                Phone = KhachThue.Phone;
                Email = KhachThue.Email;

            }

            // Lấy thông tin chỉ đọc từ bảng KHACH_THUE
            khach = await _db.KHACH_THUE
                .FirstOrDefaultAsync(k => k.IDUser == idUser);

            SoCCCD = khach?.SoCCCD;
            QueQuan = khach?.QueQuan;
            DiaChiThuongTru = khach?.DiaChiThuongTru;
            NgaySinh = khach?.NgaySinh;
            GioiTinh = khach?.GioiTinh;

            HopDong = await _db.HOPDONG
                .Where(h => h.IDUser == idUser && h.TrangThaiHD == "Đang hiệu lực")
                .OrderByDescending(h => h.NgayBatDau)
                .Include(h => h.Phong)
                .FirstOrDefaultAsync();

            Phong = HopDong?.Phong;

            if (HopDong != null)
            {
                SoThangThue = (int)((DateTime.Today - HopDong.NgayBatDau).Days / 30.44);
                SoNgayHDConLai = HopDong.NgayKetThuc.HasValue
                    ? Math.Max(0, (HopDong.NgayKetThuc.Value - DateTime.Today).Days)
                    : 0;
            }

            SoHoaDonDaDong = await _db.HDTHANG
                .Where(h => h.IDPhong == (Phong != null ? Phong.IDPhong : -1)
                         && h.TrangThai_TT == "Đã thanh toán")
                .CountAsync();

            SoSuCoDaBao = await _db.DONDV
                .Where(d => d.IDUser == idUser)
                .CountAsync();

            SoThongBaoChuaDoc = await _db.THONGBAO
                .Where(t => t.IDUser == idUser && !t.DaDoc)
                .CountAsync();

            SoHoaDonChuaDong = await _db.HDTHANG
                .Where(h => h.IDPhong == (Phong != null ? Phong.IDPhong : -1)
                         && h.TrangThai_TT == "Chưa thanh toán")
                .CountAsync();
        }

        private int? GetCurrentUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(claim, out var id) ? id : null;
        }
    }
}
