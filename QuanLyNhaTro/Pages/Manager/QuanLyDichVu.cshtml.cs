using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Security.Claims;

namespace QuanLyNhaTro.Pages.Manager
{
    // =====================================================================
    // DTO: Đơn dịch vụ (DONDV) dùng để hiển thị trên UI
    // =====================================================================

    public class DonDichVuViewModel
    {
        public int IDDonDV { get; set; }
        public string SoPhong { get; set; } = "";
        public string TenKhach { get; set; } = "";
        public string LoaiDV { get; set; } = "";
        public string? NoiDung { get; set; }
        public decimal TongTien { get; set; }
        public string TrangThai_DV { get; set; } = "";
        public string? GhiChuXuLy { get; set; }
        public DateTime NgayTao { get; set; }
        public string? AnhBienLai { get; set; }
    }

    // =====================================================================
    // DTO: Điện nước (DIENNUOC) dùng để hiển thị
    // =====================================================================
    public class DienNuocViewModel
    {
        public int IDGhiNhan { get; set; }
        public string SoPhong { get; set; } = "";
        public string KyGhiNhan { get; set; } = "";
        public int SoDienMoi { get; set; }
        public int SoDienCu { get; set; }
        public int SoNuocMoi { get; set; }
        public int SoNuocCu { get; set; }
        public string AnhChupDongHo { get; set; } = "";
        public string? AnhChupDongHoNuoc { get; set; }
        public byte TrangThaiDuyet { get; set; } // 0=Chờ | 1=Duyệt | 2=Từ chối
        public DateTime NgayGhi { get; set; }
    }

    // =====================================================================
    // DTO: Config đơn giá (CONFIG_GIA)
    // =====================================================================
    public class ConfigGiaViewModel
    {
        public int IDConfig { get; set; }
        public string TenDichVu { get; set; } = "";
        public string MaDichVu { get; set; } = "";
        public decimal DonGia { get; set; }
        public string DonVi { get; set; } = "";
        public bool IsActive { get; set; }
    }

    // =====================================================================
    // PAGE MODEL
    // =====================================================================
    public class QuanLyDichVuModel : PageModel
    {
        private readonly IConfiguration _cfg;
        private string ConnStr => _cfg.GetConnectionString("QuanLyKhuNhaTro")!;

        public QuanLyDichVuModel(IConfiguration cfg) => _cfg = cfg;
        public string ChucVu { get; set; } = "Manager";

        // ---------- Thông tin header (lấy từ Session / Identity) ----------
        public string TenNguoiDung { get; set; } = "Quản lý";
        public int SoThongBaoChuaDoc { get; set; }

        // ---------- Stat counters ----------
        public int SoDonChoXuLy { get; set; } // tổng đơn nước + giặt chờ xử lý
        public int SoDonNuocChoBinhChoXuLy { get; set; }
        public int SoDonGiatSayChoXuLy { get; set; }
        public int SoDienNuocChoDuyet { get; set; }
        public int SoPhongNoDV { get; set; }
        public decimal TongTienNoDV { get; set; }

        // ---------- Danh sách ----------
        public List<DonDichVuViewModel> DanhSachDonNuoc { get; set; } = new();
        public List<DonDichVuViewModel> DanhSachDonGiatSay { get; set; } = new();
        public List<DonDichVuViewModel> DanhSachNoDV { get; set; } = new();
        public List<DienNuocViewModel> DanhSachDienNuoc { get; set; } = new();
        public List<ConfigGiaViewModel> DanhSachConfig { get; set; } = new();

        // ---------- Toast ----------
        [TempData] public string? ThongBao { get; set; }
        [TempData] public string? LoaiThongBao { get; set; }

        // =====================================================================
        // GET
        // =====================================================================
        public async Task OnGetAsync()
        {
            var claim = User.FindFirst("FullName") ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name);
            if (claim != null) TenNguoiDung = claim.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            if (roleClaim != null) ChucVu = roleClaim.Value switch
            {
                "Admin" => "Quản trị viên",
                "Manager" => "Quản lý",
                "Staff" => "Nhân viên",
                _ => roleClaim.Value
            };

            // Lấy idManager từ Claims để truyền vào LoadAllAsync
            var idManagerStr = User.FindFirst("IDUser")?.Value
                            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(idManagerStr, out int idManager);
            await LoadAllAsync(idManager);
        }

        // =====================================================================
        // HANDLER: Nhập giá + Xác nhận đã giao nước bình
        //   → TrangThai_DV: "Chờ xử lý" → "Chờ thanh toán"
        //   → Gửi thông báo cho khách
        // =====================================================================
        public IActionResult OnPostNhapGiaNuocVaGiao(int idDonDV, string? ghiChuXuLy)
        {
            try
            {
                using var conn = OpenConn();
                // Kiểm tra quyền: phòng của đơn có thuộc danh sách phân công không
                var idMgrStr1 = User.FindFirst("IDUser")?.Value
                            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int.TryParse(idMgrStr1, out int idMgr1);
                var phong1 = LayPhongDuocPhanCong(conn, idMgr1);
                if (!phong1.Contains(GetIDPhongFromDon(conn, idDonDV)))
                {
                    ThongBao = "Không có quyền xử lý đơn này.";
                    LoaiThongBao = "danger";
                    return RedirectToPage();
                }

                // 1) Lấy IDUser và thông tin đơn
                int idUser = GetIDUserFromDon(conn, idDonDV);
                string soPhong = GetSoPhongFromDon(conn, idDonDV);

                // 2) Lấy đơn giá nước bình từ CONFIG_GIA (quản lý không được tự nhập giá)
                decimal tongTien = 0;
                using (var cmd = new SqlCommand(
                    "SELECT TOP 1 DonGia FROM dbo.CONFIG_GIA WHERE MaDichVu = N'NUOC_BINH' AND IsActive = 1", conn))
                {
                    var v = cmd.ExecuteScalar();
                    if (v != null && v != DBNull.Value) tongTien = Convert.ToDecimal(v);
                }

                // Nếu không có config thì lấy từ TongTien đã có trong đơn
                if (tongTien == 0)
                {
                    using var cmd2 = new SqlCommand(
                        "SELECT TongTien FROM dbo.DONDV WHERE IDDonDV = @ID", conn);
                    cmd2.Parameters.AddWithValue("@ID", idDonDV);
                    var v2 = cmd2.ExecuteScalar();
                    if (v2 != null && v2 != DBNull.Value) tongTien = Convert.ToDecimal(v2);
                }

                // 3) Cập nhật đơn → Chờ thanh toán
                ExecNonQuery(conn, @"
                    UPDATE dbo.DONDV
                    SET TongTien    = @TongTien,
                        TrangThai_DV= N'Chờ thanh toán',
                        GhiChuXuLy  = @GhiChu,
                        NgayXuLy    = GETDATE(),
                        UpdatedAt   = GETDATE()
                    WHERE IDDonDV = @ID",
                    P("@ID", idDonDV),
                    P("@TongTien", tongTien),
                    P("@GhiChu", (object?)ghiChuXuLy ?? DBNull.Value));

                // 4) Gửi thông báo cho khách
                if (idUser > 0)
                    GuiThongBao(conn, idUser, idDonDV, "DonDV",
                        "Nước bình đã được giao — vui lòng thanh toán",
                        $"Đơn nước bình phòng {soPhong} đã được giao. Số tiền: {tongTien:N0} đ. " +
                        "Vui lòng thanh toán và gửi ảnh chuyển khoản để xác nhận.",
                        "thanh-toan");

                ThongBao = $"Đã xác nhận giao nước phòng {soPhong}. Tiền: {tongTien:N0} đ.";
                LoaiThongBao = "success";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi: {ex.Message}";
                LoaiThongBao = "danger";
            }
            return RedirectToPage();
        }

        // =====================================================================
        // HANDLER: Xác nhận khách đã thanh toán nước bình (sau khi gửi ảnh CK)
        //   → TrangThai_DV: "Chờ thanh toán" → "Thành công"
        // =====================================================================
        public IActionResult OnPostXacNhanThanhToanNuoc(int idDonDV)
        {
            try
            {
                using var conn = OpenConn();
                // Kiểm tra quyền
                var idMgrStr2 = User.FindFirst("IDUser")?.Value
                            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int.TryParse(idMgrStr2, out int idMgr2);
                var phong2 = LayPhongDuocPhanCong(conn, idMgr2);
                if (!phong2.Contains(GetIDPhongFromDon(conn, idDonDV)))
                {
                    ThongBao = "Không có quyền xử lý đơn này.";
                    LoaiThongBao = "danger";
                    return RedirectToPage();
                }
                int idUser = GetIDUserFromDon(conn, idDonDV);
                string soPhong = GetSoPhongFromDon(conn, idDonDV);

                ExecNonQuery(conn, @"
                    UPDATE dbo.DONDV
                    SET TrangThai_DV  = N'Thành công',
                        NgayHoanThanh = GETDATE(),
                        UpdatedAt     = GETDATE()
                    WHERE IDDonDV = @ID",
                    P("@ID", idDonDV));

                if (idUser > 0)
                    GuiThongBao(conn, idUser, idDonDV, "DonDV",
                        "Thanh toán nước bình đã được xác nhận",
                        $"Quản lý đã xác nhận thanh toán đơn nước bình phòng {soPhong}. Cảm ơn bạn!",
                        "thong-tin");

                ThongBao = $"Đã xác nhận thanh toán đơn nước bình phòng {soPhong}.";
                LoaiThongBao = "success";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi: {ex.Message}";
                LoaiThongBao = "danger";
            }
            return RedirectToPage();
        }

        // =====================================================================
        // HANDLER: Xác nhận khách đã thanh toán giặt sấy (sau khi gửi ảnh CK)
        //   → TrangThai_DV: "Chờ thanh toán" → "Thành công"
        // =====================================================================
        public IActionResult OnPostXacNhanThanhToanGiatSay(int idDonDV)
        {
            try
            {
                using var conn = OpenConn();
                var idMgrStr = User.FindFirst("IDUser")?.Value
                            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int.TryParse(idMgrStr, out int idMgr);
                var phong = LayPhongDuocPhanCong(conn, idMgr);
                if (!phong.Contains(GetIDPhongFromDon(conn, idDonDV)))
                {
                    ThongBao = "Không có quyền xử lý đơn này.";
                    LoaiThongBao = "danger";
                    return RedirectToPage();
                }
                int idUser = GetIDUserFromDon(conn, idDonDV);
                string soPhong = GetSoPhongFromDon(conn, idDonDV);

                ExecNonQuery(conn, @"
                    UPDATE dbo.DONDV
                    SET TrangThai_DV  = N'Thành công',
                        NgayHoanThanh = GETDATE(),
                        UpdatedAt     = GETDATE()
                    WHERE IDDonDV = @ID AND LoaiDV = N'Giặt sấy'",
                    P("@ID", idDonDV));

                if (idUser > 0)
                    GuiThongBao(conn, idUser, idDonDV, "DonDV",
                        "Thanh toán giặt sấy đã được xác nhận",
                        $"Quản lý đã xác nhận thanh toán đơn giặt sấy phòng {soPhong}. Cảm ơn bạn!",
                        "thong-tin");

                ThongBao = $"Đã xác nhận thanh toán đơn giặt sấy phòng {soPhong}.";
                LoaiThongBao = "success";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi: {ex.Message}";
                LoaiThongBao = "danger";
            }
            return RedirectToPage();
        }

        // =====================================================================
        // HANDLER: Nhắc nhở khách thanh toán nước bình (không đổi trạng thái)
        // =====================================================================
        public IActionResult OnPostNhacNhoThanhToanNuoc(int idDonDV)
        {
            try
            {
                using var conn = OpenConn();
                // Kiểm tra quyền
                var idMgrStr3 = User.FindFirst("IDUser")?.Value
                            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int.TryParse(idMgrStr3, out int idMgr3);
                var phong3 = LayPhongDuocPhanCong(conn, idMgr3);
                if (!phong3.Contains(GetIDPhongFromDon(conn, idDonDV)))
                {
                    ThongBao = "Không có quyền xử lý đơn này.";
                    LoaiThongBao = "danger";
                    return RedirectToPage();
                }
                int idUser = GetIDUserFromDon(conn, idDonDV);
                string soPhong = GetSoPhongFromDon(conn, idDonDV);

                // Lấy số tiền để nhắc
                decimal tongTien = 0;
                using (var cmd = new SqlCommand(
                    "SELECT TongTien FROM dbo.DONDV WHERE IDDonDV = @ID", conn))
                {
                    cmd.Parameters.AddWithValue("@ID", idDonDV);
                    var v = cmd.ExecuteScalar();
                    if (v != null && v != DBNull.Value) tongTien = Convert.ToDecimal(v);
                }

                if (idUser > 0)
                    GuiThongBao(conn, idUser, idDonDV, "DonDV",
                        "Nhắc nhở thanh toán nước bình",
                        $"Đơn nước bình phòng {soPhong} số tiền {tongTien:N0} đ chưa được thanh toán. " +
                        "Vui lòng thanh toán và gửi ảnh xác nhận sớm để tránh bị cộng vào hóa đơn tháng.",
                        "canh-bao");

                ThongBao = $"Đã gửi nhắc nhở thanh toán đến khách phòng {soPhong}.";
                LoaiThongBao = "warning";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi: {ex.Message}";
                LoaiThongBao = "danger";
            }
            return RedirectToPage();
        }

        // =====================================================================
        // HANDLER: Nhắc nhở khách về khoản nợ DV bất kỳ (từ tab Nợ dịch vụ)
        // =====================================================================
        public IActionResult OnPostNhacNhoDichVu(int idDonDV)
        {
            try
            {
                using var conn = OpenConn();
                // Kiểm tra quyền
                var idMgrStrN = User.FindFirst("IDUser")?.Value
                            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int.TryParse(idMgrStrN, out int idMgrN);
                var phongN = LayPhongDuocPhanCong(conn, idMgrN);
                if (!phongN.Contains(GetIDPhongFromDon(conn, idDonDV)))
                {
                    ThongBao = "Không có quyền xử lý đơn này.";
                    LoaiThongBao = "danger";
                    return RedirectToPage();
                }

                int idUser = GetIDUserFromDon(conn, idDonDV);
                string soPhong = GetSoPhongFromDon(conn, idDonDV);

                // Lấy thông tin đơn
                decimal tongTien = 0; string loaiDV = "";
                using (var cmd = new SqlCommand(
                    "SELECT TongTien, LoaiDV FROM dbo.DONDV WHERE IDDonDV = @ID", conn))
                {
                    cmd.Parameters.AddWithValue("@ID", idDonDV);
                    using var r = cmd.ExecuteReader();
                    if (r.Read()) { tongTien = r.GetDecimal(0); loaiDV = r.GetString(1); }
                }

                if (idUser > 0)
                    GuiThongBao(conn, idUser, idDonDV, "DonDV",
                        $"Nhắc nhở thanh toán dịch vụ: {loaiDV}",
                        $"Bạn còn khoản nợ dịch vụ {loaiDV} phòng {soPhong} số tiền {tongTien:N0} đ chưa thanh toán. " +
                        "Vui lòng thanh toán sớm để tránh bị cộng vào hóa đơn tháng.",
                        "canh-bao");

                ThongBao = $"Đã gửi nhắc nhở đến khách phòng {soPhong} về khoản nợ {loaiDV}.";
                LoaiThongBao = "warning";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi: {ex.Message}";
                LoaiThongBao = "danger";
            }
            return RedirectToPage();
        }

        // =====================================================================
        // HANDLER: Nhập tiền giặt sấy
        //   → TrangThai_DV: "Chờ xử lý" → "Chờ thanh toán"
        // =====================================================================
        public IActionResult OnPostNhapGiaGiatSay(int idDonDV, decimal tongTien, string? ghiChuXuLy)
        {
            try
            {
                using var conn = OpenConn();
                // Kiểm tra quyền
                var idMgrStr4 = User.FindFirst("IDUser")?.Value
                            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int.TryParse(idMgrStr4, out int idMgr4);
                var phong4 = LayPhongDuocPhanCong(conn, idMgr4);
                if (!phong4.Contains(GetIDPhongFromDon(conn, idDonDV)))
                {
                    ThongBao = "Không có quyền xử lý đơn này.";
                    LoaiThongBao = "danger";
                    return RedirectToPage();
                }
                int idUser = GetIDUserFromDon(conn, idDonDV);
                string soPhong = GetSoPhongFromDon(conn, idDonDV);

                ExecNonQuery(conn, @"
                    UPDATE dbo.DONDV
                    SET TongTien     = @TongTien,
                        TrangThai_DV = N'Chờ thanh toán',
                        GhiChuXuLy   = @GhiChu,
                        NgayXuLy     = GETDATE(),
                        UpdatedAt    = GETDATE()
                    WHERE IDDonDV = @ID",
                    P("@ID", idDonDV),
                    P("@TongTien", tongTien),
                    P("@GhiChu", (object?)ghiChuXuLy ?? DBNull.Value));

                if (idUser > 0)
                    GuiThongBao(conn, idUser, idDonDV, "DonDV",
                        "Giặt sấy hoàn tất — vui lòng thanh toán",
                        $"Đơn giặt sấy phòng {soPhong} đã xong. Số tiền: {tongTien:N0} đ.",
                        "thanh-toan");

                ThongBao = $"Đã gửi báo giá giặt sấy phòng {soPhong}: {tongTien:N0} đ.";
                LoaiThongBao = "success";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi: {ex.Message}";
                LoaiThongBao = "danger";
            }
            return RedirectToPage();
        }

        // =====================================================================
        // HANDLER: Hủy đơn dịch vụ (bất kỳ loại nào đang "Chờ xử lý")
        // =====================================================================
        public IActionResult OnPostHuyDon(int idDonDV)
        {
            try
            {
                using var conn = OpenConn();
                // Kiểm tra quyền
                var idMgrStr5 = User.FindFirst("IDUser")?.Value
                            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int.TryParse(idMgrStr5, out int idMgr5);
                var phong5 = LayPhongDuocPhanCong(conn, idMgr5);
                if (!phong5.Contains(GetIDPhongFromDon(conn, idDonDV)))
                {
                    ThongBao = "Không có quyền xử lý đơn này.";
                    LoaiThongBao = "danger";
                    return RedirectToPage();
                }
                string soPhong = GetSoPhongFromDon(conn, idDonDV);
                ExecNonQuery(conn, @"
                    UPDATE dbo.DONDV
                    SET TrangThai_DV = N'Đã hủy',
                        NguoiHuy     = N'Manager',
                        UpdatedAt    = GETDATE()
                    WHERE IDDonDV = @ID",
                    P("@ID", idDonDV));

                ThongBao = $"Đã hủy đơn dịch vụ phòng {soPhong}.";
                LoaiThongBao = "warning";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi: {ex.Message}";
                LoaiThongBao = "danger";
            }
            return RedirectToPage();
        }

        // =====================================================================
        // HANDLER: Duyệt / Từ chối chỉ số điện nước
        //   chapNhan=true  → TrangThaiDuyet=1 (Đã duyệt)
        //   chapNhan=false → TrangThaiDuyet=2 (Từ chối)
        // =====================================================================
        public IActionResult OnPostDuyetDienNuoc(int idGhiNhan, bool chapNhan, string? ghiChuDuyet)
        {
            try
            {
                using var conn = OpenConn();
                // Kiểm tra quyền: phòng của bản ghi điện nước có thuộc phân công không
                var idMgrStr6 = User.FindFirst("IDUser")?.Value
                            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int.TryParse(idMgrStr6, out int idMgr6);
                var phong6 = LayPhongDuocPhanCong(conn, idMgr6);
                if (!phong6.Contains(GetIDPhongFromDienNuoc(conn, idGhiNhan)))
                {
                    ThongBao = "Không có quyền duyệt bản ghi này.";
                    LoaiThongBao = "danger";
                    return RedirectToPage();
                }
                byte trangThai = chapNhan ? (byte)1 : (byte)2;

                // Lấy IDPhong để gửi thông báo
                int idPhong = 0; string soPhong = ""; int idUser = 0;
                using (var cmd = new SqlCommand(@"
                    SELECT d.IDPhong, p.SoPhong, hd.IDUser
                    FROM dbo.DIENNUOC d
                    JOIN dbo.PHONG p ON p.IDPhong = d.IDPhong
                    LEFT JOIN dbo.HOPDONG hd ON hd.IDPhong = d.IDPhong AND hd.TrangThaiHD = N'Đang hiệu lực'
                    WHERE d.IDGhiNhan = @ID", conn))
                {
                    cmd.Parameters.AddWithValue("@ID", idGhiNhan);
                    using var r = cmd.ExecuteReader();
                    if (r.Read())
                    {
                        idPhong = r.GetInt32(0);
                        soPhong = r.GetString(1);
                        idUser = r.IsDBNull(2) ? 0 : r.GetInt32(2);
                    }
                }

                ExecNonQuery(conn, @"
                    UPDATE dbo.DIENNUOC
                    SET TrangThaiDuyet = @TT,
                        GhiChuDuyet   = @GhiChu,
                        NgayDuyet     = GETDATE()
                    WHERE IDGhiNhan = @ID",
                    P("@TT", trangThai),
                    P("@GhiChu", (object?)ghiChuDuyet ?? DBNull.Value),
                    P("@ID", idGhiNhan));

                // Gửi thông báo cho khách
                if (idUser > 0)
                {
                    string tieuDe = chapNhan
                        ? "Chỉ số điện nước đã được xác nhận"
                        : "Chỉ số điện nước bị từ chối";
                    string nd = chapNhan
                        ? $"Chỉ số điện nước phòng {soPhong} đã được quản lý xác nhận."
                        : $"Chỉ số điện nước phòng {soPhong} bị từ chối. Lý do: {ghiChuDuyet}. Vui lòng gửi lại.";
                    GuiThongBao(conn, idUser, idGhiNhan, "DiemNuoc", tieuDe, nd,
                        chapNhan ? "thong-tin" : "canh-bao");
                }

                ThongBao = chapNhan ? $"Đã duyệt chỉ số điện nước phòng {soPhong}." : $"Đã từ chối chỉ số phòng {soPhong}.";
                LoaiThongBao = chapNhan ? "success" : "warning";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi: {ex.Message}";
                LoaiThongBao = "danger";
            }
            return RedirectToPage();
        }

        // =====================================================================
        // HANDLER: Cộng tất cả nợ DV vào hóa đơn tháng hiện tại
        //   (chỉ các phòng được phân công cho Manager này)
        // =====================================================================
        public IActionResult OnPostChuyenNoDVVaoHD()
        {
            try
            {
                using var conn = OpenConn();

                // Kiểm tra phân công — chỉ cộng nợ các phòng thuộc Manager này
                var idMgrStrCN = User.FindFirst("IDUser")?.Value
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int.TryParse(idMgrStrCN, out int idMgrCN);
                var phongCN = LayPhongDuocPhanCong(conn, idMgrCN);
                if (!phongCN.Any())
                {
                    ThongBao = "Bạn chưa được phân công quản lý phòng nào.";
                    LoaiThongBao = "warning";
                    return RedirectToPage();
                }

                string kyThanhToan = DateTime.Now.ToString("MM/yyyy");

                // Lấy danh sách đơn DV "Chờ thanh toán" chưa được cộng,
                // chỉ trong các phòng được phân công
                using var cmdLayNo = new SqlCommand("", conn);
                var inClauseCN = TaoInClause(phongCN, cmdLayNo, "pcn");
                cmdLayNo.CommandText = $@"
                    SELECT d.IDDonDV, d.IDPhong, d.TongTien
                    FROM dbo.DONDV d
                    WHERE d.TrangThai_DV = N'Chờ thanh toán'
                      AND d.NgayXuLy IS NOT NULL
                      AND d.NgayXuLy < CAST(GETDATE() AS date)
                      AND d.IDPhong IN ({inClauseCN})
                      AND NOT EXISTS (
                          SELECT 1 FROM dbo.DONDV d2
                          WHERE d2.IDDonDV = d.IDDonDV
                            AND d2.GhiChuXuLy LIKE N'%[CONGNO]%'
                      )";

                var danhSachNo = new List<(int IDDonDV, int IDPhong, decimal TongTien)>();
                using (var r = cmdLayNo.ExecuteReader())
                {
                    while (r.Read())
                        danhSachNo.Add((r.GetInt32(0), r.GetInt32(1), r.GetDecimal(2)));
                }

                if (!danhSachNo.Any())
                {
                    ThongBao = "Không có khoản nợ nào cần cộng vào hóa đơn.";
                    LoaiThongBao = "warning";
                    return RedirectToPage();
                }

                // Gom theo phòng
                var noTheoPhong = danhSachNo
                    .GroupBy(x => x.IDPhong)
                    .Select(g => new { IDPhong = g.Key, TongNo = g.Sum(x => x.TongTien), IDDons = g.Select(x => x.IDDonDV).ToList() })
                    .ToList();

                int soPhongDaCapNhat = 0;
                foreach (var phong in noTheoPhong)
                {
                    // Kiểm tra xem tháng này đã có HDTHANG chưa
                    int idHD = 0;
                    using (var cmd = new SqlCommand(@"
                        SELECT IDHDThang FROM dbo.HDTHANG
                        WHERE IDPhong = @IDPhong AND KyThanhToan = @Ky", conn))
                    {
                        cmd.Parameters.AddWithValue("@IDPhong", phong.IDPhong);
                        cmd.Parameters.AddWithValue("@Ky", kyThanhToan);
                        var scalar = cmd.ExecuteScalar();
                        if (scalar != null && scalar != DBNull.Value)
                            idHD = Convert.ToInt32(scalar);
                    }

                    if (idHD > 0)
                    {
                        // Cộng TienNoDV vào hóa đơn hiện tại
                        ExecNonQuery(conn, @"
                            UPDATE dbo.HDTHANG
                            SET TienNoDV    = ISNULL(TienNoDV, 0) + @TongNo,
                                TongCong    = TongCong + @TongNo,
                                DuocCongVaoTro = 1,
                                UpdatedAt   = GETDATE()
                            WHERE IDHDThang = @IDHD",
                            P("@TongNo", phong.TongNo),
                            P("@IDHD", idHD));
                    }

                    // Đánh dấu các đơn DV đã được cộng nợ
                    foreach (var idDon in phong.IDDons)
                    {
                        ExecNonQuery(conn, @"
                            UPDATE dbo.DONDV
                            SET GhiChuXuLy = ISNULL(GhiChuXuLy,'') + N' [CONGNO:' + @Ky + N']',
                                UpdatedAt  = GETDATE()
                            WHERE IDDonDV = @ID",
                            P("@ID", idDon),
                            P("@Ky", kyThanhToan));
                    }
                    soPhongDaCapNhat++;
                }

                ThongBao = $"Đã cộng nợ DV vào hóa đơn tháng {kyThanhToan} cho {soPhongDaCapNhat} phòng.";
                LoaiThongBao = "success";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi: {ex.Message}";
                LoaiThongBao = "danger";
            }
            return RedirectToPage();
        }

        // =====================================================================
        // HANDLER: Đổi trạng thái CONFIG_GIA (kích hoạt / vô hiệu)
        // =====================================================================
        public IActionResult OnPostDoiTrangThaiConfig(int idConfig, bool isActive)
        {
            try
            {
                using var conn = OpenConn();
                ExecNonQuery(conn, @"
                    UPDATE dbo.CONFIG_GIA SET IsActive = @IsActive WHERE IDConfig = @ID",
                    P("@IsActive", !isActive),
                    P("@ID", idConfig));
                ThongBao = isActive ? "Đã vô hiệu hoá đơn giá." : "Đã kích hoạt đơn giá.";
                LoaiThongBao = "success";
            }
            catch (Exception ex) { ThongBao = ex.Message; LoaiThongBao = "danger"; }
            return RedirectToPage();
        }

        // =====================================================================
        // HANDLER: Thêm cấu hình đơn giá mới
        // =====================================================================
        public IActionResult OnPostThemConfig(string tenDichVu, string maDichVu, decimal donGia, string donVi)
        {
            try
            {
                using var conn = OpenConn();
                ExecNonQuery(conn, @"
                    INSERT INTO dbo.CONFIG_GIA (TenDichVu, MaDichVu, DonGia, DonVi, IsActive, NgayApDung)
                    VALUES (@Ten, @Ma, @Gia, @DV, 1, GETDATE())",
                    P("@Ten", tenDichVu), P("@Ma", maDichVu),
                    P("@Gia", donGia), P("@DV", donVi));
                ThongBao = "Đã thêm đơn giá mới.";
                LoaiThongBao = "success";
            }
            catch (Exception ex) { ThongBao = ex.Message; LoaiThongBao = "danger"; }
            return RedirectToPage();
        }

        // =====================================================================
        // LOAD ALL ASYNC — tải toàn bộ dữ liệu một lần, filter theo phòng phân công
        // =====================================================================
        private async Task LoadAllAsync(int idManager)
        {
            try
            {
                using var conn = new SqlConnection(ConnStr);
                await conn.OpenAsync();

                // ── Thông tin admin (từ session trong thực tế; để mock ở đây)
                TenNguoiDung = HttpContext.Session.GetString("FullName") ?? "Quản lý";

                // Data isolation: chỉ xử lý phòng được phân công cho Manager này
                var phongDuocPhanCong = await LayPhongDuocPhanCongAsync(conn, idManager);
                if (!phongDuocPhanCong.Any())
                {
                    // Manager chưa được phân công phòng nào → trả về tập rỗng
                    return;
                }

                // ── Thông báo chưa đọc
                using (var cmd = new SqlCommand(
                    "SELECT COUNT(*) FROM dbo.THONGBAO WHERE DaDoc = 0", conn))
                {
                    var v = await cmd.ExecuteScalarAsync();
                    SoThongBaoChuaDoc = v == null || v == DBNull.Value ? 0 : Convert.ToInt32(v);
                }

                // ── Đơn nước bình (chỉ các phòng được phân công)
                DanhSachDonNuoc = await LayDanhSachDonAsync(conn, "Nước bình", phongDuocPhanCong);
                SoDonNuocChoBinhChoXuLy = DanhSachDonNuoc.Count(d => d.TrangThai_DV == "Chờ xử lý");

                // ── Đơn giặt sấy (chỉ các phòng được phân công)
                DanhSachDonGiatSay = await LayDanhSachDonAsync(conn, "Giặt sấy", phongDuocPhanCong);
                SoDonGiatSayChoXuLy = DanhSachDonGiatSay.Count(d => d.TrangThai_DV == "Chờ xử lý" || d.TrangThai_DV == "Đang xử lý");

                // Tổng đơn chờ xử lý (cho badge sidebar)
                SoDonChoXuLy = SoDonNuocChoBinhChoXuLy + SoDonGiatSayChoXuLy;

                // ── Nợ dịch vụ (chỉ các phòng được phân công)
                DanhSachNoDV = await LayDanhSachNoDVAsync(conn, phongDuocPhanCong);
                SoPhongNoDV = DanhSachNoDV.Select(d => d.SoPhong).Distinct().Count();
                TongTienNoDV = DanhSachNoDV.Sum(d => d.TongTien);

                // ── Điện nước (chỉ các phòng được phân công)
                DanhSachDienNuoc = await LayDanhSachDienNuocAsync(conn, phongDuocPhanCong);
                SoDienNuocChoDuyet = DanhSachDienNuoc.Count(d => d.TrangThaiDuyet == 0);

                // ── Config giá (không phụ thuộc phòng — giữ nguyên)
                DanhSachConfig = LayDanhSachConfig(conn);
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi khi tải dữ liệu: {ex.Message}";
                LoaiThongBao = "danger";
            }
        }

        // ── Lấy danh sách đơn DV theo loại (async + filter phòng) ───────────
        private async Task<List<DonDichVuViewModel>> LayDanhSachDonAsync(
            SqlConnection conn, string loai, List<int> phongDuocPhanCong)
        {
            var list = new List<DonDichVuViewModel>();
            // Tạo IN clause theo danh sách phòng được phân công
            using var cmd = new SqlCommand("", conn);
            var inClause = TaoInClause(phongDuocPhanCong, cmd, "pdpc");
            cmd.CommandText = $@"
                SELECT d.IDDonDV, p.SoPhong,
                       ISNULL(kt.HoTen, a.FullName) AS TenKhach,
                       d.LoaiDV, d.NoiDung, d.TongTien, d.TrangThai_DV,
                       d.GhiChuXuLy, d.NgayTao,
                       d.AnhBienLai
                FROM dbo.DONDV d
                JOIN dbo.PHONG p ON p.IDPhong = d.IDPhong
                JOIN dbo.ACCOUNT a ON a.IDUser = d.IDUser
                LEFT JOIN dbo.KHACH_THUE kt ON kt.IDUser = d.IDUser
                WHERE d.LoaiDV = @Loai
                  AND d.TrangThai_DV NOT IN (N'Đã hủy')
                  AND d.IDPhong IN ({inClause})
                ORDER BY
                    CASE d.TrangThai_DV
                        WHEN N'Chờ xử lý'    THEN 0
                        WHEN N'Đang xử lý'    THEN 0
                        WHEN N'Chờ thanh toán' THEN 1
                        ELSE 2
                    END, d.NgayTao DESC";
            cmd.Parameters.AddWithValue("@Loai", loai);
            using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
                list.Add(new DonDichVuViewModel
                {
                    IDDonDV = r.GetInt32(0),
                    SoPhong = r.GetString(1),
                    TenKhach = r.GetString(2),
                    LoaiDV = r.GetString(3),
                    NoiDung = r.IsDBNull(4) ? null : r.GetString(4),
                    TongTien = r.GetDecimal(5),
                    TrangThai_DV = r.GetString(6),
                    GhiChuXuLy = r.IsDBNull(7) ? null : r.GetString(7),
                    NgayTao = r.GetDateTime(8),
                    AnhBienLai = r.IsDBNull(9) ? null : r.GetString(9),
                });
            return list;
        }

        // ── Đơn DV đang "Chờ thanh toán" & đã quá ngày xử lý → coi là nợ ──
        private async Task<List<DonDichVuViewModel>> LayDanhSachNoDVAsync(
            SqlConnection conn, List<int> phongDuocPhanCong)
        {
            var list = new List<DonDichVuViewModel>();
            using var cmd = new SqlCommand("", conn);
            var inClause = TaoInClause(phongDuocPhanCong, cmd, "pno");
            cmd.CommandText = $@"
                SELECT d.IDDonDV, p.SoPhong,
                       ISNULL(kt.HoTen, a.FullName) AS TenKhach,
                       d.LoaiDV, d.NoiDung, d.TongTien, d.TrangThai_DV,
                       d.GhiChuXuLy, d.NgayTao
                FROM dbo.DONDV d
                JOIN dbo.PHONG p ON p.IDPhong = d.IDPhong
                JOIN dbo.ACCOUNT a ON a.IDUser = d.IDUser
                LEFT JOIN dbo.KHACH_THUE kt ON kt.IDUser = d.IDUser
                WHERE d.TrangThai_DV = N'Chờ thanh toán'
                  AND d.NgayXuLy IS NOT NULL
                  AND d.NgayXuLy < CAST(GETDATE() AS date)
                  AND d.GhiChuXuLy NOT LIKE N'%[CONGNO:%'
                  AND d.IDPhong IN ({inClause})
                ORDER BY d.NgayTao";
            using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
                list.Add(new DonDichVuViewModel
                {
                    IDDonDV = r.GetInt32(0),
                    SoPhong = r.GetString(1),
                    TenKhach = r.GetString(2),
                    LoaiDV = r.GetString(3),
                    NoiDung = r.IsDBNull(4) ? null : r.GetString(4),
                    TongTien = r.GetDecimal(5),
                    TrangThai_DV = r.GetString(6),
                    GhiChuXuLy = r.IsDBNull(7) ? null : r.GetString(7),
                    NgayTao = r.GetDateTime(8),
                });
            return list;
        }

        // ── Điện nước (async + filter phòng) ────────────────────────────────
        private async Task<List<DienNuocViewModel>> LayDanhSachDienNuocAsync(
            SqlConnection conn, List<int> phongDuocPhanCong)
        {
            var list = new List<DienNuocViewModel>();
            using var cmd = new SqlCommand("", conn);
            var inClause = TaoInClause(phongDuocPhanCong, cmd, "pdn");
            // QUAN TRỌNG: Bảng DIENNUOC hiện chỉ có cột AnhChupDongHo (dùng chung cho cả điện lẫn nước).
            // Sau khi chạy migration thêm cột AnhChupDongHoNuoc, câu lệnh dưới sẽ hoạt động đúng.
            // Nếu chưa migrate, AnhChupDongHoNuoc sẽ luôn NULL (ảnh đồng hồ nước không hiển thị được).
            cmd.CommandText = $@"
                SELECT IDGhiNhan, p.SoPhong, KyGhiNhan,
                       SoDienMoi, SoDienCu, SoNuocMoi, SoNuocCu,
                       d.AnhChupDongHo,
                       CASE WHEN COL_LENGTH('dbo.DIENNUOC','AnhChupDongHoNuoc') IS NOT NULL
                            THEN d.AnhChupDongHoNuoc ELSE NULL END AS AnhChupDongHoNuoc,
                       d.TrangThaiDuyet, d.NgayGhi
                FROM dbo.DIENNUOC d
                JOIN dbo.PHONG p ON p.IDPhong = d.IDPhong
                WHERE d.IDPhong IN ({inClause})
                ORDER BY d.NgayGhi DESC";
            using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
                list.Add(new DienNuocViewModel
                {
                    IDGhiNhan = r.GetInt32(0),
                    SoPhong = r.GetString(1),
                    KyGhiNhan = r.GetString(2),
                    SoDienMoi = r.GetInt32(3),
                    SoDienCu = r.GetInt32(4),
                    SoNuocMoi = r.GetInt32(5),
                    SoNuocCu = r.GetInt32(6),
                    AnhChupDongHo = r.GetString(7),
                    AnhChupDongHoNuoc = r.IsDBNull(8) ? null : r.GetString(8),
                    TrangThaiDuyet = r.GetByte(9),
                    NgayGhi = r.GetDateTime(10),
                });
            return list;
        }

        // ── Config giá (đồng bộ) ──────────────────────────────────────────
        private List<ConfigGiaViewModel> LayDanhSachConfig(SqlConnection conn)
        {
            var list = new List<ConfigGiaViewModel>();
            using var cmd = new SqlCommand(
                "SELECT IDConfig, TenDichVu, MaDichVu, DonGia, DonVi, IsActive FROM dbo.CONFIG_GIA ORDER BY TenDichVu",
                conn);
            using var r = cmd.ExecuteReader();
            while (r.Read())
                list.Add(new ConfigGiaViewModel
                {
                    IDConfig = r.GetInt32(0),
                    TenDichVu = r.GetString(1),
                    MaDichVu = r.GetString(2),
                    DonGia = r.GetDecimal(3),
                    DonVi = r.GetString(4),
                    IsActive = r.GetBoolean(5),
                });
            return list;
        }

        // ── Lấy danh sách IDPhong được phân công cho Manager (async) ────────
        private async Task<List<int>> LayPhongDuocPhanCongAsync(SqlConnection conn, int idManager)
        {
            var list = new List<int>();
            using var cmd = new SqlCommand(
                "SELECT IDPhong FROM dbo.PHONG_MANAGER WHERE IDManager = @IDMgr AND IsActive = 1",
                conn);
            cmd.Parameters.AddWithValue("@IDMgr", idManager);
            using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync()) list.Add(r.GetInt32(0));
            return list;
        }

        // ── Lấy danh sách IDPhong được phân công cho Manager (đồng bộ) ─────
        private List<int> LayPhongDuocPhanCong(SqlConnection conn, int idManager)
        {
            var list = new List<int>();
            using var cmd = new SqlCommand(
                "SELECT IDPhong FROM dbo.PHONG_MANAGER WHERE IDManager = @IDMgr AND IsActive = 1",
                conn);
            cmd.Parameters.AddWithValue("@IDMgr", idManager);
            using var r = cmd.ExecuteReader();
            while (r.Read()) list.Add(r.GetInt32(0));
            return list;
        }

        // ── Lấy IDPhong từ DONDV ────────────────────────────────────────────
        private int GetIDPhongFromDon(SqlConnection conn, int idDonDV)
        {
            using var cmd = new SqlCommand(
                "SELECT IDPhong FROM dbo.DONDV WHERE IDDonDV = @ID", conn);
            cmd.Parameters.AddWithValue("@ID", idDonDV);
            var v = cmd.ExecuteScalar();
            return v == null || v == DBNull.Value ? 0 : Convert.ToInt32(v);
        }

        // ── Lấy IDPhong từ DIENNUOC ─────────────────────────────────────────
        private int GetIDPhongFromDienNuoc(SqlConnection conn, int idGhiNhan)
        {
            using var cmd = new SqlCommand(
                "SELECT IDPhong FROM dbo.DIENNUOC WHERE IDGhiNhan = @ID", conn);
            cmd.Parameters.AddWithValue("@ID", idGhiNhan);
            var v = cmd.ExecuteScalar();
            return v == null || v == DBNull.Value ? 0 : Convert.ToInt32(v);
        }

        // ── Lấy IDUser (tenant) từ DONDV ────────────────────────────────────
        private int GetIDUserFromDon(SqlConnection conn, int idDonDV)
        {
            using var cmd = new SqlCommand(
                "SELECT IDUser FROM dbo.DONDV WHERE IDDonDV = @ID", conn);
            cmd.Parameters.AddWithValue("@ID", idDonDV);
            var v = cmd.ExecuteScalar();
            return v == null || v == DBNull.Value ? 0 : Convert.ToInt32(v);
        }

        // ── Lấy SoPhong từ DONDV ────────────────────────────────────────────
        private string GetSoPhongFromDon(SqlConnection conn, int idDonDV)
        {
            using var cmd = new SqlCommand(@"
                SELECT p.SoPhong FROM dbo.DONDV d
                JOIN dbo.PHONG p ON p.IDPhong = d.IDPhong
                WHERE d.IDDonDV = @ID", conn);
            cmd.Parameters.AddWithValue("@ID", idDonDV);
            var v = cmd.ExecuteScalar();
            return v == null || v == DBNull.Value ? "?" : v.ToString()!;
        }

        // ── Gửi thông báo vào bảng THONGBAO ────────────────────────────────
        // Khớp với model THONGBAO:
        //   IDNguoiGui(int?), IDUser(int?), IDNguonTB(int?),
        //   LoaiNguon(string?), TieuDe, NoiDung(string?), LoaiTB, DaDoc, NgayTao
        private void GuiThongBao(
            SqlConnection conn,
            int idNguoiNhan,
            int idNguon,
            string loaiNguon,   // 'DonDV' | 'HoaDon' | 'DiemNuoc' | 'HeThong'
            string tieuDe,
            string? noiDung,
            string loaiTB)      // 'thong-tin' | 'canh-bao' | 'thanh-toan' | 'he-thong'
        {
            ExecNonQuery(conn, @"
                INSERT INTO dbo.THONGBAO
                    (IDNguoiGui, IDUser, IDNguonTB, LoaiNguon, TieuDe, NoiDung, LoaiTB, DaDoc, NgayTao)
                VALUES
                    (NULL, @IDUser, @IDNguon, @LoaiNguon, @TieuDe, @NoiDung, @LoaiTB, 0, GETUTCDATE())",
                P("@IDUser", idNguoiNhan),
                P("@IDNguon", idNguon),
                P("@LoaiNguon", loaiNguon),
                P("@TieuDe", tieuDe),
                P("@NoiDung", (object?)noiDung ?? DBNull.Value),
                P("@LoaiTB", loaiTB));
        }

        // ── Helper: tạo tham số IN clause an toàn (tránh SQL injection) ─────
        // Ví dụ: ids=[1,2,3], prefix="p" → "@p0,@p1,@p2" và thêm params vào cmd
        private static string TaoInClause(List<int> ids, SqlCommand cmd, string prefix)
        {
            var paramNames = ids.Select((id, i) =>
            {
                var name = $"@{prefix}{i}";
                cmd.Parameters.AddWithValue(name, id);
                return name;
            });
            return string.Join(",", paramNames);
        }

        // ── Helper: tạo SqlParameter gọn ─────────────────────────────────────
        private static SqlParameter P(string name, object value)
            => new SqlParameter(name, value);

        // ── Helper: mở kết nối DB ────────────────────────────────────────────
        private SqlConnection OpenConn()
        {
            var conn = new SqlConnection(ConnStr);
            conn.Open();
            return conn;
        }

        // ── Helper: thực thi câu lệnh không trả dữ liệu (INSERT/UPDATE/DELETE)
        private static void ExecNonQuery(SqlConnection conn, string sql, params SqlParameter[] ps)
        {
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddRange(ps);
            cmd.ExecuteNonQuery();
        }
    }
}
