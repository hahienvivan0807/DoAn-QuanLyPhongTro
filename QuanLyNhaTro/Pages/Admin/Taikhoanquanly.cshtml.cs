using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Data.SqlClient;
using QuanLyNhaTro.Models;
using System.Text.Json;

namespace QuanLyNhaTro.Pages.Admin
{
    /// <summary>
    /// Page back-end: Quản lý tài khoản Manager
    /// Bảng liên quan: ACCOUNT, PHONG, PHONG_MANAGER, ACCOUNT_PERMISSION
    /// </summary>
    public class TaiKhoanQuanLyModel : PageModel
    {
        // ─── DI ───────────────────────────────────────────────────────
        private readonly IConfiguration _config;
        private readonly ILogger<TaiKhoanQuanLyModel> _logger;

        public TaiKhoanQuanLyModel(IConfiguration config, ILogger<TaiKhoanQuanLyModel> logger)
        {
            _config = config;
            _logger = logger;
        }

        // ─── Gradient pool đồng bộ với JS ────────────────────────────
        public static readonly string[] GradientPool =
        [
            "linear-gradient(135deg,#7c3aed,#a78bfa)",
            "linear-gradient(135deg,#b8720a,#e8971c)",
            "linear-gradient(135deg,#059669,#34d399)",
            "linear-gradient(135deg,#1a56db,#60a5fa)",
            "linear-gradient(135deg,#e11d48,#f87171)",
            "linear-gradient(135deg,#0891b2,#22d3ee)"
        ];

        // ─── View-model cho từng quản lý ─────────────────────────────
        public class QuanLyViewModel
        {
            public int IDUser { get; set; }
            public string Username { get; set; } = "";
            public string FullName { get; set; } = "";
            public string Phone { get; set; } = "";
            public string? Email { get; set; }
            public string? Avatar { get; set; }
            public bool IsActive { get; set; }
            public DateTime CreatedAt { get; set; }
            public List<PhongInfo> Phongs { get; set; } = [];

            /// <summary>Bitmask quyền – key khớp với id toggle trên UI</summary>
            public Dictionary<string, bool> Permissions { get; set; } = new()
            {
                ["tao-hd"] = false,
                ["huy-hd"] = false,
                ["thu-hd"] = false,
                ["dien-nuoc"] = false,
                ["sua-chua"] = false,
                ["thong-bao"] = false,
                ["khach-thue"] = false
            };
        }

        public class PhongInfo
        {
            public int IDPhong { get; set; }
            public string SoPhong { get; set; } = "";
            public byte Tang { get; set; }
            public string TrangThai { get; set; } = "";
            public decimal GiaPhongFix { get; set; }
        }

        // ─── DTO nhận từ AJAX ─────────────────────────────────────────
        public record TaoTaiKhoanDto(
            string Username,
            string Passwords,
            string FullName,
            string Phone,
            string? Email,
            string Roles = "Manager"
        );

        public record SuaTaiKhoanDto(
            int IDUser,
            string FullName,
            string Phone,
            string? Email,
            string? NewPassword
        );

        public record KhoaDto(int IDUser, bool IsLocked);
        public record IdDto(int IDUser);
        public record PhanCongDto(int IDManager, List<int> IDPhongs);
        public record LuuQuyenDto(int IDManager, Dictionary<string, bool> Permissions);

        // ─── Thuộc tính trang ────────────────────────────────────────
        public List<QuanLyViewModel> DanhSachQuanLy { get; private set; } = [];
        public List<PhongInfo> TatCaPhong { get; private set; } = [];

        public int TongQuanLy { get; private set; }
        public int QuanLyHoatDong { get; private set; }
        public int PhongChuaPhanCong { get; private set; }
        public int TongPhong { get; private set; }

        // ─── Connection string helper ─────────────────────────────────
        private string ConnStr => _config.GetConnectionString("QuanLyKhuNhaTro")
                                  ?? throw new InvalidOperationException("Chưa cấu hình ConnectionString 'QuanLyKhuNhaTro' trong appsettings.json.");

        // ═══════════════════════════════════════════════════════════════
        // GET — Render trang lần đầu
        // ═══════════════════════════════════════════════════════════════
        public void OnGet()
        {
            try
            {
                TatCaPhong = LayTatCaPhong();
                DanhSachQuanLy = LayDanhSachQuanLy(TatCaPhong);

                TongQuanLy = DanhSachQuanLy.Count;
                QuanLyHoatDong = DanhSachQuanLy.Count(q => q.IsActive);
                TongPhong = TatCaPhong.Count;

                var assignedIds = DanhSachQuanLy
                                    .SelectMany(q => q.Phongs.Select(p => p.IDPhong))
                                    .Distinct()
                                    .ToHashSet();
                PhongChuaPhanCong = TatCaPhong.Count(p => !assignedIds.Contains(p.IDPhong));
            }
            catch (Exception ex)
            {
                // Log chi tiết để dễ debug, sau đó re-throw
                // để ASP.NET hiển thị trang lỗi thay vì render trang trống với toàn số 0.
                _logger.LogError(ex,
                    "Lỗi khi tải trang TaiKhoanQuanLy. ConnStr key=QuanLyKhuNhaTro | Message={Msg}",
                    ex.Message);
                throw;
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // TRUY VẤN DB — LẤY DỮ LIỆU
        // ═══════════════════════════════════════════════════════════════

        /// <summary>Lấy toàn bộ phòng từ bảng PHONG</summary>
        private List<PhongInfo> LayTatCaPhong()
        {
            var list = new List<PhongInfo>();
            using var conn = new SqlConnection(ConnStr);
            conn.Open();

            const string sql = @"
                SELECT IDPhong, SoPhong, Tang, TrangThai, GiaPhongFix
                FROM   PHONG
                ORDER  BY Tang, SoPhong";

            using var cmd = new SqlCommand(sql, conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new PhongInfo
                {
                    IDPhong = reader.GetInt32(0),
                    SoPhong = reader.GetString(1),
                    Tang = reader.GetByte(2),
                    TrangThai = reader.GetString(3),
                    GiaPhongFix = reader.GetDecimal(4)
                });
            }
            return list;
        }

        /// <summary>
        /// Lấy danh sách Manager từ ACCOUNT + phòng phân công từ PHONG_MANAGER
        /// + quyền từ ACCOUNT_PERMISSION (nếu bảng tồn tại).
        /// </summary>
        private List<QuanLyViewModel> LayDanhSachQuanLy(List<PhongInfo> tatCaPhong)
        {
            var dict = new Dictionary<int, QuanLyViewModel>();

            using var conn = new SqlConnection(ConnStr);
            conn.Open();

            // ── 1. Lấy tất cả Manager ──────────────────────────────
            const string sqlManager = @"
                SELECT IDUser, Username, FullName, Phone, Email, Avatar, IsActive, CreatedAt
                FROM   ACCOUNT
                WHERE  Roles = 'Manager'
                ORDER  BY CreatedAt";

            using (var cmd = new SqlCommand(sqlManager, conn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var ql = new QuanLyViewModel
                    {
                        IDUser = reader.GetInt32(0),
                        Username = reader.GetString(1),
                        FullName = reader.GetString(2),
                        Phone = reader.GetString(3),
                        Email = reader.IsDBNull(4) ? null : reader.GetString(4),
                        Avatar = reader.IsDBNull(5) ? null : reader.GetString(5),
                        IsActive = reader.GetBoolean(6),
                        CreatedAt = reader.GetDateTime(7)
                    };
                    dict[ql.IDUser] = ql;
                }
            }

            if (dict.Count == 0) return [];

            // ── 2. Lấy phân công phòng (PHONG_MANAGER IsActive=1) ──
            const string sqlPhanCong = @"
                SELECT pm.IDManager, pm.IDPhong
                FROM   PHONG_MANAGER pm
                WHERE  pm.IsActive = 1
                ORDER  BY pm.IDManager, pm.IDPhong";

            var phongDict = tatCaPhong.ToDictionary(p => p.IDPhong);

            using (var cmd = new SqlCommand(sqlPhanCong, conn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var idManager = reader.GetInt32(0);
                    var idPhong = reader.GetInt32(1);

                    if (!dict.TryGetValue(idManager, out var ql)) continue;
                    if (!phongDict.TryGetValue(idPhong, out var p)) continue;

                    ql.Phongs.Add(p);
                }
            }

            // ── 3. Lấy quyền từ ACCOUNT_PERMISSION ────────────────
            //      Kiểm tra bảng tồn tại trước để tránh lỗi runtime
            //      khi DB chưa có migration.
            if (BangTonTai(conn, "ACCOUNT_PERMISSION"))
            {
                var idList = string.Join(",", dict.Keys);   // an toàn vì là int

                var sqlQuyen = $@"
                    SELECT IDManager, PermissionKey, IsGranted
                    FROM   ACCOUNT_PERMISSION
                    WHERE  IDManager IN ({idList})";

                using var cmd = new SqlCommand(sqlQuyen, conn);
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    var idManager = reader.GetInt32(0);
                    var permKey = reader.GetString(1);
                    var isGranted = reader.GetBoolean(2);

                    if (dict.TryGetValue(idManager, out var ql)
                        && ql.Permissions.ContainsKey(permKey))
                    {
                        ql.Permissions[permKey] = isGranted;
                    }
                }
            }

            return [.. dict.Values];
        }

        /// <summary>Kiểm tra bảng có tồn tại trong schema hiện tại không</summary>
        private static bool BangTonTai(SqlConnection conn, string tenBang)
        {
            using var cmd = new SqlCommand(
                "SELECT COUNT(1) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @t", conn);
            cmd.Parameters.AddWithValue("@t", tenBang);
            return (int)cmd.ExecuteScalar()! > 0;
        }

        // ═══════════════════════════════════════════════════════════════
        // API HANDLERS
        // ═══════════════════════════════════════════════════════════════

        // ─── Tạo tài khoản ───────────────────────────────────────────
        public IActionResult OnPostTaoTaiKhoan([FromBody] TaoTaiKhoanDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) ||
                string.IsNullOrWhiteSpace(dto.Passwords) ||
                string.IsNullOrWhiteSpace(dto.FullName) ||
                string.IsNullOrWhiteSpace(dto.Phone))
                return BadRequest(new { message = "Vui lòng điền đầy đủ thông tin bắt buộc." });

            if (dto.Passwords.Length < 8)
                return BadRequest(new { message = "Mật khẩu phải có ít nhất 8 ký tự." });

            try
            {
                using var conn = new SqlConnection(ConnStr);
                conn.Open();

                // Kiểm tra username trùng
                using (var chk = new SqlCommand(
                    "SELECT COUNT(1) FROM ACCOUNT WHERE Username = @u", conn))
                {
                    chk.Parameters.AddWithValue("@u", dto.Username.Trim());
                    if ((int)chk.ExecuteScalar()! > 0)
                        return BadRequest(new { message = $"Username '@{dto.Username}' đã tồn tại." });
                }

                // Hash mật khẩu — BCrypt.Net-Next NuGet
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Passwords);

                const string sql = @"
                    INSERT INTO ACCOUNT
                        (Username, Passwords, FullName, Phone, Email, Roles, IsActive, CreatedAt, UpdatedAt)
                    OUTPUT INSERTED.IDUser
                    VALUES
                        (@username, @pwd, @fullname, @phone, @email, @roles, 1, GETDATE(), GETDATE())";

                using var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@username", dto.Username.Trim());
                cmd.Parameters.AddWithValue("@pwd", passwordHash);
                cmd.Parameters.AddWithValue("@fullname", dto.FullName.Trim());
                cmd.Parameters.AddWithValue("@phone", dto.Phone.Trim());
                cmd.Parameters.AddWithValue("@email", (object?)dto.Email?.Trim() ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@roles", dto.Roles);

                var newId = (int)cmd.ExecuteScalar()!;

                // Seed quyền mặc định = false cho Manager mới
                if (BangTonTai(conn, "ACCOUNT_PERMISSION"))
                {
                    var keys = new[] { "tao-hd", "huy-hd", "thu-hd", "dien-nuoc", "sua-chua", "thong-bao", "khach-thue" };
                    foreach (var key in keys)
                    {
                        using var ins = new SqlCommand(@"
                            IF NOT EXISTS (SELECT 1 FROM ACCOUNT_PERMISSION WHERE IDManager=@m AND PermissionKey=@k)
                                INSERT INTO ACCOUNT_PERMISSION (IDManager, PermissionKey, IsGranted)
                                VALUES (@m, @k, 0)", conn);
                        ins.Parameters.AddWithValue("@m", newId);
                        ins.Parameters.AddWithValue("@k", key);
                        ins.ExecuteNonQuery();
                    }
                }

                return new JsonResult(new
                {
                    message = $"Tạo tài khoản @{dto.Username} thành công!",
                    idUser = newId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi tạo tài khoản");
                return StatusCode(500, new { message = "Lỗi hệ thống khi tạo tài khoản." });
            }
        }

        // ─── Sửa tài khoản ───────────────────────────────────────────
        public IActionResult OnPostSuaTaiKhoan([FromBody] SuaTaiKhoanDto dto)
        {
            if (dto.IDUser <= 0 || string.IsNullOrWhiteSpace(dto.FullName))
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });

            try
            {
                using var conn = new SqlConnection(ConnStr);
                conn.Open();

                if (!string.IsNullOrWhiteSpace(dto.NewPassword))
                {
                    if (dto.NewPassword.Length < 8)
                        return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 8 ký tự." });

                    var hash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                    using var cmd = new SqlCommand(@"
                        UPDATE ACCOUNT
                        SET    FullName=@fn, Phone=@ph, Email=@em, Passwords=@pwd, UpdatedAt=GETDATE()
                        WHERE  IDUser=@id AND Roles='Manager'", conn);
                    cmd.Parameters.AddWithValue("@fn", dto.FullName.Trim());
                    cmd.Parameters.AddWithValue("@ph", dto.Phone.Trim());
                    cmd.Parameters.AddWithValue("@em", (object?)dto.Email?.Trim() ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@pwd", hash);
                    cmd.Parameters.AddWithValue("@id", dto.IDUser);
                    cmd.ExecuteNonQuery();
                }
                else
                {
                    using var cmd = new SqlCommand(@"
                        UPDATE ACCOUNT
                        SET    FullName=@fn, Phone=@ph, Email=@em, UpdatedAt=GETDATE()
                        WHERE  IDUser=@id AND Roles='Manager'", conn);
                    cmd.Parameters.AddWithValue("@fn", dto.FullName.Trim());
                    cmd.Parameters.AddWithValue("@ph", dto.Phone.Trim());
                    cmd.Parameters.AddWithValue("@em", (object?)dto.Email?.Trim() ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@id", dto.IDUser);
                    cmd.ExecuteNonQuery();
                }

                return new JsonResult(new { message = "Cập nhật thông tin thành công." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi sửa tài khoản {id}", dto.IDUser);
                return StatusCode(500, new { message = "Lỗi hệ thống khi cập nhật." });
            }
        }

        // ─── Khóa / Mở khóa tài khoản ────────────────────────────────
        public IActionResult OnPostKhoaTaiKhoan([FromBody] KhoaDto dto)
        {
            if (dto.IDUser <= 0)
                return BadRequest(new { message = "ID không hợp lệ." });

            try
            {
                using var conn = new SqlConnection(ConnStr);
                conn.Open();

                using var cmd = new SqlCommand(@"
                    UPDATE ACCOUNT
                    SET    IsActive=@active, UpdatedAt=GETDATE()
                    WHERE  IDUser=@id AND Roles='Manager'", conn);
                cmd.Parameters.AddWithValue("@active", dto.IsLocked ? 0 : 1);
                cmd.Parameters.AddWithValue("@id", dto.IDUser);
                cmd.ExecuteNonQuery();

                var msg = dto.IsLocked ? "Tài khoản đã bị khóa thành công." : "Tài khoản đã được mở khóa.";
                return new JsonResult(new { message = msg });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khóa/mở khóa tài khoản {id}", dto.IDUser);
                return StatusCode(500, new { message = "Lỗi hệ thống." });
            }
        }

        // ─── Xóa tài khoản ───────────────────────────────────────────
        public IActionResult OnPostXoaTaiKhoan([FromBody] IdDto dto)
        {
            if (dto.IDUser <= 0)
                return BadRequest(new { message = "ID không hợp lệ." });

            try
            {
                using var conn = new SqlConnection(ConnStr);
                conn.Open();
                using var tran = conn.BeginTransaction();

                try
                {
                    // Xóa quyền
                    if (BangTonTai(conn, "ACCOUNT_PERMISSION"))
                    {
                        using var delPerm = new SqlCommand(
                            "DELETE FROM ACCOUNT_PERMISSION WHERE IDManager=@id", conn, tran);
                        delPerm.Parameters.AddWithValue("@id", dto.IDUser);
                        delPerm.ExecuteNonQuery();
                    }

                    // Xóa phân công phòng
                    using (var delPM = new SqlCommand(
                        "DELETE FROM PHONG_MANAGER WHERE IDManager=@id", conn, tran))
                    {
                        delPM.Parameters.AddWithValue("@id", dto.IDUser);
                        delPM.ExecuteNonQuery();
                    }

                    // Xóa tài khoản
                    using (var delAcc = new SqlCommand(
                        "DELETE FROM ACCOUNT WHERE IDUser=@id AND Roles='Manager'", conn, tran))
                    {
                        delAcc.Parameters.AddWithValue("@id", dto.IDUser);
                        delAcc.ExecuteNonQuery();
                    }

                    tran.Commit();
                    return new JsonResult(new { message = "Đã xóa tài khoản quản lý." });
                }
                catch
                {
                    tran.Rollback();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi xóa tài khoản {id}", dto.IDUser);
                return StatusCode(500, new { message = "Lỗi hệ thống khi xóa tài khoản." });
            }
        }

        // ─── Phân công phòng ─────────────────────────────────────────
        public IActionResult OnPostPhanCongPhong([FromBody] PhanCongDto dto)
        {
            if (dto.IDManager <= 0)
                return BadRequest(new { message = "ID quản lý không hợp lệ." });

            try
            {
                using var conn = new SqlConnection(ConnStr);
                conn.Open();
                using var tran = conn.BeginTransaction();

                try
                {
                    // Hủy toàn bộ phân công cũ (IsActive=0)
                    using (var cmd = new SqlCommand(@"
                        UPDATE PHONG_MANAGER SET IsActive=0
                        WHERE  IDManager=@mgr", conn, tran))
                    {
                        cmd.Parameters.AddWithValue("@mgr", dto.IDManager);
                        cmd.ExecuteNonQuery();
                    }

                    // Upsert phân công mới
                    foreach (var idPhong in dto.IDPhongs)
                    {
                        using var cmd = new SqlCommand(@"
                            IF EXISTS (
                                SELECT 1 FROM PHONG_MANAGER
                                WHERE IDPhong=@p AND IDManager=@m
                            )
                                UPDATE PHONG_MANAGER
                                SET    IsActive=1, NgayPhanCong=GETDATE()
                                WHERE  IDPhong=@p AND IDManager=@m
                            ELSE
                                INSERT INTO PHONG_MANAGER (IDPhong, IDManager, IsActive, NgayPhanCong)
                                VALUES (@p, @m, 1, GETDATE())", conn, tran);

                        cmd.Parameters.AddWithValue("@p", idPhong);
                        cmd.Parameters.AddWithValue("@m", dto.IDManager);
                        cmd.ExecuteNonQuery();
                    }

                    tran.Commit();
                    return new JsonResult(new
                    {
                        message = $"Đã phân công {dto.IDPhongs.Count} phòng thành công."
                    });
                }
                catch
                {
                    tran.Rollback();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi phân công phòng cho manager {id}", dto.IDManager);
                return StatusCode(500, new { message = "Lỗi hệ thống khi phân công phòng." });
            }
        }

        // ─── Lưu quyền ───────────────────────────────────────────────
        /// <summary>
        /// Upsert quyền vào ACCOUNT_PERMISSION.
        /// Bảng cần tồn tại trước (xem QUANLY_KHUTRO_Schema.sql mục 5).
        /// </summary>
        public IActionResult OnPostLuuQuyen([FromBody] LuuQuyenDto dto)
        {
            if (dto.IDManager <= 0)
                return BadRequest(new { message = "ID quản lý không hợp lệ." });

            try
            {
                using var conn = new SqlConnection(ConnStr);
                conn.Open();

                foreach (var (key, granted) in dto.Permissions)
                {
                    using var cmd = new SqlCommand(@"
                        IF EXISTS (
                            SELECT 1 FROM ACCOUNT_PERMISSION
                            WHERE IDManager=@mgr AND PermissionKey=@key
                        )
                            UPDATE ACCOUNT_PERMISSION
                            SET    IsGranted=@val
                            WHERE  IDManager=@mgr AND PermissionKey=@key
                        ELSE
                            INSERT INTO ACCOUNT_PERMISSION (IDManager, PermissionKey, IsGranted)
                            VALUES (@mgr, @key, @val)", conn);

                    cmd.Parameters.AddWithValue("@mgr", dto.IDManager);
                    cmd.Parameters.AddWithValue("@key", key);
                    cmd.Parameters.AddWithValue("@val", granted ? 1 : 0);
                    cmd.ExecuteNonQuery();
                }

                return new JsonResult(new { message = "Đã lưu phân quyền thành công." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi lưu quyền manager {id}", dto.IDManager);
                return StatusCode(500, new { message = "Lỗi hệ thống khi lưu quyền." });
            }
        }

        // ─── AJAX refresh danh sách (không reload trang) ─────────────
        public IActionResult OnGetDanhSachQuanLy()
        {
            try
            {
                var phong = LayTatCaPhong();
                var list = LayDanhSachQuanLy(phong);

                return new JsonResult(list.Select(q => new
                {
                    idUser = q.IDUser,
                    fullName = q.FullName,
                    username = q.Username,
                    phone = q.Phone,
                    email = q.Email,
                    isActive = q.IsActive,
                    createdAt = q.CreatedAt.ToString("dd/MM/yyyy"),
                    permissions = q.Permissions,
                    phongs = q.Phongs.Select(p => new
                    {
                        p.IDPhong,
                        p.SoPhong,
                        tang = (int)p.Tang,
                        p.TrangThai
                    })
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi API DanhSachQuanLy");
                return StatusCode(500, new { message = "Lỗi hệ thống." });
            }
        }
    }
}
