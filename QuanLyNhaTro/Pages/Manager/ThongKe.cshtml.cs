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

        // ── Dữ liệu hiển thị ──────────────────────────────────────────
        public THONGKE_TONG? ThongKeTong { get; set; }
        public List<THONGKE_DOANHTHU_THANG> DanhSachDoanhThuThang { get; set; } = new();

        // ── Bind properties Form 1: THONGKE_TONG ──────────────────────
        [BindProperty]
        public TongInputModel TongInput { get; set; } = new();

        // ── Bind properties Form 2: THONGKE_DOANHTHU_THANG ───────────
        [BindProperty]
        public DoanhThuThangInputModel DoanhThuThangInput { get; set; } = new();

        // ================================================================
        // INPUT MODELS
        // ================================================================
        public class TongInputModel
        {
            public int TongSoPhong { get; set; }
            public int PhongDangThue { get; set; }
            public int PhongConTrong { get; set; }
            public int PhongDangSua { get; set; }
            public decimal TiLeLapDay { get; set; }
            public decimal DoanhThuThangNay { get; set; }
            public decimal DoanhThuThangTruoc { get; set; }
            public decimal TangTruongDoanhThu { get; set; }
            public int HoaDonChuaDong { get; set; }
            public int HoaDonSapDenHan { get; set; }
            public int HoaDonQuaHan { get; set; }
            public int DonDVChoXuLy { get; set; }
            public int DonDVKhanCap { get; set; }
        }

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
        // ON GET — Tải dữ liệu mặc định
        // ================================================================
        public async Task<IActionResult> OnGetAsync()
        {
            // ── Xác thực ─────────────────────────────────────────────
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out int idUser))
                return RedirectToPage("/Login");

            CurrentUser = await _context.ACCOUNT
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.IDUser == idUser);

            // ── Thông báo chưa đọc ───────────────────────────────────
            SoThongBaoChuaDoc = await _context.THONGBAO
                .Where(t => t.IDUser == idUser && !t.DaDoc)
                .CountAsync();

            // ── Sự cố chờ xử lý (sidebar badge) ──────────────────────
            SoSuCoChoXuLy = await _context.DONDV
                .Where(d => d.LoaiDV == "Hư hỏng" && d.TrangThai_DV == "Chờ xử lý")
                .CountAsync();

            // ── Tải THONGKE_TONG (ID = 1) ────────────────────────────
            ThongKeTong = await _context.THONGKE_TONG
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.ID == 1);

            // Nếu record chưa tồn tại, khởi tạo đối tượng rỗng để hiển thị form
            if (ThongKeTong == null)
                ThongKeTong = new THONGKE_TONG { ID = 1 };

            // Điền sẵn giá trị vào input model Form 1
            TongInput = new TongInputModel
            {
                TongSoPhong = ThongKeTong.TongSoPhong,
                PhongDangThue = ThongKeTong.PhongDangThue,
                PhongConTrong = ThongKeTong.PhongConTrong,
                PhongDangSua = ThongKeTong.PhongDangSua,
                TiLeLapDay = ThongKeTong.TiLeLapDay,
                DoanhThuThangNay = ThongKeTong.DoanhThuThangNay,
                DoanhThuThangTruoc = ThongKeTong.DoanhThuThangTruoc,
                TangTruongDoanhThu = ThongKeTong.TangTruongDoanhThu,
                HoaDonChuaDong = ThongKeTong.HoaDonChuaDong,
                HoaDonSapDenHan = ThongKeTong.HoaDonSapDenHan,
                HoaDonQuaHan = ThongKeTong.HoaDonQuaHan,
                DonDVChoXuLy = ThongKeTong.DonDVChoXuLy,
                DonDVKhanCap = ThongKeTong.DonDVKhanCap
            };

            // ── Tải danh sách THONGKE_DOANHTHU_THANG ─────────────────
            DanhSachDoanhThuThang = await _context.THONGKE_DOANHTHU_THANG
                .AsNoTracking()
                .OrderByDescending(t => t.Nam)
                .ThenByDescending(t => t.Thang)
                .Take(24) // Hiển thị 24 tháng gần nhất
                .ToListAsync();

            return Page();
        }

        // ================================================================
        // HANDLER — Form 1: Cập nhật THONGKE_TONG
        // ================================================================
        public async Task<IActionResult> OnPostUpdateTongAsync()
        {
            // Xác thực người dùng
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out _))
                return RedirectToPage("/Login");

            // Validate model state cho TongInput
            if (!ModelState.IsValid)
            {
                TempData["ErrorMessage"] = "Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại.";
                return RedirectToPage();
            }

            try
            {
                var record = await _context.THONGKE_TONG.FindAsync(1);

                if (record == null)
                {
                    // Tạo mới nếu chưa có (trường hợp seed chưa chạy)
                    record = new THONGKE_TONG { ID = 1 };
                    _context.THONGKE_TONG.Add(record);
                }

                // Cập nhật từng trường từ input
                record.TongSoPhong = TongInput.TongSoPhong;
                record.PhongDangThue = TongInput.PhongDangThue;
                record.PhongConTrong = TongInput.PhongConTrong;
                record.PhongDangSua = TongInput.PhongDangSua;
                record.TiLeLapDay = TongInput.TiLeLapDay;
                record.DoanhThuThangNay = TongInput.DoanhThuThangNay;
                record.DoanhThuThangTruoc = TongInput.DoanhThuThangTruoc;
                record.TangTruongDoanhThu = TongInput.TangTruongDoanhThu;
                record.HoaDonChuaDong = TongInput.HoaDonChuaDong;
                record.HoaDonSapDenHan = TongInput.HoaDonSapDenHan;
                record.HoaDonQuaHan = TongInput.HoaDonQuaHan;
                record.DonDVChoXuLy = TongInput.DonDVChoXuLy;
                record.DonDVKhanCap = TongInput.DonDVKhanCap;
                record.NgayCapNhat = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                TempData["SuccessMessage"] = "✅ Cập nhật thống kê tổng quan thành công!";
            }
            catch (DbUpdateConcurrencyException ex)
            {
                TempData["ErrorMessage"] = $"Lỗi xung đột dữ liệu khi lưu: {ex.Message}";
            }
            catch (DbUpdateException ex)
            {
                TempData["ErrorMessage"] = $"Lỗi cơ sở dữ liệu: {ex.InnerException?.Message ?? ex.Message}";
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Lỗi không xác định: {ex.Message}";
            }

            return RedirectToPage();
        }

        // ================================================================
        // HANDLER — Form 2: Thêm/Cập nhật THONGKE_DOANHTHU_THANG
        // ================================================================
        public async Task<IActionResult> OnPostUpdateDoanhThuAsync()
        {
            // Xác thực người dùng
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out _))
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
                    existing.NgayCapNhat = DateTime.UtcNow;

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
                        NgayCapNhat = DateTime.UtcNow
                    };

                    _context.THONGKE_DOANHTHU_THANG.Add(newRecord);

                    TempData["SuccessMessage"] = $"✅ Đã thêm mới dữ liệu tháng {DoanhThuThangInput.Thang}/{DoanhThuThangInput.Nam} thành công!";
                }

                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                TempData["ErrorMessage"] = $"Lỗi xung đột dữ liệu: {ex.Message}";
            }
            catch (DbUpdateException ex)
            {
                // Bắt lỗi vi phạm unique index (Nam + Thang)
                if (ex.InnerException?.Message.Contains("UNIQUE") == true ||
                    ex.InnerException?.Message.Contains("unique") == true)
                {
                    TempData["ErrorMessage"] = $"Dữ liệu tháng {DoanhThuThangInput.Thang}/{DoanhThuThangInput.Nam} đã tồn tại và có xung đột. Vui lòng thử lại.";
                }
                else
                {
                    TempData["ErrorMessage"] = $"Lỗi cơ sở dữ liệu: {ex.InnerException?.Message ?? ex.Message}";
                }
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Lỗi không xác định: {ex.Message}";
            }

            return RedirectToPage();
        }

        // ================================================================
        // HANDLER — Xóa bản ghi doanh thu theo tháng
        // ================================================================
        public async Task<IActionResult> OnPostDeleteDoanhThuAsync(int id)
        {
            var idUserStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idUserStr, out _))
                return RedirectToPage("/Login");

            try
            {
                var record = await _context.THONGKE_DOANHTHU_THANG.FindAsync(id);
                if (record == null)
                {
                    TempData["ErrorMessage"] = "Không tìm thấy bản ghi cần xóa.";
                    return RedirectToPage();
                }

                _context.THONGKE_DOANHTHU_THANG.Remove(record);
                await _context.SaveChangesAsync();

                TempData["SuccessMessage"] = $"✅ Đã xóa dữ liệu tháng {record.Thang}/{record.Nam} thành công!";
            }
            catch (DbUpdateException ex)
            {
                TempData["ErrorMessage"] = $"Lỗi khi xóa: {ex.InnerException?.Message ?? ex.Message}";
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Lỗi không xác định: {ex.Message}";
            }

            return RedirectToPage();
        }
    }
}