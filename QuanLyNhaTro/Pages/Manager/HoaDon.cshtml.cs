using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Text.Json;

namespace QuanLyNhaTro.Pages.Manager
{
    // ================================================================
    // VIEW MODEL – HÓA ĐƠN DỊCH VỤ (DONDV)
    // ================================================================
    public class HoaDonDichVuViewModel
    {
        public int Id { get; set; }
        public string SoPhong { get; set; } = "";
        public string TenNguoiThue { get; set; } = "";
        /// <summary>"qua-han" | "sap-den" | "cho-xac-nhan" | "hoan-thanh"</summary>
        public string TrangThai { get; set; } = "";
        public string LoaiDV { get; set; } = "";
        public string HanNop { get; set; } = "";
        public string? NgayNop { get; set; }
        public decimal TongTien { get; set; }
        public string SoDienThoai { get; set; } = "";
        public string? AnhBienLai { get; set; }
        public string? GhiChu { get; set; }
        /// <summary>true = khách đã gửi ảnh biên lai, đang chờ quản lý xác nhận</summary>
        public bool CoAnhChoXacNhan { get; set; }
    }

    // ================================================================
    // VIEW MODEL – HÓA ĐƠN CUỐI THÁNG (HDTHANG)
    // ================================================================
    public class HoaDonThangViewModel
    {
        public int Id { get; set; }
        public string SoPhong { get; set; } = "";
        public string TenNguoiThue { get; set; } = "";
        public string TrangThai { get; set; } = "";
        public string KyThanhToan { get; set; } = "";
        public string HanNop { get; set; } = "";
        public string? NgayNop { get; set; }
        public decimal TienPhong { get; set; }
        public decimal TienDien { get; set; }
        public decimal TienNuoc { get; set; }
        public decimal TienDichVu { get; set; }
        public string SoDienThoai { get; set; } = "";
        public string? GhiChu { get; set; }
        public string? AnhChuyenKhoan { get; set; }
        /// <summary>true = khách đã gửi ảnh CK, đang chờ quản lý xác nhận</summary>
        public bool CoAnhChoXacNhan { get; set; }
    }

    // ================================================================
    // PAGE MODEL
    // ================================================================
    public class HoaDonModel : PageModel
    {
        private readonly QuanLyKhuNhaTro _db;

        public HoaDonModel(QuanLyKhuNhaTro db) => _db = db;

        public List<HoaDonThangViewModel> DanhSachHoaDon { get; set; } = new();
        public string DanhSachHoaDonJson { get; set; } = "[]";

        public List<HoaDonDichVuViewModel> DanhSachDonDVChoXacNhan { get; set; } = new();
        public string DanhSachDonDVChoXacNhanJson { get; set; } = "[]";

        public int TongHoaDon => DanhSachHoaDon.Count;
        public int SoQuaHan => DanhSachHoaDon.Count(h => h.TrangThai == "qua-han");
        public int SoSapDen => DanhSachHoaDon.Count(h => h.TrangThai == "sap-den");
        public int SoChoXacNhan => DanhSachHoaDon.Count(h => h.TrangThai == "cho-xac-nhan")
                                 + DanhSachDonDVChoXacNhan.Count;
        public int SoHoanThanh => DanhSachHoaDon.Count(h => h.TrangThai == "hoan-thanh");

        public string TenManager { get; set; } = "Admin";
        public string ChucVuManager { get; set; } = "Quản trị viên";

        [BindProperty(SupportsGet = true)]
        public string KyXem { get; set; } = DateTime.Now.ToString("MM/yyyy");

        public async Task OnGetAsync()
        {
            var idStr = User.FindFirst("IDUser")?.Value
                     ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            int.TryParse(idStr, out int idManager);

            if (idManager > 0)
            {
                var acc = await _db.ACCOUNT
                    .Where(a => a.IDUser == idManager && a.IsActive)
                    .Select(a => new { a.FullName, a.Roles })
                    .FirstOrDefaultAsync();

                if (acc != null)
                {
                    TenManager = acc.FullName;
                    ChucVuManager = acc.Roles switch
                    {
                        "Admin" => "Quản trị viên",
                        "Manager" => "Quản lý",
                        _ => acc.Roles
                    };
                }
            }

            // Data isolation: chỉ lấy phòng được phân công cho Manager này
            var idPhongDuocPhanCong = await _db.PHONG_MANAGER
                .AsNoTracking()
                .Where(pm => pm.IDManager == idManager && pm.IsActive)
                .Select(pm => pm.IDPhong)
                .ToListAsync();

            if (!idPhongDuocPhanCong.Any())
            {
                DanhSachHoaDon = new List<HoaDonThangViewModel>();
                DanhSachDonDVChoXacNhan = new List<HoaDonDichVuViewModel>();
                DanhSachHoaDonJson = "[]";
                DanhSachDonDVChoXacNhanJson = "[]";
                return;
            }

            // ── Truy vấn HDTHANG theo kỳ ─────────────────────────────────────────
            // LỖI 1 ĐÃ SỬA: HDTHANG không có navigation HopDongs nên KHÔNG thể
            // ThenInclude(p => p.HopDongs).ThenInclude(hd => hd.Tenant).
            // Giải pháp: lấy HDTHANG trước, sau đó JOIN với HOPDONG để lấy tenant.
            var dsHDThang = await _db.HDTHANG
                .AsNoTracking()
                .Where(h => h.KyThanhToan == KyXem
                         && idPhongDuocPhanCong.Contains(h.IDPhong))
                .Include(h => h.Phong)
                .ToListAsync();

            // Lấy tất cả IDPhong từ kết quả để query HOPDONG một lần (tránh N+1)
            var idPhongCanLay = dsHDThang.Select(h => h.IDPhong).Distinct().ToList();

            // LỖI 1 ĐÃ SỬA: Lấy hợp đồng đang hiệu lực + tenant (ACCOUNT) theo phòng
            // HOPDONG.Tenant là navigation FK đến ACCOUNT (IDUser), ACCOUNT có Phone + FullName
            var dsHopDong = await _db.HOPDONG
                .AsNoTracking()
                .Where(hd => idPhongCanLay.Contains(hd.IDPhong)
                          && hd.TrangThaiHD == "Đang hiệu lực")
                .Include(hd => hd.Tenant)  // Tenant = ACCOUNT (có FullName, Phone)
                .ToListAsync();

            // Tạo lookup: IDPhong → HopDong (lấy hợp đồng đầu tiên nếu có nhiều)
            var hopDongTheoPhong = dsHopDong
                .GroupBy(hd => hd.IDPhong)
                .ToDictionary(g => g.Key, g => g.First());

            DanhSachHoaDon = dsHDThang.Select(h =>
            {
                hopDongTheoPhong.TryGetValue(h.IDPhong, out var hopDong);
                var tenant = hopDong?.Tenant; // ACCOUNT

                // ── Map trạng thái ────────────────────────────────────────────────
                // "Chờ duyệt"     → cho-xac-nhan (khách đã gửi ảnh CK, chờ quản lý)
                // "Đã hoàn thành" → hoan-thanh
                // "Quá hạn"       → qua-han
                // Còn lại ("Chưa đóng", null...) → xét theo ngày hạn
                var trangThai = h.TrangThai_TT switch
                {
                    "Quá hạn"       => "qua-han",
                    "Chờ duyệt"     => "cho-xac-nhan",
                    "Đã hoàn thành" => "hoan-thanh",
                    _               => IsSapDen(h.HanDong) ? "sap-den" : "qua-han"
                };

                // TienDV + TienNoDV đều nullable trong model
                var noDV = (h.TienDV ?? 0) + (h.TienNoDV ?? 0);

                return new HoaDonThangViewModel
                {
                    Id              = h.IDHDThang,
                    SoPhong         = h.Phong.SoPhong,
                    TenNguoiThue    = tenant?.FullName ?? "—",
                    TrangThai       = trangThai,
                    KyThanhToan     = $"Tháng {h.KyThanhToan}",
                    HanNop          = h.HanDong.ToString("dd/MM/yyyy"),
                    NgayNop         = h.NgayDuyet?.ToString("dd/MM/yyyy HH:mm"),
                    TienPhong       = h.TienPhong ?? 0,
                    TienDien        = h.TienDienSum ?? 0,
                    TienNuoc        = h.TienNuocSum ?? 0,
                    TienDichVu      = noDV,
                    // ACCOUNT.Phone là string (không nullable) theo model
                    SoDienThoai     = tenant?.Phone ?? "",
                    GhiChu          = h.GhiChuDuyet,
                    AnhChuyenKhoan  = h.AnhChuyenKhoan,
                    // Hiện nút Duyệt khi: đang chờ xác nhận VÀ có ảnh CK
                    CoAnhChoXacNhan = trangThai == "cho-xac-nhan"
                                      && !string.IsNullOrEmpty(h.AnhChuyenKhoan),
                };
            }).ToList();

            DanhSachHoaDonJson = JsonSerializer.Serialize(DanhSachHoaDon, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            // ── Lấy DONDV chờ xác nhận ảnh biên lai ─────────────────────────────
            // Lọc đơn ở trạng thái "Chờ duyệt" hoặc "Chờ thanh toán" mà đã có ảnh biên lai.
            // DONDV.Tenant → ACCOUNT (IDUser FK), ACCOUNT.Phone + FullName đều tồn tại.
            var donDVChoXacNhan = await _db.DONDV
                .AsNoTracking()
                .Where(d => (d.TrangThai_DV == "Chờ duyệt" || d.TrangThai_DV == "Chờ thanh toán")
                         && d.AnhBienLai != null
                         && idPhongDuocPhanCong.Contains(d.IDPhong))
                .Include(d => d.Phong)
                .Include(d => d.Tenant)  // Tenant = ACCOUNT
                .ToListAsync();

            DanhSachDonDVChoXacNhan = donDVChoXacNhan.Select(d => new HoaDonDichVuViewModel
            {
                Id              = d.IDDonDV,
                SoPhong         = d.Phong.SoPhong,
                TenNguoiThue    = d.Tenant?.FullName ?? "—",
                TrangThai       = "cho-xac-nhan",
                LoaiDV          = d.LoaiDV,
                HanNop          = d.NgayHetHan?.ToString("dd/MM/yyyy") ?? "—",
                // UpdatedAt là DateTime (không nullable) theo model DONDV
                NgayNop         = d.UpdatedAt.ToString("dd/MM/yyyy HH:mm"),
                TongTien        = d.TongTien,
                // ACCOUNT.Phone là string (không nullable)
                SoDienThoai     = d.Tenant?.Phone ?? "",
                AnhBienLai      = d.AnhBienLai,
                GhiChu          = d.GhiChuXuLy,
                // Query đã lọc AnhBienLai != null nên luôn true ở đây
                CoAnhChoXacNhan = !string.IsNullOrEmpty(d.AnhBienLai),
            }).ToList();

            DanhSachDonDVChoXacNhanJson = JsonSerializer.Serialize(DanhSachDonDVChoXacNhan, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
        }

        // ================================================================
        // POST: XÁC NHẬN THANH TOÁN HDTHANG (?handler=XacNhan)
        // ================================================================
        public async Task<IActionResult> OnPostXacNhanAsync([FromBody] IdRequest req)
        {
            int idManager = LayIdManager();
            if (!await CoQuyenHDThangAsync(req.Id, idManager))
                return new JsonResult(new { message = "Không có quyền thao tác hóa đơn này." }) { StatusCode = 403 };

            var hd = await _db.HDTHANG.FindAsync(req.Id);
            if (hd == null) return NotFound();

            if (hd.TrangThai_TT == "Đã hoàn thành")
                return BadRequest(new { message = "Hóa đơn đã được thanh toán trước đó." });

            if (hd.TrangThai_TT != "Chờ duyệt")
                return BadRequest(new { message = "Hóa đơn không ở trạng thái chờ xác nhận." });

            hd.TrangThai_TT   = "Đã hoàn thành";
            hd.NgayDuyet      = DateTime.Now;
            // IDManagerDuyet là int? theo model HDTHANG
            hd.IDManagerDuyet = idManager > 0 ? idManager : null;
            hd.UpdatedAt      = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // POST: TỪ CHỐI THANH TOÁN HDTHANG (?handler=TuChoi)
        // ================================================================
        public async Task<IActionResult> OnPostTuChoiAsync([FromBody] IdRequest req)
        {
            int idManager = LayIdManager();
            if (!await CoQuyenHDThangAsync(req.Id, idManager))
                return new JsonResult(new { message = "Không có quyền thao tác hóa đơn này." }) { StatusCode = 403 };

            var hd = await _db.HDTHANG.FindAsync(req.Id);
            if (hd == null) return NotFound();

            if (hd.TrangThai_TT != "Chờ duyệt")
                return BadRequest(new { message = "Hóa đơn không ở trạng thái chờ xác nhận." });

            // Reset: xóa ảnh, trả về "Quá hạn" để khách gửi lại
            hd.TrangThai_TT  = "Quá hạn";
            hd.AnhChuyenKhoan = null;
            hd.NgayDuyet     = null;
            hd.UpdatedAt     = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // POST: GHI THU TIỀN MẶT HDTHANG (?handler=ThuTienMat)
        // ================================================================
        public async Task<IActionResult> OnPostThuTienMatAsync([FromBody] IdRequest req)
        {
            int idManager = LayIdManager();
            if (!await CoQuyenHDThangAsync(req.Id, idManager))
                return new JsonResult(new { message = "Không có quyền thao tác hóa đơn này." }) { StatusCode = 403 };

            var hd = await _db.HDTHANG.FindAsync(req.Id);
            if (hd == null) return NotFound();

            if (hd.TrangThai_TT == "Đã hoàn thành")
                return BadRequest(new { message = "Hóa đơn đã được thanh toán." });

            hd.TrangThai_TT   = "Đã hoàn thành";
            hd.NgayDuyet      = DateTime.Now;
            hd.IDManagerDuyet = idManager > 0 ? idManager : null;
            hd.GhiChuDuyet    = "Thu tiền mặt";
            hd.UpdatedAt      = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // POST: XÁC NHẬN THANH TOÁN DONDV (?handler=XacNhanDichVu)
        // ================================================================
        public async Task<IActionResult> OnPostXacNhanDichVuAsync([FromBody] IdRequest req)
        {
            int idManager = LayIdManager();
            if (!await CoQuyenDonDVAsync(req.Id, idManager))
                return new JsonResult(new { message = "Không có quyền thao tác đơn dịch vụ này." }) { StatusCode = 403 };

            var don = await _db.DONDV.FindAsync(req.Id);
            if (don == null) return NotFound();

            if (don.TrangThai_DV == "Thành công")
                return BadRequest(new { message = "Đơn dịch vụ đã được xác nhận trước đó." });

            // Chấp nhận cả "Chờ duyệt" (Giặt sấy) lẫn "Chờ thanh toán" (Nước bình đã gửi ảnh)
            if (don.TrangThai_DV != "Chờ duyệt" && don.TrangThai_DV != "Chờ thanh toán")
                return BadRequest(new { message = "Đơn dịch vụ không ở trạng thái chờ xác nhận." });

            don.TrangThai_DV  = "Thành công";
            // IDManagerXuLy là int? theo model DONDV
            don.IDManagerXuLy = idManager > 0 ? idManager : don.IDManagerXuLy;
            // LỖI 3 ĐÃ SỬA: Xác nhận thanh toán → set NgayHoanThanh (không phải NgayXuLy)
            // NgayXuLy = thời điểm xử lý đơn (giao hàng/nhập giá)
            // NgayHoanThanh = thời điểm thanh toán hoàn tất
            don.NgayHoanThanh = DateTime.Now;
            don.UpdatedAt     = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // POST: TỪ CHỐI THANH TOÁN DONDV (?handler=TuChoiDichVu)
        // ================================================================
        public async Task<IActionResult> OnPostTuChoiDichVuAsync([FromBody] IdRequest req)
        {
            int idManager = LayIdManager();
            if (!await CoQuyenDonDVAsync(req.Id, idManager))
                return new JsonResult(new { message = "Không có quyền thao tác đơn dịch vụ này." }) { StatusCode = 403 };

            var don = await _db.DONDV.FindAsync(req.Id);
            if (don == null) return NotFound();

            if (don.TrangThai_DV != "Chờ duyệt" && don.TrangThai_DV != "Chờ thanh toán")
                return BadRequest(new { message = "Đơn dịch vụ không ở trạng thái chờ xác nhận." });

            // Reset: xóa ảnh biên lai, giữ "Chờ thanh toán" để khách gửi lại
            don.TrangThai_DV = "Chờ thanh toán";
            don.AnhBienLai   = null;
            don.UpdatedAt    = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // GET: DANH SÁCH ĐƠN DỊCH VỤ THEO KỲ (?handler=DanhSachDV&ky=MM/yyyy)
        // ================================================================
        public async Task<IActionResult> OnGetDanhSachDVAsync(string ky)
        {
            int idManager = LayIdManager();
            if (idManager == 0) return Unauthorized();

            var idPhong = await _db.PHONG_MANAGER
                .AsNoTracking()
                .Where(pm => pm.IDManager == idManager && pm.IsActive)
                .Select(pm => pm.IDPhong)
                .ToListAsync();

            if (!idPhong.Any())
                return new JsonResult(new List<HoaDonDichVuViewModel>());

            // Parse kỳ xem "MM/yyyy"
            var kyXem  = string.IsNullOrEmpty(ky) ? DateTime.Now.ToString("MM/yyyy") : ky;
            var parts  = kyXem.Split('/');
            int thang  = int.Parse(parts[0]);
            int nam    = int.Parse(parts[1]);

            // LỖI 4 ĐÃ SỬA: Không dùng .Select() phức tạp trực tiếp trên IQueryable khi
            // có điều kiện client-side (CoAnhChoXacNhan, string.IsNullOrEmpty).
            // → ToListAsync() trước để load về bộ nhớ, sau đó mới .Select() bằng LINQ-to-Objects.
            var rawDons = await _db.DONDV
                .AsNoTracking()
                .Include(d => d.Phong)
                .Include(d => d.Tenant)  // Tenant = ACCOUNT
                .Where(d => idPhong.Contains(d.IDPhong)
                         && d.NgayTao.Month == thang
                         && d.NgayTao.Year  == nam)
                .OrderByDescending(d => d.NgayTao)
                .ToListAsync();

            var dons = rawDons.Select(d => new HoaDonDichVuViewModel
            {
                Id           = d.IDDonDV,
                SoPhong      = d.Phong.SoPhong,
                TenNguoiThue = d.Tenant?.FullName ?? "—",
                // Map trạng thái DB → trạng thái UI
                TrangThai    = d.TrangThai_DV switch
                {
                    "Thành công"    => "hoan-thanh",
                    "Đã hoàn thành" => "hoan-thanh",
                    "Đã hủy"        => "hoan-thanh",
                    "Từ chối"       => "hoan-thanh",
                    "Chờ duyệt"     => "cho-xac-nhan",
                    // "Chờ thanh toán" + có ảnh → đã gửi biên lai, chờ duyệt
                    // "Chờ thanh toán" + chưa có ảnh → chờ khách gửi
                    "Chờ thanh toán" when !string.IsNullOrEmpty(d.AnhBienLai) => "cho-xac-nhan",
                    _ => d.NgayHetHan.HasValue && d.NgayHetHan < DateTime.Today
                             ? "qua-han"
                             : d.NgayHetHan.HasValue
                               && (d.NgayHetHan.Value - DateTime.Today).TotalDays <= 5
                                   ? "sap-den"
                                   : "qua-han"
                },
                LoaiDV          = d.LoaiDV,
                HanNop          = d.NgayHetHan?.ToString("dd/MM/yyyy") ?? "—",
                // NgayHoanThanh nullable theo model DONDV
                NgayNop         = d.NgayHoanThanh?.ToString("dd/MM/yyyy HH:mm"),
                TongTien        = d.TongTien,
                SoDienThoai     = d.Tenant?.Phone ?? "",
                AnhBienLai      = d.AnhBienLai,
                GhiChu          = d.GhiChuXuLy,
                // CoAnhChoXacNhan: true khi đơn đang chờ duyệt VÀ có ảnh biên lai
                CoAnhChoXacNhan = (d.TrangThai_DV == "Chờ duyệt"
                                   || d.TrangThai_DV == "Chờ thanh toán")
                                  && !string.IsNullOrEmpty(d.AnhBienLai),
            }).ToList();

            return new JsonResult(dons, new System.Text.Json.JsonSerializerOptions
            {
                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
            });
        }

        // ================================================================
        // POST: NHẮC NHỞ THANH TOÁN (?handler=NhacNho)
        // ================================================================
        public async Task<IActionResult> OnPostNhacNhoAsync([FromBody] NhacNhoRequest req)
        {
            int idManager = LayIdManager();
            if (idManager == 0) return Unauthorized();

            int idUser    = 0;
            string soPhong = "?";
            decimal soTien = 0;

            if (req.Loai == "month")
            {
                if (!await CoQuyenHDThangAsync(req.Id, idManager))
                    return new JsonResult(new { message = "Không có quyền." }) { StatusCode = 403 };

                var hd = await _db.HDTHANG
                    .AsNoTracking()
                    .Include(h => h.Phong)
                    .FirstOrDefaultAsync(h => h.IDHDThang == req.Id);
                if (hd == null) return NotFound();

                // Lấy tenant qua HOPDONG đang hiệu lực của phòng
                // HOPDONG.IDUser là FK → ACCOUNT (Tenant)
                var hopDong = await _db.HOPDONG
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.IDPhong == hd.IDPhong
                                           && x.TrangThaiHD == "Đang hiệu lực");

                idUser  = hopDong?.IDUser ?? 0;
                soPhong = hd.Phong?.SoPhong ?? "?";
                soTien  = (hd.TienPhong   ?? 0)
                        + (hd.TienDienSum ?? 0)
                        + (hd.TienNuocSum ?? 0)
                        + (hd.TienDV      ?? 0)
                        + (hd.TienNoDV    ?? 0);
            }
            else if (req.Loai == "dv")
            {
                if (!await CoQuyenDonDVAsync(req.Id, idManager))
                    return new JsonResult(new { message = "Không có quyền." }) { StatusCode = 403 };

                var don = await _db.DONDV
                    .AsNoTracking()
                    .Include(d => d.Phong)
                    .FirstOrDefaultAsync(d => d.IDDonDV == req.Id);
                if (don == null) return NotFound();

                // DONDV.IDUser là FK → ACCOUNT (Tenant)
                idUser  = don.IDUser;
                soPhong = don.Phong?.SoPhong ?? "?";
                soTien  = don.TongTien;
            }
            else
            {
                return BadRequest(new { message = "Loại không hợp lệ." });
            }

            if (idUser == 0)
                return BadRequest(new { message = "Không tìm thấy thông tin tenant." });

            // Chống spam: không nhắc quá 1 lần trong 6 giờ cùng nguồn
            var gioiHan  = DateTime.Now.AddHours(-6);
            // LoaiNguon phải khớp CHECK constraint DB: 'DonDV'|'HoaDon'|'DiemNuoc'|'HeThong'
            var loaiNguon = req.Loai == "month" ? "HoaDon" : "DonDV";

            bool daCoNhac = await _db.THONGBAO
                .AnyAsync(t => t.IDUser    == idUser
                            && t.IDNguonTB == req.Id
                            && t.LoaiNguon == loaiNguon
                            && t.LoaiTB    == "canh-bao"
                            && t.NgayTao   >= gioiHan);

            if (daCoNhac)
                return BadRequest(new { message = "Đã nhắc nhở trong vòng 6 giờ qua. Vui lòng chờ thêm." });

            // Ghi thông báo — các giá trị khớp CHECK constraint của bảng THONGBAO
            // LoaiTB: 'thong-tin'|'canh-bao'|'thanh-toan'|'he-thong'
            // LoaiNguon: 'DonDV'|'HoaDon'|'DiemNuoc'|'HeThong'
            _db.THONGBAO.Add(new THONGBAO
            {
                IDNguoiGui = idManager,
                IDUser     = idUser,
                IDNguonTB  = req.Id,
                LoaiNguon  = loaiNguon,
                TieuDe     = "Nhắc nhở thanh toán",
                NoiDung    = $"Quản lý nhắc bạn thanh toán hóa đơn phòng {soPhong}. "
                           + $"Số tiền: {soTien:N0} đ. Vui lòng thanh toán sớm.",
                LoaiTB     = "canh-bao",
                DaDoc      = false,
                NgayTao    = DateTime.Now,
            });
            await _db.SaveChangesAsync();

            return new JsonResult(new { success = true });
        }

        // ================================================================
        // HELPERS
        // ================================================================
        private static bool IsSapDen(DateTime hanDong)
        {
            var con = (hanDong.Date - DateTime.Today).TotalDays;
            return con >= 0 && con <= 5;
        }

        private int LayIdManager()
        {
            var s = User.FindFirst("IDUser")?.Value
                 ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(s, out int id);
            return id;
        }

        // Kiểm tra Manager có quyền thao tác trên HDTHANG không
        // Tách 2 bước để tránh lỗi CS1061 (EF nhầm TEntity khi lồng subquery DbSet khác)
        private async Task<bool> CoQuyenHDThangAsync(int idHDThang, int idManager)
        {
            // Bước 1: lấy IDPhong của hóa đơn
            var idPhong = await _db.HDTHANG
                .AsNoTracking()
                .Where(h => h.IDHDThang == idHDThang)
                .Select(h => (int?)h.IDPhong)
                .FirstOrDefaultAsync();

            if (idPhong == null) return false;

            // Bước 2: kiểm tra phòng đó có thuộc phân công của Manager không
            return await _db.PHONG_MANAGER
                .AnyAsync(pm => pm.IDPhong   == idPhong
                             && pm.IDManager == idManager
                             && pm.IsActive);
        }

        // Kiểm tra Manager có quyền thao tác trên DONDV không
        // Tách 2 bước để tránh lỗi CS1061 (EF nhầm TEntity khi lồng subquery DbSet khác)
        private async Task<bool> CoQuyenDonDVAsync(int idDonDV, int idManager)
        {
            // Bước 1: lấy IDPhong của đơn dịch vụ
            var idPhong = await _db.DONDV
                .AsNoTracking()
                .Where(d => d.IDDonDV == idDonDV)
                .Select(d => (int?)d.IDPhong)
                .FirstOrDefaultAsync();

            if (idPhong == null) return false;

            // Bước 2: kiểm tra phòng đó có thuộc phân công của Manager không
            return await _db.PHONG_MANAGER
                .AnyAsync(pm => pm.IDPhong   == idPhong
                             && pm.IDManager == idManager
                             && pm.IsActive);
        }
    }

    public class IdRequest
    {
        public int Id { get; set; }
    }

    public class NhacNhoRequest
    {
        public int Id { get; set; }
        /// <summary>"month" | "dv"</summary>
        public string Loai { get; set; } = "";
    }
}
