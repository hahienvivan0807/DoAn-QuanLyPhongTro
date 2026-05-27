using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using System.Security.Claims;
using System.Text.RegularExpressions; //Thư viện kiểm tra ký tự

namespace QuanLyNhaTro.Controllers.ChuTro
{
    [ApiController]
    [Route("api/[controller]")]

    public class ChuTroController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;
        private readonly IConfiguration _configuration;

        public ChuTroController(QuanLyKhuNhaTro context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        // ─── Request Models ────────────────────────────────────────────
        public class NguoiThueRequest
        {
            public string HoTen { get; set; }
            public string SoDienThoai { get; set; }
            public string Email { get; set; }
            public string NgaySinh { get; set; } // "YYYY-MM-DD" or null
            public string GioiTinh { get; set; }
            public string SoCCCD { get; set; }
            public string NgayCapCCCD { get; set; } // "YYYY-MM-DD" or null
            public string NoiCapCCCD { get; set; }
            public string NgheNghiep { get; set; }
            public string LienHeKhan { get; set; }
            public string SDTKhan { get; set; }
            public string DiaChi { get; set; }
            public string QueQuan { get; set; }
            public string GhiChu { get; set; }
        }

        public class TaoTaiKhoanRequest
        {
            // Tab 0
            public string FullName { get; set; }
            public string Username { get; set; }
            public string Phone { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }

            // Tab 1
            public string CCCD { get; set; }
            public string NgaySinh { get; set; }
            public string GioiTinh { get; set; }
            public string QueQuan { get; set; }
            public string DiaChiThuongTru { get; set; }
            public string GhiChu { get; set; }
            public string ExtraRoles { get; set; }

            // Tab 2
            public int? IDPhong { get; set; }
            public string NgayBatDauHD { get; set; }
            public string NgayKetThucHD { get; set; }
            public int DienDauKy { get; set; }
            public int NuocDauKy { get; set; }
            public decimal TienCocHD { get; set; }
            public string GhiChuHD { get; set; }
        }
        // ─── Controller Action ─────────────────────────────────────────
        [HttpPost("tao-tai-khoan")]
        public async Task<IActionResult> TaoTaiKhoan([FromBody] TaoTaiKhoanRequest request)
        {
            // ══════════════════════════════════════════════════════════
            // 1. VALIDATE — Tab 0 fields are always required
            // ══════════════════════════════════════════════════════════
            if (string.IsNullOrWhiteSpace(request.FullName)
             || string.IsNullOrWhiteSpace(request.Username)
             || string.IsNullOrWhiteSpace(request.Phone)
             || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Vui lòng điền đầy đủ thông tin bắt buộc." });
            }

            request.Username = request.Username.Trim();
            request.FullName = request.FullName.Trim();
            request.Phone = request.Phone.Replace(" ", "").Trim();

            if (request.Username.Length > 50)
                return BadRequest(new { message = "Username không được vượt quá 50 ký tự." });

            if (!Regex.IsMatch(request.Username, @"^[a-zA-Z0-9_]{3,50}$"))
                return BadRequest(new { message = "Username chỉ gồm chữ, số, gạch dưới (3–50 ký tự)." });

            if (!Regex.IsMatch(request.FullName, @"^[\p{L}\s]+$"))
                return BadRequest(new { message = "Họ tên không được chứa số hoặc ký tự đặc biệt." });

            if (!Regex.IsMatch(request.Phone, @"^0[0-9]{9}$"))
                return BadRequest(new { message = "Số điện thoại phải là 10 chữ số, bắt đầu bằng 0." });

            if (!string.IsNullOrWhiteSpace(request.Email)
             && !Regex.IsMatch(request.Email, @"^[^\s@]+@[^\s@]+\.[^\s@]+$"))
                return BadRequest(new { message = "Email không đúng định dạng." });

            if (request.Password.Length < 6)
                return BadRequest(new { message = "Mật khẩu phải có ít nhất 6 ký tự." });

            // CCCD on tab 1 — only validate if provided
            if (!string.IsNullOrWhiteSpace(request.CCCD)
             && !Regex.IsMatch(request.CCCD, @"^[0-9]{9}$|^[0-9]{12}$"))
                return BadRequest(new { message = "CCCD phải là 9 hoặc 12 chữ số." });

            // ══════════════════════════════════════════════════════════
            // 2. DUPLICATE CHECK
            // ══════════════════════════════════════════════════════════
            bool trungLap = await _context.ACCOUNT.AnyAsync(u =>
                u.Username == request.Username || u.Phone == request.Phone);

            if (trungLap)
                return BadRequest(new { message = "Tên đăng nhập hoặc số điện thoại đã tồn tại." });

            // ══════════════════════════════════════════════════════════
            // 3. CREATE ACCOUNT
            // ══════════════════════════════════════════════════════════
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var newUser = new ACCOUNT
            {
                Username = request.Username,
                FullName = request.FullName,
                Passwords = passwordHash,
                Phone = request.Phone,
                Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
                Roles = "Manager",
                ExtraRoles = string.IsNullOrWhiteSpace(request.ExtraRoles) ? null : request.ExtraRoles.Trim(),
                QR_Link = "abc",
                IsActive = true,
                CreatedAt = DateTime.Now,
            };

            _context.ACCOUNT.Add(newUser);
            await _context.SaveChangesAsync();

            static DateTime? ParseDate(string s) =>
                !string.IsNullOrWhiteSpace(s) && DateTime.TryParse(s, out var d) ? d : null;

            var newKhachThue = new KHACH_THUE
            {
                IDUser = newUser.IDUser,
                HoTen = request.FullName,
                SoDienThoai = request.Phone,
                SoCCCD = string.IsNullOrWhiteSpace(request.CCCD) ? null : request.CCCD.Trim(),
                NgaySinh = ParseDate(request.NgaySinh),
                GioiTinh = string.IsNullOrWhiteSpace(request.GioiTinh) ? null : request.GioiTinh,
                QueQuan = string.IsNullOrWhiteSpace(request.QueQuan) ? null : request.QueQuan.Trim(),
                DiaChiThuongTru = string.IsNullOrWhiteSpace(request.DiaChiThuongTru) ? null : request.DiaChiThuongTru.Trim(),
                GhiChu = string.IsNullOrWhiteSpace(request.GhiChu) ? null : request.GhiChu.Trim(),
            };
            _context.KHACH_THUE.Add(newKhachThue);

            // ══════════════════════════════════════════════════════════
            // 5. CREATE HOPDONG + UPDATE PHONG  — only if room selected
            //    AND a start date was provided (both are required to
            //    form a meaningful contract)
            // ══════════════════════════════════════════════════════════
            bool coPhong = request.IDPhong.HasValue && request.IDPhong > 0;
            bool coNgayBD = !string.IsNullOrWhiteSpace(request.NgayBatDauHD);

            if (coPhong && coNgayBD)
            {
                // Verify the room exists and is available
                var phong = await _context.PHONG.FindAsync(request.IDPhong.Value);
                if (phong == null)
                    return BadRequest(new { message = $"Không tìm thấy phòng ID {request.IDPhong}." });

                if (phong.TrangThai == "Đã thuê")
                    return BadRequest(new { message = $"Phòng {phong.SoPhong} đang có người thuê." });

                DateTime ngayBD = DateTime.Parse(request.NgayBatDauHD);
                DateTime? ngayKT = ParseDate(request.NgayKetThucHD);

                if (ngayKT.HasValue && ngayKT.Value <= ngayBD)
                    return BadRequest(new { message = "Ngày kết thúc hợp đồng phải sau ngày bắt đầu." });

                var newHopDong = new HOPDONG
                {
                    IDUser = newUser.IDUser,
                    IDPhong = request.IDPhong.Value,
                    NgayBatDau = ngayBD,
                    NgayKetThuc = ngayKT,
                    DienDauKy = request.DienDauKy,
                    NuocDauKy = request.NuocDauKy,
                    TienCocBanDau = request.TienCocHD,
                    GhiChu = string.IsNullOrWhiteSpace(request.GhiChuHD) ? null : request.GhiChuHD.Trim(),
                    TrangThaiHD = "Đang hiệu lực",
                    GiaThueChot = phong.GiaPhongFix,
                };

                _context.HOPDONG.Add(newHopDong);

                // Mark room as occupied
                phong.TrangThai = "Đã thuê";
            }

            // ══════════════════════════════════════════════════════════
            // 6. SAVE ALL REMAINING CHANGES IN ONE CALL
            // ══════════════════════════════════════════════════════════
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tạo tài khoản quản lý thành công!",
                idUser = newUser.IDUser,
                coHopDong = coPhong && coNgayBD,
            });
        }
        [HttpGet("danh-sach-quan-ly")]
        public async Task<IActionResult> LayDanhSachQuanLy()
        {
            var ds = await _context.ACCOUNT
                .Where(u => u.Roles == "Manager" && u.IsActive)   // ✅ "Manager", có lọc IsActive
                .OrderBy(u => u.FullName)
                .Select(u => new {
                    u.IDUser,
                    u.Username,
                    u.FullName,
                    u.Phone,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(ds);
        }
        [HttpGet("danh-sach-nguoi-thue")]
        public async Task<IActionResult> LayDanhSachNguoiThue()
        {
            var ds = await _context.ACCOUNT
                .Where(u => u.Roles == "Tenant" && u.IsActive)
                .OrderBy(u => u.FullName)
                .Select(u => new {
                    u.IDUser,
                    u.Username,
                    u.FullName,
                    u.Phone,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(ds);
        }
        [HttpGet("chi-tiet-nguoi-thue/{id}")]
        public async Task<IActionResult> LayChiTietNguoiThue(int id)
        {
            // 1. JOIN Account -> HopDong -> Phong để lấy thông tin phòng hiện tại
            var chiTiet = await _context.ACCOUNT
                .Where(u => u.IDUser == id && u.Roles == "Tenant" && u.IsActive)
                .Select(u => new
                {
                    u.IDUser,
                    u.FullName,
                    u.Phone,
                    u.Username,
                    u.Email,
                    // Tìm hợp đồng đang hiệu lực của người này để lấy thông tin phòng
                    HopDongHienTai = u.HopDongTenants
                        .Where(hd => hd.TrangThaiHD == "Đang hiệu lực")
                        .Select(hd => new
                        {
                            hd.Phong.SoPhong,
                            hd.Phong.GiaPhongFix
                        }).FirstOrDefault() // Mỗi người thường chỉ có 1 hợp đồng đang active
                })
                .FirstOrDefaultAsync();

            if (chiTiet == null)
            {
                return NotFound(new { message = "Không tìm thấy người thuê hoặc tài khoản đã bị khóa." });
            }

            // 2. Lấy đơn giá điện, nước, rác từ bảng CONFIG_GIA (nếu có)
            var configGia = await _context.CONFIG_GIA
                .Where(c => c.IsActive)
                .ToListAsync();

            // Dựa vào MaDichVu của bạn để lấy đúng giá (Giả sử mã của bạn là DIEN, NUOC, RAC)
            var giaDien = configGia.FirstOrDefault(c => c.MaDichVu == "DIEN")?.DonGia ?? 0;
            var giaNuoc = configGia.FirstOrDefault(c => c.MaDichVu == "NUOC")?.DonGia ?? 0;
            var giaRac = configGia.FirstOrDefault(c => c.MaDichVu == "RAC")?.DonGia ?? 0;

            // 3. Map dữ liệu thành object JSON khớp chính xác với biến JS ở Frontend
            var result = new
            {
                idUser = chiTiet.IDUser,
                fullName = chiTiet.FullName,
                sdt = chiTiet.Phone, // Frontend của bạn đang gọi nt.sdt nên ở đây trả về 'sdt'
                cccd = "Chưa cập nhật (Thiếu trong DB)", // TODO: Thêm cột CCCD vào DB
        
                // Trích xuất từ Hợp Đồng/Phòng
                soPhong = chiTiet.HopDongHienTai != null ? chiTiet.HopDongHienTai.SoPhong : "Chưa xếp phòng",
                giaPhong = chiTiet.HopDongHienTai != null ? chiTiet.HopDongHienTai.GiaPhongFix : 0,
        
                // Trích xuất từ Config Giá
                tienDien = giaDien,
                tienNuoc = giaNuoc,
                tienRac = giaRac,
                email = chiTiet.Email
            };

            return Ok(result);
        }
        [HttpGet("DanhSachPhong")]
        public async Task<IActionResult> DanhSachPhong()
        {
            var DSPhong = await _context.PHONG
             .OrderBy(u => u.Khu)      
             .ThenBy(u => u.SoPhong)
             .Select(u => new
            {
                 u.soluong,
                 u.IDPhong,
                u.SoPhong,
                u.Khu,
                u.DienTich,
                u.GiaPhongFix,
                u.MoTa,
                u.TrangThai
            }).ToListAsync();
            return Ok(DSPhong);
        }
        [HttpGet("TyLeLap")]
        public async Task<IActionResult> TyLePhong()
        {

            int tongPhong = await _context.PHONG.CountAsync();
            int soPhongDaThue = await _context.PHONG
            .CountAsync(p => p.TrangThai == "Đã Thuê");

            int Phongtrong = await _context.PHONG
            .CountAsync(i => i.TrangThai == "Trống");

            int PhongBaotri = await _context.PHONG
                .CountAsync(k => k.TrangThai == "Bảo Trì");

            if (tongPhong > 0)
            {
                double tyLe = ((double) soPhongDaThue / tongPhong) *100;
                return Ok(new
                {
                    PhongBaoTri = PhongBaotri,
                    PhongTrong = Phongtrong,
                    PhongThue = soPhongDaThue,
                    tongSoPhong = tongPhong,
                    tyLeLapDay = Math.Round(tyLe)
                });
            }

            return BadRequest(new { message = "Có lỗi xảy ra" });
        }
        [HttpGet("TyLeDoanhThu")]
        public async Task<IActionResult> TyLeDoanhThu()
        {
            var SoLieu = await _context.THONGKE_DOANHTHU_THANG
                .OrderByDescending(t => t.Nam)
                .ThenByDescending(t => t.Thang)
                .FirstOrDefaultAsync();
            var SoLieuCu = await _context.THONGKE_DOANHTHU_THANG
                .OrderByDescending(t => t.Nam)
                .ThenByDescending(t => t.Thang)
                .Skip(1)
                .FirstOrDefaultAsync();

            decimal DoanhThuCu = SoLieuCu.TongCong;
            decimal DoanhThuMoi = SoLieu.TongCong;

            decimal tong = ((DoanhThuMoi - DoanhThuCu) / DoanhThuCu * 100);
            return Ok(new
            {
                thang = SoLieu.Thang,
                DoanhThuT = SoLieu.TongCong,
                TyleDT = tong
            });
        }
        [HttpGet("Profile")]
        public async Task<IActionResult> ProfileChuTro()
        {
            var data = await _context.ACCOUNT
                .Where(x => x.Roles == "admin")
                .FirstOrDefaultAsync();

            return Ok(data);
        }
        [HttpGet("SLTaskBar")]
        public async Task<IActionResult> SoLuongTaskBar()
        {
            int count = await _context.THONGBAO
                   .CountAsync(x => x.LoaiTB == "canh-bao");

            return Ok(new { Dem = count });
        }
    }   

}
