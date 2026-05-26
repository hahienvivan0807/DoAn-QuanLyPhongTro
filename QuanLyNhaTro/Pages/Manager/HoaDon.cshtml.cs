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
                // Truy vấn trực tiếp từ bảng ACCOUNT trong SQL Server
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
                // Manager chưa được phân công phòng nào → trả về tập rỗng, không lỗi
                DanhSachHoaDon = new List<HoaDonThangViewModel>();
                DanhSachDonDVChoXacNhan = new List<HoaDonDichVuViewModel>();
                DanhSachHoaDonJson = "[]";
                DanhSachDonDVChoXacNhanJson = "[]";
                return;
            }

            // ── Truy vấn HDTHANG theo kỳ ─────────────────────────────
            var query = await _db.HDTHANG
                .Where(h => h.KyThanhToan == KyXem
                         && idPhongDuocPhanCong.Contains(h.IDPhong))
                .Include(h => h.Phong)
                    .ThenInclude(p => p.HopDongs.Where(hd => hd.TrangThaiHD == "Đang hiệu lực"))
                        .ThenInclude(hd => hd.Tenant)
                .ToListAsync();

            DanhSachHoaDon = query.Select(h =>
            {
                var hopDong = h.Phong.HopDongs.FirstOrDefault();
                var tenant = hopDong?.Tenant;

                // ── Map trạng thái ──────────────────────────────────
                // "Chờ duyệt"     = khách đã gửi ảnh CK, quản lý chưa xác nhận → cho-xac-nhan
                // "Đã hoàn thành" = quản lý đã xác nhận HOẶC thu tiền mặt      → hoan-thanh
                // "Quá hạn"       = đã quá hạn thanh toán                       → qua-han
                // Các giá trị khác ("Chưa đóng", null...) → xác định theo ngày hạn
                var trangThai = h.TrangThai_TT switch
                {
                    "Quá hạn" => "qua-han",
                    "Chờ duyệt" => "cho-xac-nhan",
                    "Đã hoàn thành" => "hoan-thanh",
                    _ => IsSapDen(h.HanDong) ? "sap-den" : "qua-han"
                };

                var noDV = (h.TienDV ?? 0) + (h.TienNoDV ?? 0);

                return new HoaDonThangViewModel
                {
                    Id = h.IDHDThang,
                    SoPhong = h.Phong.SoPhong,
                    TenNguoiThue = tenant?.FullName ?? "—",
                    TrangThai = trangThai,
                    KyThanhToan = $"Tháng {h.KyThanhToan}",
                    HanNop = h.HanDong.ToString("dd/MM/yyyy"),
                    NgayNop = h.NgayDuyet?.ToString("dd/MM/yyyy HH:mm"),
                    TienPhong = h.TienPhong ?? 0,
                    TienDien = h.TienDienSum ?? 0,
                    TienNuoc = h.TienNuocSum ?? 0,
                    TienDichVu = noDV,
                    SoDienThoai = tenant?.Phone ?? "",
                    GhiChu = h.GhiChuDuyet,
                    // Có ảnh & đang "Chờ duyệt" → hiện nút xác nhận cho manager
                    AnhChuyenKhoan = h.AnhChuyenKhoan,
                    CoAnhChoXacNhan = trangThai == "cho-xac-nhan" && !string.IsNullOrEmpty(h.AnhChuyenKhoan),
                };
            }).ToList();

            DanhSachHoaDonJson = JsonSerializer.Serialize(DanhSachHoaDon, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            // Lấy DONDV cần quản lý xem/xác nhận:
            // – "Chờ duyệt"      : đã có ảnh biên lai (Giặt sấy / Nước bình)
            // – "Chờ thanh toán" : Nước bình – khách đã gửi ảnh CK nhưng trạng thái
            //   chỉ lên "Chờ thanh toán" (QuanLyDichVu set sau khi giao hàng)
            var donDVChoXacNhan = await _db.DONDV
                .Where(d => (d.TrangThai_DV == "Chờ duyệt" || d.TrangThai_DV == "Chờ thanh toán")
                         && d.AnhBienLai != null
                         && idPhongDuocPhanCong.Contains(d.IDPhong))
                .Include(d => d.Phong)
                .Include(d => d.Tenant)
                .ToListAsync();

            DanhSachDonDVChoXacNhan = donDVChoXacNhan.Select(d => new HoaDonDichVuViewModel
            {
                Id = d.IDDonDV,
                SoPhong = d.Phong.SoPhong,
                TenNguoiThue = d.Tenant?.FullName ?? "—",
                TrangThai = "cho-xac-nhan",
                LoaiDV = d.LoaiDV,
                HanNop = d.NgayHetHan?.ToString("dd/MM/yyyy") ?? "—",
                NgayNop = d.UpdatedAt.ToString("dd/MM/yyyy HH:mm"),
                TongTien = d.TongTien,
                SoDienThoai = d.Tenant?.Phone ?? "",
                AnhBienLai = d.AnhBienLai,
                GhiChu = d.GhiChuXuLy,
            }).ToList();

            DanhSachDonDVChoXacNhanJson = JsonSerializer.Serialize(DanhSachDonDVChoXacNhan, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
        }

        // ================================================================
        // API: XÁC NHẬN THANH TOÁN HDTHANG (POST /api/hoa-don/xac-nhan)
        // ================================================================
        public async Task<IActionResult> OnPostXacNhanAsync([FromBody] IdRequest req)
        {
            // Kiểm tra quyền: Manager chỉ được thao tác trên phòng được phân công
            int idManager = LayIdManager();
            if (!await CoQuyenHDThangAsync(req.Id, idManager))
                return new JsonResult(new { message = "Không có quyền thao tác hóa đơn này." }) { StatusCode = 403 };

            var hd = await _db.HDTHANG.FindAsync(req.Id);
            if (hd == null) return NotFound();

            if (hd.TrangThai_TT == "Đã hoàn thành")
                return BadRequest(new { message = "Hóa đơn đã được thanh toán trước đó." });

            if (hd.TrangThai_TT != "Chờ duyệt")
                return BadRequest(new { message = "Hóa đơn không ở trạng thái chờ xác nhận." });

            hd.TrangThai_TT = "Đã hoàn thành";
            hd.NgayDuyet = DateTime.Now;
            hd.IDManagerDuyet = idManager > 0 ? idManager : null;
            hd.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // API: TỪ CHỐI THANH TOÁN HDTHANG (POST /api/hoa-don/tu-choi)
        // ================================================================
        public async Task<IActionResult> OnPostTuChoiAsync([FromBody] IdRequest req)
        {
            // Kiểm tra quyền: Manager chỉ được thao tác trên phòng được phân công
            int idManager = LayIdManager();
            if (!await CoQuyenHDThangAsync(req.Id, idManager))
                return new JsonResult(new { message = "Không có quyền thao tác hóa đơn này." }) { StatusCode = 403 };

            var hd = await _db.HDTHANG.FindAsync(req.Id);
            if (hd == null) return NotFound();

            if (hd.TrangThai_TT != "Chờ duyệt")
                return BadRequest(new { message = "Hóa đơn không ở trạng thái chờ xác nhận." });

            // Reset về "Quá hạn" để PageModel map đúng → "qua-han"
            hd.TrangThai_TT = "Quá hạn";
            hd.AnhChuyenKhoan = null;
            hd.NgayDuyet = null;
            hd.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // API: GHI THU TIỀN MẶT HDTHANG (POST /api/hoa-don/thu-tien-mat)
        // ================================================================
        public async Task<IActionResult> OnPostThuTienMatAsync([FromBody] IdRequest req)
        {
            // Kiểm tra quyền: Manager chỉ được thao tác trên phòng được phân công
            int idManager = LayIdManager();
            if (!await CoQuyenHDThangAsync(req.Id, idManager))
                return new JsonResult(new { message = "Không có quyền thao tác hóa đơn này." }) { StatusCode = 403 };

            var hd = await _db.HDTHANG.FindAsync(req.Id);
            if (hd == null) return NotFound();

            // Guard: không thu tiền mặt nếu đã hoàn thành
            if (hd.TrangThai_TT == "Đã hoàn thành")
                return BadRequest(new { message = "Hóa đơn đã được thanh toán." });

            hd.TrangThai_TT = "Đã hoàn thành";
            hd.NgayDuyet = DateTime.Now;
            hd.IDManagerDuyet = idManager > 0 ? idManager : null;
            hd.GhiChuDuyet = "Thu tiền mặt";
            hd.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // API: XÁC NHẬN THANH TOÁN DONDV (POST /api/hoa-don/xac-nhan-dich-vu)
        // Task 3 – approve guest's uploaded receipt for Giặt sấy / Nước bình
        // ================================================================
        public async Task<IActionResult> OnPostXacNhanDichVuAsync([FromBody] IdRequest req)
        {
            // Kiểm tra quyền: Manager chỉ được thao tác trên phòng được phân công
            int idManager = LayIdManager();
            if (!await CoQuyenDonDVAsync(req.Id, idManager))
                return new JsonResult(new { message = "Không có quyền thao tác đơn dịch vụ này." }) { StatusCode = 403 };

            var don = await _db.DONDV.FindAsync(req.Id);
            if (don == null) return NotFound();

            if (don.TrangThai_DV == "Thành công")
                return BadRequest(new { message = "Đơn dịch vụ đã được xác nhận trước đó." });

            // Chấp nhận cả "Chờ duyệt" (Giặt sấy) lẫn "Chờ thanh toán" (Nước bình)
            if (don.TrangThai_DV != "Chờ duyệt" && don.TrangThai_DV != "Chờ thanh toán")
                return BadRequest(new { message = "Đơn dịch vụ không ở trạng thái chờ xác nhận." });

            don.TrangThai_DV = "Thành công";
            don.IDManagerXuLy = idManager > 0 ? idManager : don.IDManagerXuLy;
            don.NgayXuLy = DateTime.Now;
            don.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // API: TỪ CHỐI THANH TOÁN DONDV (POST /api/hoa-don/tu-choi-dich-vu)
        // Task 3 – reject guest's receipt; reset so they can re-upload
        // ================================================================
        public async Task<IActionResult> OnPostTuChoiDichVuAsync([FromBody] IdRequest req)
        {
            // Kiểm tra quyền: Manager chỉ được thao tác trên phòng được phân công
            int idManager = LayIdManager();
            if (!await CoQuyenDonDVAsync(req.Id, idManager))
                return new JsonResult(new { message = "Không có quyền thao tác đơn dịch vụ này." }) { StatusCode = 403 };

            var don = await _db.DONDV.FindAsync(req.Id);
            if (don == null) return NotFound();

            // Chấp nhận cả "Chờ duyệt" (Giặt sấy) lẫn "Chờ thanh toán" (Nước bình)
            if (don.TrangThai_DV != "Chờ duyệt" && don.TrangThai_DV != "Chờ thanh toán")
                return BadRequest(new { message = "Đơn dịch vụ không ở trạng thái chờ xác nhận." });

            // Reset về "Chờ thanh toán" — xóa ảnh để khách có thể gửi lại
            don.TrangThai_DV = "Chờ thanh toán";
            don.AnhBienLai = null;
            don.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return new JsonResult(new { success = true });
        }

        // ================================================================
        // GET: DANH SÁCH ĐƠN DỊCH VỤ THEO KỲ (GET ?handler=DanhSachDV&ky=MM/yyyy)
        // Lỗi 3: thay thế endpoint /api/hoa-don/danh-sach-dv không tồn tại
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
            var kyXem = string.IsNullOrEmpty(ky) ? DateTime.Now.ToString("MM/yyyy") : ky;
            var parts = kyXem.Split('/');
            int thang = int.Parse(parts[0]);
            int nam = int.Parse(parts[1]);

            var dons = await _db.DONDV
                .AsNoTracking()
                .Include(d => d.Phong)
                .Include(d => d.Tenant)
                .Where(d => idPhong.Contains(d.IDPhong)
                         && d.NgayTao.Month == thang
                         && d.NgayTao.Year == nam)
                .OrderByDescending(d => d.NgayTao)
                .Select(d => new HoaDonDichVuViewModel
                {
                    Id = d.IDDonDV,
                    SoPhong = d.Phong.SoPhong,
                    TenNguoiThue = d.Tenant != null ? d.Tenant.FullName : "—",
                    // "Chờ thanh toán" + có ảnh biên lai = khách Nước bình đã gửi ảnh CK → cho-xac-nhan
                    // "Chờ thanh toán" + chưa có ảnh    = chờ khách gửi → sap-den / qua-han
                    TrangThai = d.TrangThai_DV == "Thành công"
                                        ? "hoan-thanh"
                                 : d.TrangThai_DV == "Đã hoàn thành"
                                        ? "hoan-thanh"
                                 : d.TrangThai_DV == "Chờ duyệt"
                                        ? "cho-xac-nhan"
                                 : (d.TrangThai_DV == "Chờ thanh toán" && d.AnhBienLai != null)
                                        ? "cho-xac-nhan"
                                 : d.TrangThai_DV == "Đã hủy" || d.TrangThai_DV == "Từ chối"
                                        ? "hoan-thanh"
                                 : d.NgayHetHan.HasValue && d.NgayHetHan < DateTime.Today
                                        ? "qua-han"
                                 : d.NgayHetHan.HasValue
                                   && (d.NgayHetHan.Value - DateTime.Today).TotalDays <= 5
                                        ? "sap-den"
                                 : "qua-han",
                    LoaiDV = d.LoaiDV,
                    HanNop = d.NgayHetHan.HasValue
                                        ? d.NgayHetHan.Value.ToString("dd/MM/yyyy") : "—",
                    NgayNop = d.NgayHoanThanh.HasValue
                                        ? d.NgayHoanThanh.Value.ToString("dd/MM/yyyy HH:mm") : null,
                    TongTien = d.TongTien,
                    SoDienThoai = d.Tenant != null ? d.Tenant.Phone : "",
                    AnhBienLai = d.AnhBienLai,
                    GhiChu = d.GhiChuXuLy,
                })
                .ToListAsync();

            return new JsonResult(dons, new System.Text.Json.JsonSerializerOptions
            {
                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
            });
        }

        // ================================================================
        // POST: NHẮC NHỞ THANH TOÁN (POST ?handler=NhacNho)
        // Lỗi 4: thêm handler cho nút Nhắc nhở trên UI
        // ================================================================
        public async Task<IActionResult> OnPostNhacNhoAsync([FromBody] NhacNhoRequest req)
        {
            int idManager = LayIdManager();
            if (idManager == 0) return Unauthorized();

            int idUser = 0;
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
                var hopDong = await _db.HOPDONG
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.IDPhong == hd.IDPhong
                                           && x.TrangThaiHD == "Đang hiệu lực");

                idUser = hopDong?.IDUser ?? 0;
                soPhong = hd.Phong?.SoPhong ?? "?";
                soTien = (hd.TienPhong ?? 0)
                        + (hd.TienDienSum ?? 0)
                        + (hd.TienNuocSum ?? 0)
                        + (hd.TienDV ?? 0)
                        + (hd.TienNoDV ?? 0);
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

                idUser = don.IDUser;
                soPhong = don.Phong?.SoPhong ?? "?";
                soTien = don.TongTien;
            }
            else
            {
                return BadRequest(new { message = "Loại không hợp lệ." });
            }

            if (idUser == 0)
                return BadRequest(new { message = "Không tìm thấy thông tin tenant." });

            // Chống spam: không nhắc quá 1 lần trong 6 giờ cùng nguồn
            var gioiHan = DateTime.Now.AddHours(-6);
            var loaiNguon = req.Loai == "month" ? "HoaDon" : "DonDV"; // khớp CHECK constraint DB
            bool daCoNhac = await _db.THONGBAO
                .AnyAsync(t => t.IDUser == idUser
                            && t.IDNguonTB == req.Id
                            && t.LoaiNguon == loaiNguon
                            && t.LoaiTB == "canh-bao"  // khớp CHECK constraint DB
                            && t.NgayTao >= gioiHan);

            if (daCoNhac)
                return BadRequest(new
                {
                    message = "Đã nhắc nhở trong vòng 6 giờ qua. Vui lòng chờ thêm."
                });

            // Ghi thông báo — tất cả giá trị đều khớp CHECK constraint của DB
            _db.THONGBAO.Add(new THONGBAO
            {
                IDNguoiGui = idManager,
                IDUser = idUser,
                IDNguonTB = req.Id,
                LoaiNguon = loaiNguon,   // 'HoaDon' hoặc 'DonDV'
                TieuDe = "Nhắc nhở thanh toán",
                NoiDung = $"Quản lý nhắc bạn thanh toán hóa đơn phòng {soPhong}. "
                           + $"Số tiền: {soTien:N0} đ. Vui lòng thanh toán sớm.",
                LoaiTB = "canh-bao",  // khớp CHECK: 'he-thong'|'thanh-toan'|'canh-bao'|'thong-tin'
                DaDoc = false,
                NgayTao = DateTime.Now,
            });
            await _db.SaveChangesAsync();

            return new JsonResult(new { success = true });
        }

        // ================================================================
        // HELPER
        // ================================================================
        private static bool IsSapDen(DateTime hanDong)
        {
            var con = (hanDong.Date - DateTime.Today).TotalDays;
            return con >= 0 && con <= 5;
        }

        // Lấy idManager từ Claims
        private int LayIdManager()
        {
            var s = User.FindFirst("IDUser")?.Value
                 ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(s, out int id);
            return id;
        }

        // Kiểm tra Manager có quyền thao tác trên hóa đơn tháng không
        private async Task<bool> CoQuyenHDThangAsync(int idHDThang, int idManager)
        {
            return await _db.HDTHANG
                .AsNoTracking()
                .AnyAsync(h => h.IDHDThang == idHDThang
                            && _db.PHONG_MANAGER.Any(pm =>
                                    pm.IDPhong == h.IDPhong
                                 && pm.IDManager == idManager
                                 && pm.IsActive));
        }

        // Kiểm tra Manager có quyền thao tác trên đơn dịch vụ không
        private async Task<bool> CoQuyenDonDVAsync(int idDonDV, int idManager)
        {
            return await _db.DONDV
                .AsNoTracking()
                .AnyAsync(d => d.IDDonDV == idDonDV
                            && _db.PHONG_MANAGER.Any(pm =>
                                    pm.IDPhong == d.IDPhong
                                 && pm.IDManager == idManager
                                 && pm.IsActive));
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
