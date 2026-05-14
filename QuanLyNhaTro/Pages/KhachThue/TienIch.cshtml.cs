using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.KhachThue
{
    public class TienIchModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;
        private readonly IWebHostEnvironment _env;

        public TienIchModel(QuanLyKhuNhaTro db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // --- Properties ---
        public string TenKhach { get; set; } = "";
        public string SoPhong { get; set; } = "";
        public string TangPhong { get; set; } = "";
        public string ChuVietTat { get; set; } = "K";
        public int ChiSoDienCu { get; set; }
        public int ChiSoNuocCu { get; set; }
        public string? QrLink { get; set; }
        public string ChuTaiKhoan { get; set; } = "";
        public int SoThongBaoChuaDoc { get; set; }
        public DONDV? DonGiatSay { get; set; }
        public DONDV? DonNuocBinh { get; set; }
        public DONDV? DonGiatSayCongVaoTro { get; set; }
        public DONDV? DonNuocBinhCongVaoTro { get; set; }

        private async Task<(int idUser, int idPhong)> LayThongTinPhong()
        {
            var userIdStr = User.FindFirst("IDUser")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int idUser)) return (-1, -1);

            var hopDong = await _db.HOPDONG.AsNoTracking()
                .FirstOrDefaultAsync(h => h.IDUser == idUser && h.TrangThaiHD == "Đang hiệu lực");

            return hopDong == null ? (idUser, -1) : (idUser, hopDong.IDPhong);
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var (idUser, idPhong) = await LayThongTinPhong();
            if (idUser < 0) return RedirectToPage("/Index");
            if (idPhong < 0) return RedirectToPage("/KhachThue/KhachThue");

            var hopDong = await _db.HOPDONG
                .Include(h => h.Tenant).Include(h => h.Phong)
                .FirstOrDefaultAsync(h => h.IDPhong == idPhong && h.TrangThaiHD == "Đang hiệu lực");

            if (hopDong == null) return Page();

            TenKhach = hopDong.Tenant.FullName;
            SoPhong = $"Phòng {hopDong.Phong.SoPhong}";
            TangPhong = $"Tầng {hopDong.Phong.Tang}";
            ChuVietTat = !string.IsNullOrEmpty(TenKhach) ? TenKhach[0].ToString().ToUpper() : "K";

            var dienNuocCu = await _db.DIENNUOC
                .Where(d => d.IDPhong == idPhong && d.TrangThaiDuyet == 1)
                .OrderByDescending(d => d.NgayGhi).FirstOrDefaultAsync();

            ChiSoDienCu = dienNuocCu?.SoDienMoi ?? hopDong.DienDauKy;
            ChiSoNuocCu = dienNuocCu?.SoNuocMoi ?? hopDong.NuocDauKy;

            SoThongBaoChuaDoc = await _db.THONGBAO.CountAsync(t => t.IDUser == idUser && !t.DaDoc);

            var donDangXuLy = await _db.DONDV
                .Where(d => d.IDPhong == idPhong && !new[] { "Thành công", "Đã hủy", "Đã thanh toán" }.Contains(d.TrangThai_DV))
                .ToListAsync();

            DonGiatSay = donDangXuLy.FirstOrDefault(d => d.LoaiDV == "Giặt sấy");
            DonNuocBinh = donDangXuLy.FirstOrDefault(d => d.LoaiDV == "Nước bình");

            // Kiểm tra đơn nợ đã cộng vào hóa đơn tháng
            var kyHienTai = DateTime.Now.ToString("MM/yyyy");
            var coNoTrongHD = await _db.HDTHANG.AnyAsync(h => h.IDPhong == idPhong && h.KyThanhToan == kyHienTai && h.DuocCongVaoTro == true);

            if (coNoTrongHD)
            {
                var ngayNguong = DateTime.Now.AddDays(-7);
                var donNo = donDangXuLy.Where(d => d.TrangThai_DV == "Chờ thanh toán" && d.NgayTao <= ngayNguong).ToList();
                DonGiatSayCongVaoTro = donNo.FirstOrDefault(d => d.LoaiDV == "Giặt sấy");
                DonNuocBinhCongVaoTro = donNo.FirstOrDefault(d => d.LoaiDV == "Nước bình");
            }

            var manager = await _db.PHONG_MANAGER.Include(pm => pm.Manager)
                .Where(pm => pm.IDPhong == idPhong && pm.IsActive)
                .Select(pm => pm.Manager).FirstOrDefaultAsync();

            if (manager != null)
            {
                QrLink = manager.QR_Link;
                ChuTaiKhoan = manager.FullName;
            }

            return Page();
        }

        // --- API Đặt đơn Giặt sấy ---
        public async Task<IActionResult> OnPostGiatSayAsync([FromBody] DatGSRequest req)
        {
            var (idUser, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return Unauthorized();

            if (await _db.DONDV.AnyAsync(d => d.IDPhong == idPhong && d.LoaiDV == "Giặt sấy" && !new[] { "Thành công", "Đã hủy" }.Contains(d.TrangThai_DV)))
                return BadRequest("Bạn đang có đơn giặt sấy chờ xử lý.");

            var don = new DONDV
            {
                IDPhong = idPhong,
                IDUser = idUser,
                LoaiDV = "Giặt sấy",
                TrangThai_DV = "Chờ xử lý",
                NoiDung = $"[{req.LoaiDV}] {req.GhiChu}".Trim(),
                MucDo = "Trung bình",
                TongTien = 0,
                NgayTao = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _db.DONDV.Add(don);
            await _db.SaveChangesAsync();
            await GuiThongBaoManager(idPhong, idUser, "Đơn Giặt Sấy mới", $"Phòng {idPhong} vừa đặt dịch vụ giặt sấy.", "thong-tin");

            return new JsonResult(new { id = don.IDDonDV });
        }

        // --- API Gửi chỉ số Điện/Nước ---
        public async Task<IActionResult> OnPostDienNuocAsync([FromForm] string dienMoi, [FromForm] string nuocMoi, IFormFile? anhDien, IFormFile? anhNuoc)
        {
            var (idUser, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return Unauthorized();

            if (!int.TryParse(dienMoi, out int dM) || !int.TryParse(nuocMoi, out int nM))
                return BadRequest("Chỉ số phải là số nguyên.");

            // Kiểm tra chỉ số không được nhỏ hơn kỳ trước
            var last = await _db.DIENNUOC.Where(d => d.IDPhong == idPhong && d.TrangThaiDuyet == 1)
                        .OrderByDescending(d => d.NgayGhi).FirstOrDefaultAsync();
            if (dM < (last?.SoDienMoi ?? 0) || nM < (last?.SoNuocMoi ?? 0))
                return BadRequest("Chỉ số mới không được nhỏ hơn chỉ số cũ.");

            string? relativePath = null;
            var file = anhDien ?? anhNuoc;
            if (file != null)
            {
                string folder = Path.Combine(_env.WebRootPath, "uploads", "dien-nuoc");
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                using (var fs = new FileStream(Path.Combine(folder, fileName), FileMode.Create))
                    await file.CopyToAsync(fs);
                relativePath = "/uploads/dien-nuoc/" + fileName;
            }

            var entry = new DIENNUOC
            {
                IDPhong = idPhong,
                KyGhiNhan = DateTime.Now.ToString("MM/yyyy"),
                SoDienCu = last?.SoDienMoi ?? 0,
                SoDienMoi = dM,
                SoNuocCu = last?.SoNuocMoi ?? 0,
                SoNuocMoi = nM,
                AnhChupDongHo = relativePath ?? "",
                NgayGhi = DateTime.Now,
                TrangThaiDuyet = 0
            };

            _db.DIENNUOC.Add(entry);
            await _db.SaveChangesAsync();
            return new JsonResult(new { ok = true });
        }

        // --- Helper Gửi thông báo ---
        private async Task GuiThongBaoManager(int idPhong, int idSender, string title, string content, string type)
        {
            var managers = await _db.PHONG_MANAGER.Where(pm => pm.IDPhong == idPhong && pm.IsActive).Select(pm => pm.IDManager).ToListAsync();
            foreach (var mId in managers)
            {
                _db.THONGBAO.Add(new THONGBAO
                {
                    IDUser = mId,
                    IDNguoiGui = idSender,
                    TieuDe = title,
                    NoiDung = content,
                    DaDoc = false,
                    NgayTao = DateTime.Now,
                    LoaiTB = type,
                    LoaiNguon = "DonDV"
                });
            }
            await _db.SaveChangesAsync();
        }

        // ── Request DTOs ────────────────────────────────────────────────
        public class XacNhanRequest
        {
            public int DonId { get; set; }
        }

        public class DatGSRequest
        {
            /// <summary>Loại giặt sấy: "Giặt thường" | "Giặt nhanh" | ...</summary>
            public string LoaiDV { get; set; } = "";
            public string GhiChu { get; set; } = "";
        }

        public class DatNuocRequest
        {
            public int SoLuong { get; set; } = 1;
            public bool TraVo { get; set; } = false;
            public string GhiChu { get; set; } = "";
            /// <summary>Tổng tiền tính sẵn từ client (để hiển thị); server tự tính lại.</summary>
            public decimal TongTien { get; set; }
        }
    }
}
