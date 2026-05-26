using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

namespace QuanLyNhaTro.Controllers.ChuTro
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChuTroQuanLyNguoiThueController : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;
        private readonly IConfiguration _configuration;

        public ChuTroQuanLyNguoiThueController(QuanLyKhuNhaTro context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        [HttpGet("ds-nguoi-thue")]
        public async Task<IActionResult> GetDanhSachNguoiThue()
        {
            // BƯỚC 1: Load tất cả hợp đồng
            var dsHopDong = await _context.HOPDONG
                .AsNoTracking()
                .OrderByDescending(hd => hd.NgayBatDau)
                .Select(hd => new
                {
                    hd.IDHopDong,
                    hd.IDUser,
                    hd.IDPhong,
                    hd.NgayBatDau,
                    hd.NgayKetThuc,
                    hd.TienCocBanDau,
                    hd.TrangThaiHD,
                    hd.GhiChu,
                    hd.DienDauKy,
                    hd.NuocDauKy,
                    TenKhachThue = hd.Tenant.FullName,
                    SoDienThoai = hd.Tenant.Phone,
                    Email = hd.Tenant.Email,
                    Username = hd.Tenant.Username,
                    IsActive = hd.Tenant.IsActive,
                    SoPhong = hd.Phong.SoPhong,
                    KhachThue = _context.KHACH_THUE
                        .Where(kt => kt.IDUser == hd.IDUser)
                        .Select(kt => new {
                            kt.IDKhachThue,
                            kt.HoTen,
                            kt.SoCCCD,
                            kt.NgaySinh,
                            kt.GioiTinh,
                            kt.SoDienThoai,
                            kt.QueQuan,
                            kt.DiaChiThuongTru,
                            kt.AnhChanDung,
                            kt.GhiChu,
                            kt.NgayVaoO,
                        })
                        .FirstOrDefault(),
                    SoNgayConLai = hd.NgayKetThuc.HasValue
                        ? (int?)EF.Functions.DateDiffDay(DateTime.UtcNow, hd.NgayKetThuc.Value)
                        : null
                })
                .ToListAsync();

            // BƯỚC 2: Mỗi IDUser chỉ giữ 1 hợp đồng mới nhất
            // (ưu tiên "Đang hiệu lực", nếu không có thì lấy hợp đồng gần nhất)
            var dsHopDongLoc = dsHopDong
                .GroupBy(hd => hd.IDUser)
                .Select(g =>
                    g.FirstOrDefault(hd => hd.TrangThaiHD == "Đang hiệu lực")
                    ?? g.OrderByDescending(hd => hd.NgayBatDau).First()
                )
                .ToList();

            // BƯỚC 3: Lấy IDPhong đang hiệu lực
            var idPhongList = dsHopDongLoc
                .Where(hd => hd.TrangThaiHD == "Đang hiệu lực")
                .Select(hd => hd.IDPhong)
                .Distinct()
                .ToList();

            // BƯỚC 4: Load người ở ghép riêng
            var nguoiOGhepRaw = await _context.HOPDONG_KHACHO
                .AsNoTracking()
                .Where(ko =>
                    ko.NgayRa == null &&
                    ko.IsChinhChu == false &&
                    idPhongList.Contains(ko.HopDong.IDPhong) &&
                    ko.HopDong.TrangThaiHD == "Đang hiệu lực")
                .Select(ko => new {
                    ko.IDKhachO,
                    ko.IDUser,
                    ko.HoTen,
                    ko.SoCCCD,
                    ko.NgaySinh,
                    ko.GioiTinh,
                    ko.SoDienThoai,
                    ko.QuanHe,
                    ko.IsChinhChu,
                    ko.NgayVao,
                    ko.NgayRa,
                    ko.GhiChu,
                    IDPhong = ko.HopDong.IDPhong,
                    IDUserChuPhong = ko.HopDong.IDUser,
                })
                .ToListAsync();

            // BƯỚC 5: GroupBy trong memory — mỗi IDUser chỉ lấy record mới nhất
            var nguoiOGhepDict = nguoiOGhepRaw
                .GroupBy(ko => new { ko.IDPhong, ko.IDUser })
                .Select(g => g.OrderByDescending(x => x.IDKhachO).First())
                .GroupBy(ko => ko.IDPhong)
                .ToDictionary(g => g.Key, g => g.ToList());

            // BƯỚC 6: Ghép kết quả
            var ketQua = dsHopDongLoc.Select(hd => new
            {
                hd.IDHopDong,
                hd.IDUser,
                hd.IDPhong,
                hd.NgayBatDau,
                hd.NgayKetThuc,
                hd.TienCocBanDau,
                hd.TrangThaiHD,
                hd.GhiChu,
                hd.DienDauKy,
                hd.NuocDauKy,
                hd.TenKhachThue,
                hd.SoDienThoai,
                hd.Email,
                hd.Username,
                hd.IsActive,
                hd.SoPhong,
                hd.KhachThue,
                hd.SoNgayConLai,
                NguoiOGhep = nguoiOGhepDict.ContainsKey(hd.IDPhong)
                    ? nguoiOGhepDict[hd.IDPhong]
                        .Where(ko => ko.IDUser != hd.IDUser)
                        .ToList()
                    : nguoiOGhepRaw.Take(0).ToList()
            });

            return Ok(new { success = true, danhSach = ketQua });
        }

        [HttpGet("ds-phong")]
        public async Task<IActionResult> GetDanhSachPhong([FromQuery] string? trangThai, [FromQuery] string? tuKhoa)
        {
            var query = _context.PHONG.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(trangThai))
                query = query.Where(p => p.TrangThai == trangThai);

            if (!string.IsNullOrWhiteSpace(tuKhoa))
                query = query.Where(p => p.SoPhong.Contains(tuKhoa));

            var dsPhong = await query
                .OrderBy(p => p.Khu)
                .ThenBy(p => p.SoPhong)
                .Select(p => new
                {
                    p.IDPhong,
                    p.SoPhong,
                    p.Khu,
                    p.DienTich,
                    p.GiaPhongFix,
                    p.MoTa,
                    p.TrangThai,
                    p.CreatedAt,

                    HopDong = p.HopDongs
                        .Where(hd => hd.TrangThaiHD == "Đang hiệu lực")
                        .OrderByDescending(hd => hd.NgayBatDau)
                        .Select(hd => new
                        {
                            hd.IDHopDong,
                            hd.IDUser,
                            hd.NgayBatDau,
                            hd.NgayKetThuc,
                            hd.TienCocBanDau,
                            hd.TrangThaiHD,

                            TenKhachThue = hd.Tenant.FullName,
                            SoDienThoai = hd.Tenant.Phone,

                            // ✅ Thêm IsActive từ ACCOUNT
                            IsActive = hd.Tenant.IsActive,

                            SoNgayConLai = hd.NgayKetThuc.HasValue
                                ? (int?)EF.Functions.DateDiffDay(DateTime.UtcNow, hd.NgayKetThuc.Value)
                                : null
                        })
                        .FirstOrDefault()
                })
                .ToListAsync();

            var thongKe = new
            {
                TongPhong = dsPhong.Count,
                PhongTrong = dsPhong.Count(p => p.TrangThai == "Trống"),
                PhongDaThue = dsPhong.Count(p => p.TrangThai == "Đã thuê"),
                PhongDangSua = dsPhong.Count(p => p.TrangThai == "Đang sửa"),
            };

            return Ok(new { success = true, thongKe, danhSach = dsPhong });
        }
        // PUT: api/ChuTroQuanLyNguoiThue/tra-phong/{idUser}
        [HttpPut("tra-phong/{idUser}")]
        public async Task<IActionResult> TraPhong(int idUser, [FromBody] TraPhongDto dto)
        {
            // 1. Khóa tài khoản
            var account = await _context.ACCOUNT.FindAsync(idUser);
            if (account == null) return NotFound(new { success = false, message = "Không tìm tài khoản" });
            account.IsActive = false;

            // 2. Kết thúc hợp đồng đang hiệu lực
            var hopDong = await _context.HOPDONG
                .Where(hd => hd.IDUser == idUser && hd.TrangThaiHD == "Đang hiệu lực")
                .FirstOrDefaultAsync();

            if (hopDong != null)
            {
                hopDong.TrangThaiHD = "Đã kết thúc";
                hopDong.NgayKetThuc = DateTime.Today;
                if (!string.IsNullOrWhiteSpace(dto?.GhiChu))
                    hopDong.GhiChu = dto.GhiChu;

                // 3. Đặt phòng về Trống
                var phong = await _context.PHONG.FindAsync(hopDong.IDPhong);
                if (phong != null) phong.TrangThai = "Trống";
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã trả phòng thành công" });
        }

        // PUT: api/ChuTroQuanLyNguoiThue/khoi-phuc/{idUser}
        [HttpPut("khoi-phuc/{idUser}")]
        public async Task<IActionResult> KhoiPhuc(int idUser)
        {
            var account = await _context.ACCOUNT.FindAsync(idUser);
            if (account == null) return NotFound(new { success = false, message = "Không tìm tài khoản" });

            account.IsActive = true;
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã khôi phục tài khoản" });
        }

        // DTO
        public class TraPhongDto
        {
            public string? GhiChu { get; set; }
        }
        [HttpGet("account/{idUser}")]
        public async Task<IActionResult> GetAccount(int idUser)
        {
            var acc = await _context.ACCOUNT
                .AsNoTracking()
                .Where(a => a.IDUser == idUser)
                .Select(a => new {
                    a.IDUser,
                    a.Username,
                    a.Email,
                    a.FullName,
                    a.Phone,
                    a.IsActive
                })
                .FirstOrDefaultAsync();

            if (acc == null)
                return NotFound(new { success = false });

            return Ok(new { success = true, username = acc.Username, email = acc.Email });
        }
        [HttpGet("ds-phong-dang-thue")]
        public async Task<IActionResult> GetPhongDangThue()
        {
            var dsPhong = await _context.PHONG
                .AsNoTracking()
                .Where(p => p.TrangThai == "Đã thuê")
                .OrderBy(p => p.Khu)
                .ThenBy(p => p.SoPhong)
                .Select(p => new
                {
                    p.IDPhong,
                    p.SoPhong,
                    p.Khu,
                    p.DienTich,
                    p.GiaPhongFix,
                    p.TrangThai,
                    p.soluong,

                    // Lấy hợp đồng đang hiệu lực, kèm danh sách người ở
                    HopDong = p.HopDongs
                        .Where(hd => hd.TrangThaiHD == "Đang hiệu lực")
                        .OrderByDescending(hd => hd.NgayBatDau)
                        .Select(hd => new
                        {
                            hd.IDHopDong,
                            TenChuPhong = hd.Tenant.FullName,
                            SdtChuPhong = hd.Tenant.Phone,
                            SoNguoiOHienTai = hd.KhachO
                                .Count(ko => ko.NgayRa == null),
                            NguoiO = hd.KhachO
                                .Where(ko => ko.NgayRa == null)
                                .Select(ko => new
                                {
                                    ko.IDKhachO,
                                    ko.HoTen,
                                    ko.SoDienThoai,
                                    ko.IsChinhChu
                                })
                                .ToList()
                        })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(new { success = true, danhSach = dsPhong });
        }
        // DELETE người ở ghép — khóa tài khoản + đánh dấu NgayRa
        [HttpPut("nguoi-ghep/roi-di/{idKhachO}")]
        public async Task<IActionResult> NguoiGhepRoiDi(int idKhachO, [FromBody] NguoiGhepRoiDiDto dto)
        {
            var khachO = await _context.HOPDONG_KHACHO.FindAsync(idKhachO);
            if (khachO == null) return NotFound(new { success = false, message = "Không tìm thấy" });

            // Đánh dấu ngày ra
            khachO.NgayRa = DateTime.Today;
            if (!string.IsNullOrWhiteSpace(dto?.GhiChu))
                khachO.GhiChu = dto.GhiChu;

            // Khóa tài khoản
            var acc = await _context.ACCOUNT.FindAsync(khachO.IDUser);
            if (acc != null) acc.IsActive = false;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã gỡ người ở ghép" });
        }

        // POST tạo hợp đồng mới cho người ở ghép (thăng lên chủ phòng)
        [HttpPost("nguoi-ghep/tao-hop-dong/{idKhachO}")]
        public async Task<IActionResult> TaoHopDongChoNguoiGhep(int idKhachO, [FromBody] TaoHDNguoiGhepDto dto)
        {
            var khachO = await _context.HOPDONG_KHACHO
                .Include(k => k.HopDong).ThenInclude(h => h.Phong)
                .FirstOrDefaultAsync(k => k.IDKhachO == idKhachO);

            if (khachO == null) return NotFound(new { success = false, message = "Không tìm thấy" });

            var phong = khachO.HopDong.Phong;

            var hdCu = await _context.HOPDONG
                .Where(h => h.IDPhong == phong.IDPhong && h.TrangThaiHD == "Đang hiệu lực")
                .FirstOrDefaultAsync();
            if (hdCu != null) return BadRequest(new { success = false, message = "Phòng vẫn còn hợp đồng hiệu lực" });

            // ── FIX: Đánh dấu NgayRa cho TẤT CẢ record cũ của người này ──────
            var cacRecordCu = await _context.HOPDONG_KHACHO
                .Where(ko => ko.IDUser == khachO.IDUser && ko.NgayRa == null)
                .ToListAsync();
            foreach (var record in cacRecordCu)
            {
                record.NgayRa = DateTime.Today;
            }
            // ──────────────────────────────────────────────────────────────────

            // Tạo hợp đồng mới
            var hdMoi = new HOPDONG
            {
                IDUser = khachO.IDUser,
                IDPhong = phong.IDPhong,
                NgayBatDau = dto.NgayBatDau,
                NgayKetThuc = dto.NgayKetThuc,
                TienCocBanDau = dto.TienCoc,
                GiaThueChot = dto.GiaThue > 0 ? dto.GiaThue : phong.GiaPhongFix,
                TrangThaiHD = "Đang hiệu lực",
                DienDauKy = dto.DienDauKy,
                NuocDauKy = dto.NuocDauKy,
                GhiChu = dto.GhiChu,
            };
            _context.HOPDONG.Add(hdMoi);
            phong.TrangThai = "Đã thuê";

            await _context.SaveChangesAsync();

            _context.HOPDONG_KHACHO.Add(new HOPDONG_KHACHO
            {
                IDHopDong = hdMoi.IDHopDong,
                IDUser = khachO.IDUser,
                HoTen = khachO.HoTen,
                SoCCCD = khachO.SoCCCD,
                NgaySinh = khachO.NgaySinh,
                GioiTinh = khachO.GioiTinh,
                SoDienThoai = khachO.SoDienThoai,
                QuanHe = "Đại diện",
                IsChinhChu = true,
                NgayVao = dto.NgayBatDau,
            });

            var ktExist = await _context.KHACH_THUE.AnyAsync(k => k.IDUser == khachO.IDUser);
            if (!ktExist)
            {
                _context.KHACH_THUE.Add(new KHACH_THUE
                {
                    IDUser = khachO.IDUser,
                    HoTen = khachO.HoTen,
                    SoCCCD = khachO.SoCCCD,
                    NgaySinh = khachO.NgaySinh,
                    GioiTinh = khachO.GioiTinh,
                    SoDienThoai = khachO.SoDienThoai,
                    NgayVaoO = dto.NgayBatDau,
                });
            }

            // ── FIX: Kích hoạt lại tài khoản cho người ghép thành chủ phòng ──
            var account = await _context.ACCOUNT.FindAsync(khachO.IDUser);
            if (account != null) account.IsActive = true;
            // ──────────────────────────────────────────────────────────────────

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã tạo hợp đồng mới", idHopDong = hdMoi.IDHopDong });
        }

        // DTOs
        public class NguoiGhepRoiDiDto { public string? GhiChu { get; set; } }
        public class TaoHDNguoiGhepDto
        {
            public DateTime NgayBatDau { get; set; }
            public DateTime? NgayKetThuc { get; set; }
            public decimal TienCoc { get; set; } = 0;
            public decimal GiaThue { get; set; } = 0;
            public int DienDauKy { get; set; } = 0;
            public int NuocDauKy { get; set; } = 0;
            public string? GhiChu { get; set; }
        }
        // Trong ChuTroThemNguoiThueController.cs
        [HttpPut("cap-nhat/{idHopDong}")]
        public async Task<IActionResult> CapNhatNguoiThue(int idHopDong, [FromBody] CapNhatNguoiThueDto dto)
        {
            // Tìm hop dong
            var hopDong = await _context.HOPDONG
                .Include(h => h.Phong)
                .FirstOrDefaultAsync(h => h.IDHopDong == idHopDong);

            if (hopDong == null)
                return NotFound(new { success = false, message = "Không tìm thấy hợp đồng" });

            // Cập nhật ACCOUNT
            var account = await _context.ACCOUNT.FindAsync(hopDong.IDUser);
            if (account != null)
            {
                if (!string.IsNullOrWhiteSpace(dto.HoTen)) account.FullName = dto.HoTen;
                if (!string.IsNullOrWhiteSpace(dto.SoDienThoai)) account.Phone = dto.SoDienThoai;
                if (dto.Email != null) account.Email = dto.Email;
                if (!string.IsNullOrWhiteSpace(dto.Username)) account.Username = dto.Username;
                account.UpdatedAt = DateTime.UtcNow;
            }

            // Cập nhật KHACH_THUE
            var khachThue = await _context.KHACH_THUE
                .FirstOrDefaultAsync(k => k.IDUser == hopDong.IDUser);
            if (khachThue != null)
            {
                if (!string.IsNullOrWhiteSpace(dto.HoTen)) khachThue.HoTen = dto.HoTen;
                if (!string.IsNullOrWhiteSpace(dto.SoDienThoai)) khachThue.SoDienThoai = dto.SoDienThoai;
                if (dto.NgaySinh.HasValue) khachThue.NgaySinh = dto.NgaySinh;
                if (dto.GioiTinh != null) khachThue.GioiTinh = dto.GioiTinh;
                if (dto.SoCCCD != null) khachThue.SoCCCD = dto.SoCCCD;
                if (dto.QueQuan != null) khachThue.QueQuan = dto.QueQuan;
                if (dto.DiaChiThuongTru != null) khachThue.DiaChiThuongTru = dto.DiaChiThuongTru;
                if (dto.GhiChu != null) khachThue.GhiChu = dto.GhiChu;
            }

            // Cập nhật HOPDONG (chỉ các field được phép)
            if (dto.NgayKetThuc.HasValue) hopDong.NgayKetThuc = dto.NgayKetThuc;
            if (dto.TienCoc.HasValue) hopDong.TienCocBanDau = dto.TienCoc.Value;
            if (dto.GhiChuHD != null) hopDong.GhiChu = dto.GhiChuHD;
            hopDong.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Cập nhật thành công" });
        }

        // DTO
        public class CapNhatNguoiThueDto
        {
            public string? HoTen { get; set; }
            public string? SoDienThoai { get; set; }
            public string? Email { get; set; }
            public string? Username { get; set; }
            public DateTime? NgaySinh { get; set; }
            public string? GioiTinh { get; set; }
            public string? SoCCCD { get; set; }
            public string? NgayCapCCCD { get; set; }
            public string? NoiCapCCCD { get; set; }
            public string? NgheNghiep { get; set; }
            public string? LienHeKhan { get; set; }
            public string? SDTKhan { get; set; }
            public string? DiaChi { get; set; }
            public string? TinhThanh { get; set; }
            public string? QueQuan { get; set; }
            public string? GhiChu { get; set; }
            public string? AnhChanDung { get; set; }
            public string? DiaChiThuongTru { get; set; }
            public DateTime? NgayKetThuc { get; set; }
            public decimal? TienCoc { get; set; }
            public string? GhiChuHD { get; set; }
        }
    }
}