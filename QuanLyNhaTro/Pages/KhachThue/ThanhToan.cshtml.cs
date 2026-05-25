using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.KhachThue
{
    public class ThanhToanModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;
        private readonly IWebHostEnvironment _env;

        public ThanhToanModel(QuanLyKhuNhaTro db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // ── Dữ liệu truyền sang View ─────────────────────────────────
        public HDTHANG? HoaDon { get; set; }
        public DIENNUOC? DienNuoc { get; set; }
        public ACCOUNT? KhachThue { get; set; }
        public PHONG? Phong { get; set; }

        // ── Thông tin quản lý (dùng cho QR + ngân hàng) ──────────────
        public ACCOUNT? QuanLy { get; set; }
        public ACCOUNT? ChuTro { get; set; }



        public string NganHang { get; set; } = "";
        public string SoTaiKhoan { get; set; } = "";

        // ── Giá phòng cố định (từ PHONG.GiaPhongFix) ─────────────────
        public decimal GiaPhongCoDinh { get; set; }

        // ── Đơn giá từ CONFIG_GIA ─────────────────────────────────────
        public decimal DonGiaDien { get; set; }
        public decimal DonGiaNuoc { get; set; }

        // ── Số thông báo chưa đọc (badge) ────────────────────────────
        public int SoThongBaoChua { get; set; }


        // ════════════════════════════════════════════════════════════════
        // GET — Load dữ liệu trang
        // ════════════════════════════════════════════════════════════════
        public async Task<IActionResult> OnGetAsync()
        {
            // 1. Lấy IDUser của khách đang đăng nhập từ Claims
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idUser))
                return RedirectToPage("/Index");

            KhachThue = await _db.ACCOUNT.FindAsync(idUser);
            if (KhachThue == null) return NotFound();

            // 2. Tìm hợp đồng đang hiệu lực của khách
            var hopDong = await _db.HOPDONG
                .Include(h => h.Phong)
                .FirstOrDefaultAsync(h => h.IDUser == idUser && h.TrangThaiHD == "Đang hiệu lực");

            if (hopDong == null) return NotFound("Không tìm thấy hợp đồng đang hiệu lực.");
            Phong = hopDong.Phong;

            // 3. Lấy hóa đơn tháng hiện tại (hoặc tháng chưa đóng gần nhất)
            HoaDon = await _db.HDTHANG
                .Include(h => h.DienNuoc)
                .Where(h => h.IDPhong == hopDong.IDPhong
                         && (h.TrangThai_TT == "Chưa đóng" || h.TrangThai_TT == "Chờ duyệt"))
                .OrderByDescending(h => h.KyThanhToan)
                .FirstOrDefaultAsync();

            DienNuoc = HoaDon?.DienNuoc;

            // 4. Lấy thông tin quản lý phụ trách phòng này (để lấy QR_Link)
            //    SQL tương đương:
            //      SELECT a.* FROM ACCOUNT a
            //      JOIN PHONG_MANAGER pm ON pm.IDManager = a.IDUser
            //      WHERE pm.IDPhong = @idPhong AND pm.IsActive = 1
            //      ORDER BY pm.NgayPhanCong DESC
            var phongManager = await _db.PHONG_MANAGER
                .Include(pm => pm.Manager)
                .Where(pm => pm.IDPhong == hopDong.IDPhong && pm.IsActive)
                .OrderByDescending(pm => pm.NgayPhanCong)
                .FirstOrDefaultAsync();

            QuanLy = phongManager?.Manager;
            ChuTro = await _db.ACCOUNT
            .Where(a => a.Roles == "Admin" && a.IsActive)
            .FirstOrDefaultAsync()
            ?? new ACCOUNT { FullName = "Trần Minh Quân", Phone = "0900111222" };

            NganHang = "";  
            SoTaiKhoan = "";  

            // 4b. Lấy giá phòng cố định
            GiaPhongCoDinh = hopDong.Phong?.GiaPhongFix ?? 0;

            // 5. Đơn giá điện/nước từ CONFIG_GIA
            var configDien = await _db.CONFIG_GIA
                .FirstOrDefaultAsync(c => c.MaDichVu == "DIEN" && c.IsActive);
            var configNuoc = await _db.CONFIG_GIA
                .FirstOrDefaultAsync(c => c.MaDichVu == "NUOC" && c.IsActive);

            DonGiaDien = configDien?.DonGia ?? 0;
            DonGiaNuoc = configNuoc?.DonGia ?? 0;

            // 6. Đếm thông báo chưa đọc
            SoThongBaoChua = await _db.THONGBAO
                .CountAsync(t => t.IDUser == idUser && !t.DaDoc);

            return Page();
        }



       
       
        /*
         * ═══════════════════════════════════════════════════════════════
         *  UPLOAD ẢNH BILL CHUYỂN KHOẢN
         * ───────────────────────────────────────────────────────────────
         * Luồng hoạt động:
         *   1. Người dùng chọn ảnh → JS preview (client-side, không cần server)
         *   2. Nhấn "Gửi xác nhận" → JS gọi fetch() POST đến handler này
         *   3. Server lưu file → cập nhật DB → trả JSON thành công
         *
         * Cách gọi từ JS (thay setTimeout trong ttGuiXacNhan):
         *   const fd = new FormData();
         *   fd.append('BillImage', ttSelectedFile);
         *   fd.append('InvoiceId', '@Model.HoaDon?.IDHDThang');
         *   const res = await fetch('?handler=GuiXacNhan', {
         *     method: 'POST',
         *     headers: { 'RequestVerificationToken':
         *       document.querySelector('[name=__RequestVerificationToken]').value },
         *     body: fd
         *   });
         *   if (!res.ok) throw new Error('Lỗi server');
         *
         * SQL sau khi lưu file thành công:
         *   UPDATE HDTHANG
         *   SET AnhChuyenKhoan = @duongDan,
         *       TrangThai_TT   = 'Chờ duyệt',
         *       UpdatedAt      = GETDATE()
         *   WHERE IDHDThang = @invoiceId
         *
         * Thư mục lưu file:
         *   wwwroot/uploads/bills/{IDHDThang}_{yyyyMMddHHmmss}.jpg
         

         * [GHI CHÚ] UPLOAD ẢNH QR CODE CỦA QUẢN LÝ
         * ───────────────────────────────────────────────────────────────
         * Thực hiện ở trang quản lý (Manager), KHÔNG phải trang khách thuê.
         * Luồng:
         *   1. Manager upload ảnh QR từ trang cài đặt của mình
         *   2. Server lưu file vào: wwwroot/uploads/qr/{IDUser}.png
         *   3. Cập nhật SQL:
         *        UPDATE ACCOUNT
         *        SET QR_Link   = '/uploads/qr/{IDUser}.png',
         *            UpdatedAt = GETDATE()
         *        WHERE IDUser = @idManager AND Roles = 'Manager'
         *   4. Trang ThanhToan của khách tự động hiển thị QR mới
         *      thông qua: src="@Model.QuanLy.QR_Link"
         * ═══════════════════════════════════════════════════════════════
         */
        [BindProperty]
        public IFormFile? BillImage { get; set; }

        [BindProperty]
        public int InvoiceId { get; set; }

        public async Task<IActionResult> OnPostGuiXacNhanAsync()
        {
            if (BillImage == null || InvoiceId <= 0)
                return BadRequest(new { message = "Thiếu dữ liệu." });

            // Kiểm tra hóa đơn thuộc về khách đang đăng nhập
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idUser))
                return Unauthorized();

            var hoaDon = await _db.HDTHANG
                .Include(h => h.Phong)
                    .ThenInclude(p => p.HopDongs)
                .FirstOrDefaultAsync(h => h.IDHDThang == InvoiceId);

            if (hoaDon == null) return NotFound();

            bool laKhachCuaPhong = hoaDon.Phong.HopDongs
                .Any(hd => hd.IDUser == idUser && hd.TrangThaiHD == "Đang hiệu lực");
            if (!laKhachCuaPhong) return Forbid();

            // Lưu file ảnh bill
            string uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "bills");
            Directory.CreateDirectory(uploadsDir);

            string ext = Path.GetExtension(BillImage.FileName);
            string fileName = $"{InvoiceId}_{DateTime.Now:yyyyMMddHHmmss}{ext}";
            string filePath = Path.Combine(uploadsDir, fileName);

            await using (var stream = System.IO.File.Create(filePath))
                await BillImage.CopyToAsync(stream);

            // Cập nhật DB
            //     UPDATE HDTHANG
            //     SET AnhChuyenKhoan = @duongDan,
            //         TrangThai_TT   = 'Chờ duyệt',
            //         UpdatedAt      = GETDATE()
            //     WHERE IDHDThang = @invoiceId
            hoaDon.AnhChuyenKhoan = $"/uploads/bills/{fileName}";
            hoaDon.TrangThai_TT = "Chờ duyệt";
            hoaDon.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return new JsonResult(new { success = true });
        }
    }
}
