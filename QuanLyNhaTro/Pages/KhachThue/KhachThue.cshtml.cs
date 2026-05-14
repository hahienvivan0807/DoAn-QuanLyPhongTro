using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

namespace QuanLyNhaTro.Pages.KhachThue
{
    [Authorize(Roles = "Tenant")]
    public class ThongBaoViewModel
    {
        public string NoiDung { get; set; } = "";
        public string ThoiGian { get; set; } = "";
        public string LoaiDot { get; set; } = "nd-blue"; // nd-blue | nd-amber | nd-green | nd-red
    }

    public class KhachThueModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public KhachThueModel(QuanLyKhuNhaTro db)
        {
            _db = db;
        }

        // ── Thông tin cá nhân ─────────────────────────────────────────
        public ACCOUNT? TenantInfo { get; set; }
        public HOPDONG? HopDongHienTai { get; set; }
        public PHONG? PhongHienTai { get; set; }
        

        // ── Thống kê nhanh ────────────────────────────────────────────
        public int SoThangDaThue { get; set; }
        public int SoHoaDonTreHan { get; set; }
        public int SoSuCo { get; set; }
        public int SoSuCoDangXuLy { get; set; }

        // ── Hóa đơn tháng hiện tại ────────────────────────────────────
        public HDTHANG? HoaDonThangNay { get; set; }

        // ── Thông báo (tối đa 4) ──────────────────────────────────────
        public List<ThongBaoViewModel> DanhSachThongBao { get; set; } = new();
        public int SoThongBaoChuaDoc { get; set; }

        // ── Địa chỉ / liên hệ nhà trọ ────────────────────────────────
        public string DiaChi { get; set; } = "123 Đường ABC, Quận 1, TP. Hồ Chí Minh";
        public string SoDienThoai { get; set; } = "0123 456 789";
        public string EmailNhaTro { get; set; } = "contact@nhatroabc.vn";
        public string GioLamViec { get; set; } = "T2–T6: 8:00–17:00 | T7: 8:00–12:00";

        public async Task OnGetAsync()
        {
            // Lấy IDUser từ claim
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return;

            int userId = int.Parse(userIdClaim.Value);

            // ── 1. Lấy thông tin tài khoản ────────────────────────────────
            TenantInfo = await _db.ACCOUNT.FirstOrDefaultAsync(a => a.IDUser == userId);
            if (TenantInfo == null)
            {
                TenantInfo = new ACCOUNT { FullName = "Khách thuê" };
            }

            // ── 2. Lấy Hợp đồng và Phòng ──────────────────────────────────
            HopDongHienTai = await _db.HOPDONG
                .Include(h => h.Phong)
                .FirstOrDefaultAsync(h => h.IDUser == userId && h.TrangThaiHD == "Đang hiệu lực");

            if (HopDongHienTai != null)
            {
                PhongHienTai = HopDongHienTai.Phong ?? new PHONG { SoPhong = "---" };

                // ── 3. Tính toán thông số hóa đơn ─────────────────────────
                var now = DateTime.Today;

                SoThangDaThue = ((now.Year - HopDongHienTai.NgayBatDau.Year) * 12)
                              + (now.Month - HopDongHienTai.NgayBatDau.Month);

                SoHoaDonTreHan = await _db.HDTHANG
                    .CountAsync(h => h.IDPhong == PhongHienTai.IDPhong && h.TrangThai_TT == "Quá hạn");

                string kyHienTai = $"{now.Month:D2}/{now.Year}";
                HoaDonThangNay = await _db.HDTHANG
    .           FirstOrDefaultAsync(h => h.IDPhong == PhongHienTai.IDPhong
                           && h.KyThanhToan == kyHienTai);
            }
            else
            {
                PhongHienTai = new PHONG { SoPhong = "Chưa thuê" };
            }

            // ── 4. Sự cố (Tách await rõ ràng để DB xử lý mượt) ────────────
            SoSuCo = await _db.DONDV
                .CountAsync(d => d.IDUser == userId);

            SoSuCoDangXuLy = await _db.DONDV
                .CountAsync(d => d.IDUser == userId && d.TrangThai_DV == "Đang xử lý");

            // ── 5. Thông báo ──────────────────────────────────────────────
            var rawTBs = await _db.THONGBAO
                .Where(t => t.IDUser == userId || t.IDUser == null)
                .OrderByDescending(t => t.NgayTao)
                .Take(4)
                .ToListAsync();

            SoThongBaoChuaDoc = await _db.THONGBAO
                .CountAsync(t => (t.IDUser == userId || t.IDUser == null) && !t.DaDoc);

            // Xử lý null an toàn cho t.TieuDe (tránh cảnh báo CS8601 nếu TieuDe trong DB cho phép null)
            DanhSachThongBao = rawTBs.Select(t => new ThongBaoViewModel
            {
                NoiDung = t.TieuDe ?? "Thông báo hệ thống",
                ThoiGian = FormatThoiGian(t.NgayTao),
                LoaiDot = (t.LoaiTB ?? "") switch
                {
                    "canh-bao" => "nd-amber",
                    "thanh-toan" => "nd-blue",
                    "he-thong" => "nd-red",
                    _ => "nd-green"
                }
            }).ToList();
        }

        private static string FormatThoiGian(DateTime ngay)
        {
            var diff = DateTime.UtcNow - ngay;
            if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} phút trước";
            if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} giờ trước";
            if (diff.TotalDays < 2) return "Hôm qua";
            return ngay.ToString("dd/MM/yyyy");
        }
    }
}
