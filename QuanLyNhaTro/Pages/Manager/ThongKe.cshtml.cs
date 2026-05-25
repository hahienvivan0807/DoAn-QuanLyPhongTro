using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.Manager
{
    public class ThongKeModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _context;

        public ThongKeModel(QuanLyKhuNhaTro context)
        {
            _context = context;
        }

        // ── Thông tin user ────────────────────────────────────────────
        public ACCOUNT? CurrentUser { get; set; }
        public int SoThongBaoChuaDoc { get; set; }
        public int SoSuCoChoXuLy { get; set; }

        // ── Thống kê phòng (đọc, tính từ DB) ─────────────────────────
        public int TongSoPhong { get; set; }
        public int PhongDangThue { get; set; }
        public int PhongConTrong { get; set; }
        public int PhongDangSua { get; set; }
        public decimal TiLeLapDay { get; set; }

        // ── Thống kê doanh thu (đọc, tính từ DB) ─────────────────────
        public decimal DoanhThuThangNay { get; set; }
        public decimal DoanhThuThangTruoc { get; set; }
        public decimal TangTruongDoanhThu { get; set; }

        // ── Thống kê hóa đơn (đọc, tính từ DB) ──────────────────────
        public int HoaDonChuaDong { get; set; }
        public int HoaDonSapDenHan { get; set; }
        public int HoaDonQuaHan { get; set; }

        // ── Thống kê đơn dịch vụ (đọc, tính từ DB) ──────────────────
        public int DonDVChoXuLy { get; set; }
        public int DonDVKhanCap { get; set; }

        // ── Dữ liệu hiển thị ──────────────────────────────────────────
        public List<THONGKE_DOANHTHU_THANG> DanhSachDoanhThuThang { get; set; } = new();

        // ── Bind properties Form 2: THONGKE_DOANHTHU_THANG ───────────
        [BindProperty]
        public DoanhThuThangInputModel DoanhThuThangInput { get; set; } = new();

        // ================================================================
        // INPUT MODELS
        // ================================================================
        public class DoanhThuThangInputModel
        {
            public short Nam { get; set; } = (short)DateTime.Now.Year;
            public byte Thang { get; set; } = (byte)DateTime.Now.Month;
            public decimal TongTienPhong { get; set; }
            public decimal TongTienDien { get; set; }
            public decimal TongTienNuoc { get; set; }
            public decimal TongTienDV { get; set; }
            public decimal TongCong { get; set; }
            public int SoHoaDonDaDong { get; set; }
            public decimal ChiPhiThang { get; set; }
        }

        // ================================================================
        // ON GET — Tải và tính dữ liệu trực tiếp từ DB
        // ================================================================
        public async Task<IActionResult> OnGetAsync()
        {
            // ── Bước 1: Parse idManager theo pattern chuẩn dự án ─────
            var idStr = User.FindFirst("IDUser")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idStr, out int idManager) || idManager == 0)
                return RedirectToPage("/Login");

            // ── Tải thông tin tài khoản hiện tại ─────────────────────
            CurrentUser = await _context.ACCOUNT
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.IDUser == idManager);

            // ── Thông báo chưa đọc ───────────────────────────────────
            SoThongBaoChuaDoc = await _context.THONGBAO
                .Where(t => t.IDUser == idManager && !t.DaDoc)
                .CountAsync();

            // ── Bước 2: Lấy danh sách phòng được phân công ───────────
            var idPhong = await _context.PHONG_MANAGER
                .AsNoTracking()
                .Where(pm => pm.IDManager == idManager && pm.IsActive)
                .Select(pm => pm.IDPhong)
                .ToListAsync();

            // ── Bước 3: Thống kê trạng thái phòng từ bảng PHONG ──────
            var dsPhong = await _context.PHONG
                .AsNoTracking()
                .Where(p => idPhong.Contains(p.IDPhong))
                .Select(p => p.TrangThai)
                .ToListAsync();

            int tongSoPhong = dsPhong.Count;
            int phongDangThue = dsPhong.Count(t => t == "Đang thuê");
            int phongConTrong = dsPhong.Count(t => t == "Trống");
            int phongDangSua = dsPhong.Count(t => t == "Đang sửa");
            decimal tiLeLapDay = tongSoPhong > 0
                ? Math.Round((decimal)phongDangThue / tongSoPhong * 100, 2) : 0;

            // ── Bước 4: Doanh thu tháng này và tháng trước từ HDTHANG ─
            var kyNay = DateTime.Now.ToString("MM/yyyy");
            var kyTruoc = DateTime.Now.AddMonths(-1).ToString("MM/yyyy");

            var dtThangNay = await _context.HDTHANG
                .AsNoTracking()
                .Where(h => idPhong.Contains(h.IDPhong)
                         && h.KyThanhToan == kyNay
                         && h.TrangThai_TT == "Đã hoàn thành")
                .SumAsync(h => (decimal?)h.TongCong) ?? 0;

            var dtThangTruoc = await _context.HDTHANG
                .AsNoTracking()
                .Where(h => idPhong.Contains(h.IDPhong)
                         && h.KyThanhToan == kyTruoc
                         && h.TrangThai_TT == "Đã hoàn thành")
                .SumAsync(h => (decimal?)h.TongCong) ?? 0;

            decimal tangTruong = dtThangTruoc > 0
                ? Math.Round((dtThangNay - dtThangTruoc) / dtThangTruoc * 100, 2) : 0;

            // ── Bước 5: Thống kê hóa đơn tháng này từ HDTHANG ────────
            var hdThangNay = await _context.HDTHANG
                .AsNoTracking()
                .Where(h => idPhong.Contains(h.IDPhong) && h.KyThanhToan == kyNay)
                .Select(h => new { h.TrangThai_TT, h.HanDong })
                .ToListAsync();

            int hdChuaDong = hdThangNay.Count(h => h.TrangThai_TT == "Chưa đóng" || h.TrangThai_TT == "Quá hạn");
            int hdSapDenHan = hdThangNay.Count(h =>
                h.TrangThai_TT != "Đã hoàn thành" &&
                (h.HanDong.Date - DateTime.Today).TotalDays is >= 0 and <= 5);
            int hdQuaHan = hdThangNay.Count(h => h.TrangThai_TT == "Quá hạn");

            // ── Bước 6: Thống kê đơn dịch vụ và sự cố từ DONDV ──────
            var dsDonDV = await _context.DONDV
                .AsNoTracking()
                .Where(d => idPhong.Contains(d.IDPhong)
                         && d.TrangThai_DV != "Đã hủy"
                         && d.TrangThai_DV != "Thành công")
                .Select(d => new { d.TrangThai_DV, d.MucDo, d.LoaiDV })
                .ToListAsync();

            int donDVChoXuLy = dsDonDV.Count(d => d.TrangThai_DV == "Chờ xử lý");
            int donDVKhanCap = dsDonDV.Count(d => d.MucDo == "Khẩn cấp" && d.LoaiDV == "Hư hỏng");

            // Sự cố chờ xử lý — dùng cho badge sidebar (chỉ phòng phân công)
            SoSuCoChoXuLy = dsDonDV.Count(d => d.LoaiDV == "Hư hỏng" && d.TrangThai_DV == "Chờ xử lý");

            // ── Bước 7: Gán thẳng vào các property đọc ───────────────
            TongSoPhong = tongSoPhong;
            PhongDangThue = phongDangThue;
            PhongConTrong = phongConTrong;
            PhongDangSua = phongDangSua;
            TiLeLapDay = tiLeLapDay;
            DoanhThuThangNay = dtThangNay;
            DoanhThuThangTruoc = dtThangTruoc;
            TangTruongDoanhThu = tangTruong;
            HoaDonChuaDong = hdChuaDong;
            HoaDonSapDenHan = hdSapDenHan;
            HoaDonQuaHan = hdQuaHan;
            DonDVChoXuLy = donDVChoXuLy;
            DonDVKhanCap = donDVKhanCap;

            // ── Bước 8: Tải danh sách THONGKE_DOANHTHU_THANG ─────────
            // Bảng này không có cột IDManager nên giữ nguyên query cũ
            DanhSachDoanhThuThang = await _context.THONGKE_DOANHTHU_THANG
                .AsNoTracking()
                .OrderByDescending(t => t.Nam)
                .ThenByDescending(t => t.Thang)
                .Take(24) // Hiển thị 24 tháng gần nhất
                .ToListAsync();

            // ── Bước 9: Tự tính sẵn DoanhThuThangInput từ HDTHANG theo kyNay ─
            DoanhThuThangInput.TongTienPhong = await _context.HDTHANG.AsNoTracking()
                .Where(h => idPhong.Contains(h.IDPhong) && h.KyThanhToan == kyNay)
                .SumAsync(h => (decimal?)h.TongCong) ?? 0;

            DoanhThuThangInput.TongTienDien = await _context.HDTHANG.AsNoTracking()
                .Where(h => idPhong.Contains(h.IDPhong) && h.KyThanhToan == kyNay)
                .SumAsync(h => (decimal?)h.TongCong) ?? 0;

            DoanhThuThangInput.TongTienNuoc = await _context.HDTHANG.AsNoTracking()
                .Where(h => idPhong.Contains(h.IDPhong) && h.KyThanhToan == kyNay)
                .SumAsync(h => (decimal?)h.TongCong) ?? 0;

            DoanhThuThangInput.TongTienDV = await _context.HDTHANG.AsNoTracking()
                .Where(h => idPhong.Contains(h.IDPhong) && h.KyThanhToan == kyNay)
                .SumAsync(h => (decimal?)h.TongCong) ?? 0;

            DoanhThuThangInput.TongCong = await _context.HDTHANG.AsNoTracking()
                .Where(h => idPhong.Contains(h.IDPhong) && h.KyThanhToan == kyNay)
                .SumAsync(h => (decimal?)h.TongCong) ?? 0;

            DoanhThuThangInput.SoHoaDonDaDong = await _context.HDTHANG.AsNoTracking()
                .Where(h => idPhong.Contains(h.IDPhong) && h.KyThanhToan == kyNay
                         && h.TrangThai_TT == "Đã hoàn thành")
                .CountAsync();

            // ChiPhiThang giữ 0 — manager tự nhập
            DoanhThuThangInput.ChiPhiThang = 0;

            // Điền tháng/năm theo tháng hiện tại
            DoanhThuThangInput.Thang = (byte)DateTime.Now.Month;
            DoanhThuThangInput.Nam = (short)DateTime.Now.Year;

            return Page();
        }

        // ================================================================
        // HANDLER — Form 2: Thêm/Cập nhật THONGKE_DOANHTHU_THANG
        // ================================================================
        public async Task<IActionResult> OnPostUpdateDoanhThuAsync()
        {
            // Xác thực người dùng
            var idStr = User.FindFirst("IDUser")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idStr, out int idManager) || idManager == 0)
                return RedirectToPage("/Login");

            // Validate tháng/năm hợp lệ
            if (DoanhThuThangInput.Thang < 1 || DoanhThuThangInput.Thang > 12)
            {
                TempData["ErrorMessage"] = "Tháng không hợp lệ. Vui lòng nhập giá trị từ 1 đến 12.";
                return RedirectToPage();
            }

            if (DoanhThuThangInput.Nam < 2000 || DoanhThuThangInput.Nam > 2100)
            {
                TempData["ErrorMessage"] = "Năm không hợp lệ. Vui lòng nhập năm trong khoảng 2000 – 2100.";
                return RedirectToPage();
            }

            // Bọc transaction để tránh race condition duplicate insert đồng thời
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Kiểm tra bản ghi tháng/năm này đã tồn tại chưa
                var existing = await _context.THONGKE_DOANHTHU_THANG
                    .FirstOrDefaultAsync(t =>
                        t.Nam == DoanhThuThangInput.Nam &&
                        t.Thang == DoanhThuThangInput.Thang);

                if (existing != null)
                {
                    // CẬP NHẬT bản ghi đã tồn tại
                    existing.TongTienPhong = DoanhThuThangInput.TongTienPhong;
                    existing.TongTienDien = DoanhThuThangInput.TongTienDien;
                    existing.TongTienNuoc = DoanhThuThangInput.TongTienNuoc;
                    existing.TongTienDV = DoanhThuThangInput.TongTienDV;
                    existing.TongCong = DoanhThuThangInput.TongCong;
                    existing.SoHoaDonDaDong = DoanhThuThangInput.SoHoaDonDaDong;
                    existing.ChiPhiThang = DoanhThuThangInput.ChiPhiThang;
                    existing.NgayCapNhat = DateTime.Now;

                    TempData["SuccessMessage"] = $"✅ Đã cập nhật dữ liệu tháng {DoanhThuThangInput.Thang}/{DoanhThuThangInput.Nam} thành công!";
                }
                else
                {
                    // THÊM MỚI bản ghi
                    var newRecord = new THONGKE_DOANHTHU_THANG
                    {
                        Nam = DoanhThuThangInput.Nam,
                        Thang = DoanhThuThangInput.Thang,
                        TongTienPhong = DoanhThuThangInput.TongTienPhong,
                        TongTienDien = DoanhThuThangInput.TongTienDien,
                        TongTienNuoc = DoanhThuThangInput.TongTienNuoc,
                        TongTienDV = DoanhThuThangInput.TongTienDV,
                        TongCong = DoanhThuThangInput.TongCong,
                        SoHoaDonDaDong = DoanhThuThangInput.SoHoaDonDaDong,
                        ChiPhiThang = DoanhThuThangInput.ChiPhiThang,
                        NgayCapNhat = DateTime.Now
                    };

                    _context.THONGKE_DOANHTHU_THANG.Add(newRecord);

                    TempData["SuccessMessage"] = $"✅ Đã thêm mới dữ liệu tháng {DoanhThuThangInput.Thang}/{DoanhThuThangInput.Nam} thành công!";
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (DbUpdateException ex)
            {
                await transaction.RollbackAsync();
                // Bắt lỗi vi phạm unique index (Nam + Thang) — ẩn chi tiết schema
                if (ex.InnerException?.Message.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase) == true)
                    TempData["ErrorMessage"] = $"Dữ liệu tháng {DoanhThuThangInput.Thang}/{DoanhThuThangInput.Nam} đã tồn tại. Vui lòng thử lại.";
                else
                    TempData["ErrorMessage"] = "Lỗi cơ sở dữ liệu khi lưu. Vui lòng thử lại.";
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                TempData["ErrorMessage"] = "Lỗi không xác định. Vui lòng thử lại.";
            }

            return RedirectToPage();
        }

        // ================================================================
        // HANDLER — Xóa bản ghi doanh thu theo tháng
        // ================================================================
        public async Task<IActionResult> OnPostDeleteDoanhThuAsync(int id)
        {
            var idStr = User.FindFirst("IDUser")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idStr, out int idManager) || idManager == 0)
                return RedirectToPage("/Login");

            try
            {
                // Lấy bản ghi trước khi xóa — kiểm tra tồn tại server-side
                var record = await _context.THONGKE_DOANHTHU_THANG.FindAsync(id);
                if (record == null)
                {
                    TempData["ErrorMessage"] = "Không tìm thấy bản ghi cần xóa.";
                    return RedirectToPage();
                }

                // Uncomment nếu bảng THONGKE_DOANHTHU_THANG có cột IDManager:
                // if (record.IDManager != idManager) return Forbid();

                _context.THONGKE_DOANHTHU_THANG.Remove(record);
                await _context.SaveChangesAsync();

                TempData["SuccessMessage"] = $"✅ Đã xóa dữ liệu tháng {record.Thang}/{record.Nam} thành công!";
            }
            catch (DbUpdateException)
            {
                TempData["ErrorMessage"] = "Lỗi cơ sở dữ liệu khi xóa. Vui lòng thử lại.";
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Lỗi không xác định. Vui lòng thử lại.";
            }

            return RedirectToPage();
        }
    }
}
