using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Security.Claims;

namespace QuanLyNhaTro.Controllers
{
    [ApiController]
    [Authorize(AuthenticationSchemes = "MyCookieAuth")]
    public class QuanLyApiController : ControllerBase
    {
        private readonly IConfiguration _cfg;
        private string ConnStr => _cfg.GetConnectionString("QuanLyKhuNhaTro")!;

        public QuanLyApiController(IConfiguration cfg) => _cfg = cfg;

        // =====================================================================
        // GET /api/QuanLy/Profile
        // =====================================================================
        [HttpGet("/api/QuanLy/Profile")]
        public IActionResult GetProfile()
        {
            try
            {
                var idUserStr = User.FindFirst("IDUser")?.Value
                             ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (!int.TryParse(idUserStr, out int idUser) || idUser <= 0)
                {
                    var claimList = User.Claims.Select(c => $"{c.Type}={c.Value}").ToList();
                    Console.WriteLine($"[Profile] Claims: {string.Join(", ", claimList)}");
                    return Unauthorized(new { message = "Không xác định được IDUser." });
                }

                using var conn = new SqlConnection(ConnStr);
                conn.Open();

                // ✅ FIX: Kiểm tra tên cột thật trong bảng ACCOUNT
                // Ưu tiên: SoDienThoai → PhoneNumber → SDT → trả "" nếu không có
                var colPhone = GetExistingColumn(conn, "ACCOUNT",
                    new[] { "SoDienThoai", "PhoneNumber", "SDT", "DienThoai", "Phone" });

                var phoneSelect = colPhone != null
                    ? $"ISNULL(a.{colPhone}, '')"
                    : "'' ";

                var sql = $@"
                    SELECT ISNULL(a.Email, '')    AS Email,
                           ISNULL(a.FullName, '') AS FullName,
                           {phoneSelect}          AS PhoneNumber
                    FROM dbo.ACCOUNT a
                    WHERE a.IDUser = @IDUser";

                using var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@IDUser", idUser);

                using var r = cmd.ExecuteReader();
                if (!r.Read())
                    return NotFound(new { message = $"Không tìm thấy tài khoản IDUser={idUser}" });

                return Ok(new
                {
                    email = r.GetString(0),
                    fullName = r.GetString(1),
                    phoneNumber = r.GetString(2),
                });
            }
            catch (SqlException sqlEx)
            {
                Console.WriteLine($"[Profile] SqlException: {sqlEx.Message}");
                return StatusCode(500, new { message = $"Lỗi cơ sở dữ liệu: {sqlEx.Message}" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Profile] Exception: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // =====================================================================
        // GET /api/ConfigGia?ma=NUOC_BINH
        // =====================================================================
        [HttpGet("/api/ConfigGia")]
        public IActionResult GetConfigGia([FromQuery] string ma)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ma))
                    return BadRequest(new { message = "Thiếu tham số 'ma'" });

                using var conn = new SqlConnection(ConnStr);
                conn.Open();

                using var cmd = new SqlCommand(@"
                    SELECT TOP 1
                           IDConfig, TenDichVu, MaDichVu, DonGia, DonVi, IsActive
                    FROM dbo.CONFIG_GIA
                    WHERE MaDichVu = @Ma AND IsActive = 1
                    ORDER BY IDConfig DESC", conn);
                cmd.Parameters.AddWithValue("@Ma", ma.Trim());

                using var r = cmd.ExecuteReader();
                if (!r.Read())
                {
                    // ✅ FIX: Thay vì trả 404 (gây lỗi đỏ console),
                    // trả 200 với giá mặc định để UI vẫn hoạt động bình thường.
                    // JS đã có fallback: donGiaNuocBinh = d.donGia || 0
                    Console.WriteLine($"[ConfigGia] Không có dữ liệu cho mã '{ma}' — trả giá mặc định 0");
                    return Ok(new
                    {
                        idConfig = 0,
                        tenDichVu = ma,
                        maDichVu = ma,
                        donGia = 0m,
                        donVi = "",
                        isActive = false,
                    });
                }

                return Ok(new
                {
                    idConfig = r.GetInt32(0),
                    tenDichVu = r.GetString(1),
                    maDichVu = r.GetString(2),
                    donGia = r.GetDecimal(3),
                    donVi = r.GetString(4),
                    isActive = r.GetBoolean(5),
                });
            }
            catch (SqlException sqlEx)
            {
                Console.WriteLine($"[ConfigGia] SqlException: {sqlEx.Message}");
                return StatusCode(500, new { message = $"Lỗi cơ sở dữ liệu: {sqlEx.Message}" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ConfigGia] Exception: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // =====================================================================
        // GET /api/ConfigGia/all
        // =====================================================================
        [HttpGet("/api/ConfigGia/all")]
        public IActionResult GetAllConfigGia()
        {
            try
            {
                using var conn = new SqlConnection(ConnStr);
                conn.Open();

                using var cmd = new SqlCommand(@"
                    SELECT IDConfig, TenDichVu, MaDichVu, DonGia, DonVi, IsActive
                    FROM dbo.CONFIG_GIA
                    ORDER BY TenDichVu", conn);

                var results = new List<object>();
                using var r = cmd.ExecuteReader();
                while (r.Read())
                {
                    results.Add(new
                    {
                        idConfig = r.GetInt32(0),
                        tenDichVu = r.GetString(1),
                        maDichVu = r.GetString(2),
                        donGia = r.GetDecimal(3),
                        donVi = r.GetString(4),
                        isActive = r.GetBoolean(5),
                    });
                }

                return Ok(results);
            }
            catch (SqlException sqlEx)
            {
                Console.WriteLine($"[ConfigGia/all] SqlException: {sqlEx.Message}");
                return StatusCode(500, new { message = $"Lỗi cơ sở dữ liệu: {sqlEx.Message}" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ConfigGia/all] Exception: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // =====================================================================
        // Helper: tìm tên cột đầu tiên tồn tại trong bảng (không phân biệt hoa/thường)
        // =====================================================================
        private static string? GetExistingColumn(SqlConnection conn, string tableName, string[] candidates)
        {
            using var cmd = new SqlCommand(@"
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = @Table
                  AND COLUMN_NAME IN (" + string.Join(",", candidates.Select((_, i) => $"@c{i}")) + ")", conn);

            cmd.Parameters.AddWithValue("@Table", tableName);
            for (int i = 0; i < candidates.Length; i++)
                cmd.Parameters.AddWithValue($"@c{i}", candidates[i]);

            using var r = cmd.ExecuteReader();
            // Trả về candidate đầu tiên theo thứ tự ưu tiên tìm thấy trong DB
            var found = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            while (r.Read()) found.Add(r.GetString(0));
            r.Close();

            return candidates.FirstOrDefault(c => found.Contains(c));
        }
    }
}
