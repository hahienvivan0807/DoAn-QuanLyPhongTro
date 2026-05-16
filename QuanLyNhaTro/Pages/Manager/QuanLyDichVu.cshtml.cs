using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Data.SqlClient;
using System.Data;

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
        public void OnGet()
        {
            LoadAll();
        }

        // =====================================================================
        // HANDLER: Nhập giá + Xác nhận đã giao nước bình
        //   → TrangThai_DV: "Chờ xử lý" → "Chờ thanh toán"
        //   → Gửi thông báo cho khách
        // =====================================================================
        public IActionResult OnPostNhapGiaNuocVaGiao(int idDonDV, decimal tongTien, string? ghiChuXuLy)
        {
            try
            {
                using var conn = OpenConn();
                // 1) Lấy IDUser của khách để gửi thông báo
                int idUser = GetIDUserFromDon(conn, idDonDV);
                string soPhong = GetSoPhongFromDon(conn, idDonDV);

                // 2) Cập nhật đơn
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

                // 3) Gửi thông báo cho khách
                if (idUser > 0)
                    GuiThongBao(conn, idUser, idDonDV, "DonDV",
                        "Nước bình đã được giao",
                        $"Đơn nước bình phòng {soPhong} đã được giao. Số tiền: {tongTien:N0} đ. Vui lòng thanh toán đúng hạn.",
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
        // HANDLER: Nhập tiền giặt sấy
        //   → TrangThai_DV: "Chờ xử lý" → "Chờ thanh toán"
        // =====================================================================
        public IActionResult OnPostNhapGiaGiatSay(int idDonDV, decimal tongTien, string? ghiChuXuLy)
        {
            try
            {
                using var conn = OpenConn();
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
        //
        //   Logic:
        //   1. Tìm tất cả đơn DV ở trạng thái "Chờ thanh toán" đã quá hạn
        //      (NgayHoanThanh IS NULL AND NgayXuLy < ngày hiện tại - X ngày ân hạn)
        //   2. Với mỗi phòng, cộng TongTien vào HDTHANG.TienNoDV của kỳ tháng hiện tại
        //   3. Cập nhật TongCong của hóa đơn
        //   4. Đánh dấu DuocCongVaoTro = 1 trên HDTHANG
        //   5. (Tùy chọn) Hủy đơn DV sau khi đã cộng nợ
        // =====================================================================
        public IActionResult OnPostChuyenNoDVVaoHD()
        {
            try
            {
                using var conn = OpenConn();
                string kyThanhToan = DateTime.Now.ToString("MM/yyyy");

                // Lấy danh sách đơn DV "Chờ thanh toán" chưa được cộng
                // (Dùng NgayXuLy <= hôm qua để cho ân hạn 1 ngày)
                const string sqlLayNo = @"
                    SELECT d.IDDonDV, d.IDPhong, d.TongTien
                    FROM dbo.DONDV d
                    WHERE d.TrangThai_DV = N'Chờ thanh toán'
                      AND d.NgayXuLy IS NOT NULL
                      AND d.NgayXuLy < CAST(GETDATE() AS date)
                      AND NOT EXISTS (
                          SELECT 1 FROM dbo.DONDV d2
                          WHERE d2.IDDonDV = d.IDDonDV
                            AND d2.GhiChuXuLy LIKE N'%[CONGNO]%'
                      )";

                var danhSachNo = new List<(int IDDonDV, int IDPhong, decimal TongTien)>();
                using (var cmd = new SqlCommand(sqlLayNo, conn))
                using (var r = cmd.ExecuteReader())
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
                    // Nếu chưa có HDTHANG tháng này → sẽ được cộng khi tạo HD

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
        // LOAD ALL — tải toàn bộ dữ liệu một lần
        // =====================================================================
        private void LoadAll()
        {
            try
            {
                using var conn = OpenConn();

                // ── Thông tin admin (từ session trong thực tế; để mock ở đây)
                TenNguoiDung = HttpContext.Session.GetString("FullName") ?? "Quản lý";

                // ── Thông báo chưa đọc
                SoThongBaoChuaDoc = ScalarInt(conn,
                    "SELECT COUNT(*) FROM dbo.THONGBAO WHERE DaDoc = 0");

                // ── Đơn nước bình
                DanhSachDonNuoc = LayDanhSachDon(conn, "Nước bình");
                SoDonNuocChoBinhChoXuLy = DanhSachDonNuoc.Count(d => d.TrangThai_DV == "Chờ xử lý");

                // ── Đơn giặt sấy
                DanhSachDonGiatSay = LayDanhSachDon(conn, "Giặt sấy");
                SoDonGiatSayChoXuLy = DanhSachDonGiatSay.Count(d => d.TrangThai_DV == "Chờ xử lý");

                // Tổng đơn chờ xử lý (cho badge sidebar)
                SoDonChoXuLy = SoDonNuocChoBinhChoXuLy + SoDonGiatSayChoXuLy;

                // ── Nợ dịch vụ (đơn "Chờ thanh toán" đã qua ngày xử lý)
                DanhSachNoDV = LayDanhSachNoDV(conn);
                SoPhongNoDV = DanhSachNoDV.Select(d => d.SoPhong).Distinct().Count();
                TongTienNoDV = DanhSachNoDV.Sum(d => d.TongTien);

                // ── Điện nước
                DanhSachDienNuoc = LayDanhSachDienNuoc(conn);
                SoDienNuocChoDuyet = DanhSachDienNuoc.Count(d => d.TrangThaiDuyet == 0);

                // ── Config giá
                DanhSachConfig = LayDanhSachConfig(conn);
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi khi tải dữ liệu: {ex.Message}";
                LoaiThongBao = "danger";
            }
        }

        // ── Lấy danh sách đơn DV theo loại ──────────────────────────────────
        private List<DonDichVuViewModel> LayDanhSachDon(SqlConnection conn, string loai)
        {
            var list = new List<DonDichVuViewModel>();
            const string sql = @"
                SELECT d.IDDonDV, p.SoPhong,
                       ISNULL(kt.HoTen, a.FullName) AS TenKhach,
                       d.LoaiDV, d.NoiDung, d.TongTien, d.TrangThai_DV,
                       d.GhiChuXuLy, d.NgayTao
                FROM dbo.DONDV d
                JOIN dbo.PHONG p ON p.IDPhong = d.IDPhong
                JOIN dbo.ACCOUNT a ON a.IDUser = d.IDUser
                LEFT JOIN dbo.KHACH_THUE kt ON kt.IDUser = d.IDUser
                WHERE d.LoaiDV = @Loai
                  AND d.TrangThai_DV NOT IN (N'Đã hủy')
                ORDER BY
                    CASE d.TrangThai_DV
                        WHEN N'Chờ xử lý'    THEN 0
                        WHEN N'Chờ thanh toán' THEN 1
                        ELSE 2
                    END, d.NgayTao DESC";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Loai", loai);
            using var r = cmd.ExecuteReader();
            while (r.Read())
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

        // ── Đơn DV đang "Chờ thanh toán" & đã quá ngày xử lý → coi là nợ ──
        private List<DonDichVuViewModel> LayDanhSachNoDV(SqlConnection conn)
        {
            var list = new List<DonDichVuViewModel>();
            const string sql = @"
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
                ORDER BY d.NgayTao";
            using var cmd = new SqlCommand(sql, conn);
            using var r = cmd.ExecuteReader();
            while (r.Read())
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

        // ── Điện nước ────────────────────────────────────────────────────────
        private List<DienNuocViewModel> LayDanhSachDienNuoc(SqlConnection conn)
        {
            var list = new List<DienNuocViewModel>();
            const string sql = @"
                SELECT dn.IDGhiNhan, p.SoPhong, dn.KyGhiNhan,
                       dn.SoDienMoi, dn.SoDienCu, dn.SoNuocMoi, dn.SoNuocCu,
                       dn.AnhChupDongHo, dn.TrangThaiDuyet, dn.NgayGhi
                FROM dbo.DIENNUOC dn
                JOIN dbo.PHONG p ON p.IDPhong = dn.IDPhong
                ORDER BY
                    CASE dn.TrangThaiDuyet WHEN 0 THEN 0 ELSE 1 END,
                    dn.NgayGhi DESC";
            using var cmd = new SqlCommand(sql, conn);
            using var r = cmd.ExecuteReader();
            while (r.Read())
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
                    TrangThaiDuyet = r.GetByte(8),
                    NgayGhi = r.GetDateTime(9),
                });
            return list;
        }

        // ── Config giá ──────────────────────────────────────────────────────
        private List<ConfigGiaViewModel> LayDanhSachConfig(SqlConnection conn)
        {
            var list = new List<ConfigGiaViewModel>();
            const string sql = @"
                SELECT IDConfig, TenDichVu, MaDichVu, DonGia, DonVi, IsActive
                FROM dbo.CONFIG_GIA ORDER BY TenDichVu";
            using var cmd = new SqlCommand(sql, conn);
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

        // =====================================================================
        // PRIVATE HELPERS
        // =====================================================================
        private SqlConnection OpenConn()
        {
            var c = new SqlConnection(ConnStr);
            c.Open();
            return c;
        }

        private static void ExecNonQuery(SqlConnection conn, string sql, params SqlParameter[] ps)
        {
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddRange(ps);
            cmd.ExecuteNonQuery();
        }

        private static int ScalarInt(SqlConnection conn, string sql)
        {
            using var cmd = new SqlCommand(sql, conn);
            var v = cmd.ExecuteScalar();
            return v == null || v == DBNull.Value ? 0 : Convert.ToInt32(v);
        }

        private static SqlParameter P(string name, object? value) =>
            new(name, value ?? DBNull.Value);

        private static int GetIDUserFromDon(SqlConnection conn, int idDonDV)
        {
            using var cmd = new SqlCommand(
                "SELECT IDUser FROM dbo.DONDV WHERE IDDonDV = @ID", conn);
            cmd.Parameters.AddWithValue("@ID", idDonDV);
            var v = cmd.ExecuteScalar();
            return v == null || v == DBNull.Value ? 0 : Convert.ToInt32(v);
        }

        private static string GetSoPhongFromDon(SqlConnection conn, int idDonDV)
        {
            using var cmd = new SqlCommand(@"
                SELECT p.SoPhong FROM dbo.DONDV d
                JOIN dbo.PHONG p ON p.IDPhong = d.IDPhong
                WHERE d.IDDonDV = @ID", conn);
            cmd.Parameters.AddWithValue("@ID", idDonDV);
            return cmd.ExecuteScalar()?.ToString() ?? "?";
        }

        /// <summary>
        /// Gửi thông báo vào bảng THONGBAO cho khách thuê.
        /// </summary>
        private static void GuiThongBao(SqlConnection conn,
            int idUser, int idNguon, string loaiNguon,
            string tieuDe, string noiDung, string loaiTB)
        {
            ExecNonQuery(conn, @"
                INSERT INTO dbo.THONGBAO
                    (IDUser, IDNguonTB, LoaiNguon, TieuDe, NoiDung, LoaiTB, DaDoc, NgayTao)
                VALUES
                    (@IDUser, @IDNguon, @LoaiNguon, @TieuDe, @NoiDung, @LoaiTB, 0, GETDATE())",
                P("@IDUser", idUser),
                P("@IDNguon", idNguon),
                P("@LoaiNguon", loaiNguon),
                P("@TieuDe", tieuDe),
                P("@NoiDung", noiDung),
                P("@LoaiTB", loaiTB));
        }
    }
}
