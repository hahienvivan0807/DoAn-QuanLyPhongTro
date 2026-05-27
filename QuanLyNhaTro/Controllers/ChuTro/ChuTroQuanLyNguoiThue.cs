using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Migrations;
using QuanLyNhaTro.Models;
using static QuanLyNhaTro.Controllers.ChuTro.ChuTroQuanLyNguoiThueController;

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

            // BƯỚC 3: Lấy IDHopDong đang hiệu lực (FIX: dùng IDHopDong thay vì IDPhong)
            var idHopDongList = dsHopDongLoc
                .Where(hd => hd.TrangThaiHD == "Đang hiệu lực")
                .Select(hd => hd.IDHopDong)
                .Distinct()
                .ToList();

            // BƯỚC 3b: Lấy TẤT CẢ IDHopDong (kể cả đã kết thúc) — để tìm người ghép bị "mồ côi"
            //          khi chủ phòng trả phòng sớm nhưng người ghép chưa có HĐ mới
            var idHopDongTatCa = dsHopDongLoc
                .Select(hd => hd.IDHopDong)
                .Distinct()
                .ToList();

            // BƯỚC 4: Load người ở ghép — khớp theo IDHopDong để tránh lấy nhầm
            // record của hợp đồng cũ cùng phòng (FIX: dùng IDHopDong thay vì IDPhong)
            // THÊM: cũng load người ghép của HĐ đã kết thúc (NgayRa = null) → họ cần HĐ mới
            var nguoiOGhepRaw = await _context.HOPDONG_KHACHO
                .AsNoTracking()
                .Where(ko =>
                    ko.NgayRa == null &&                        // Vẫn đang ở (chưa rời đi)
                    ko.IsChinhChu == false &&                   // Chỉ lấy người ở ghép
                    (idHopDongList.Contains(ko.IDHopDong)       // Thuộc HĐ đang hiệu lực
                     || (idHopDongTatCa.Contains(ko.IDHopDong) // HOẶC HĐ đã kết thúc nhưng người ghép chưa có HĐ mới
                         && ko.HopDong.TrangThaiHD != "Đang hiệu lực"
                         && !_context.HOPDONG.Any(hd2 => hd2.IDUser == ko.IDUser && hd2.TrangThaiHD == "Đang hiệu lực"))))
                .Select(ko => new {
                    ko.IDKhachO,
                    ko.IDHopDong,                               // FIX: thêm IDHopDong
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
                    HopDongConHieuLuc = ko.HopDong.TrangThaiHD == "Đang hiệu lực",
                })
                .ToListAsync();

            // BƯỚC 5: GroupBy trong memory — mỗi IDUser chỉ lấy record mới nhất
            var idUserChuPhongSet = dsHopDongLoc
                .Select(hd => hd.IDUser)
                .ToHashSet();
            var idUserDaCoHDHieuLuc = nguoiOGhepRaw
    .Where(ko => ko.HopDongConHieuLuc)
    .Select(ko => ko.IDUser)
    .ToHashSet();

            var nguoiGhepMoCoi = nguoiOGhepRaw
                .Where(ko => !ko.HopDongConHieuLuc
                          && !idUserChuPhongSet.Contains(ko.IDUser)
                          && !idUserDaCoHDHieuLuc.Contains(ko.IDUser)) // ← add this
                .GroupBy(ko => ko.IDPhong)
                .ToDictionary(g => g.Key, g => g.ToList());
            // FIX: group theo IDHopDong (không phải IDPhong) để tránh duplicate
            // khi cùng một phòng có nhiều hợp đồng lịch sử
            var nguoiOGhepDict = nguoiOGhepRaw
                .Where(ko => !idUserChuPhongSet.Contains(ko.IDUser))
                .GroupBy(ko => new { ko.IDHopDong, ko.IDUser })  // dedup mỗi người trong 1 HĐ
                .Select(g => g.OrderByDescending(x => x.IDKhachO).First())
                .GroupBy(ko => ko.IDHopDong)                     // FIX: group theo IDHopDong
                .ToDictionary(g => g.Key, g => g.ToList());



            // BƯỚC 6: Ghép kết quả — lookup theo IDHopDong
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
                // FIX: lookup theo IDHopDong thay vì IDPhong
                NguoiOGhep = nguoiOGhepDict.ContainsKey(hd.IDHopDong)
                    ? nguoiOGhepDict[hd.IDHopDong]
                        .Where(ko => ko.IDUser != hd.IDUser)
                        .ToList()
                   : nguoiOGhepRaw.Where(_ => false).ToList(),
                // THÊM: người ghép mồ côi thuộc phòng này (HĐ cũ đã kết thúc, cần lập HĐ mới)
                NguoiGhepCanHopDong = nguoiGhepMoCoi.ContainsKey(hd.IDPhong)
                    ? nguoiGhepMoCoi[hd.IDPhong]
                        .Where(ko => ko.IDUser != hd.IDUser)
                        .ToList()
                    : nguoiOGhepRaw.Where(_ => false).ToList(),
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
            // 1. Khóa tài khoản chủ phòng
            var account = await _context.ACCOUNT.FindAsync(idUser);
            if (account == null) return NotFound(new { success = false, message = "Không tìm tài khoản" });
            account.IsActive = false;

            // 2. Kết thúc hợp đồng đang hiệu lực
            var hopDong = await _context.HOPDONG
                .Where(hd => hd.IDUser == idUser && hd.TrangThaiHD == "Đang hiệu lực")
                .FirstOrDefaultAsync();

            var nguoiGhepConLai = new List<object>();

            if (hopDong != null)
            {
                hopDong.TrangThaiHD = "Đã kết thúc";
                hopDong.NgayKetThuc = DateTime.Today;
                if (!string.IsNullOrWhiteSpace(dto?.GhiChu))
                    hopDong.GhiChu = dto.GhiChu;

                // 3. Đặt phòng về Trống
                var phong = await _context.PHONG.FindAsync(hopDong.IDPhong);
                if (phong != null) phong.TrangThai = "Trống";

                // 4. Chỉ đóng record của CHÍNH CHỦ PHÒNG (IsChinhChu = true)
                //    Giữ nguyên NgayRa = null cho người ở ghép → họ vẫn hiển thị trên bảng
                //    và có thể được thiết lập hợp đồng mới (trở thành chủ phòng)
                var khachOCuaHD = await _context.HOPDONG_KHACHO
                    .Where(ko => ko.IDHopDong == hopDong.IDHopDong && ko.NgayRa == null)
                    .ToListAsync();

                foreach (var ko in khachOCuaHD)
                {
                    if (ko.IsChinhChu == true || ko.IDUser == idUser)
                    {
                        // Đóng record của chủ phòng
                        ko.NgayRa = DateTime.Today;
                    }
                    else
                    {
                        // Người ở ghép: giữ nguyên để hiển thị trên bảng
                        // Trả về danh sách để frontend hiện modal tạo hợp đồng mới
                        nguoiGhepConLai.Add(new
                        {
                            ko.IDKhachO,
                            ko.IDUser,
                            ko.HoTen,
                            ko.SoDienThoai,
                            ko.SoCCCD,
                            ko.QuanHe,
                            IDPhong = hopDong.IDPhong,
                            SoPhong = phong?.SoPhong ?? "",
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new
            {
                success = true,
                message = "Đã trả phòng thành công",
                nguoiGhepConLai,       // Danh sách người ở ghép còn lại (cần tạo HĐ mới)
                coNguoiGhep = nguoiGhepConLai.Count > 0
            });
        }

        // GET: api/ChuTroQuanLyNguoiThue/nguoi-ghep-can-hop-dong
        // Trả về danh sách người ở ghép đang không có hợp đồng hiệu lực
        // (hợp đồng gốc đã kết thúc nhưng NgayRa vẫn null — chủ phòng đã trả phòng sớm)
        [HttpGet("nguoi-ghep-can-hop-dong")]
        public async Task<IActionResult> GetNguoiGhepCanHopDong()
        {
            var ds = await _context.HOPDONG_KHACHO
                .AsNoTracking()
                .Where(ko =>
                    ko.NgayRa == null &&
                    ko.IsChinhChu == false &&
                    ko.HopDong.TrangThaiHD != "Đang hiệu lực") // HĐ gốc đã kết thúc
                .Select(ko => new
                {
                    ko.IDKhachO,
                    ko.IDUser,
                    ko.HoTen,
                    ko.SoDienThoai,
                    ko.SoCCCD,
                    ko.NgaySinh,
                    ko.GioiTinh,
                    ko.QuanHe,
                    ko.NgayVao,
                    IDPhong = ko.HopDong.IDPhong,
                    SoPhong = ko.HopDong.Phong.SoPhong,
                    IDHopDongCu = ko.IDHopDong,
                })
                .ToListAsync();

            return Ok(new { success = true, danhSach = ds });
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

        // PUT: api/ChuTroQuanLyNguoiThue/nguoi-ghep/roi-di/{idKhachO}
        [HttpPut("nguoi-ghep/roi-di/{idKhachO}")]
        public async Task<IActionResult> NguoiGhepRoiDi(int idKhachO, [FromBody] NguoiGhepRoiDiDto dto)
        {
            var khachO = await _context.HOPDONG_KHACHO
                .Include(k => k.HopDong)
                .FirstOrDefaultAsync(k => k.IDKhachO == idKhachO);
            if (khachO == null) return NotFound(new { success = false, message = "Không tìm thấy" });

            // Đánh dấu ngày ra
            khachO.NgayRa = DateTime.Today;
            if (!string.IsNullOrWhiteSpace(dto?.GhiChu))
                khachO.GhiChu = dto.GhiChu;

            // Khóa tài khoản (giữ account, chỉ IsActive = false)
            var acc = await _context.ACCOUNT.FindAsync(khachO.IDUser);
            if (acc != null)
            {
                acc.IsActive = false;
                acc.UpdatedAt = DateTime.UtcNow;
            }

            // Giảm số lượng người ở trong phòng
            var phong = await _context.PHONG.FindAsync(khachO.HopDong.IDPhong);
            if (phong != null && phong.soluong > 0)
                phong.soluong -= 1;

            // KHÔNG kết thúc hợp đồng — hợp đồng vẫn thuộc chủ phòng (IsChinhChu=true)

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

            // Đánh dấu NgayRa cho TẤT CẢ record cũ của người này
            var cacRecordCu = await _context.HOPDONG_KHACHO
                .Where(ko => ko.IDUser == khachO.IDUser && ko.NgayRa == null)
                .ToListAsync();
            foreach (var record in cacRecordCu)
                record.NgayRa = DateTime.Today;

            await _context.SaveChangesAsync();

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

            await _context.SaveChangesAsync(); // hdMoi now has a real IDHopDong

            // ── BƯỚC X: Thu thập người ghép còn lại TRƯỚC khi lưu KHACHO của chủ mới ──
            //
            // Query lúc này: hdMoi đã tồn tại nhưng chưa có KHACHO nào → chưa bị đếm vào
            // idUserDaCoHDHieuLuc khi ta kiểm tra qua HOPDONG_KHACHO.
            // Điều kiện tìm kiếm:
            //   - Cùng phòng (IDPhong == phong.IDPhong)
            //   - Hợp đồng gốc đã kết thúc (TrangThaiHD == "Đã kết thúc")
            //   - Chưa chính thức rời đi (NgayRa == null)
            //   - Là người ở ghép (IsChinhChu == false)
            //   - Không phải người vừa ký HĐ mới (IDUser != khachO.IDUser)
            var nguoiGhepCanGan = await _context.HOPDONG_KHACHO
                .Include(ko => ko.HopDong)
                .Where(ko =>
                    ko.HopDong.IDPhong == phong.IDPhong &&
                    ko.HopDong.TrangThaiHD == "Đã kết thúc" &&
                    ko.NgayRa == null &&
                    ko.IsChinhChu == false &&
                    ko.IDUser != khachO.IDUser)
                .ToListAsync();
            // ── KẾT THÚC thu thập ──

            // Thêm record HOPDONG_KHACHO cho chủ phòng mới
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

            // Kích hoạt lại tài khoản cho người ghép thành chủ phòng
            var account = await _context.ACCOUNT.FindAsync(khachO.IDUser);
            if (account != null) account.IsActive = true;

            // ── BƯỚC X (tiếp theo): Gán người ghép còn lại vào hợp đồng mới ──
            //
            // Dùng danh sách đã thu thập trước khi chủ mới được thêm vào KHACHO,
            // nên không lo bị nhiễm bởi trạng thái mới của hdMoi.
            var idUserDaXuLy = new HashSet<int>();

            foreach (var nguoiGhep in nguoiGhepCanGan)
            {
                if (!idUserDaXuLy.Add(nguoiGhep.IDUser))
                    continue; // đã xử lý IDUser này rồi (dedup)

                // 1. Đóng TẤT CẢ record cũ còn mở của người này
                var recordsCuNguoiGhep = await _context.HOPDONG_KHACHO
                    .Where(ko => ko.IDUser == nguoiGhep.IDUser && ko.NgayRa == null)
                    .ToListAsync();
                foreach (var rec in recordsCuNguoiGhep)
                    rec.NgayRa = DateTime.Today;

                // 2. Lấy thông tin tài khoản để điền vào record mới
                var accNguoiGhep = await _context.ACCOUNT.FindAsync(nguoiGhep.IDUser);

                // 3. Tạo record HOPDONG_KHACHO mới trong hợp đồng vừa được tạo
                _context.HOPDONG_KHACHO.Add(new HOPDONG_KHACHO
                {
                    IDHopDong = hdMoi.IDHopDong,
                    IDUser = nguoiGhep.IDUser,
                    HoTen = nguoiGhep.HoTen,
                    SoCCCD = nguoiGhep.SoCCCD,
                    NgaySinh = nguoiGhep.NgaySinh,
                    GioiTinh = nguoiGhep.GioiTinh,
                    SoDienThoai = accNguoiGhep?.Phone ?? nguoiGhep.SoDienThoai,
                    QuanHe = nguoiGhep.QuanHe ?? "Người ở ghép",
                    IsChinhChu = false,
                    NgayVao = dto.NgayBatDau,
                    NgayRa = null,
                    GhiChu = nguoiGhep.GhiChu,
                });

                // 4. Kích hoạt lại tài khoản của người ghép (nếu bị khoá)
                if (accNguoiGhep != null && !accNguoiGhep.IsActive)
                {
                    accNguoiGhep.IsActive = true;
                    accNguoiGhep.UpdatedAt = DateTime.UtcNow;
                }
            }

            // Lưu tất cả: KHACHO chủ mới + KHACH_THUE + người ghép được gán lại
            await _context.SaveChangesAsync();
            // ── KẾT THÚC BƯỚC X ──

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

        [HttpPut("cap-nhat/{idHopDong}")]
        public async Task<IActionResult> CapNhatNguoiThue(int idHopDong, [FromBody] CapNhatNguoiThueDto dto)
        {
            // Tìm hợp đồng
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
        [HttpPut("tra-phong-v2/{idUser}")]
        public async Task<IActionResult> TraPhongV2(int idUser, [FromBody] TraPhongV2Dto dto)
        {
            // 1. Find the active contract for this user
            var hopDong = await _context.HOPDONG
                .Include(h => h.Phong)
                .FirstOrDefaultAsync(h => h.IDUser == idUser && h.TrangThaiHD == "Đang hiệu lực");

            if (hopDong == null)
                return NotFound(new { success = false, message = "Không tìm thấy hợp đồng đang hiệu lực" });

            // 2. Lock the main tenant's account
            var account = await _context.ACCOUNT.FindAsync(idUser);
            if (account != null) account.IsActive = false;

            // 3. End the contract
            hopDong.TrangThaiHD = "Đã kết thúc";
            hopDong.NgayKetThuc = dto.NgayThanhLy ?? DateTime.Today;
            hopDong.LyDoKetThuc = dto.LyDo;
            hopDong.NgayThanhLy = dto.NgayThanhLy ?? DateTime.Today;

            // 4. Get all active HOPDONG_KHACHO records for this contract
            var tatCaKhachO = await _context.HOPDONG_KHACHO
                .Where(ko => ko.IDHopDong == hopDong.IDHopDong && ko.NgayRa == null)
                .ToListAsync();

            // 5. Always close the main tenant's own KHACHO record
            var chiChiChu = tatCaKhachO.FirstOrDefault(ko => ko.IDUser == idUser || ko.IsChinhChu);
            if (chiChiChu != null) chiChiChu.NgayRa = dto.NgayThanhLy ?? DateTime.Today;

            // 6. Process each roommate per the landlord's decision
            var idNguoiRoiDi = dto.IDUserRoiDi ?? new List<int>();
            var nguoiOLai = new List<object>();

            foreach (var ko in tatCaKhachO.Where(ko => ko.IDUser != idUser && !ko.IsChinhChu))
            {
                if (idNguoiRoiDi.Contains(ko.IDUser))
                {
                    // Roommate leaves with main tenant
                    ko.NgayRa = dto.NgayThanhLy ?? DateTime.Today;
                    var accRoiDi = await _context.ACCOUNT.FindAsync(ko.IDUser);
                    if (accRoiDi != null) accRoiDi.IsActive = false;
                }
                else
                {
                    // Roommate stays — NgayRa stays NULL, appears in "needs new contract" list
                    nguoiOLai.Add(new
                    {
                        ko.IDKhachO,
                        ko.IDUser,
                        ko.HoTen,
                        ko.SoDienThoai,
                        ko.SoCCCD,
                        ko.QuanHe,
                        ko.NgayVao,
                        IDPhong = hopDong.IDPhong,
                        SoPhong = hopDong.Phong?.SoPhong ?? ""
                    });
                }
            }

            // 7. Set room to Trống only if NO one is staying
            if (!nguoiOLai.Any())
                hopDong.Phong.TrangThai = "Trống";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Đã thanh lý hợp đồng thành công",
                nguoiOLai,
                coNguoiOLai = nguoiOLai.Any()
            });
        }
        [HttpGet("tim-nguoi-thue")]
        public async Task<IActionResult> TimNguoiThue(
    [FromQuery] string? q,
    [FromQuery] int? idPhong)
        {
            var query = _context.ACCOUNT
                .AsNoTracking()
                .Where(a => a.Roles == "Tenant");

            if (!string.IsNullOrWhiteSpace(q))
            {
                var lower = q.ToLower();
                query = query.Where(a =>
                    a.FullName.ToLower().Contains(lower) ||
                    a.Phone.Contains(q) ||
                    (a.Email != null && a.Email.ToLower().Contains(lower)));
            }

            // Exclude users already in an active contract on this specific room
            if (idPhong.HasValue)
            {
                var activeUsers = await _context.HOPDONG
                    .Where(h => h.IDPhong == idPhong && h.TrangThaiHD == "Đang hiệu lực")
                    .SelectMany(h => _context.HOPDONG_KHACHO
                        .Where(ko => ko.IDHopDong == h.IDHopDong && ko.NgayRa == null)
                        .Select(ko => ko.IDUser))
                    .ToListAsync();

                query = query.Where(a => !activeUsers.Contains(a.IDUser));
            }

            var results = await query
                .OrderByDescending(a => a.UpdatedAt)
                .Take(20)
                .Select(a => new
                {
                    a.IDUser,
                    a.FullName,
                    a.Phone,
                    a.Email,
                    a.IsActive,
                    // Pull extra info from KHACH_THUE
                    KhachThue = _context.KHACH_THUE
                        .Where(kt => kt.IDUser == a.IDUser)
                        .Select(kt => new { kt.SoCCCD, kt.GioiTinh, kt.QueQuan, kt.AnhChanDung })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(new { success = true, danhSach = results });
        }
        [HttpPost("them-nguoi-co-san/{idHopDong}")]
        public async Task<IActionResult> ThemNguoiCoSan(int idHopDong, [FromBody] ThemNguoiCoSanDto dto)
        {
            var hopDong = await _context.HOPDONG
                .Include(h => h.Phong)
                .FirstOrDefaultAsync(h => h.IDHopDong == idHopDong && h.TrangThaiHD == "Đang hiệu lực");

            if (hopDong == null)
                return NotFound(new { success = false, message = "Hợp đồng không tồn tại hoặc đã kết thúc" });

            var daCoTrong = await _context.HOPDONG_KHACHO.AnyAsync(ko =>
                ko.IDHopDong == idHopDong &&
                ko.IDUser == dto.IDUser &&
                ko.NgayRa == null);

            if (daCoTrong)
                return BadRequest(new { success = false, message = "Người này đã đang ở trong phòng này" });

            var account = await _context.ACCOUNT.FindAsync(dto.IDUser);
            if (account == null)
                return NotFound(new { success = false, message = "Không tìm thấy tài khoản" });

            // ── FIX: Đóng TẤT CẢ record cũ còn mở của người này trước khi thêm mới ──
            var recordsCu = await _context.HOPDONG_KHACHO
                .Where(ko => ko.IDUser == dto.IDUser && ko.NgayRa == null)
                .ToListAsync();
            foreach (var r in recordsCu)
                r.NgayRa = DateTime.Today;
            // ────────────────────────────────────────────────────────────────────────

            var khachThue = await _context.KHACH_THUE
                .FirstOrDefaultAsync(kt => kt.IDUser == dto.IDUser);

            var khachO = new HOPDONG_KHACHO
            {
                IDHopDong = idHopDong,
                IDUser = dto.IDUser,
                HoTen = account.FullName,
                SoCCCD = khachThue?.SoCCCD ?? dto.SoCCCD,
                NgaySinh = khachThue?.NgaySinh ?? dto.NgaySinh,
                GioiTinh = khachThue?.GioiTinh ?? dto.GioiTinh,
                SoDienThoai = account.Phone,
                QuanHe = dto.QuanHe ?? "Người ở ghép",
                IsChinhChu = false,
                NgayVao = dto.NgayVao ?? DateTime.Today,
                NgayRa = null,
                GhiChu = dto.GhiChu,
            };

            _context.HOPDONG_KHACHO.Add(khachO);

            if (!account.IsActive)
            {
                account.IsActive = true;
                account.UpdatedAt = DateTime.UtcNow;
            }
            if (hopDong.Phong != null)
                hopDong.Phong.soluong += 1;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Đã thêm {account.FullName} vào phòng {hopDong.Phong?.SoPhong}",
                idKhachO = khachO.IDKhachO
            });
        }
        [HttpGet("nguoi-ghep-trong-phong/{idHopDong}")]
        public async Task<IActionResult> GetNguoiGhepTrongPhong(int idHopDong)
        {
            var danhSach = await _context.HOPDONG_KHACHO
                .AsNoTracking()
                .Where(ko => ko.IDHopDong == idHopDong && ko.NgayRa == null && ko.IsChinhChu == false)
                .Select(ko => new
                {
                    ko.IDKhachO,
                    ko.IDUser,
                    ko.HoTen,
                    ko.SoDienThoai,
                    ko.SoCCCD,
                    ko.QuanHe,
                    ko.NgayVao,
                    ko.GioiTinh,
                })
                .ToListAsync();

            return Ok(new { success = true, danhSach });
        }
        public class TraPhongV2Dto
        {
            public DateTime? NgayThanhLy { get; set; }
            public string? LyDo { get; set; }
            /// <summary>IDUser values of roommates who are LEAVING with the main tenant</summary>
            public List<int>? IDUserRoiDi { get; set; }
        }

        public class ThemNguoiCoSanDto
        {
            public int IDUser { get; set; }
            public string? QuanHe { get; set; }
            public DateTime? NgayVao { get; set; }
            public string? GhiChu { get; set; }
            // Fallback fields if KHACH_THUE record doesn't exist yet
            public string? SoCCCD { get; set; }
            public DateTime? NgaySinh { get; set; }
            public string? GioiTinh { get; set; }
        }
    }
}
