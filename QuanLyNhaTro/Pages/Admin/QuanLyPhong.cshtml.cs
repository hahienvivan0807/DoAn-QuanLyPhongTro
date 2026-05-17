using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Text.Json;

namespace QuanLyNhaTro.Pages.Admin
{
    /// <summary>
    /// PageModel – Trang Quản lý phòng trọ
    /// Hỗ trợ: xem danh sách, thêm, sửa, xóa phòng (PHONG)
    /// </summary>
    public class QuanLyPhongModel : PageModel
    {
        // ── Dependency Injection ──────────────────────────────────────
        private readonly QuanLyKhuNhaTro _db;

        public QuanLyPhongModel(QuanLyKhuNhaTro db)
        {
            _db = db;
        }

        // ================================================================
        // PROPERTIES DÙNG TRONG VIEW
        // ================================================================

        /// <summary>Danh sách tất cả phòng (kèm hợp đồng và tài khoản người thuê)</summary>
        public List<PHONG> DanhSachPhong { get; set; } = new();

        /// <summary>Chuỗi JSON của DanhSachPhong để dùng phía JavaScript client</summary>
        public string DanhSachPhongJson { get; set; } = "[]";

        /// <summary>Tổng số phòng trong hệ thống</summary>
        public int TongSoPhong { get; set; }

        /// <summary>Số phòng đang ở trạng thái "Trống"</summary>
        public int SoPhongTrong { get; set; }

        /// <summary>Số phòng đang ở trạng thái "Đã thuê"</summary>
        public int SoPhongDaThue { get; set; }

        /// <summary>Số phòng đang ở trạng thái "Đang sửa"</summary>
        public int SoPhongDangSua { get; set; }

        /// <summary>Số tầng tối đa (dùng để render dropdown lọc tầng)</summary>
        public int SoTangToiDa { get; set; } = 1;

        /// <summary>Số phòng hiển thị mỗi trang (phân trang)</summary>
        public int SoPhongMotTrang { get; set; } = 20;

        // ================================================================
        // ON GET – TẢI DỮ LIỆU DANH SÁCH PHÒNG
        // ================================================================
        public async Task<IActionResult> OnGetAsync()
        {
            // Tải tất cả phòng, kèm theo hợp đồng đang hiệu lực và tài khoản người thuê
            DanhSachPhong = await _db.PHONG
                .Include(p => p.HopDongs
                    .Where(hd => hd.TrangThaiHD == "Đang hiệu lực"))
                    .ThenInclude(hd => hd.Tenant)
                .OrderBy(p => p.Tang)
                .ThenBy(p => p.SoPhong)
                .ToListAsync();

            // Thống kê
            TongSoPhong = DanhSachPhong.Count;
            SoPhongTrong = DanhSachPhong.Count(p => p.TrangThai == "Trống");
            SoPhongDaThue = DanhSachPhong.Count(p => p.TrangThai == "Đã thuê");
            SoPhongDangSua = DanhSachPhong.Count(p => p.TrangThai == "Đang sửa");
            SoTangToiDa = DanhSachPhong.Any() ? (int)DanhSachPhong.Max(p => p.Tang) : 1;

            // Serialize dữ liệu cho JavaScript (chỉ gửi các trường cần thiết, không serialize navigation property vòng)
            DanhSachPhongJson = JsonSerializer.Serialize(
                DanhSachPhong.Select(p =>
                {
                    // Lấy hợp đồng đang hiệu lực — chỉ khi phòng không Trống
                    var hd = p.TrangThai != "Trống" ? p.HopDongs.FirstOrDefault(h => h.TrangThaiHD == "Đang hiệu lực") : null;
                    return new
                    {
                        idPhong = p.IDPhong,
                        soPhong = p.SoPhong,
                        tang = (int)p.Tang,
                        soLuong = p.soluong,
                        dienTich = p.DienTich,
                        giaPhongFix = p.GiaPhongFix,
                        moTa = p.MoTa,
                        trangThai = p.TrangThai,
                        createdAt = p.CreatedAt.ToString("dd/MM/yyyy"),
                        tenNguoiThue = hd?.Tenant?.FullName,
                        sdtNguoiThue = hd?.Tenant?.Phone
                    };
                }),
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
            );

            return Page();
        }

        // ================================================================
        // HANDLER AJAX: THÊM PHÒNG MỚI
        // POST: ?handler=ThemPhong
        // ================================================================
        public async Task<IActionResult> OnPostThemPhongAsync([FromBody] DtoThemPhong dto)
        {
            // Kiểm tra dữ liệu đầu vào
            if (string.IsNullOrWhiteSpace(dto.SoPhong))
                return new JsonResult(new { success = false, message = "Số phòng không được để trống." });

            if (dto.GiaPhongFix < 0)
                return new JsonResult(new { success = false, message = "Giá phòng không hợp lệ." });

            // Kiểm tra trùng số phòng
            bool daCoPhong = await _db.PHONG.AnyAsync(p => p.SoPhong == dto.SoPhong.Trim());
            if (daCoPhong)
                return new JsonResult(new { success = false, message = $"Số phòng \"{dto.SoPhong}\" đã tồn tại trong hệ thống." });

            // Kiểm tra trạng thái hợp lệ
            var trangThaiHopLe = new[] { "Trống", "Đang sửa" };
            if (!trangThaiHopLe.Contains(dto.TrangThai))
                return new JsonResult(new { success = false, message = "Trạng thái không hợp lệ khi thêm phòng mới." });

            // Tạo entity PHONG mới
            var phongMoi = new PHONG
            {
                SoPhong = dto.SoPhong.Trim(),
                Tang = (byte)Math.Clamp(dto.Tang, 1, 20),
                soluong = Math.Max(0, dto.SoLuong),
                DienTich = dto.DienTich,
                GiaPhongFix = dto.GiaPhongFix,
                MoTa = dto.MoTa?.Trim(),
                TrangThai = dto.TrangThai,
                CreatedAt = DateTime.UtcNow
            };

            _db.PHONG.Add(phongMoi);
            await _db.SaveChangesAsync();

            return new JsonResult(new
            {
                success = true,
                message = $"Thêm phòng {phongMoi.SoPhong} thành công.",
                idPhong = phongMoi.IDPhong
            });
        }

        // ================================================================
        // HANDLER AJAX: SỬA PHÒNG
        // POST: ?handler=SuaPhong
        // ================================================================
        public async Task<IActionResult> OnPostSuaPhongAsync([FromBody] DtoSuaPhong dto)
        {
            if (string.IsNullOrWhiteSpace(dto.SoPhong))
                return new JsonResult(new { success = false, message = "Số phòng không được để trống." });

            if (dto.GiaPhongFix < 0)
                return new JsonResult(new { success = false, message = "Giá phòng không hợp lệ." });

            // Kiểm tra trạng thái hợp lệ
            var trangThaiHopLe = new[] { "Trống", "Đã thuê", "Đang sửa" };
            if (!trangThaiHopLe.Contains(dto.TrangThai))
                return new JsonResult(new { success = false, message = "Trạng thái không hợp lệ." });

            // Tìm phòng cần sửa (kèm hợp đồng + tài khoản người thuê để xử lý logic bên dưới)
            var phong = await _db.PHONG
                .Include(p => p.HopDongs.Where(hd => hd.TrangThaiHD == "Đang hiệu lực"))
                    .ThenInclude(hd => hd.Tenant)
                .FirstOrDefaultAsync(p => p.IDPhong == dto.IDPhong);
            if (phong == null)
                return new JsonResult(new { success = false, message = "Không tìm thấy phòng." });

            // Kiểm tra trùng số phòng (trừ chính phòng đang sửa)
            bool trungSoPhong = await _db.PHONG.AnyAsync(p => p.SoPhong == dto.SoPhong.Trim() && p.IDPhong != dto.IDPhong);
            if (trungSoPhong)
                return new JsonResult(new { success = false, message = $"Số phòng \"{dto.SoPhong}\" đã tồn tại." });

            // ── XỬ LÝ KHI PHÒNG CHUYỂN SANG "TRỐNG" ──────────────────
            // Nếu trạng thái cũ KHÔNG phải "Trống" mà trạng thái mới là "Trống"
            // → kết thúc hợp đồng + vô hiệu hóa tài khoản người thuê
            if (phong.TrangThai != "Trống" && dto.TrangThai == "Trống")
            {
                foreach (var hd in phong.HopDongs.Where(hd => hd.TrangThaiHD == "Đang hiệu lực"))
                {
                    // Cập nhật trạng thái hợp đồng → Đã kết thúc
                    hd.TrangThaiHD = "Đã kết thúc";
                    hd.NgayKetThuc = DateTime.UtcNow.Date;

                    // Vô hiệu hóa tài khoản người thuê
                    if (hd.Tenant != null)
                        hd.Tenant.IsActive = false;
                }
            }

            // Cập nhật các trường theo model PHONG
            phong.SoPhong = dto.SoPhong.Trim();
            phong.Tang = (byte)Math.Clamp(dto.Tang, 1, 20);
            phong.soluong = Math.Max(0, dto.SoLuong);
            phong.DienTich = dto.DienTich;
            phong.GiaPhongFix = dto.GiaPhongFix;
            phong.MoTa = dto.MoTa?.Trim();
            phong.TrangThai = dto.TrangThai;

            await _db.SaveChangesAsync();

            return new JsonResult(new { success = true, message = $"Cập nhật phòng {phong.SoPhong} thành công." });
        }

        // ================================================================
        // HANDLER AJAX: XÓA PHÒNG
        // POST: ?handler=XoaPhong
        // ================================================================
        public async Task<IActionResult> OnPostXoaPhongAsync([FromBody] DtoXoaPhong dto)
        {
            // Tải phòng kèm hợp đồng để kiểm tra ràng buộc
            var phong = await _db.PHONG
                .Include(p => p.HopDongs)
                .FirstOrDefaultAsync(p => p.IDPhong == dto.IDPhong);

            if (phong == null)
                return new JsonResult(new { success = false, message = "Không tìm thấy phòng." });

            // Không cho xóa phòng đang có hợp đồng hiệu lực
            bool dangCoNguoiThue = phong.HopDongs.Any(hd => hd.TrangThaiHD == "Đang hiệu lực");
            if (dangCoNguoiThue)
                return new JsonResult(new { success = false, message = "Không thể xóa phòng đang có người thuê." });

            // Không cho xóa phòng "Đã thuê" (phòng hợp) 
            if (phong.TrangThai == "Đã thuê")
                return new JsonResult(new { success = false, message = "Không thể xóa phòng đang ở trạng thái \"Đã thuê\"." });

            _db.PHONG.Remove(phong);
            await _db.SaveChangesAsync();

            return new JsonResult(new { success = true, message = $"Đã xóa phòng {phong.SoPhong} thành công." });
        }

        // ================================================================
        // DTO – Data Transfer Object cho các handler AJAX
        // (Khai báo nội bộ để tiện dùng, không cần file riêng)
        // ================================================================

        /// <summary>DTO nhận dữ liệu khi thêm phòng mới</summary>
        public class DtoThemPhong
        {
            public string SoPhong { get; set; } = null!;
            public int Tang { get; set; } = 1;
            public int SoLuong { get; set; } = 1;
            public decimal? DienTich { get; set; }
            public decimal GiaPhongFix { get; set; }
            public string TrangThai { get; set; } = "Trống";
            public string? MoTa { get; set; }
        }

        /// <summary>DTO nhận dữ liệu khi cập nhật phòng</summary>
        public class DtoSuaPhong
        {
            public int IDPhong { get; set; }
            public string SoPhong { get; set; } = null!;
            public int Tang { get; set; } = 1;
            public int SoLuong { get; set; } = 1;
            public decimal? DienTich { get; set; }
            public decimal GiaPhongFix { get; set; }
            public string TrangThai { get; set; } = "Trống";
            public string? MoTa { get; set; }
        }

        /// <summary>DTO nhận ID phòng khi xóa</summary>
        public class DtoXoaPhong
        {
            public int IDPhong { get; set; }
        }
    }
}
