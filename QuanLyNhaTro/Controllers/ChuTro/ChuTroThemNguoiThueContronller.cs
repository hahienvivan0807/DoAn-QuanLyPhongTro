using Azure.Core;
using BCrypt.Net;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace QuanLyNhaTro.Controllers.ChuTro
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChuTroThemNguoiThueController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;
        private readonly IConfiguration _configuration;

        public ChuTroThemNguoiThueController(QuanLyKhuNhaTro context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public class NguoiThueRequest
        {
            // Tab 1: Thông tin cơ bản
            public string HoTen { get; set; }
            public string SoDienThoai { get; set; }
            public string? Email { get; set; }
            public DateTime? NgaySinh { get; set; }
            public string? GioiTinh { get; set; }
            public string? SoCCCD { get; set; }
            public DateTime? NgayCapCCCD { get; set; }
            public string? NoiCapCCCD { get; set; }
            public string? NgheNghiep { get; set; }
            public string? LienHeKhan { get; set; }
            public string? SDTKhan { get; set; }

            // Tab 2: Cư trú & Tài khoản
            public string? DiaChi { get; set; }
            public string? TinhThanh { get; set; }
            public string? QueQuan { get; set; }
            public string? GhiChu { get; set; }
            public string Username { get; set; }
            public string Password { get; set; }

            // Tab 3: Phòng & Hợp đồng
            public DateTime NgayVaoO { get; set; }
            public int IDPhong { get; set; }
            public decimal TienCoc { get; set; } = 0;
            public DateTime? NgayKetThuc { get; set; }
            public int DienDauKy { get; set; } = 0;
            public int NuocDauKy { get; set; } = 0;
            public string? GhiChuHD { get; set; }

            // Ảnh
            public string? AnhChanDung { get; set; }
        }

        [HttpPost("them-nguoi-thue")]
        public async Task<IActionResult> ThemNguoiThue([FromBody] NguoiThueRequest req)
        {
            // ── Validate bắt buộc ──
            if (string.IsNullOrWhiteSpace(req.HoTen))
                return BadRequest(new { message = "Họ tên không được để trống" });
            if (string.IsNullOrWhiteSpace(req.SoDienThoai))
                return BadRequest(new { message = "Số điện thoại không được để trống" });
            if (string.IsNullOrWhiteSpace(req.Username))
                return BadRequest(new { message = "Tên đăng nhập không được để trống" });
            if (string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(new { message = "Mật khẩu không được để trống" });
            if (req.IDPhong <= 0)
                return BadRequest(new { message = "Vui lòng chọn phòng" });
            if (req.NgayVaoO == default(DateTime))
                return BadRequest(new { message = "Ngày vào ở không được để trống" });
            if (!req.NgayKetThuc.HasValue)
                return BadRequest(new { message = "Ngày kết thúc hợp đồng không được để trống" });

            // ── Validate tuổi ──
            if (req.NgaySinh.HasValue)
            {
                var ngaySinh = req.NgaySinh.Value.Date;
                var ngayHienTai = DateTime.Today;

                int tuoi = ngayHienTai.Year - ngaySinh.Year;
                if (ngayHienTai < ngaySinh.AddYears(tuoi))
                    tuoi--;

                if (tuoi < 16)
                    return BadRequest(new
                    {
                        message = $"Người thuê mới {tuoi} tuổi. Hợp đồng chỉ áp dụng cho người từ đủ 16 tuổi trở lên."
                    });
            }

            // ── Validate ngày ──
            if (req.NgayKetThuc.Value.Date <= req.NgayVaoO.Date)
                return BadRequest(new { message = "Ngày hết hạn HĐ phải sau ngày vào ở" });

            int soNgayThue = (req.NgayKetThuc.Value.Date - req.NgayVaoO.Date).Days;
            if (soNgayThue < 180)
                return BadRequest(new { message = $"Thời gian thuê quá ngắn ({soNgayThue} ngày). Hợp đồng tối thiểu phải từ 180 ngày trở lên." });

            // ── Validate trùng ──
            bool sdtTrung = await _context.ACCOUNT.AnyAsync(u => u.Phone == req.SoDienThoai);
            if (sdtTrung)
                return BadRequest(new { message = "Số điện thoại đã tồn tại" });

            bool usernameTrung = await _context.ACCOUNT.AnyAsync(u => u.Username == req.Username);
            if (usernameTrung)
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });

            // ── Validate phòng ──
            var phong = await _context.PHONG.FirstOrDefaultAsync(p => p.IDPhong == req.IDPhong);
            if (phong == null)
                return BadRequest(new { message = "Phòng không tồn tại" });
            if (phong.TrangThai != "Trống")
                return BadRequest(new { message = "Phòng này đã có người thuê" });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. INSERT ACCOUNT
                var newAccount = new ACCOUNT
                {
                    FullName = req.HoTen.Trim(),
                    Username = req.Username.Trim(),
                    Passwords = BCrypt.Net.BCrypt.HashPassword(req.Password),
                    Phone = req.SoDienThoai.Trim(),
                    Email = req.Email?.Trim(),
                    Roles = "Tenant",
                    QR_Link = "",
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                };
                _context.ACCOUNT.Add(newAccount);
                await _context.SaveChangesAsync(); // lấy IDUser

                // 2. INSERT KHACH_THUE
                var newKhachThue = new KHACH_THUE
                {
                    IDUser = newAccount.IDUser,
                    HoTen = req.HoTen.Trim(),
                    SoDienThoai = req.SoDienThoai.Trim(),
                    SoCCCD = req.SoCCCD?.Trim(),
                    NgaySinh = req.NgaySinh,
                    GioiTinh = req.GioiTinh,
                    QueQuan = req.QueQuan?.Trim(),
                    DiaChiThuongTru = req.DiaChi?.Trim(),
                    GhiChu = req.GhiChu?.Trim(),
                    AnhChanDung = req.AnhChanDung,
                    NgayVaoO = req.NgayVaoO,
                };
                _context.KHACH_THUE.Add(newKhachThue);

                // 3. INSERT HOPDONG
                var newHopDong = new HOPDONG
                {
                    IDUser = newAccount.IDUser,
                    IDPhong = req.IDPhong,
                    NgayBatDau = req.NgayVaoO,
                    NgayKetThuc = req.NgayKetThuc,
                    TienCocBanDau = req.TienCoc,
                    DienDauKy = req.DienDauKy,
                    NuocDauKy = req.NuocDauKy,
                    TrangThaiHD = "Đang hiệu lực",
                    GhiChu = req.GhiChuHD?.Trim(),
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    GiaThueChot = phong.GiaPhongFix,
                };
                _context.HOPDONG.Add(newHopDong);

                // 4. UPDATE PHONG → Đã thuê
                phong.TrangThai = "Đã thuê";
                phong.soluong += 1;

                // ✅ FIX 1: SaveChanges TRƯỚC khi dùng newHopDong.IDHopDong
                // Trước đây IDHopDong = 0 (chưa được DB gán) → vi phạm FK → lỗi 500
                await _context.SaveChangesAsync(); // lấy IDHopDong

                // 5. INSERT HOPDONG_KHACHO (chủ phòng)
                // ✅ FIX 3: Bổ sung đầy đủ IsChinhChu, GioiTinh, QuanHe
                var newKhachO = new HOPDONG_KHACHO
                {
                    IDHopDong = newHopDong.IDHopDong, // ✅ Lúc này đã có giá trị hợp lệ
                    IDUser = newAccount.IDUser,
                    HoTen = newAccount.FullName.Trim(),
                    SoCCCD = req.SoCCCD?.Trim(),
                    SoDienThoai = req.SoDienThoai.Trim(),
                    NgaySinh = req.NgaySinh,
                    GioiTinh = req.GioiTinh,
                    QuanHe = "Đại diện",
                    IsChinhChu = true,
                    NgayVao = req.NgayVaoO,
                    GhiChu = req.GhiChu?.Trim(),
                };
                _context.HOPDONG_KHACHO.Add(newKhachO);
                await _context.SaveChangesAsync();

                // 6. Tự động gán người ở ghép còn lại vào hợp đồng mới
                // Tìm tất cả HOPDONG_KHACHO thuộc cùng phòng, chưa rời đi (NgayRa == null),
                // thuộc hợp đồng đã kết thúc, không phải chủ phòng cũ,
                // và chưa có trong bất kỳ hợp đồng đang hiệu lực nào của phòng này.
                var idUserDangHieuLuc = await _context.HOPDONG_KHACHO
                    .Where(ko => ko.HopDong.IDPhong == req.IDPhong
                              && ko.HopDong.TrangThaiHD == "Đang hiệu lực"
                              && ko.NgayRa == null)
                    .Select(ko => ko.IDUser)
                    .ToListAsync();

                var nguoiGhepConLai = await _context.HOPDONG_KHACHO
                    .Where(ko => ko.HopDong.IDPhong == req.IDPhong
                              && ko.HopDong.TrangThaiHD == "Đã kết thúc"
                              && ko.NgayRa == null
                              && ko.IsChinhChu == false
                              && !idUserDangHieuLuc.Contains(ko.IDUser))
                    .ToListAsync();

                foreach (var nguoiGhep in nguoiGhepConLai)
                {
                    // Thêm vào hợp đồng mới
                    var khachOGhep = new HOPDONG_KHACHO
                    {
                        IDHopDong = newHopDong.IDHopDong,
                        IDUser = nguoiGhep.IDUser,
                        HoTen = nguoiGhep.HoTen,
                        SoCCCD = nguoiGhep.SoCCCD,
                        NgaySinh = nguoiGhep.NgaySinh,
                        GioiTinh = nguoiGhep.GioiTinh,
                        SoDienThoai = nguoiGhep.SoDienThoai,
                        QuanHe = nguoiGhep.QuanHe,
                        IsChinhChu = false,
                        NgayVao = DateTime.Today,
                    };
                    _context.HOPDONG_KHACHO.Add(khachOGhep);

                    // Kích hoạt lại tài khoản (họ vẫn đang ở trong phòng)
                    var taiKhoan = await _context.ACCOUNT
                        .FirstOrDefaultAsync(a => a.IDUser == nguoiGhep.IDUser);
                    if (taiKhoan != null)
                    {
                        taiKhoan.IsActive = true;
                        taiKhoan.UpdatedAt = DateTime.Now;
                    }

                    // Tăng số lượng người trong phòng
                    phong.soluong += 1;
                }

                if (nguoiGhepConLai.Any())
                    await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { message = "Thêm người thuê thành công!", idUser = newAccount.IDUser });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // InnerException chứa lỗi DB thật sự (ví dụ: constraint, column null, v.v.)
                var innerMsg = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new
                {
                    message = "Lỗi hệ thống!",
                    detail = ex.Message,
                    innerDetail = innerMsg
                });
            }
        }

        public class ResetPasswordRequest
        {
            public string SDTKhach { get; set; }
            public string NewPassword { get; set; }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> UpdateUser([FromBody] ResetPasswordRequest request)
        {
            var user = await _context.ACCOUNT.FirstOrDefaultAsync(u => u.Phone == request.SDTKhach);
            if (user == null)
                return BadRequest(new { message = "Không tồn tại số điện thoại" });

            string hashPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.Passwords = hashPassword;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật mật khẩu thành công" });
        }

        public class TraPhongRequest
        {
            public string? LyDo { get; set; }
            public int IDUser { get; set; }
        }

        [HttpPut("{id}/tra-phong")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> XoaNguoiThue(int id, [FromBody] TraPhongRequest request)
        {
            // 1. Tìm hợp đồng theo id (IDHopDong)
            var hopDong = await _context.HOPDONG
                .Include(h => h.Phong)
                .Include(h => h.Tenant)
                .FirstOrDefaultAsync(h => h.IDHopDong == id
                                       && h.IDUser == request.IDUser
                                       && h.TrangThaiHD == "Đang hiệu lực");

            if (hopDong == null)
                return NotFound(new { success = false, message = "Không tìm thấy hợp đồng hợp lệ" });

            // 2. Đổi trạng thái phòng → Trống
            hopDong.Phong.TrangThai = "Trống";

            // 3. Đổi trạng thái hợp đồng → Đã kết thúc
            hopDong.TrangThaiHD = "Đã kết thúc";
            hopDong.NgayThanhLy = DateTime.UtcNow;
            hopDong.LyDoKetThuc = request.LyDo;
            hopDong.UpdatedAt = DateTime.UtcNow;

            // 4. Khóa tài khoản người thuê
            hopDong.Tenant.IsActive = false;
            hopDong.Tenant.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Đã trả phòng thành công cho {hopDong.Tenant.FullName}"
            });
        }

        public class NguoiOGhepRequest
        {
            // --- Phòng ---
            public int? IDPhong { get; set; }

            // --- Account ---
            public string HoTen { get; set; }
            public string Username { get; set; }
            public string Passwords { get; set; }
            public string Phone { get; set; }
            public string Email { get; set; }
            public string Roles { get; set; } = "Tenant";

            public string? SoCCCD { get; set; }
            public DateTime? NgaySinh { get; set; }
            public string? GioiTinh { get; set; }
            public string? QueQuan { get; set; }

            public DateTime? NgayVaoO { get; set; }
            public string QuanHe { get; set; }
            public string? GhiChu { get; set; }
        }

        [HttpPost("them-nguoi-o-ghep")]
        public async Task<IActionResult> ThemNguoiOGhep([FromBody] NguoiOGhepRequest request)
        {
            // ── Kiểm tra phòng có hợp đồng hiệu lực không ──
            var hopDongHienTai = await _context.HOPDONG
                .Include(h => h.Phong)
                .FirstOrDefaultAsync(h => h.IDPhong == request.IDPhong
                                       && h.TrangThaiHD == "Đang hiệu lực");

            if (hopDongHienTai == null)
                return BadRequest(new { message = "Không tìm thấy hợp đồng đang hiệu lực cho phòng này" });

            // ── Kiểm tra account đã tồn tại chưa ──
            var accountTonTai = await _context.ACCOUNT
                .FirstOrDefaultAsync(a => a.Username == request.Username.Trim());

            int idUser;

            if (accountTonTai != null)
            {
                // Dùng lại account cũ, kích hoạt lại nếu bị khóa
                accountTonTai.IsActive = true;
                accountTonTai.UpdatedAt = DateTime.UtcNow;
                idUser = accountTonTai.IDUser;
            }
            else
            {
                // Kiểm tra SĐT trùng không
                var sdtTonTai = await _context.ACCOUNT
                    .FirstOrDefaultAsync(a => a.Phone == request.Phone.Trim());
                if (sdtTonTai != null)
                    return BadRequest(new { message = $"Số điện thoại {request.Phone} đã được dùng bởi tài khoản khác" });

                // Tạo tài khoản mới
                var newAccount = new ACCOUNT
                {
                    FullName = request.HoTen.Trim(),
                    Username = request.Username.Trim(),
                    Passwords = BCrypt.Net.BCrypt.HashPassword(request.Passwords),
                    Phone = request.Phone.Trim(),
                    Email = request.Email?.Trim(),
                    Roles = request.Roles,
                    QR_Link = "",
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                };
                _context.ACCOUNT.Add(newAccount);
                await _context.SaveChangesAsync(); // lấy IDUser
                idUser = newAccount.IDUser;
            }

            // ── Tạo KHACH_THUE nếu chưa có ──
            var khachThueTonTai = await _context.KHACH_THUE
                .AnyAsync(k => k.IDUser == idUser);

            if (!khachThueTonTai)
            {
                var newKhachThue = new KHACH_THUE
                {
                    IDUser = idUser,
                    HoTen = request.HoTen.Trim(),
                    SoCCCD = request.SoCCCD?.Trim(),
                    NgaySinh = request.NgaySinh,
                    GioiTinh = request.GioiTinh,
                    SoDienThoai = request.Phone.Trim(),
                    QueQuan = request.QueQuan?.Trim(),
                    DiaChiThuongTru = "",
                    GhiChu = request.GhiChu?.Trim()
                              ?? $"Người ở ghép, quan hệ: {request.QuanHe}",
                    NgayVaoO = request.NgayVaoO ?? DateTime.Today,
                };
                _context.KHACH_THUE.Add(newKhachThue);
            }

            // ── Kiểm tra đã có trong hợp đồng này chưa ──
            var daCoTrongHD = await _context.HOPDONG_KHACHO
                .AnyAsync(ko => ko.IDHopDong == hopDongHienTai.IDHopDong
                             && ko.IDUser == idUser
                             && ko.NgayRa == null);

            if (daCoTrongHD)
                return BadRequest(new { message = "Người này đã có trong hợp đồng của phòng" });

            // ── INSERT HOPDONG_KHACHO ──
            var khachO = new HOPDONG_KHACHO
            {
                IDHopDong = hopDongHienTai.IDHopDong,
                IDUser = idUser,
                HoTen = request.HoTen.Trim(),
                SoCCCD = request.SoCCCD?.Trim(),
                NgaySinh = request.NgaySinh,
                GioiTinh = request.GioiTinh,
                SoDienThoai = request.Phone.Trim(),
                QuanHe = request.QuanHe,
                IsChinhChu = false,
                NgayVao = request.NgayVaoO ?? DateTime.Today,
            };
            _context.HOPDONG_KHACHO.Add(khachO);


            var phong = await _context.PHONG
                .FirstOrDefaultAsync(p => p.IDPhong == hopDongHienTai.IDPhong);
            if (phong != null)
                phong.soluong += 1;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Đã thêm người ở ghép vào phòng {hopDongHienTai.Phong.SoPhong}",
                idUser = idUser
            });
        }
    }
}
