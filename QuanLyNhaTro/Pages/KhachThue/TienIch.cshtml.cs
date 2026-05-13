using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

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

        // ── Thông tin khách thuê hiện tại ──────────────────────────
        public string TenKhach { get; set; } = "";
        public string SoPhong { get; set; } = "";
        public string TangPhong { get; set; } = "";
        public string ChuVietTat { get; set; } = "K";

        // ── Chỉ số điện/nước kỳ trước (readonly trong form) ─────────
        public int ChiSoDienCu { get; set; }
        public int ChiSoNuocCu { get; set; }

        // ── Thông tin QR thanh toán của Manager ─────────────────────
        // ACCOUNT chỉ có QR_Link, không có NganHang / SoTaiKhoan
        public string? QrLink { get; set; }
        public string ChuTaiKhoan { get; set; } = "";


        // ── Số thông báo chưa đọc ───────────────────────────────────
        public int SoThongBaoChuaDoc { get; set; }

        // ── Đơn dịch vụ đang hoạt động (để render badge server-side) ─
        public DONDV? DonGiatSay { get; set; }
        public DONDV? DonNuocBinh { get; set; }

        // ── Helper: lấy IDUser + IDPhong từ claim ──────────────────
        private async Task<(int idUser, int idPhong)> LayThongTinPhong()
        {
            var userIdClaim = User.FindFirst("IDUser")?.Value
                           ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out int idUser))
                return (-1, -1);

            var hopDong = await _db.HOPDONG
                .FirstOrDefaultAsync(h => h.IDUser == idUser && h.TrangThaiHD == "Đang hiệu lực");

            return hopDong == null ? (idUser, -1) : (idUser, hopDong.IDPhong);
        }

        // ════════════════════════════════════════════════════════════
        //   GET — Tải trang chính
        // ════════════════════════════════════════════════════════════
        public async Task<IActionResult> OnGetAsync()
        {
            var userIdClaim = User.FindFirst("IDUser")?.Value
                           ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out int idUser))
                return RedirectToPage("/Index");

            var hopDong = await _db.HOPDONG
                .Include(h => h.Tenant)
                .Include(h => h.Phong)
                .FirstOrDefaultAsync(h => h.IDUser == idUser && h.TrangThaiHD == "Đang hiệu lực");

            if (hopDong == null)
                return RedirectToPage("/KhachThue/KhachThue");

            // Thông tin cơ bản
            TenKhach = hopDong.Tenant.FullName;
            SoPhong = "Phòng " + hopDong.Phong.SoPhong;
            TangPhong = "Tầng " + hopDong.Phong.Tang;
            ChuVietTat = TenKhach.Length > 0 ? TenKhach[0].ToString().ToUpper() : "K";

            // Chỉ số điện/nước kỳ trước (đã duyệt)
            var dienNuocCu = await _db.DIENNUOC
                .Where(d => d.IDPhong == hopDong.IDPhong && d.TrangThaiDuyet == 1)
                .OrderByDescending(d => d.NgayGhi)
                .FirstOrDefaultAsync();

            ChiSoDienCu = dienNuocCu?.SoDienMoi ?? hopDong.DienDauKy;
            ChiSoNuocCu = dienNuocCu?.SoNuocMoi ?? hopDong.NuocDauKy;

            // Số thông báo chưa đọc
            SoThongBaoChuaDoc = await _db.THONGBAO
                .CountAsync(t => t.IDUser == idUser && !t.DaDoc);

            // Đơn dịch vụ còn hoạt động (bao gồm cả "Chờ thanh toán")
            var donDangXuLy = await _db.DONDV
                .Where(d => d.IDPhong == hopDong.IDPhong
                         && d.TrangThai_DV != "Thành công"
                         && d.TrangThai_DV != "Đã hủy"
                         && d.TrangThai_DV != "Đã thanh toán")
                .ToListAsync();

            DonGiatSay = donDangXuLy.FirstOrDefault(d => d.LoaiDV == "Giặt sấy");
            DonNuocBinh = donDangXuLy.FirstOrDefault(d => d.LoaiDV == "Nước bình");

            // QR Manager (ACCOUNT chỉ có QR_Link, FullName)
            var manager = await _db.PHONG_MANAGER
                .Include(pm => pm.Manager)
                .Where(pm => pm.IDPhong == hopDong.IDPhong && pm.IsActive)
                .Select(pm => pm.Manager)
                .FirstOrDefaultAsync();

            if (manager != null)
            {
                this.QrLink = manager.QR_Link;
                this.ChuTaiKhoan = manager.FullName;
            }

            return Page();
        }

        // ════════════════════════════════════════════════════════════
        //   API: GET ?handler=TrangThai
        //   Polling — trả trạng thái đơn hiện tại của phòng
        // ════════════════════════════════════════════════════════════
        public async Task<IActionResult> OnGetTrangThaiAsync()
        {
            var (_, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return Unauthorized();

            var donDangXuLy = await _db.DONDV
                .Where(d => d.IDPhong == idPhong
                         && d.TrangThai_DV != "Thành công"
                         && d.TrangThai_DV != "Đã hủy"
                         && d.TrangThai_DV != "Đã thanh toán")
                .ToListAsync();

            var gs = donDangXuLy.FirstOrDefault(d => d.LoaiDV == "Giặt sấy");
            var nuoc = donDangXuLy.FirstOrDefault(d => d.LoaiDV == "Nước bình");

            return new JsonResult(new
            {
                giatSay = gs == null ? null : new
                {
                    id = gs.IDDonDV,
                    trangThai = gs.TrangThai_DV,
                    tongTien = gs.TongTien   // Quản lý cập nhật sau
                },
                nuocBinh = nuoc == null ? null : new
                {
                    id = nuoc.IDDonDV,
                    trangThai = nuoc.TrangThai_DV,
                    tongTien = nuoc.TongTien
                }
            });
        }

        // ════════════════════════════════════════════════════════════
        //   API: POST ?handler=GiatSay
        //   Khách đặt đơn giặt sấy
        //   Giá sẽ do Quản lý nhập sau → TongTien mặc định = 0
        // ════════════════════════════════════════════════════════════
        public async Task<IActionResult> OnPostGiatSayAsync([FromBody] DatGSRequest req)
        {
            var (idUser, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return Unauthorized();

            // Kiểm tra đã có đơn đang xử lý chưa
            var coRoi = await _db.DONDV.AnyAsync(d =>
                d.IDPhong == idPhong && d.LoaiDV == "Giặt sấy" &&
                d.TrangThai_DV != "Thành công" && d.TrangThai_DV != "Đã hủy");
            if (coRoi)
                return BadRequest("Bạn đã có đơn giặt sấy đang xử lý.");

            // Dùng NoiDung thay GhiChu (field thực trong DONDV)
            var don = new DONDV
            {
                IDPhong = idPhong,
                IDUser = idUser,
                LoaiDV = "Giặt sấy",
                TrangThai_DV = "Chờ xử lý",
                NoiDung = $"[{req.LoaiDV}] {req.GhiChu}".Trim(),
                MucDo = "Trung bình",
                TongTien = 0,       // Quản lý sẽ cập nhật sau
                NgayTao = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _db.DONDV.Add(don);
            await _db.SaveChangesAsync();

            // Thông báo cho Manager
            await GuiThongBaoManager(idPhong, idUser,
                tieuDe: "Đơn Giặt Sấy mới",
                noiDung: $"Phòng {idPhong} vừa đặt dịch vụ giặt sấy ({req.LoaiDV}).",
                loaiTB: "thong-tin");

            return new JsonResult(new { id = don.IDDonDV });
        }

        // ════════════════════════════════════════════════════════════
        //   API: POST ?handler=NuocBinh
        //   Khách đặt bình nước — giá cố định 30.000đ/bình
        //   Trả vỏ giảm 5.000đ/bình
        // ════════════════════════════════════════════════════════════
        public async Task<IActionResult> OnPostNuocBinhAsync([FromBody] DatNuocRequest req)
        {
            var (idUser, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return Unauthorized();

            var coRoi = await _db.DONDV.AnyAsync(d =>
                d.IDPhong == idPhong && d.LoaiDV == "Nước bình" &&
                d.TrangThai_DV != "Thành công" && d.TrangThai_DV != "Đã hủy");
            if (coRoi)
                return BadRequest("Bạn đã có đơn nước bình đang xử lý.");

            // Giá cố định: 30.000đ/bình, trả vỏ giảm 5.000đ/bình
            decimal giaMoiBinh = 30_000m;
            decimal giamTraVo = req.TraVo ? 5_000m * req.SoLuong : 0m;
            decimal tong = (giaMoiBinh * req.SoLuong) - giamTraVo;

            var don = new DONDV
            {
                IDPhong = idPhong,
                IDUser = idUser,
                LoaiDV = "Nước bình",
                TrangThai_DV = "Chờ xử lý",
                // Lưu số lượng + ghi chú vào NoiDung
                NoiDung = $"Số lượng: {req.SoLuong} bình" +
                               (req.TraVo ? " | Trả vỏ" : "") +
                               (string.IsNullOrEmpty(req.GhiChu) ? "" : $" | {req.GhiChu}"),
                MucDo = "Trung bình",
                TongTien = tong,
                NgayTao = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _db.DONDV.Add(don);
            await _db.SaveChangesAsync();

            await GuiThongBaoManager(idPhong, idUser,
                tieuDe: "Đơn Bình Nước mới",
                noiDung: $"Phòng {idPhong} đặt {req.SoLuong} bình nước. Tổng: {tong:N0}đ.",
                loaiTB: "thong-tin");

            return new JsonResult(new { id = don.IDDonDV, tongTien = tong });
        }

        // ════════════════════════════════════════════════════════════
        //   API: POST ?handler=DienNuoc
        //   Khách gửi chỉ số điện/nước + ảnh minh chứng
        // ════════════════════════════════════════════════════════════
        public async Task<IActionResult> OnPostDienNuocAsync(
            [FromForm] string? dienMoi,
            [FromForm] string? nuocMoi,
            [FromForm] IFormFile? anhDien,
            [FromForm] IFormFile? anhNuoc)
        {
            var (idUser, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return Unauthorized();

            var hopDong = await _db.HOPDONG
                .FirstOrDefaultAsync(h => h.IDUser == idUser && h.TrangThaiHD == "Đang hiệu lực");
            if (hopDong == null) return BadRequest("Không tìm thấy hợp đồng.");

            // Lấy chỉ số kỳ trước
            var cuoi = await _db.DIENNUOC
                .Where(d => d.IDPhong == idPhong && d.TrangThaiDuyet == 1)
                .OrderByDescending(d => d.NgayGhi)
                .FirstOrDefaultAsync();

            int dienCu = cuoi?.SoDienMoi ?? hopDong.DienDauKy;
            int nuocCu = cuoi?.SoNuocMoi ?? hopDong.NuocDauKy;

            if (!int.TryParse(dienMoi, out int dienMoiVal)) dienMoiVal = dienCu;
            if (!int.TryParse(nuocMoi, out int nuocMoiVal)) nuocMoiVal = nuocCu;

            // Upload ảnh vào wwwroot/uploads/dien-nuoc/
            string uploadDir = Path.Combine(_env.WebRootPath, "uploads", "dien-nuoc");
            Directory.CreateDirectory(uploadDir);

            // DIENNUOC chỉ có AnhChupDongHo (1 field ảnh)
            // Lưu ảnh điện làm ảnh chính, ảnh nước ghép vào tên file
            string? pathAnh = null;

            IFormFile? anhChon = anhDien ?? anhNuoc;
            if (anhChon != null)
            {
                var ext = Path.GetExtension(anhChon.FileName);
                var fn = $"dn_{idPhong}_{DateTime.Now:yyyyMMddHHmmss}{ext}";
                var fullPath = Path.Combine(uploadDir, fn);
                using var fs = new FileStream(fullPath, FileMode.Create);
                await anhChon.CopyToAsync(fs);
                pathAnh = "/uploads/dien-nuoc/" + fn;
            }

            var kyGhiNhan = DateTime.Now.ToString("MM/yyyy");

            // Kiểm tra kỳ này đã gửi chưa (tránh trùng unique index IDPhong+KyGhiNhan)
            var daGui = await _db.DIENNUOC
                .AnyAsync(d => d.IDPhong == idPhong && d.KyGhiNhan == kyGhiNhan);
            if (daGui)
                return BadRequest("Bạn đã gửi chỉ số điện/nước kỳ này rồi.");

            var bghiMoi = new DIENNUOC
            {
                IDPhong = idPhong,
                KyGhiNhan = kyGhiNhan,
                SoDienCu = dienCu,
                SoDienMoi = dienMoiVal,
                SoNuocCu = nuocCu,
                SoNuocMoi = nuocMoiVal,
                AnhChupDongHo = pathAnh ?? "",
                NgayGhi = DateTime.Now,
                TrangThaiDuyet = 0   // 0 = chờ duyệt
            };

            _db.DIENNUOC.Add(bghiMoi);
            await _db.SaveChangesAsync();

            await GuiThongBaoManager(idPhong, idUser,
                tieuDe: "Chỉ số điện/nước mới",
                noiDung: $"Phòng {idPhong} đã gửi chỉ số điện/nước kỳ {kyGhiNhan}. Cần xác nhận.",
                loaiTB: "thanh-toan");

            return new JsonResult(new { ok = true });
        }

        // ════════════════════════════════════════════════════════════
        //   API: POST ?handler=XacNhanNhanHang
        //   Khách xác nhận đã nhận bình nước → TrangThai → "Chờ thanh toán"
        // ════════════════════════════════════════════════════════════
        public async Task<IActionResult> OnPostXacNhanNhanHangAsync([FromBody] XacNhanRequest req)
        {
            var (_, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return Unauthorized();

            var don = await _db.DONDV.FindAsync(req.DonId);
            if (don == null || don.IDPhong != idPhong)
                return BadRequest("Không tìm thấy đơn.");

            don.TrangThai_DV = "Chờ thanh toán";
            don.UpdatedAt = DateTime.Now;
            await _db.SaveChangesAsync();

            return new JsonResult(new { ok = true });
        }

        // ════════════════════════════════════════════════════════════
        //   API: POST ?handler=XacNhanThanhToan
        //   Khách upload ảnh bill → cập nhật TrangThai_DV → chờ Manager duyệt
        //
        //   loaiTT = "gs"   → chỉ thanh toán giặt sấy
        //   loaiTT = "nuoc" → chỉ thanh toán nước bình
        //   loaiTT = "gop"  → thanh toán cả hai (gộp)
        // ════════════════════════════════════════════════════════════
        public async Task<IActionResult> OnPostXacNhanThanhToanAsync(
            [FromForm] string loaiTT,
            [FromForm] string? gsDonId,
            [FromForm] string? nuocDonId,
            [FromForm] IFormFile anhBill)
        {
            var (idUser, idPhong) = await LayThongTinPhong();
            if (idPhong < 0) return Unauthorized();
            if (anhBill == null) return BadRequest("Thiếu ảnh bill.");

            // Lưu ảnh bill vào wwwroot/uploads/bill/
            string uploadDir = Path.Combine(_env.WebRootPath, "uploads", "bill");
            Directory.CreateDirectory(uploadDir);
            var fn = $"bill_{idPhong}_{loaiTT}_{DateTime.Now:yyyyMMddHHmmss}{Path.GetExtension(anhBill.FileName)}";
            var fullPath = Path.Combine(uploadDir, fn);
            using (var fs = new FileStream(fullPath, FileMode.Create))
                await anhBill.CopyToAsync(fs);
            var urlBill = "/uploads/bill/" + fn;

            // Cập nhật trạng thái đơn → "Chờ xử lý" (Manager chưa xác nhận)
            // Dùng AnhBienLai thay AnhBillTT (field thực trong DONDV)
            async Task CapNhatDon(string? donIdStr)
            {
                if (!int.TryParse(donIdStr, out int donId)) return;
                var don = await _db.DONDV.FindAsync(donId);
                if (don == null || don.IDPhong != idPhong) return;
                don.TrangThai_DV = "Đang xử lý";   // Manager sẽ chuyển sang Thành công
                don.AnhBienLai = urlBill;         // AnhBienLai = ảnh bill CK
                don.NgayXuLy = DateTime.Now;
                don.UpdatedAt = DateTime.Now;
            }

            if (loaiTT is "gs" or "gop") await CapNhatDon(gsDonId);
            if (loaiTT is "nuoc" or "gop") await CapNhatDon(nuocDonId);

            await _db.SaveChangesAsync();

            // Thông báo Manager xác nhận thanh toán
            string tenDV = loaiTT switch
            {
                "gs" => "Giặt Sấy",
                "nuoc" => "Bình Nước",
                _ => "Giặt Sấy + Bình Nước"
            };

            await GuiThongBaoManager(idPhong, idUser,
                tieuDe: $"Xác nhận thanh toán — {tenDV}",
                noiDung: $"Phòng {idPhong} đã gửi ảnh bill thanh toán dịch vụ {tenDV}. Vui lòng xác nhận.",
                loaiTB: "thanh-toan");

            return new JsonResult(new { ok = true, urlBill });
        }

        // ════════════════════════════════════════════════════════════
        //   Helper: Gửi thông báo cho tất cả Manager phụ trách phòng
        // ════════════════════════════════════════════════════════════
        private async Task GuiThongBaoManager(
            int idPhong, int idNguoiGui,
            string tieuDe, string noiDung, string loaiTB)
        {
            var managerIds = await _db.PHONG_MANAGER
                .Where(pm => pm.IDPhong == idPhong && pm.IsActive)
                .Select(pm => pm.IDManager)
                .ToListAsync();

            foreach (var mId in managerIds)
            {
                _db.THONGBAO.Add(new THONGBAO
                {
                    IDUser = mId,
                    IDNguoiGui = idNguoiGui,
                    TieuDe = tieuDe,
                    NoiDung = noiDung,
                    DaDoc = false,
                    NgayTao = DateTime.Now,
                    LoaiTB = loaiTB,
                    LoaiNguon = "DonDV"
                });
            }

            await _db.SaveChangesAsync();
        }
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
