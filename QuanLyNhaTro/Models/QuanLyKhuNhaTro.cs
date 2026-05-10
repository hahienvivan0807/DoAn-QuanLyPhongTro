using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
namespace QuanLyNhaTro.Models
{
    public class ACCOUNT
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDUser { get; set; }
        public string Username { get; set; }
        public string Passwords { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Roles { get; set; }
        public string QR_Link { get; set; }
        public DateTime CreatedAt { get; set; }

    }
    [Table("PHONG")]
    public class PHONG
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDPhong { get; set; }

        [Required]
        [StringLength(10)]
        public string SoPhong { get; set; }

        [Required]
        [Column(TypeName = "decimal(15, 2)")]
        public decimal GiaPhongFix { get; set; }

        [StringLength(30)]
        public string TrangThai { get; set; }

        // Giúp bạn dễ dàng lấy danh sách điện nước từ 1 phòng bất kỳ
        public virtual ICollection<DIENNUOC> DanhSachDienNuoc { get; set; }
    }
    [Table("DIENNUOC")] 
    public class DIENNUOC
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDGhiNhan { get; set; }

        // Khóa ngoại liên kết với bảng PHONG
        [Required]
        public int IDPhong { get; set; }

        [Required(ErrorMessage = "Kỳ ghi nhận không được để trống")]
        [StringLength(7)] // varchar(7) - Ví dụ: "05/2026"
        public string KyGhiNhan { get; set; }

        [Required]
        public int SoDienMoi { get; set; }

        [Required]
        public int SoNuocMoi { get; set; }

        [Required]
        public int SoDienCu { get; set; }

        [Required]
        public int SoNuocCu { get; set; }

        [Required]
        [StringLength(255)] // varchar(255)
        public string AnhChupDongHo { get; set; }

        // bit, null trong SQL -> dùng bool? (nullable) trong C#
        public bool? TrangThaiDuyet { get; set; }

        // datetime, null trong SQL -> dùng DateTime? (nullable) trong C#
        public DateTime? NgayGhi { get; set; }

        // --- QUAN HỆ (NAVIGATION PROPERTIES) ---
        // Khai báo mối quan hệ để EF Core hiểu IDPhong nối tới bảng PHONG nào
        [ForeignKey("IDPhong")]
        public virtual PHONG Phong { get; set; }
    }


    public class QuanLyKhuNhaTro : DbContext
    {
        public QuanLyKhuNhaTro(DbContextOptions<QuanLyKhuNhaTro> options) : base(options) { }
        public DbSet <ACCOUNT> ACCOUNT { get; set; }
    }
}
