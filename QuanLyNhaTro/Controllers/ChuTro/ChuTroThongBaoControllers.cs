using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;

namespace QuanLyNhaTro.Controllers.ChuTro
{
    [ApiController]
    [Route("api/thongbao")]
    public class ChuTroThongBaoControllers : ControllerBase
    {
        private readonly QuanLyKhuNhaTro _context;

        public ChuTroThongBaoControllers(QuanLyKhuNhaTro context)
        {
            _context = context;
        }

        public class GuiThongBaoRequest
        {
            public string TieuDe { get; set; }
            public string NoiDung { get; set; }
            public string LoaiTB { get; set; }       // thong-tin | canh-bao | khan-cap | he-thong
            public string LoaiNguon { get; set; }    // HeThong | DonDV | HoaDon ...
            public int? IDNguonTB { get; set; }
            public int? IDUser { get; set; }          // null = gửi tất cả
            public string LoaiGui { get; set; }       // all | phong | nguoi
            public DateTime NgayGui { get; set; }
        }

        [HttpPost("gui")]
        public async Task<IActionResult> GuiThongBao([FromBody] GuiThongBaoRequest req)
        {
            // Validate
            if (string.IsNullOrWhiteSpace(req.TieuDe))
                return BadRequest(new { success = false, message = "Tiêu đề không được để trống." });

            if (string.IsNullOrWhiteSpace(req.NoiDung))
                return BadRequest(new { success = false, message = "Nội dung không được để trống." });

            if (string.IsNullOrWhiteSpace(req.LoaiGui))
                return BadRequest(new { success = false, message = "Loại gửi không hợp lệ." });

            var danhSachTB = new List<THONGBAO>();

            if (req.LoaiGui == "all")
            {
                // Gửi cho tất cả Tenant đang active
                var danhSachUser = await _context.ACCOUNT
                    .Where(u => u.Roles == "Tenant" && u.IsActive)
                    .Select(u => u.IDUser)
                    .ToListAsync();

                foreach (var uid in danhSachUser)
                {
                    danhSachTB.Add(TaoThongBao(req, uid));
                }
            }
            else if (req.LoaiGui == "quan-ly")
            {
                // Lấy danh sách IDUser của các tài khoản có role là Manager (hoặc Admin) đang active
                var danhSachQuanLy = await _context.ACCOUNT
                    .Where(u => (u.Roles == "Manager" || u.Roles == "Admin") && u.IsActive)
                    .Select(u => u.IDUser)
                    .ToListAsync();

                if (!danhSachQuanLy.Any())
                    return BadRequest(new { success = false, message = "Không có quản lý nào đang hoạt động trong hệ thống." });

                foreach (var uid in danhSachQuanLy)
                {
                    danhSachTB.Add(TaoThongBao(req, uid));
                }
            }
            else if (req.LoaiGui == "phong")
            {
                if (req.IDNguonTB == null)
                    return BadRequest(new { success = false, message = "Chưa chọn phòng." });

                // Tìm tenant đang có hợp đồng hiệu lực tại phòng này
                var danhSachUser = await _context.HOPDONG
                    .Where(hd => hd.IDPhong == req.IDNguonTB && hd.TrangThaiHD == "Đang hiệu lực")
                    .Select(hd => hd.IDUser)
                    .Distinct()
                    .ToListAsync();

                if (!danhSachUser.Any())
                    return BadRequest(new { success = false, message = "Phòng này không có người thuê đang hoạt động." });

                foreach (var uid in danhSachUser)
                {
                    danhSachTB.Add(TaoThongBao(req, uid));
                }
            }
            else if (req.LoaiGui == "nguoi")
            {
                if (req.IDUser == null)
                    return BadRequest(new { success = false, message = "Chưa chọn người thuê." });

                var tonTai = await _context.ACCOUNT
                    .AnyAsync(u => u.IDUser == req.IDUser && u.Roles == "Tenant" && u.IsActive);

                if (!tonTai)
                    return BadRequest(new { success = false, message = "Người thuê không tồn tại hoặc đã bị khóa." });

                danhSachTB.Add(TaoThongBao(req, req.IDUser.Value));
            }
            else
            {
                return BadRequest(new { success = false, message = "Loại gửi không hợp lệ." });
            }

            if (!danhSachTB.Any())
                return BadRequest(new { success = false, message = "Không có người nhận nào hợp lệ." });

            await _context.THONGBAO.AddRangeAsync(danhSachTB);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = $"Đã gửi {danhSachTB.Count} thông báo thành công." });
        }

        private THONGBAO TaoThongBao(GuiThongBaoRequest req, int idUser)
        {
            return new THONGBAO
            {
                IDUser = idUser,
                IDNguonTB = req.IDNguonTB,
                LoaiNguon = string.IsNullOrWhiteSpace(req.LoaiNguon) ? "HeThong" : req.LoaiNguon,
                TieuDe = req.TieuDe.Trim(),
                NoiDung = req.NoiDung.Trim(),
                LoaiTB = req.LoaiTB ?? "thong-tin",
                DaDoc = false,
                NgayTao = req.NgayGui != default ? req.NgayGui : DateTime.Now
            };
        }
    }
}