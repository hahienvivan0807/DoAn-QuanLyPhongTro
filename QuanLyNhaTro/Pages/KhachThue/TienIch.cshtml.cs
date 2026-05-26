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

        // Helper: lấy IDManager đang phụ trách phòng (dùng khi tạo đơn)
        private async Task<int?> LayIDManagerPhongAsync(int idPhong)
        {
            return await _db.PHONG_MANAGER
                .Where(pm => pm.IDPhong == idPhong && pm.IsActive)
                .Select(pm => (int?)pm.IDManager)
                .FirstOrDefaultAsync();
        }

        // Danh sách trạng thái "chưa xong" – dùng thống nhất ở nhiều nơi
        // Gồm cả "Chờ duyệt" để polling vẫn thấy đơn sau khi khách gửi ảnh
        private static readonly string[] TrangThaiChuaXong =
            { "Chờ xử lý", "Đang xử lý", "Chờ thanh toán", "Chờ duyệt" };

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
            TangPhong = $"Khu {hopDong.Phong.Khu}";
            ChuVietTat = !string.IsNullOrEmpty(TenKhach) ? TenKhach[0].ToString().ToUpper() : "K";

            var dienNuocCu = await _db.DIENNUOC
                .Where(d => d.IDPhong == idPhong && d.TrangThaiDuyet == 1)
                .OrderByDescending(d => d.NgayGhi).FirstOrDefaultAsync();

            ChiSoDienCu = dienNuocCu?.SoDienMoi ?? hopDong.DienDauKy;
            ChiSoNuocCu = dienNuocCu?.SoNuocMoi ?? hopDong.NuocDauKy;

            SoThongBaoChuaDoc = await _db.THONGBAO.CountAsync(t => t.IDUser == idUser && !t.DaDoc);

            // Dùng TrangThaiChuaXong thống nhất – gồm cả "Chờ xác nhận"
            var donDangXuLy = await _db.DONDV
                .Where(d => d.IDPhong == idPhong && TrangThaiChuaXong.Contains(d.TrangThai_DV))
                .ToListAsync();

            DonGiatSay = donDangXuLy.FirstOrDefault(d => d.LoaiDV == "Giặt sấy");
            DonNuocBinh = donDangXuLy.FirstOrDefault(d => d.LoaiDV == "Nước bình");

            var kyHienTai = DateTime.Now.ToString("MM/yyyy");
            var hdThang = await _db.HDTHANG
                .FirstOrDefaultAsync(h => h.IDPhong == idPhong && h.KyThanhToan == kyHienTai);

            if (hdThang?.DuocCongVaoTro == true)
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

            if (await _db.DONDV.AnyAsync(d => d.IDPhong == idPhong && d.LoaiDV == "Giặt sấy"
                && TrangThaiChuaXong.Contains(d.TrangThai_DV)))
                return BadRequest("Bạn đang có đơn giặt sấy chờ xử lý.");

            // Lấy IDManager phụ trách phòng để gán ngay khi tạo đơn
            var idManager = await LayIDManagerPhongAsync(idPhong);

            var don = new DONDV
            {
                IDPhong = idPhong,
                IDUser = idUser,
                IDManagerXuLy = idManager,          // ← gán manager phụ trách
                LoaiDV = "Giặt sấy",
                TrangThai_DV = "Chờ xử lý",       
                NoiDung = $"[{req.LoaiDV}] {req.GhiChu}".Trim(),
                MucDo = "Trung bình",
                TongTien = 0,
                NgayTao = DateTime.Now,
                NgayHetHan = DateTime.Now.AddDays(7),
                UpdatedAt = DateTime.Now
            };

            _db.DONDV.Add(don);
            await _db.SaveChangesAsync();
            await GuiThongBaoManager(idPhong, idUser, "Đơn Giặt Sấy mới",
                $"Phòng {idPhong} vừa đặt dịch vụ giặt sấy.", "thong-tin");

            return new JsonResult(new { id = don.IDDonDV });
        }

        // --- API Đặt đơn Nước bình ---
        public async Task<IActionResult> OnPostNuocBinhAsync([FromBody] DatNuocRequest req)
        {
            var (idUser, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return Unauthorized();

            if (await _db.DONDV.AnyAsync(d => d.IDPhong == idPhong && d.LoaiDV == "Nước bình"
                && TrangThaiChuaXong.Contains(d.TrangThai_DV)))
                return BadRequest("Bạn đang có đơn nước bình chờ xử lý.");

            // Lấy IDManager phụ trách phòng để gán ngay khi tạo đơn
            var idManager = await LayIDManagerPhongAsync(idPhong);

            decimal tongTien = req.SoLuong * 15000m - (req.TraVo ? req.SoLuong * 5000m : 0);

            var don = new DONDV
            {
                IDPhong = idPhong,
                IDUser = idUser,
                IDManagerXuLy = idManager,          // ← gán manager phụ trách
                LoaiDV = "Nước bình",
                TrangThai_DV = "Đang xử lý",       // ← "Đang xử lý" để map đúng sang "sap-den"
                NoiDung = $"Số lượng: {req.SoLuong} bình. Trả vỏ: {(req.TraVo ? "Có" : "Không")}. {req.GhiChu}".Trim(),
                MucDo = "Trung bình",
                TongTien = tongTien,
                NgayTao = DateTime.Now,
                NgayHetHan = DateTime.Now.AddDays(7),
                UpdatedAt = DateTime.Now
            };

            _db.DONDV.Add(don);
            await _db.SaveChangesAsync();
            await GuiThongBaoManager(idPhong, idUser, "Đơn Nước Bình mới",
                $"Phòng {idPhong} vừa đặt {req.SoLuong} bình nước.", "thong-tin");

            return new JsonResult(new { id = don.IDDonDV });
        }

        // --- API Polling trạng thái đơn ---
        public async Task<IActionResult> OnGetTrangThaiAsync()
        {
            var (_, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return new JsonResult(new { });

            // Dùng TrangThaiChuaXong thống nhất – gồm cả "Chờ xác nhận"
            var donDangXuLy = await _db.DONDV
                .Where(d => d.IDPhong == idPhong && TrangThaiChuaXong.Contains(d.TrangThai_DV))
                .ToListAsync();

            var gs = donDangXuLy.FirstOrDefault(d => d.LoaiDV == "Giặt sấy");
            var nuoc = donDangXuLy.FirstOrDefault(d => d.LoaiDV == "Nước bình");

            var kyHienTai = DateTime.Now.ToString("MM/yyyy");
            var duocCongVaoTro = await _db.HDTHANG
                .Where(h => h.IDPhong == idPhong && h.KyThanhToan == kyHienTai)
                .Select(h => h.DuocCongVaoTro)
                .FirstOrDefaultAsync() == true;

            var ngayNguong = DateTime.Now.AddDays(-7);

            return new JsonResult(new
            {
                giatSay = gs == null ? null : (object)new
                {
                    id = gs.IDDonDV,
                    trangThai = gs.TrangThai_DV,
                    tongTien = gs.TongTien,
                    ngayHetHan = gs.NgayHetHan?.ToString("dd/MM/yyyy"),
                    conHan = gs.NgayHetHan.HasValue ? (gs.NgayHetHan.Value - DateTime.Now).Days : (int?)null,
                    duocCongVaoTro = duocCongVaoTro
                        && gs.TrangThai_DV == "Chờ thanh toán"
                        && gs.NgayTao <= ngayNguong
                },
                nuocBinh = nuoc == null ? null : (object)new
                {
                    id = nuoc.IDDonDV,
                    trangThai = nuoc.TrangThai_DV,
                    tongTien = nuoc.TongTien,
                    ngayHetHan = nuoc.NgayHetHan?.ToString("dd/MM/yyyy"),
                    conHan = nuoc.NgayHetHan.HasValue ? (nuoc.NgayHetHan.Value - DateTime.Now).Days : (int?)null,
                    coAnhBienLai = !string.IsNullOrEmpty(nuoc.AnhBienLai), // ← thêm dòng này
                    duocCongVaoTro = duocCongVaoTro
                    && nuoc.TrangThai_DV == "Chờ thanh toán"
                    && nuoc.NgayTao <= ngayNguong
                }
            });
        }

        // --- API Xác nhận thanh toán ---
        public async Task<IActionResult> OnPostXacNhanThanhToanAsync(
            [FromForm] string loaiTT,
            [FromForm] string? gsDonId,
            [FromForm] string? nuocDonId,
            IFormFile? anhBill)
        {
            var (idUser, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return Unauthorized();

            string? anhPath = null;
            if (anhBill != null && anhBill.Length > 0)
            {
                string folder = Path.Combine(_env.WebRootPath, "uploads", "bill");
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                string fileName = Guid.NewGuid() + Path.GetExtension(anhBill.FileName);
                using var fs = new FileStream(Path.Combine(folder, fileName), FileMode.Create);
                await anhBill.CopyToAsync(fs);
                anhPath = "/uploads/bill/" + fileName;
            }

            var now = DateTime.Now;

            // Giặt sấy: khách chuyển khoản → chờ quản lý xác nhận
            if ((loaiTT == "gs" || loaiTT == "gop") && int.TryParse(gsDonId, out int gsId))
            {
                var don = await _db.DONDV.FirstOrDefaultAsync(d => d.IDDonDV == gsId && d.IDPhong == idPhong);
                if (don != null)
                {
                    don.TrangThai_DV = "Chờ duyệt";   // ← unified with HDTHANG convention
                    don.AnhBienLai = anhPath;
                    don.UpdatedAt = now;
                }
            }

            // Nước bình: thu tiền mặt trực tiếp → hoàn tất ngay
            if ((loaiTT == "nuoc" || loaiTT == "gop") && int.TryParse(nuocDonId, out int nuocId))
            {
                var don = await _db.DONDV.FirstOrDefaultAsync(d => d.IDDonDV == nuocId && d.IDPhong == idPhong);
                if (don != null)
                {
                    don.TrangThai_DV = "Chờ thanh toán"; // giữ nguyên, manager sẽ xác nhận
                    don.AnhBienLai = anhPath;             // lưu ảnh để manager xem
                    don.UpdatedAt = now;
                }
            }

            await _db.SaveChangesAsync();
            await GuiThongBaoManager(idPhong, idUser, "Xác nhận thanh toán",
                $"Phòng {idPhong} đã gửi ảnh bill thanh toán ({loaiTT}).", "thanh-toan");

            return new JsonResult(new { ok = true });
        }

        // --- API Hủy nợ cộng vào hóa đơn tháng ---
        public async Task<IActionResult> OnPostHuyNoDVAsync([FromBody] XacNhanRequest req)
        {
            var (_, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return Unauthorized();

            var don = await _db.DONDV.FirstOrDefaultAsync(d => d.IDDonDV == req.DonId && d.IDPhong == idPhong);
            if (don == null) return NotFound("Không tìm thấy đơn.");

            don.TrangThai_DV = "Chờ thanh toán";
            don.UpdatedAt = DateTime.Now;

            var kyHienTai = DateTime.Now.ToString("MM/yyyy");
            var hdThang = await _db.HDTHANG
                .FirstOrDefaultAsync(h => h.IDPhong == idPhong && h.KyThanhToan == kyHienTai);
            if (hdThang != null)
            {
                hdThang.DuocCongVaoTro = false;
                var tienNo = don.TongTien;
                hdThang.TienNoDV = Math.Max(0, (hdThang.TienNoDV ?? 0) - tienNo);
                hdThang.TongCong = Math.Max(0, hdThang.TongCong - tienNo);
                hdThang.UpdatedAt = DateTime.Now;
            }

            await _db.SaveChangesAsync();
            return new JsonResult(new { ok = true });
        }

        // --- API Gửi chỉ số Điện/Nước ---
        public async Task<IActionResult> OnPostDienNuocAsync(
            [FromForm] string? dienMoi,
            [FromForm] string? nuocMoi,
            IFormFile? anhDien,
            IFormFile? anhNuoc)
        {
            var (idUser, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return Unauthorized();

            if (string.IsNullOrWhiteSpace(dienMoi) && string.IsNullOrWhiteSpace(nuocMoi))
                return BadRequest("Vui lòng nhập ít nhất một chỉ số điện hoặc nước.");

            int? dM = null, nM = null;
            if (!string.IsNullOrWhiteSpace(dienMoi))
            {
                if (!int.TryParse(dienMoi, out int d)) return BadRequest("Chỉ số điện phải là số nguyên.");
                dM = d;
            }
            if (!string.IsNullOrWhiteSpace(nuocMoi))
            {
                if (!int.TryParse(nuocMoi, out int n)) return BadRequest("Chỉ số nước phải là số nguyên.");
                nM = n;
            }

            var last = await _db.DIENNUOC
                .Where(d => d.IDPhong == idPhong && d.TrangThaiDuyet == 1)
                .OrderByDescending(d => d.NgayGhi).FirstOrDefaultAsync();

            if (dM.HasValue && dM < (last?.SoDienMoi ?? 0))
                return BadRequest("Chỉ số điện mới không được nhỏ hơn chỉ số cũ.");
            if (nM.HasValue && nM < (last?.SoNuocMoi ?? 0))
                return BadRequest("Chỉ số nước mới không được nhỏ hơn chỉ số cũ.");

            string anhPath = "";
            var file = anhDien ?? anhNuoc;
            if (file != null && file.Length > 0)
            {
                string folder = Path.Combine(_env.WebRootPath, "uploads", "dien-nuoc");
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                using var fs = new FileStream(Path.Combine(folder, fileName), FileMode.Create);
                await file.CopyToAsync(fs);
                anhPath = "/uploads/dien-nuoc/" + fileName;
            }

            var entry = new DIENNUOC
            {
                IDPhong = idPhong,
                KyGhiNhan = DateTime.Now.ToString("MM/yyyy"),
                SoDienCu = last?.SoDienMoi ?? 0,
                SoDienMoi = dM ?? (last?.SoDienMoi ?? 0),
                SoNuocCu = last?.SoNuocMoi ?? 0,
                SoNuocMoi = nM ?? (last?.SoNuocMoi ?? 0),
                AnhChupDongHo = anhPath,
                NgayGhi = DateTime.Now,
                TrangThaiDuyet = 0
            };

            _db.DIENNUOC.Add(entry);
            await _db.SaveChangesAsync();
            return new JsonResult(new { ok = true });
        }

        // --- Helper Gửi thông báo cho quản lý phòng ---
        private async Task GuiThongBaoManager(int idPhong, int idSender, string title, string content, string type)
        {
            var managers = await _db.PHONG_MANAGER
                .Where(pm => pm.IDPhong == idPhong && pm.IsActive)
                .Select(pm => pm.IDManager)
                .ToListAsync();

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

        // ── Request DTOs ─────────────────────────────────────────────────
        public class XacNhanRequest { public int DonId { get; set; } }

        public class DatGSRequest
        {
            public string LoaiDV { get; set; } = "";
            public string GhiChu { get; set; } = "";
        }

        public class DatNuocRequest
        {
            public int SoLuong { get; set; } = 1;
            public bool TraVo { get; set; } = false;
            public string GhiChu { get; set; } = "";
            public decimal TongTien { get; set; }
        }
    }
}
