using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.KhachThue
{
    public class ThongBaoModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public ThongBaoModel(QuanLyKhuNhaTro db)
        {
            _db = db;
        }

        // ── Thông tin khách thuê hiện tại ──────────────────────────
        public ACCOUNT KhachThue { get; set; } = null!;
        public string SoPhong { get; set; } = "";
        public byte Tang { get; set; }

        // ── Danh sách thông báo ────────────────────────────────────
        public List<THONGBAO> DanhSachThongBao { get; set; } = new();
        public int TongThongBao => DanhSachThongBao.Count;
        public int SoChuaDoc => DanhSachThongBao.Count(tb => !tb.DaDoc);

        // ── GET ────────────────────────────────────────────────────
        public async Task<IActionResult> OnGetAsync()
        {
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(idUserStr) || !int.TryParse(idUserStr, out int idUser))
                return RedirectToPage("/Index");

            KhachThue = await _db.ACCOUNT.FindAsync(idUser)
                        ?? throw new Exception("Không tìm thấy tài khoản");

            var hopDong = await _db.HOPDONG
                .Include(hd => hd.Phong)
                .FirstOrDefaultAsync(hd => hd.IDUser == idUser && hd.TrangThaiHD == "Đang hiệu lực");

            if (hopDong != null)
            {
                SoPhong = hopDong.Phong.SoPhong;
                Tang = hopDong.Phong.Khu;
            }

            DanhSachThongBao = await _db.THONGBAO
                .Where(tb => tb.IDUser == idUser || tb.IDUser == null)
                .OrderByDescending(tb => tb.NgayTao)
                .ToListAsync();

            return Page();
        }

        // ── POST: Đánh dấu 1 thông báo đã đọc ────────────────────
        public async Task<IActionResult> OnPostDanhDauDaDocAsync([FromBody] DaDocRequest req)
        {
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idUser))
                return Unauthorized();

            var tb = await _db.THONGBAO
                .FirstOrDefaultAsync(t => t.IDThongBao == req.IdThongBao
                                       && (t.IDUser == idUser || t.IDUser == null));

            if (tb == null) return NotFound();

            tb.DaDoc = true;
            await _db.SaveChangesAsync();

            return new JsonResult(new { ok = true });
        }

        // ── POST: Đánh dấu tất cả đã đọc ─────────────────────────
        public async Task<IActionResult> OnPostDanhDauHetAsync()
        {
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idUser))
                return Unauthorized();

            var danhSach = await _db.THONGBAO
                .Where(t => (t.IDUser == idUser || t.IDUser == null) && !t.DaDoc)
                .ToListAsync();

            foreach (var tb in danhSach) tb.DaDoc = true;
            await _db.SaveChangesAsync();

            return new JsonResult(new { ok = true });
        }

        // ── DTO ────────────────────────────────────────────────────
        public class DaDocRequest
        {
            public int IdThongBao { get; set; }
        }

        // ── Helpers ────────────────────────────────────────────────
        public string GetLoaiClass(string loaiTB) => loaiTB switch
        {
            "canh-bao" => "the-loai-canh-bao",
            "thanh-toan" => "the-loai-canh-bao",
            "he-thong" => "the-loai-he-thong",
            "thanh-cong" => "the-loai-thanh-cong",
            _ => "the-loai-thong-tin"
        };

        public string GetLoaiNhan(string loaiTB) => loaiTB switch
        {
            "canh-bao" => "⚡ Cảnh báo",
            "thanh-toan" => "💰 Thanh toán",
            "he-thong" => "🔔 Hệ thống",
            "thanh-cong" => "✅ Thành công",
            _ => "📋 Thông tin"
        };

        public string GetBieuTuongClass(string loaiTB) => loaiTB switch
        {
            "canh-bao" => "bt-canh-bao",
            "thanh-toan" => "bt-canh-bao",
            "he-thong" => "bt-he-thong",
            "thanh-cong" => "bt-thanh-cong",
            _ => "bt-thong-tin"
        };

        public string GetIconClass(string loaiTB) => loaiTB switch
        {
            "canh-bao" => "fas fa-bolt",
            "thanh-toan" => "fas fa-file-invoice-dollar",
            "he-thong" => "fas fa-star",
            "thanh-cong" => "fas fa-check-circle",
            _ => "fas fa-clipboard-list"
        };

        public string GetItemChuaDocClass(THONGBAO tb)
        {
            if (tb.DaDoc) return "";
            return tb.LoaiTB switch
            {
                "canh-bao" or "thanh-toan" => "chua-doc loai-canh-bao",
                "thanh-cong" => "chua-doc loai-thanh-cong",
                _ => "chua-doc"
            };
        }

        public string FormatThoiGian(DateTime ngayTao)
        {
            var delta = DateTime.Now - ngayTao;
            if (delta.TotalMinutes < 60)
                return $"{(int)delta.TotalMinutes} phút trước";
            if (delta.TotalHours < 24)
                return $"{(int)delta.TotalHours} giờ trước";
            if (ngayTao.Date == DateTime.Today.AddDays(-1))
                return $"Hôm qua, {ngayTao:HH:mm}";
            return ngayTao.ToString("dd/MM/yyyy");
        }
    }
}
