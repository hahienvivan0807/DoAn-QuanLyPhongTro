using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyNhaTro.Models
{
    // ================================================================
    // 1. ACCOUNT — Tài khoản (Chủ trọ / Quản lý / Khách thuê)
    // ================================================================
    [Table("ACCOUNT")]
    public class ACCOUNT
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDUser { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; } = null!;

        [Required]
        [StringLength(255)]
        public string Passwords { get; set; } = null!;

        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = null!;

        [Required]
        [StringLength(15)]
        public string Phone { get; set; } = null!;

        [StringLength(100)]
        public string? Email { get; set; }

        [StringLength(255)]
        public string? Avatar { get; set; }

        [Required]
        [StringLength(10)]
        public string Roles { get; set; } = null!; // 'Admin'|'Manager'|'Tenant'

        [StringLength(255)]
        public string? QR_Link { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Navigation Properties
        public virtual ICollection<REFRESH_TOKEN> RefreshTokens { get; set; } = new List<REFRESH_TOKEN>();
        public virtual ICollection<HOPDONG> HopDongTenants { get; set; } = new List<HOPDONG>();
        public virtual ICollection<HOPDONG> HopDongManagers { get; set; } = new List<HOPDONG>();
        public virtual ICollection<PHONG_MANAGER> PhongManagers { get; set; } = new List<PHONG_MANAGER>();
        public virtual ICollection<DONDV> DonDVGuiDi { get; set; } = new List<DONDV>();
        public virtual ICollection<DONDV> DonDVXuLy { get; set; } = new List<DONDV>();
        public virtual ICollection<DIENNUOC> DienNuocDuyet { get; set; } = new List<DIENNUOC>();
        public virtual ICollection<HDTHANG> HoaDonDuyet { get; set; } = new List<HDTHANG>();
        public virtual ICollection<THONGBAO> ThongBaos { get; set; } = new List<THONGBAO>();
        public virtual ICollection<KHACH_THUE> KhachThues { get; set; } = new List<KHACH_THUE>();
    }

    // ================================================================
    // 2. REFRESH_TOKEN — JWT Refresh Token
    // ================================================================
    [Table("REFRESH_TOKEN")]
    public class REFRESH_TOKEN
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDToken { get; set; }

        [Required]
        public int IDUser { get; set; }

        [Required]
        [StringLength(512)]
        public string Token { get; set; } = null!;

        [Required]
        public DateTime ExpiresAt { get; set; }

        public bool IsRevoked { get; set; } = false;

        public DateTime CreatedAt { get; set; }

        [ForeignKey("IDUser")]
        public virtual ACCOUNT Account { get; set; } = null!;
    }

    // ================================================================
    // 3. PHONG — Phòng trọ
    // ================================================================
    [Table("PHONG")]
    public class PHONG
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDPhong { get; set; }

        [Required]
        [StringLength(10)]
        public string SoPhong { get; set; } = null!;

        public byte Tang { get; set; } = 1;
        public int soluong { get; set; }

        [Column(TypeName = "decimal(6, 2)")]
        public decimal? DienTich { get; set; }

        [Required]
        [Column(TypeName = "decimal(15, 2)")]
        public decimal GiaPhongFix { get; set; }

        [StringLength(500)]
        public string? MoTa { get; set; }

        [Required]
        [StringLength(20)]
        public string TrangThai { get; set; } = "Trống"; // 'Trống'|'Đã thuê'|'Đang sửa'

        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public virtual ICollection<PHONG_MANAGER> PhongManagers { get; set; } = new List<PHONG_MANAGER>();
        public virtual ICollection<HOPDONG> HopDongs { get; set; } = new List<HOPDONG>();
        public virtual ICollection<DONDV> DonDVs { get; set; } = new List<DONDV>();
        public virtual ICollection<DIENNUOC> DanhSachDienNuoc { get; set; } = new List<DIENNUOC>();
        public virtual ICollection<HDTHANG> HoaDonThangs { get; set; } = new List<HDTHANG>();
    }

    // ================================================================
    // 4. PHONG_MANAGER — Phân công Quản lý → Phòng (N-N)
    // ================================================================
    [Table("PHONG_MANAGER")]
    public class PHONG_MANAGER
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [Required]
        public int IDPhong { get; set; }

        [Required]
        public int IDManager { get; set; }

        public bool IsActive { get; set; } = true;

        [StringLength(200)]
        public string? GhiChu { get; set; }

        public DateTime NgayPhanCong { get; set; }

        [ForeignKey("IDPhong")]
        public virtual PHONG Phong { get; set; } = null!;

        [ForeignKey("IDManager")]
        public virtual ACCOUNT Manager { get; set; } = null!;
    }

    // ================================================================
    // 5. HOPDONG — Hợp đồng thuê phòng
    // ================================================================
    [Table("HOPDONG")]
    public class HOPDONG
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDHopDong { get; set; }

        [Required]
        public int IDUser { get; set; } // Tenant

        [Required]
        public int IDPhong { get; set; }

        public int? IDManager { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateTime NgayBatDau { get; set; }

        [Column(TypeName = "date")]
        public DateTime? NgayKetThuc { get; set; }

        public int DienDauKy { get; set; } = 0;

        public int NuocDauKy { get; set; } = 0;

        [Column(TypeName = "decimal(15, 2)")]
        public decimal TienCocBanDau { get; set; } = 0;

        [Required]
        [StringLength(20)]
        public string TrangThaiHD { get; set; } = "Đang hiệu lực"; // 'Đang hiệu lực'|'Đã kết thúc'|'Đã hủy'

        [StringLength(500)]
        public string? GhiChu { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        [ForeignKey("IDUser")]
        public virtual ACCOUNT Tenant { get; set; } = null!;

        [ForeignKey("IDPhong")]
        public virtual PHONG Phong { get; set; } = null!;

        [ForeignKey("IDManager")]
        public virtual ACCOUNT? Manager { get; set; }
    }

    // ================================================================
    // 6. DONDV — Đơn dịch vụ
    // ================================================================
    [Table("DONDV")]
    public class DONDV
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDDonDV { get; set; }

        [Required]
        public int IDUser { get; set; }

        [Required]
        public int IDPhong { get; set; }

        public int? IDManagerXuLy { get; set; }

        [Required]
        [StringLength(30)]
        public string LoaiDV { get; set; } = null!; // 'Nước bình'|'Giặt sấy'|'Hư hỏng'|'Dịch vụ'

        [StringLength(500)]
        public string? NoiDung { get; set; }

        [Required]
        [StringLength(20)]
        public string MucDo { get; set; } = "Trung bình"; // 'Thấp'|'Trung bình'|'Khẩn cấp'

        [Column(TypeName = "decimal(15, 2)")]
        public decimal TongTien { get; set; } = 0;

        [Required]
        [StringLength(30)]
        // 'Chờ xử lý'|'Đang xử lý'|'Chờ thanh toán'|'Đang xử lý'|'Thành công'|'Đã hủy'
        public string TrangThai_DV { get; set; } = "Chờ xử lý";

        [StringLength(200)]
        public string? LyDoHuy { get; set; }

        [StringLength(10)]
        public string? NguoiHuy { get; set; }

        [StringLength(255)]
        public string? AnhBienLai { get; set; }

        [StringLength(255)]
        public string? AnhKetQua { get; set; }

        [StringLength(500)]
        public string? GhiChuXuLy { get; set; }

        public DateTime? NgayXuLy { get; set; }

        public DateTime? NgayHoanThanh { get; set; }
        public DateTime? NgayHetHan { get; set; }

        public DateTime NgayTao { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Navigation Properties
        [ForeignKey("IDUser")]
        public virtual ACCOUNT Tenant { get; set; } = null!;

        [ForeignKey("IDPhong")]
        public virtual PHONG Phong { get; set; } = null!;

        [ForeignKey("IDManagerXuLy")]
        public virtual ACCOUNT? ManagerXuLy { get; set; }
    }

    // ================================================================
    // 7. DIENNUOC — Chỉ số điện nước theo kỳ
    // ================================================================
    [Table("DIENNUOC")]
    public class DIENNUOC
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDGhiNhan { get; set; }

        [Required]
        public int IDPhong { get; set; }

        [Required]
        [StringLength(7)]
        public string KyGhiNhan { get; set; } = null!;

        [Required]
        public int SoDienMoi { get; set; }

        [Required]
        public int SoNuocMoi { get; set; }

        [Required]
        public int SoDienCu { get; set; }

        [Required]
        public int SoNuocCu { get; set; }

        [Required]
        [StringLength(255)]
        public string AnhChupDongHo { get; set; } = null!;

        // 0=Chờ duyệt | 1=Đã duyệt | 2=Từ chối
        public byte TrangThaiDuyet { get; set; } = 0;

        public int? IDManagerDuyet { get; set; }

        public DateTime? NgayDuyet { get; set; }

        [StringLength(200)]
        public string? GhiChuDuyet { get; set; }

        public DateTime NgayGhi { get; set; }

        // Navigation Properties
        [ForeignKey("IDPhong")]
        public virtual PHONG Phong { get; set; } = null!;

        [ForeignKey("IDManagerDuyet")]
        public virtual ACCOUNT? ManagerDuyet { get; set; }

        public virtual ICollection<HDTHANG> HoaDonThangs { get; set; } = new List<HDTHANG>();
    }

    // ================================================================
    // 8. HDTHANG — Hóa đơn tháng
    // ================================================================
    [Table("HDTHANG")]
    public class HDTHANG
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDHDThang { get; set; }

        [Required]
        public int IDPhong { get; set; }

        // Khóa ngoại cho phép Null khi chưa chốt điện nước
        public int? IDDienNuoc { get; set; }

        // Khóa ngoại cho phép Null khi chưa có người duyệt
        public int? IDManagerDuyet { get; set; }

        [Required]
        [StringLength(7)]
        public string? KyThanhToan { get; set; } = null!; // Định dạng: "MM/yyyy"

        [Required]
        [Column(TypeName = "decimal(15, 2)")]
        public decimal? TienPhong { get; set; }

        [Required]
        [Column(TypeName = "decimal(15, 2)")]
        public decimal? TienDienSum { get; set; }

        [Required]
        [Column(TypeName = "decimal(15, 2)")]
        public decimal? TienNuocSum { get; set; }

        // TienDV: dịch vụ đã thanh toán đúng hạn trong tháng
        [Column(TypeName = "decimal(15, 2)")]
        public decimal? TienDV { get; set; } = 0;

        // TienNoDV: nợ dịch vụ quá hạn bị cộng thêm vào hóa đơn
        // Trong SQL Server cột này cho phép (null) -> Bắt buộc dùng decimal?
        [Column(TypeName = "decimal(15, 2)")]
        public decimal? TienNoDV { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(15, 2)")]
        // TongCong = TienPhong + TienDienSum + TienNuocSum + TienDV + TienNoDV
        public decimal TongCong { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateTime HanDong { get; set; }

        [Required]
        [StringLength(20)]
        // Các trạng thái: 'Chưa đóng' | 'Chờ duyệt' | 'Đã hoàn thành' | 'Quá hạn'
        public string TrangThai_TT { get; set; } = "Chưa đóng";

        [StringLength(255)]
        public string? AnhChuyenKhoan { get; set; }

        public DateTime? NgayDuyet { get; set; }

        [StringLength(200)]
        public string? GhiChuDuyet { get; set; }

        public DateTime NgayXuatHD { get; set; }

        public DateTime UpdatedAt { get; set; }

        // NgayHetHan: mốc chuyển sang trạng thái "Quá hạn"
        // Cho phép Null -> Khớp với DB
        public DateTime? NgayHetHan { get; set; }

        // DaCoNhacNo và DuocCongVaoTro: Dùng bool? để an toàn tuyệt đối tránh lỗi SqlNullValueException
        // Gán sẵn giá trị mặc định là false để tiện cho logic C#
        public bool? DaCoNhacNo { get; set; } = false;
        public bool? DuocCongVaoTro { get; set; } = false;


        // ==========================================
        // Navigation Properties
        // ==========================================
        [ForeignKey("IDPhong")]
        public virtual PHONG Phong { get; set; } = null!;

        [ForeignKey("IDDienNuoc")]
        public virtual DIENNUOC? DienNuoc { get; set; }

        [ForeignKey("IDManagerDuyet")]
        public virtual ACCOUNT? ManagerDuyet { get; set; }
    }

    // ================================================================
    // 9. THONGBAO — Thông báo hệ thống
    // ================================================================
    [Table("THONGBAO")]
    public class THONGBAO
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDThongBao { get; set; }

        public int? IDNguoiGui { get; set; }

        public int? IDUser { get; set; } // NULL = broadcast tất cả

        public int? IDNguonTB { get; set; }

        [StringLength(20)]
        public string? LoaiNguon { get; set; } // 'DonDV'|'HoaDon'|'DiemNuoc'|'HeThong'

        [Required]
        [StringLength(200)]
        public string TieuDe { get; set; } = null!;

        [StringLength(500)]
        public string? NoiDung { get; set; }

        [Required]
        [StringLength(20)]
        public string LoaiTB { get; set; } = "thong-tin"; // 'thong-tin'|'canh-bao'|'thanh-toan'|'he-thong'

        public bool DaDoc { get; set; } = false;

        public DateTime NgayTao { get; set; }

        // Navigation Properties
        [ForeignKey("IDUser")]
        public virtual ACCOUNT? NguoiNhan { get; set; }

        [ForeignKey("IDNguoiGui")]
        public virtual ACCOUNT? NguoiGui { get; set; }
    }

    // ================================================================
    // 10. CONFIG_GIA — Đơn giá dịch vụ
    // ================================================================
    [Table("CONFIG_GIA")]
    public class CONFIG_GIA
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDConfig { get; set; }

        [Required]
        [StringLength(50)]
        public string TenDichVu { get; set; } = null!;

        [Required]
        [StringLength(30)]
        public string MaDichVu { get; set; } = null!;

        [Required]
        [Column(TypeName = "decimal(15, 2)")]
        public decimal DonGia { get; set; }

        [Required]
        [StringLength(20)]
        public string DonVi { get; set; } = "lần";

        public bool IsActive { get; set; } = true;

        public DateTime NgayApDung { get; set; }
    }

    // ================================================================
    // 11. THONGKE_TONG — Snapshot thống kê (1 dòng duy nhất)
    // ================================================================
    [Table("THONGKE_TONG")]
    public class THONGKE_TONG
    {
        [Key]
        public int ID { get; set; } = 1;

        public int TongSoPhong { get; set; } = 0;
        public int PhongDangThue { get; set; } = 0;
        public int PhongConTrong { get; set; } = 0;
        public int PhongDangSua { get; set; } = 0;

        [Column(TypeName = "decimal(5, 2)")]
        public decimal TiLeLapDay { get; set; } = 0;

        [Column(TypeName = "decimal(15, 2)")]
        public decimal DoanhThuThangNay { get; set; } = 0;

        [Column(TypeName = "decimal(15, 2)")]
        public decimal DoanhThuThangTruoc { get; set; } = 0;

        [Column(TypeName = "decimal(5, 2)")]
        public decimal TangTruongDoanhThu { get; set; } = 0;

        public int HoaDonChuaDong { get; set; } = 0;
        public int HoaDonSapDenHan { get; set; } = 0;
        public int HoaDonQuaHan { get; set; } = 0;
        public int DonDVChoXuLy { get; set; } = 0;
        public int DonDVKhanCap { get; set; } = 0;

        public DateTime NgayCapNhat { get; set; }
    }

    // ================================================================
    // 12. THONGKE_DOANHTHU_THANG — Doanh thu theo từng tháng
    // ================================================================
    [Table("THONGKE_DOANHTHU_THANG")]
    public class THONGKE_DOANHTHU_THANG
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDThongKe { get; set; }

        [Required]
        public short Nam { get; set; }

        [Required]
        [Range(1, 12)]
        public byte Thang { get; set; }

        [Column(TypeName = "decimal(15, 2)")]
        public decimal TongTienPhong { get; set; } = 0;

        [Column(TypeName = "decimal(15, 2)")]
        public decimal TongTienDien { get; set; } = 0;

        [Column(TypeName = "decimal(15, 2)")]
        public decimal TongTienNuoc { get; set; } = 0;

        [Column(TypeName = "decimal(15, 2)")]
        public decimal TongTienDV { get; set; } = 0;

        [Column(TypeName = "decimal(15, 2)")]
        public decimal TongCong { get; set; } = 0;

        public int SoHoaDonDaDong { get; set; } = 0;

        [Column(TypeName = "decimal(15, 2)")]
        public decimal ChiPhiThang { get; set; } = 0;

        public DateTime NgayCapNhat { get; set; }
    }

    // ================================================================
    // 13. KHACH_THUE — Thông tin chi tiết khách thuê
    // ================================================================
    [Table("KHACH_THUE")]
    public class KHACH_THUE
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDKhachThue { get; set; }

        public int IDUser { get; set; }

        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        [StringLength(100)]
        public string? HoTen { get; set; }

        [StringLength(15)]
        public string? SoCCCD { get; set; }

        public DateTime? NgaySinh { get; set; }

        [StringLength(10)]
        public string? GioiTinh { get; set; }

        [StringLength(15)]
        public string? SoDienThoai { get; set; }

        [StringLength(255)]
        public string? QueQuan { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string? AnhChanDung { get; set; }

        public DateTime NgayVaoO { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string? GhiChu { get; set; }

        [StringLength(255)]
        public string? DiaChiThuongTru { get; set; }

        // Navigation Properties
        [ForeignKey("IDUser")]
        public virtual ACCOUNT? Account { get; set; }
    }

    // ================================================================
    // DbContext
    // ================================================================
    public class QuanLyKhuNhaTro : DbContext
    {
        public QuanLyKhuNhaTro(DbContextOptions<QuanLyKhuNhaTro> options) : base(options) { }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(w =>
                w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics
                         .RelationalEventId.PendingModelChangesWarning));
        }

        public DbSet<ACCOUNT> ACCOUNT { get; set; }
        public DbSet<REFRESH_TOKEN> REFRESH_TOKEN { get; set; }
        public DbSet<PHONG> PHONG { get; set; }
        public DbSet<PHONG_MANAGER> PHONG_MANAGER { get; set; }
        public DbSet<HOPDONG> HOPDONG { get; set; }
        public DbSet<DONDV> DONDV { get; set; }
        public DbSet<DIENNUOC> DIENNUOC { get; set; }
        public DbSet<HDTHANG> HDTHANG { get; set; }
        public DbSet<THONGBAO> THONGBAO { get; set; }
        public DbSet<CONFIG_GIA> CONFIG_GIA { get; set; }
        public DbSet<THONGKE_TONG> THONGKE_TONG { get; set; }
        public DbSet<THONGKE_DOANHTHU_THANG> THONGKE_DOANHTHU_THANG { get; set; }
        public DbSet<KHACH_THUE> KHACH_THUE { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── ACCOUNT ──────────────────────────────────────────────
            modelBuilder.Entity<ACCOUNT>(entity =>
            {
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Roles);
                entity.HasIndex(e => e.IsActive);
                entity.Property(e => e.Roles).HasConversion<string>();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // ── REFRESH_TOKEN ────────────────────────────────────────
            modelBuilder.Entity<REFRESH_TOKEN>(entity =>
            {
                entity.HasIndex(e => e.Token).IsUnique();
                entity.HasIndex(e => e.IDUser);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Account)
                      .WithMany(a => a.RefreshTokens)
                      .HasForeignKey(e => e.IDUser)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ── PHONG ────────────────────────────────────────────────
            modelBuilder.Entity<PHONG>(entity =>
            {
                entity.HasIndex(e => e.SoPhong).IsUnique();
                entity.HasIndex(e => e.TrangThai);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // ── PHONG_MANAGER ────────────────────────────────────────
            modelBuilder.Entity<PHONG_MANAGER>(entity =>
            {
                entity.HasIndex(e => new { e.IDPhong, e.IDManager, e.IsActive }).IsUnique();
                entity.Property(e => e.NgayPhanCong).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Phong)
                      .WithMany(p => p.PhongManagers)
                      .HasForeignKey(e => e.IDPhong)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Manager)
                      .WithMany(a => a.PhongManagers)
                      .HasForeignKey(e => e.IDManager)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ── HOPDONG ──────────────────────────────────────────────
            modelBuilder.Entity<HOPDONG>(entity =>
            {
                entity.HasIndex(e => e.IDUser);
                entity.HasIndex(e => e.IDPhong);
                entity.HasIndex(e => e.IDManager);
                entity.HasIndex(e => e.TrangThaiHD);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Tenant)
                      .WithMany(a => a.HopDongTenants)
                      .HasForeignKey(e => e.IDUser)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Phong)
                      .WithMany(p => p.HopDongs)
                      .HasForeignKey(e => e.IDPhong)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Manager)
                      .WithMany(a => a.HopDongManagers)
                      .HasForeignKey(e => e.IDManager)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // ── DONDV ────────────────────────────────────────────────
            modelBuilder.Entity<DONDV>(entity =>
            {
                entity.HasIndex(e => e.IDUser);
                entity.HasIndex(e => e.IDPhong);
                entity.HasIndex(e => e.IDManagerXuLy);
                entity.HasIndex(e => e.TrangThai_DV);
                entity.HasIndex(e => e.LoaiDV);
                entity.HasIndex(e => new { e.IDPhong, e.TrangThai_DV });
                entity.Property(e => e.NgayTao).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Tenant)
                      .WithMany(a => a.DonDVGuiDi)
                      .HasForeignKey(e => e.IDUser)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Phong)
                      .WithMany(p => p.DonDVs)
                      .HasForeignKey(e => e.IDPhong)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ManagerXuLy)
                      .WithMany(a => a.DonDVXuLy)
                      .HasForeignKey(e => e.IDManagerXuLy)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // ── DIENNUOC ─────────────────────────────────────────────
            modelBuilder.Entity<DIENNUOC>(entity =>
            {
                entity.HasIndex(e => new { e.IDPhong, e.KyGhiNhan }).IsUnique();
                entity.HasIndex(e => e.TrangThaiDuyet);
                entity.Property(e => e.NgayGhi).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Phong)
                      .WithMany(p => p.DanhSachDienNuoc)
                      .HasForeignKey(e => e.IDPhong)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ManagerDuyet)
                      .WithMany(a => a.DienNuocDuyet)
                      .HasForeignKey(e => e.IDManagerDuyet)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // ── HDTHANG ──────────────────────────────────────────────
            modelBuilder.Entity<HDTHANG>(entity =>
            {
                entity.HasIndex(e => new { e.IDPhong, e.KyThanhToan }).IsUnique();
                entity.HasIndex(e => e.TrangThai_TT);
                entity.HasIndex(e => e.IDManagerDuyet);
                entity.HasIndex(e => new { e.KyThanhToan, e.TrangThai_TT });

                entity.Property(e => e.TienNoDV).HasDefaultValue(0m);
                entity.Property(e => e.TienDV).HasDefaultValue(0m);
                entity.Property(e => e.DaCoNhacNo).HasDefaultValue(false);
                entity.Property(e => e.DuocCongVaoTro).HasDefaultValue(false);
                entity.Property(e => e.NgayXuatHD).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Phong)
                      .WithMany(p => p.HoaDonThangs)
                      .HasForeignKey(e => e.IDPhong)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.DienNuoc)
                      .WithMany(d => d.HoaDonThangs)
                      .HasForeignKey(e => e.IDDienNuoc)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.ManagerDuyet)
                      .WithMany(a => a.HoaDonDuyet)
                      .HasForeignKey(e => e.IDManagerDuyet)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // ── THONGBAO ─────────────────────────────────────────────
            modelBuilder.Entity<THONGBAO>(entity =>
            {
                entity.HasIndex(e => new { e.IDUser, e.DaDoc });
                entity.HasIndex(e => e.NgayTao);
                entity.Property(e => e.NgayTao).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.NguoiNhan)
                      .WithMany(a => a.ThongBaos)
                      .HasForeignKey(e => e.IDUser)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.NguoiGui)
                      .WithMany()
                      .HasForeignKey(e => e.IDNguoiGui)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // ── CONFIG_GIA ───────────────────────────────────────────
            modelBuilder.Entity<CONFIG_GIA>(entity =>
            {
                entity.HasIndex(e => e.MaDichVu).IsUnique();
                entity.Property(e => e.NgayApDung).HasDefaultValueSql("GETUTCDATE()");
            });

            // ── THONGKE_TONG ─────────────────────────────────────────
            modelBuilder.Entity<THONGKE_TONG>(entity =>
            {
                entity.ToTable("THONGKE_TONG", t =>
                    t.HasCheckConstraint("CHK_ID_1", "[ID] = 1"));
                entity.Property(e => e.NgayCapNhat).HasDefaultValueSql("GETUTCDATE()");
            });

            // ── THONGKE_DOANHTHU_THANG ───────────────────────────────
            modelBuilder.Entity<THONGKE_DOANHTHU_THANG>(entity =>
            {
                entity.HasIndex(e => new { e.Nam, e.Thang }).IsUnique();
                entity.Property(e => e.NgayCapNhat).HasDefaultValueSql("GETUTCDATE()");
            });

            // ── KHACH_THUE ───────────────────────────────────────────
            modelBuilder.Entity<KHACH_THUE>(entity =>
            {
                entity.HasIndex(e => e.IDUser);
                entity.Property(e => e.NgayVaoO).HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.Account)
                      .WithMany(a => a.KhachThues)
                      .HasForeignKey(e => e.IDUser)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
