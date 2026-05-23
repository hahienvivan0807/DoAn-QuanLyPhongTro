using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.KhachThue
{
    public class BaoCaoSuCoModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;
        private readonly IWebHostEnvironment _env;

        public BaoCaoSuCoModel(QuanLyKhuNhaTro db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // ── Thông tin khách thuê đăng nhập ────────────────────────────
        public ACCOUNT KhachThue { get; set; } = null!;
        public string SoPhongHienTai { get; set; } = "";
        public byte TangHienTai { get; set; }
        public int IDPhongHienTai { get; set; }

        // ── Dropdown danh sách phòng của khách (thường chỉ 1) ─────────
        // Lấy từ: HOPDONG join PHONG WHERE IDUser = IDKhach AND TrangThaiHD = 'Đang hiệu lực'
        public List<PHONG> DanhSachPhong { get; set; } = new();

        // ── Thống kê nhanh ────────────────────────────────────────────
        // Đếm từ DONDV WHERE IDUser = IDKhach
        public int TongSuCoDaGui { get; set; }
        public int SuCoDangXuLy { get; set; }
        public int SuCoHoanTat { get; set; }

        // ──-Lịch sử báo cáo  ─────────────────────────
        // Lấy từ DONDV WHERE IDUser = IDKhach ORDER BY NgayTao DESC TAKE 5
        public List<DONDV> LichSuBaoCao { get; set; } = new();

        // ── Thông tin liên hệ ─────────────────────────────────────────
        // Lấy từ ACCOUNT JOIN PHONG_MANAGER WHERE IDPhong = IDPhongKhach AND Roles = 'Manager'
        public ACCOUNT ThongTinQuanLy { get; set; } = null!;
        // Lấy từ ACCOUNT WHERE Roles = 'Admin'
        public ACCOUNT ThongTinChuTro { get; set; } = null!;

        // ── Badge sidebar ──────────────────────────────────────────────
        // Đếm từ HDTHANG WHERE IDPhong = IDPhongKhach AND TrangThai_TT IN ('Chưa đóng','Quá hạn')
        public int SoHoaDonChuaDong { get; set; }
        // Đếm từ THONGBAO WHERE IDUser = IDKhach AND DaDoc = false
        public int SoThongBaoChuaDoc { get; set; }

        // ─────────────────────────────────────────────────────────────
        public async Task<IActionResult> OnGetAsync()
        {
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idUser))
                return RedirectToPage("/Index");

            KhachThue = await _db.ACCOUNT.FindAsync(idUser)
                        ?? throw new Exception("Không tìm thấy tài khoản");

            // Hợp đồng đang hiệu lực
            var hopDong = await _db.HOPDONG
                .Include(h => h.Phong)
                .Where(h => h.IDUser == idUser && h.TrangThaiHD == "Đang hiệu lực")
                .FirstOrDefaultAsync();

            if (hopDong != null)
            {
                IDPhongHienTai = hopDong.IDPhong;
                SoPhongHienTai = hopDong.Phong.SoPhong;
                TangHienTai = hopDong.Phong.Tang;
            }

            // Danh sách phòng (dropdown) — chỉ phòng đang thuê
            DanhSachPhong = await _db.HOPDONG
                .Where(h => h.IDUser == idUser && h.TrangThaiHD == "Đang hiệu lực")
                .Select(h => h.Phong)
                .ToListAsync();

            // Thống kê
            var donDVQuery = _db.DONDV.Where(d => d.IDUser == idUser);
            TongSuCoDaGui = await donDVQuery.CountAsync();
            SuCoDangXuLy = await donDVQuery.CountAsync(d => d.TrangThai_DV == "Đang xử lý" || d.TrangThai_DV == "Chờ xử lý");
            SuCoHoanTat = await donDVQuery.CountAsync(d => d.TrangThai_DV == "Thành công");

            // Lịch sử 5 cái mới nhất
            LichSuBaoCao = await donDVQuery
                .OrderByDescending(d => d.NgayTao)
                .Take(5)
                .ToListAsync();

            // Thông tin quản lý (theo phòng)
            ThongTinQuanLy = await _db.PHONG_MANAGER
                .Where(pm => pm.IDPhong == IDPhongHienTai && pm.IsActive)
                .Select(pm => pm.Manager)
                .FirstOrDefaultAsync()
                ?? new ACCOUNT { FullName = "Chưa phân công", Phone = "—", Roles = "Manager" };

            // Chủ trọ (Admin đầu tiên)
            ThongTinChuTro = await _db.ACCOUNT
                .Where(a => a.Roles == "Admin" && a.IsActive)
                .FirstOrDefaultAsync()
                ?? new ACCOUNT { FullName = "—", Phone = "—", Roles = "Admin" };

            // Badge
            SoHoaDonChuaDong = await _db.HDTHANG
                .CountAsync(h => h.IDPhong == IDPhongHienTai
                    && (h.TrangThai_TT == "Chưa đóng" || h.TrangThai_TT == "Quá hạn"));

            SoThongBaoChuaDoc = await _db.THONGBAO
                .CountAsync(t => t.IDUser == idUser && !t.DaDoc);

            return Page();
        }

        // ─────────────────────────────────────────────────────────────
        // POST: /KhachThue/BaoSuCo?handler=GuiBaoCao
        // Nhận FormData gồm loai + các field + file ảnh
        // Lưu DONDV, sau đó trả JSON { success, maBaoCao }
        // ─────────────────────────────────────────────────────────────
        public async Task<IActionResult> OnPostGuiBaoCaoAsync()
        {
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idUser))
                return new JsonResult(new { success = false, message = "Chưa đăng nhập" });

            // ── Lấy IDPhong trực tiếp từ DB theo IDUser (không tin form) ──
            var hopDong = await _db.HOPDONG
                .Include(h => h.Phong)
                .Where(h => h.IDUser == idUser && h.TrangThaiHD == "Đang hiệu lực")
                .FirstOrDefaultAsync();

            if (hopDong == null)
                return new JsonResult(new { success = false, message = "Không tìm thấy phòng đang thuê" });

            int idPhong = hopDong.IDPhong;

            var loai = Request.Form["loai"].ToString();     // "dich-vu" | "hu-hong"

            // ── Xử lý upload ảnh ──────────────────────────────────────
            // Ảnh lưu tại: wwwroot/uploads/su-co/{IDUser}_{timestamp}_{filename}
            // Đường dẫn lưu vào DB: /uploads/su-co/...
            // Nếu nhiều ảnh, nối bằng dấu '|' (tối đa 5 ảnh)
            //
            // SQL tương ứng: cột DONDV.AnhBienLai VARCHAR(255) → tăng lên VARCHAR(1000)
            // nếu cần lưu nhiều đường dẫn. Hoặc tạo bảng DONDV_ANH riêng (xem ghi chú bên dưới)
            // ─────────────────────────────────────────────────────────

            var fileKey = loai == "dich-vu" ? "FileAnhDichVu" : "FileAnhHuHong";
            var files = Request.Form.Files.GetFiles(fileKey);
            var anhPaths = new List<string>();
            var uploadDir = Path.Combine(_env.WebRootPath, "uploads", "su-co");
            Directory.CreateDirectory(uploadDir);

            foreach (var file in files.Take(5))
            {
                if (file.Length > 5 * 1024 * 1024) continue; // bỏ qua file > 5MB
                var ext = Path.GetExtension(file.FileName).ToLower();
                var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                if (!allowed.Contains(ext)) continue;

                var fileName = $"{idUser}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}{ext}";
                var savePath = Path.Combine(uploadDir, fileName);
                using var stream = System.IO.File.Create(savePath);
                await file.CopyToAsync(stream);
                anhPaths.Add($"/uploads/su-co/{fileName}");
            }

            // ── Tạo đơn DONDV ─────────────────────────────────────────
            var mucDoMap = new Dictionary<string, string>
            {
                { "thap",     "Thấp"      },
                { "trung",    "Trung bình"},
                { "khan-cap", "Khẩn cấp"  }
            };

            string noiDung, loaiDV, mucDoRaw;

            if (loai == "dich-vu")
            {
                var dichVuChon = Request.Form["DichVuDaChon"].ToString();
                var buoi = Request.Form["BuoiDichVu"].ToString();
                var daNhac = Request.Form["DaNhac"].ToString();
                var moTa = Request.Form["MoTaDichVu"].ToString();
                mucDoRaw = Request.Form["MucDoDichVu"].ToString();
                loaiDV = "Dịch vụ";
                noiDung = $"[{dichVuChon}] {buoi} | Đã nhắc: {daNhac} | {moTa}";
            }
            else
            {
                var loaiHH = Request.Form["LoaiHuHong"].ToString();
                var viTri = Request.Form["ViTriHuHong"].ToString();
                var moTa = Request.Form["MoTaHuHong"].ToString();
                mucDoRaw = Request.Form["MucDoHuHong"].ToString();
                loaiDV = "Hư hỏng";
                noiDung = $"[{loaiHH}] Vị trí: {viTri} | {moTa}";
            }

            mucDoMap.TryGetValue(mucDoRaw, out string? mucDo);

            var don = new DONDV
            {
                IDUser = idUser,
                IDPhong = idPhong,
                LoaiDV = loaiDV,
                NoiDung = noiDung,
                MucDo = mucDo ?? "Trung bình",
                TrangThai_DV = "Chờ xử lý",
                AnhBienLai = anhPaths.Count > 0 ? string.Join("|", anhPaths) : null,
                NgayTao = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.DONDV.Add(don);
            await _db.SaveChangesAsync();

            var maBaoCao = $"#SC-{DateTime.Now.Year}-{don.IDDonDV:D4}";

            return new JsonResult(new { success = true, maBaoCao });
        }
    }
}

