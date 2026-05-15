using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Data.SqlClient;
using System.Data;

namespace QuanLyNhaTro.Pages.Manager
{
    public class DichVu
    {
        public int MaDichVu { get; set; }
        public string TenDichVu { get; set; } = string.Empty;
        public decimal DonGia { get; set; }
        public string DonViTinh { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public bool TrangThai { get; set; } = true;
    }

    public class QuanLyDichVuModel : PageModel
    {
        private readonly IConfiguration _configuration;
        private string ConnectionString => _configuration.GetConnectionString("QuanLyKhuNhaTro")!;

        public QuanLyDichVuModel(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // ---------- Dữ liệu hiển thị ----------
        public List<DichVu> DanhSachDichVu { get; set; } = new();

        // ---------- Form bind ----------
        [BindProperty]
        public DichVu DichVuForm { get; set; } = new();

        // ---------- Tìm kiếm ----------
        [BindProperty(SupportsGet = true)]
        public string? TuKhoa { get; set; }

        // ---------- Thông báo ----------
        [TempData]
        public string? ThongBao { get; set; }

        [TempData]
        public string? LoaiThongBao { get; set; } // "success" | "danger" | "warning"

        // =====================================================================
        // GET — Tải danh sách dịch vụ
        // =====================================================================
        public void OnGet()
        {
            LoadDanhSachDichVu();
        }

        // =====================================================================
        // POST — Thêm mới dịch vụ
        // =====================================================================
        public IActionResult OnPostThem()
        {
            if (!ModelState.IsValid)
            {
                LoadDanhSachDichVu();
                return Page();
            }

            try
            {
                using var conn = new SqlConnection(ConnectionString);
                conn.Open();
                const string sql = @"
                    INSERT INTO DichVu (TenDichVu, DonGia, DonViTinh, MoTa, TrangThai)
                    VALUES (@TenDichVu, @DonGia, @DonViTinh, @MoTa, @TrangThai)";

                using var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@TenDichVu", DichVuForm.TenDichVu);
                cmd.Parameters.AddWithValue("@DonGia", DichVuForm.DonGia);
                cmd.Parameters.AddWithValue("@DonViTinh", DichVuForm.DonViTinh);
                cmd.Parameters.AddWithValue("@MoTa", (object?)DichVuForm.MoTa ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@TrangThai", DichVuForm.TrangThai);
                cmd.ExecuteNonQuery();

                ThongBao = "Thêm dịch vụ thành công!";
                LoaiThongBao = "success";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi khi thêm dịch vụ: {ex.Message}";
                LoaiThongBao = "danger";
            }

            return RedirectToPage();
        }

        // =====================================================================
        // POST — Cập nhật dịch vụ
        // =====================================================================
        public IActionResult OnPostCapNhat()
        {
            if (!ModelState.IsValid)
            {
                LoadDanhSachDichVu();
                return Page();
            }

            try
            {
                using var conn = new SqlConnection(ConnectionString);
                conn.Open();
                const string sql = @"
                    UPDATE DichVu
                    SET TenDichVu = @TenDichVu,
                        DonGia    = @DonGia,
                        DonViTinh = @DonViTinh,
                        MoTa      = @MoTa,
                        TrangThai = @TrangThai
                    WHERE MaDichVu = @MaDichVu";

                using var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@MaDichVu", DichVuForm.MaDichVu);
                cmd.Parameters.AddWithValue("@TenDichVu", DichVuForm.TenDichVu);
                cmd.Parameters.AddWithValue("@DonGia", DichVuForm.DonGia);
                cmd.Parameters.AddWithValue("@DonViTinh", DichVuForm.DonViTinh);
                cmd.Parameters.AddWithValue("@MoTa", (object?)DichVuForm.MoTa ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@TrangThai", DichVuForm.TrangThai);
                cmd.ExecuteNonQuery();

                ThongBao = "Cập nhật dịch vụ thành công!";
                LoaiThongBao = "success";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi khi cập nhật dịch vụ: {ex.Message}";
                LoaiThongBao = "danger";
            }

            return RedirectToPage();
        }

        // =====================================================================
        // POST — Xoá dịch vụ
        // =====================================================================
        public IActionResult OnPostXoa(int maDichVu)
        {
            try
            {
                using var conn = new SqlConnection(ConnectionString);
                conn.Open();

                // Kiểm tra xem dịch vụ có đang được sử dụng không
                const string checkSql = @"
                    SELECT COUNT(*) FROM HopDong_DichVu WHERE MaDichVu = @MaDichVu";
                using var checkCmd = new SqlCommand(checkSql, conn);
                checkCmd.Parameters.AddWithValue("@MaDichVu", maDichVu);
                int soLuongSuDung = (int)checkCmd.ExecuteScalar();

                if (soLuongSuDung > 0)
                {
                    ThongBao = "Không thể xoá! Dịch vụ đang được sử dụng trong hợp đồng.";
                    LoaiThongBao = "warning";
                    return RedirectToPage();
                }

                const string deleteSql = "DELETE FROM DichVu WHERE MaDichVu = @MaDichVu";
                using var deleteCmd = new SqlCommand(deleteSql, conn);
                deleteCmd.Parameters.AddWithValue("@MaDichVu", maDichVu);
                deleteCmd.ExecuteNonQuery();

                ThongBao = "Xoá dịch vụ thành công!";
                LoaiThongBao = "success";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi khi xoá dịch vụ: {ex.Message}";
                LoaiThongBao = "danger";
            }

            return RedirectToPage();
        }

        // =====================================================================
        // POST — Đổi trạng thái (Kích hoạt / Vô hiệu hoá)
        // =====================================================================
        public IActionResult OnPostDoiTrangThai(int maDichVu, bool trangThai)
        {
            try
            {
                using var conn = new SqlConnection(ConnectionString);
                conn.Open();
                const string sql = "UPDATE DichVu SET TrangThai = @TrangThai WHERE MaDichVu = @MaDichVu";
                using var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@TrangThai", !trangThai);
                cmd.Parameters.AddWithValue("@MaDichVu", maDichVu);
                cmd.ExecuteNonQuery();

                ThongBao = trangThai ? "Đã vô hiệu hoá dịch vụ." : "Đã kích hoạt dịch vụ.";
                LoaiThongBao = "success";
            }
            catch (Exception ex)
            {
                ThongBao = $"Lỗi khi đổi trạng thái: {ex.Message}";
                LoaiThongBao = "danger";
            }

            return RedirectToPage();
        }

        // =====================================================================
        // GET handler — Lấy thông tin 1 dịch vụ (AJAX)
        // =====================================================================
        public IActionResult OnGetChiTiet(int maDichVu)
        {
            try
            {
                using var conn = new SqlConnection(ConnectionString);
                conn.Open();
                const string sql = @"
                    SELECT MaDichVu, TenDichVu, DonGia, DonViTinh, MoTa, TrangThai
                    FROM DichVu
                    WHERE MaDichVu = @MaDichVu";

                using var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@MaDichVu", maDichVu);
                using var reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    var dv = new DichVu
                    {
                        MaDichVu = reader.GetInt32("MaDichVu"),
                        TenDichVu = reader.GetString("TenDichVu"),
                        DonGia = reader.GetDecimal("DonGia"),
                        DonViTinh = reader.GetString("DonViTinh"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        TrangThai = reader.GetBoolean("TrangThai")
                    };
                    return new JsonResult(dv);
                }

                return NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // =====================================================================
        // Private helper — Tải danh sách dịch vụ (có tìm kiếm)
        // =====================================================================
        private void LoadDanhSachDichVu()
        {
            DanhSachDichVu = new List<DichVu>();

            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            string sql = @"
                SELECT MaDichVu, TenDichVu, DonGia, DonViTinh, MoTa, TrangThai
                FROM DichVu
                WHERE (@TuKhoa IS NULL
                       OR TenDichVu LIKE '%' + @TuKhoa + '%'
                       OR DonViTinh LIKE '%' + @TuKhoa + '%')
                ORDER BY TenDichVu";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@TuKhoa", (object?)TuKhoa ?? DBNull.Value);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                DanhSachDichVu.Add(new DichVu
                {
                    MaDichVu = reader.GetInt32("MaDichVu"),
                    TenDichVu = reader.GetString("TenDichVu"),
                    DonGia = reader.GetDecimal("DonGia"),
                    DonViTinh = reader.GetString("DonViTinh"),
                    MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                    TrangThai = reader.GetBoolean("TrangThai")
                });
            }
        }
    }
}
