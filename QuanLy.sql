USE [master]
GO
/****** Object:  Database [QUANLY_KHUTRO]    Script Date: 19/05/2026 7:45:36 CH ******/
CREATE DATABASE [QUANLY_KHUTRO]
GO
ALTER DATABASE [QUANLY_KHUTRO] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [QUANLY_KHUTRO].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [QUANLY_KHUTRO] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET ARITHABORT OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET  ENABLE_BROKER 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET  MULTI_USER 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [QUANLY_KHUTRO] SET DB_CHAINING OFF 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [QUANLY_KHUTRO] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [QUANLY_KHUTRO] SET QUERY_STORE = ON
GO
ALTER DATABASE [QUANLY_KHUTRO] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [QUANLY_KHUTRO]
GO
/****** Object:  Table [dbo].[__EFMigrationsHistory]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[__EFMigrationsHistory](
	[MigrationId] [nvarchar](150) NOT NULL,
	[ProductVersion] [nvarchar](32) NOT NULL,
 CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED 
(
	[MigrationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACCOUNT]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACCOUNT](
	[IDUser] [int] IDENTITY(1,1) NOT NULL,
	[Username] [varchar](50) NOT NULL,
	[Passwords] [varchar](255) NOT NULL,
	[FullName] [nvarchar](100) NOT NULL,
	[Phone] [varchar](15) NOT NULL,
	[Email] [varchar](100) NULL,
	[Avatar] [varchar](255) NULL,
	[Roles] [varchar](10) NOT NULL,
	[QR_Link] [varchar](255) NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IDUser] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CONFIG_GIA]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CONFIG_GIA](
	[IDConfig] [int] IDENTITY(1,1) NOT NULL,
	[TenDichVu] [nvarchar](50) NOT NULL,
	[MaDichVu] [varchar](30) NOT NULL,
	[DonGia] [decimal](15, 2) NOT NULL,
	[DonVi] [nvarchar](20) NOT NULL,
	[IsActive] [bit] NOT NULL,
	[NgayApDung] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IDConfig] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DIENNUOC]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DIENNUOC](
	[IDGhiNhan] [int] IDENTITY(1,1) NOT NULL,
	[IDPhong] [int] NOT NULL,
	[KyGhiNhan] [varchar](7) NOT NULL,
	[SoDienMoi] [int] NOT NULL,
	[SoNuocMoi] [int] NOT NULL,
	[SoDienCu] [int] NOT NULL,
	[SoNuocCu] [int] NOT NULL,
	[AnhChupDongHo] [varchar](255) NOT NULL,
	[TrangThaiDuyet] [tinyint] NOT NULL,
	[IDManagerDuyet] [int] NULL,
	[NgayDuyet] [datetime2](7) NULL,
	[GhiChuDuyet] [nvarchar](200) NULL,
	[NgayGhi] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IDGhiNhan] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DONDV]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DONDV](
	[IDDonDV] [int] IDENTITY(1,1) NOT NULL,
	[IDUser] [int] NOT NULL,
	[IDPhong] [int] NOT NULL,
	[IDManagerXuLy] [int] NULL,
	[LoaiDV] [nvarchar](30) NOT NULL,
	[NoiDung] [nvarchar](500) NULL,
	[MucDo] [nvarchar](20) NOT NULL,
	[TongTien] [decimal](15, 2) NOT NULL,
	[TrangThai_DV] [nvarchar](30) NOT NULL,
	[LyDoHuy] [nvarchar](200) NULL,
	[NguoiHuy] [varchar](10) NULL,
	[AnhBienLai] [varchar](255) NULL,
	[AnhKetQua] [varchar](255) NULL,
	[GhiChuXuLy] [nvarchar](500) NULL,
	[NgayXuLy] [datetime2](7) NULL,
	[NgayHoanThanh] [datetime2](7) NULL,
	[NgayTao] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
	[NgayHetHan] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[IDDonDV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[HDTHANG]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HDTHANG](
	[IDHDThang] [int] IDENTITY(1,1) NOT NULL,
	[IDPhong] [int] NOT NULL,
	[IDDienNuoc] [int] NULL,
	[IDManagerDuyet] [int] NULL,
	[KyThanhToan] [varchar](7) NOT NULL,
	[TienPhong] [decimal](15, 2) NOT NULL,
	[TienDienSum] [decimal](15, 2) NOT NULL,
	[TienNuocSum] [decimal](15, 2) NOT NULL,
	[TienDV] [decimal](15, 2) NOT NULL,
	[TongCong] [decimal](15, 2) NOT NULL,
	[HanDong] [date] NOT NULL,
	[TrangThai_TT] [nvarchar](20) NOT NULL,
	[AnhChuyenKhoan] [varchar](255) NULL,
	[NgayDuyet] [datetime2](7) NULL,
	[GhiChuDuyet] [nvarchar](200) NULL,
	[NgayXuatHD] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
	[TienNoDV] [decimal](15, 2) NULL,
	[NgayHetHan] [datetime2](7) NULL,
	[DuocCongVaoTro] [bit] NOT NULL,
	[DaCoNhacNo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IDHDThang] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[HOPDONG]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HOPDONG](
	[IDHopDong] [int] IDENTITY(1,1) NOT NULL,
	[IDUser] [int] NOT NULL,
	[IDPhong] [int] NOT NULL,
	[IDManager] [int] NULL,
	[NgayBatDau] [date] NOT NULL,
	[NgayKetThuc] [date] NULL,
	[DienDauKy] [int] NOT NULL,
	[NuocDauKy] [int] NOT NULL,
	[TienCocBanDau] [decimal](15, 2) NOT NULL,
	[TrangThaiHD] [nvarchar](20) NOT NULL,
	[GhiChu] [nvarchar](500) NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IDHopDong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[KHACH_THUE]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[KHACH_THUE](
	[IDKhachThue] [int] IDENTITY(1,1) NOT NULL,
	[IDUser] [int] NOT NULL,
	[HoTen] [nvarchar](100) NOT NULL,
	[SoCCCD] [varchar](15) NOT NULL,
	[NgaySinh] [date] NULL,
	[GioiTinh] [nvarchar](10) NULL,
	[SoDienThoai] [varchar](15) NULL,
	[QueQuan] [nvarchar](100) NULL,
	[AnhChanDung] [nvarchar](max) NULL,
	[NgayVaoO] [date] NULL,
	[GhiChu] [nvarchar](max) NULL,
	[DiaChiThuongTru] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[IDKhachThue] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PHONG]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PHONG](
	[IDPhong] [int] IDENTITY(1,1) NOT NULL,
	[SoPhong] [varchar](10) NOT NULL,
	[Tang] [tinyint] NOT NULL,
	[DienTich] [decimal](6, 2) NULL,
	[GiaPhongFix] [decimal](15, 2) NOT NULL,
	[MoTa] [nvarchar](500) NULL,
	[TrangThai] [nvarchar](20) NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[soluong] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[IDPhong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PHONG_MANAGER]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PHONG_MANAGER](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[IDPhong] [int] NOT NULL,
	[IDManager] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[GhiChu] [nvarchar](200) NULL,
	[NgayPhanCong] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[REFRESH_TOKEN]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[REFRESH_TOKEN](
	[IDToken] [int] IDENTITY(1,1) NOT NULL,
	[IDUser] [int] NOT NULL,
	[Token] [varchar](512) NOT NULL,
	[ExpiresAt] [datetime2](7) NOT NULL,
	[IsRevoked] [bit] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IDToken] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[THONGBAO]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[THONGBAO](
	[IDThongBao] [int] IDENTITY(1,1) NOT NULL,
	[IDNguoiGui] [int] NULL,
	[IDUser] [int] NULL,
	[IDNguonTB] [int] NULL,
	[LoaiNguon] [varchar](20) NULL,
	[TieuDe] [nvarchar](200) NOT NULL,
	[NoiDung] [nvarchar](500) NULL,
	[LoaiTB] [nvarchar](20) NOT NULL,
	[DaDoc] [bit] NOT NULL,
	[NgayTao] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IDThongBao] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[THONGKE_DOANHTHU_THANG]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[THONGKE_DOANHTHU_THANG](
	[IDThongKe] [int] IDENTITY(1,1) NOT NULL,
	[Nam] [smallint] NOT NULL,
	[Thang] [tinyint] NOT NULL,
	[TongTienPhong] [decimal](15, 2) NOT NULL,
	[TongTienDien] [decimal](15, 2) NOT NULL,
	[TongTienNuoc] [decimal](15, 2) NOT NULL,
	[TongTienDV] [decimal](15, 2) NOT NULL,
	[TongCong] [decimal](15, 2) NOT NULL,
	[SoHoaDonDaDong] [int] NOT NULL,
	[NgayCapNhat] [datetime2](7) NOT NULL,
	[ChiPhiThang] [decimal](15, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[IDThongKe] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[THONGKE_TONG]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[THONGKE_TONG](
	[ID] [int] NOT NULL,
	[TongSoPhong] [int] NOT NULL,
	[PhongDangThue] [int] NOT NULL,
	[PhongConTrong] [int] NOT NULL,
	[PhongDangSua] [int] NOT NULL,
	[TiLeLapDay] [decimal](5, 2) NOT NULL,
	[DoanhThuThangNay] [decimal](15, 2) NOT NULL,
	[DoanhThuThangTruoc] [decimal](15, 2) NOT NULL,
	[TangTruongDoanhThu] [decimal](5, 2) NOT NULL,
	[HoaDonChuaDong] [int] NOT NULL,
	[HoaDonSapDenHan] [int] NOT NULL,
	[HoaDonQuaHan] [int] NOT NULL,
	[DonDVChoXuLy] [int] NOT NULL,
	[DonDVKhanCap] [int] NOT NULL,
	[NgayCapNhat] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_THONGKE_TONG] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260514011225_InitialBaseline', N'10.0.7')
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260514020204_Add_Column_NgayHetHan', N'10.0.7')
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260514024643_Update_HDTHANG_Add_3Columns', N'10.0.7')
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260514025507_Fix_Column_Location_V2', N'10.0.7')
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260514031207_Merge_Models_Update', N'10.0.7')
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260515003616_Add_DuocCongVaoTro_Column', N'10.0.7')
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260515005146_Add_DuocCongVaoTro_And_NgayHetHan', N'10.0.7')
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260515010127_Add_NgayHetHan_Column', N'10.0.7')
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260515011044_Force_Add_NgayHetHan', N'10.0.7')
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260516020302_Add_NgayHetHan_To_DONDV', N'10.0.7')
GO
SET IDENTITY_INSERT [dbo].[ACCOUNT] ON 

INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (2, N'manager1', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Trần Thị Quản Lý', N'0900222333', N'mgr1@nhatro.vn', NULL, N'Manager', N'qr_manager1.png', 1, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (3, N'manager2', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Lê Minh Quản', N'0900333444', N'mgr2@nhatro.vn', NULL, N'Manager', N'qr_manager2.png', 1, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (4, N'tenant01', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Phạm Văn An', N'0911000001', N'an@gmail.com', NULL, N'Tenant', NULL, 0, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (5, N'tenant02', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Hoàng Thị Bình', N'0911000002', N'binh@gmail.com', NULL, N'Tenant', NULL, 0, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (6, N'tenant03', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Vũ Minh Châu', N'0911000003', NULL, NULL, N'Tenant', NULL, 1, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (7, N'tenant04', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Đặng Quốc Dũng', N'0911000004', NULL, NULL, N'Tenant', NULL, 1, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (8, N'tenant05', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Bùi Thị Em', N'0911000005', NULL, NULL, N'Tenant', NULL, 1, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (9, N'tenant06', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Đỗ Hữu Phúc', N'0911000006', NULL, NULL, N'Tenant', NULL, 1, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (10, N'tenant07', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Hồ Ngọc Giang', N'0911000007', NULL, NULL, N'Tenant', NULL, 1, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (11, N'tenant08', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Ngô Thị Hà', N'0911000008', NULL, NULL, N'Tenant', NULL, 1, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (12, N'tenant09', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Dương Văn Hùng', N'0911000009', NULL, NULL, N'Tenant', NULL, 1, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (13, N'tenant10', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Lý Thị Lan', N'0911000010', NULL, NULL, N'Tenant', NULL, 1, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (14, N'tenant11', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Đào Minh Long', N'0911000011', NULL, NULL, N'Tenant', NULL, 1, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (15, N'tenant12', N'$2a$11$REPLACE_REAL_HASH_HERE____________________.', N'Đoàn Thị Mai', N'0911000012', NULL, NULL, N'Tenant', NULL, 1, CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2), CAST(N'2026-05-11T12:52:36.1844805' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (16, N'ChuTro', N'$2a$11$b5D6uoeMLYqtf0iM03P3gu8BfpRzIh3Vrd8DO2lGZAXsdZaqTU9YO', N'Trần Minh Quân', N'0912345678', N'quan@gmail.com', NULL, N'Admin', N'qrchutro.jpg', 1, CAST(N'2026-05-11T14:11:34.3870064' AS DateTime2), CAST(N'2026-05-11T14:11:34.3871471' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (17, N'yenngoc', N'$2a$11$ku1KDau3QfMT4AXjgLah3uUE5R6ul2Nl.qgIIiMjL.sidhxkiaWBe', N'Yến Ngọc', N'0912082596', N'ngoc07966@gmail.com', NULL, N'Tenant', NULL, 1, CAST(N'2026-05-11T14:13:02.7041901' AS DateTime2), CAST(N'2026-05-13T07:26:11.8555270' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (18, N'Ngot', N'$2a$11$yz.v31QU4PRw7PnV5cWR/OIQ6xuZJN2DVvCJUOxK1tOWll.S/KsdS', N'Nguyễn Hoàng Yến Ngọc', N'0987654321', N'ngot@gmail.com', NULL, N'Manager', N'qr_manager2.png', 1, CAST(N'2026-05-11T14:13:36.0779105' AS DateTime2), CAST(N'2026-05-11T14:13:36.0779113' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (19, N'tenant_test', N'$2a$11$REPLACE_REAL_HASH_HERE______________________________', N'Khách Test', N'0900000099', NULL, NULL, N'Tenant', NULL, 0, CAST(N'2026-05-12T01:46:48.8214940' AS DateTime2), CAST(N'2026-05-12T01:46:48.8214940' AS DateTime2))
INSERT [dbo].[ACCOUNT] ([IDUser], [Username], [Passwords], [FullName], [Phone], [Email], [Avatar], [Roles], [QR_Link], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (20, N'tuinetroi', N'$2a$11$1H52VIWEXwAlxig.qFiX2OgStF0v4c8YEBQW.rZXSVXz5jqUClkc6', N'Nguyễn văn thị a', N'0335090046', N'xyz@gmail.com', NULL, N'Tenant', N'abc', 1, CAST(N'2026-05-16T14:03:10.5138299' AS DateTime2), CAST(N'2026-05-16T07:03:10.6466667' AS DateTime2))
SET IDENTITY_INSERT [dbo].[ACCOUNT] OFF
GO
SET IDENTITY_INSERT [dbo].[CONFIG_GIA] ON 

INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (1, N'Giá Điện', N'dien', CAST(3500.00 AS Decimal(15, 2)), N'kWh', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (2, N'Giá Nước', N'nuoc', CAST(20000.00 AS Decimal(15, 2)), N'm³', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (3, N'Phí Rác sinh hoạt', N'rac', CAST(30000.00 AS Decimal(15, 2)), N'tháng', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (4, N'Wifi / Internet', N'wifi', CAST(50000.00 AS Decimal(15, 2)), N'tháng', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (5, N'Gửi xe máy', N'xe_may', CAST(100000.00 AS Decimal(15, 2)), N'tháng', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (6, N'Gửi xe đạp', N'xe_dap', CAST(50000.00 AS Decimal(15, 2)), N'tháng', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (7, N'Giặt sấy khô', N'giat_kho', CAST(15000.00 AS Decimal(15, 2)), N'kg', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (8, N'Giặt sấy ướt', N'giat_uot', CAST(10000.00 AS Decimal(15, 2)), N'kg', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (9, N'Nước bình Vihawa 20L', N'nuoc_vihawa', CAST(50000.00 AS Decimal(15, 2)), N'bình', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (10, N'Nước bình Lavie 19L', N'nuoc_lavie', CAST(60000.00 AS Decimal(15, 2)), N'bình', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (11, N'Dọn vệ sinh phòng', N've_sinh', CAST(100000.00 AS Decimal(15, 2)), N'lần', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (12, N'Phí quản lý chung', N'phi_ql', CAST(50000.00 AS Decimal(15, 2)), N'tháng', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (13, N'Thẻ từ ra vào', N'the_tu', CAST(50000.00 AS Decimal(15, 2)), N'thẻ', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (14, N'Phí phạt trễ hạn', N'phat_tre', CAST(200000.00 AS Decimal(15, 2)), N'lần', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
INSERT [dbo].[CONFIG_GIA] ([IDConfig], [TenDichVu], [MaDichVu], [DonGia], [DonVi], [IsActive], [NgayApDung]) VALUES (15, N'Sửa đường ống nước', N'sua_ong', CAST(100000.00 AS Decimal(15, 2)), N'lần', 1, CAST(N'2026-05-11T12:52:36.2833219' AS DateTime2))
SET IDENTITY_INSERT [dbo].[CONFIG_GIA] OFF
GO
SET IDENTITY_INSERT [dbo].[DIENNUOC] ON 

INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (1, 1, N'05/2024', 150, 15, 100, 10, N'dn_p01_0524.jpg', 1, 2, CAST(N'2024-05-03T09:00:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (2, 2, N'05/2024', 210, 18, 150, 12, N'dn_p02_0524.jpg', 1, 2, CAST(N'2024-05-03T09:05:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (3, 3, N'05/2024', 280, 26, 200, 20, N'dn_p03_0524.jpg', 1, 2, CAST(N'2024-05-03T09:10:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (4, 4, N'05/2024', 360, 32, 300, 25, N'dn_p04_0524.jpg', 1, 2, CAST(N'2024-05-03T09:15:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (5, 5, N'05/2024', 420, 38, 350, 30, N'dn_p05_0524.jpg', 1, 2, CAST(N'2024-05-03T09:20:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (6, 6, N'05/2024', 490, 47, 400, 40, N'dn_p06_0524.jpg', 1, 2, CAST(N'2024-05-03T09:25:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (7, 7, N'05/2024', 530, 52, 450, 45, N'dn_p07_0524.jpg', 1, 2, CAST(N'2024-05-03T09:30:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (8, 8, N'05/2024', 580, 58, 500, 50, N'dn_p08_0524.jpg', 0, NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (9, 9, N'05/2024', 620, 61, 550, 55, N'dn_p09_0524.jpg', 0, NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (10, 10, N'05/2024', 680, 67, 600, 60, N'dn_p10_0524.jpg', 0, NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (11, 11, N'05/2024', 730, 72, 650, 65, N'dn_p11_0524.jpg', 1, 3, CAST(N'2024-05-03T10:00:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (12, 12, N'05/2024', 790, 78, 700, 70, N'dn_p12_0524.jpg', 1, 3, CAST(N'2024-05-03T10:05:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (13, 1, N'04/2024', 100, 10, 60, 5, N'dn_p01_0424.jpg', 1, 2, CAST(N'2024-04-03T09:00:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (14, 2, N'04/2024', 150, 12, 100, 8, N'dn_p02_0424.jpg', 1, 2, CAST(N'2024-04-03T09:05:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (15, 3, N'04/2024', 200, 20, 160, 15, N'dn_p03_0424.jpg', 1, 2, CAST(N'2024-04-03T09:10:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2433957' AS DateTime2))
INSERT [dbo].[DIENNUOC] ([IDGhiNhan], [IDPhong], [KyGhiNhan], [SoDienMoi], [SoNuocMoi], [SoDienCu], [SoNuocCu], [AnhChupDongHo], [TrangThaiDuyet], [IDManagerDuyet], [NgayDuyet], [GhiChuDuyet], [NgayGhi]) VALUES (16, 15, N'05/2026', 100, 10, 90, 9, N'/uploads/dien-nuoc/dn_15_20260512185518.png', 0, NULL, NULL, NULL, CAST(N'2026-05-12T18:55:18.2860958' AS DateTime2))
SET IDENTITY_INSERT [dbo].[DIENNUOC] OFF
GO
SET IDENTITY_INSERT [dbo].[DONDV] ON 

INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (1, 4, 1, 2, N'Nước bình', N'3 bình Vihawa 20L', N'Thấp', CAST(150000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'bill01.jpg', NULL, NULL, NULL, CAST(N'2024-05-02T10:30:00.0000000' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (2, 5, 2, NULL, N'Giặt sấy', N'5kg giặt ướt', N'Thấp', CAST(50000.00 AS Decimal(15, 2)), N'Đã hủy', NULL, N'Manager', NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-16T10:43:15.7100000' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (3, 6, 3, 2, N'Nước bình', N'2 bình Lavie 19L', N'Thấp', CAST(120000.00 AS Decimal(15, 2)), N'Chờ thanh toán', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (4, 7, 4, 2, N'Hư hỏng', N'Đèn phòng ngủ bị hỏng', N'Trung bình', CAST(80000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'bill04.jpg', NULL, NULL, NULL, CAST(N'2024-05-03T14:00:00.0000000' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (5, 8, 5, 2, N'Giặt sấy', N'Chăn ga mền', N'Thấp', CAST(80000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'bill05.jpg', NULL, NULL, NULL, CAST(N'2024-05-04T09:00:00.0000000' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (6, 9, 6, 2, N'Dịch vụ', N'Điều hòa chảy nước', N'Trung bình', CAST(0.00 AS Decimal(15, 2)), N'Đang xử lý', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (7, 10, 7, 2, N'Nước bình', N'2 bình Vihawa + 1 Lavie', N'Thấp', CAST(160000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'bill07.jpg', NULL, NULL, NULL, CAST(N'2024-05-05T11:00:00.0000000' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (8, 11, 8, 2, N'Hư hỏng', N'Vòi nước bị rỉ', N'Khẩn cấp', CAST(0.00 AS Decimal(15, 2)), N'Đang xử lý', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (9, 12, 9, 2, N'Nước bình', N'1 bình Vĩnh Hảo 20L', N'Thấp', CAST(55000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'bill09.jpg', NULL, NULL, NULL, CAST(N'2024-05-06T08:30:00.0000000' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (10, 13, 10, 3, N'Dịch vụ', N'Quạt máy không chạy', N'Trung bình', CAST(0.00 AS Decimal(15, 2)), N'Chờ xử lý', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (11, 14, 11, 3, N'Nước bình', N'2 bình Aquafina', N'Thấp', CAST(110000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'bill10.jpg', NULL, NULL, NULL, CAST(N'2024-05-07T10:00:00.0000000' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (12, 15, 12, 3, N'Giặt sấy', N'2kg đồ trắng', N'Thấp', CAST(30000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'bill11.jpg', NULL, NULL, NULL, CAST(N'2024-05-07T16:00:00.0000000' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (13, 4, 1, 2, N'Hư hỏng', N'Cửa phòng không khóa được', N'Khẩn cấp', CAST(0.00 AS Decimal(15, 2)), N'Chờ xử lý', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (14, 5, 2, 2, N'Giặt sấy', N'8kg giặt sấy khô', N'Thấp', CAST(120000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'bill13.jpg', NULL, NULL, NULL, CAST(N'2024-05-08T11:30:00.0000000' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (15, 6, 3, 18, N'Nước bình', N'5 bình Aquafina', N'Thấp', CAST(275000.00 AS Decimal(15, 2)), N'Chờ thanh toán', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), CAST(N'2026-05-11T12:52:36.2348586' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (16, 17, 15, 18, N'Giặt sấy', N'[giat]', N'Trung bình', CAST(27000.00 AS Decimal(15, 2)), N'Thành Công', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-12T12:13:11.0945974' AS DateTime2), CAST(N'2026-05-12T12:13:11.0947421' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (17, 17, 15, 18, N'Nước bình', N'Số lượng: 1 bình', N'Trung bình', CAST(30000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-12T12:13:20.3610808' AS DateTime2), CAST(N'2026-05-12T12:13:20.3610830' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (18, 17, 15, 18, N'Giặt sấy', N'[giat]', N'Trung bình', CAST(27000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-12T12:23:16.3044489' AS DateTime2), CAST(N'2026-05-12T12:23:16.3045471' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (19, 17, 15, 18, N'Giặt sấy', N'[giat]', N'Trung bình', CAST(27000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-12T12:52:27.7616383' AS DateTime2), CAST(N'2026-05-12T12:52:27.7617128' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (20, 17, 15, 18, N'Dịch vụ', N'[khac-dv] Sáng (6h–12h) | Đã nhắc: roi | ống nước hư kêu sửa nhiều lần ', N'Khẩn cấp', CAST(0.00 AS Decimal(15, 2)), N'Chờ xử lý', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-14T03:37:23.2778396' AS DateTime2), CAST(N'2026-05-14T03:37:23.2779513' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (21, 17, 15, 18, N'Nước bình', N'Số lượng: 1 bình. Trả vỏ: Không.', N'Trung bình', CAST(30000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-14T12:39:59.8182162' AS DateTime2), CAST(N'2026-05-14T12:39:59.8183259' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (22, 17, 15, 18, N'Nước bình', N'Số lượng: 1 bình. Trả vỏ: Không.', N'Trung bình', CAST(15000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'/uploads/bill/9f556f7b-fc25-45b5-b560-bc10273adc1d.jpg', NULL, NULL, CAST(N'2026-05-16T08:34:07.6566667' AS DateTime2), NULL, CAST(N'2026-05-14T12:59:40.4365268' AS DateTime2), CAST(N'2026-05-16T09:18:53.2879587' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (23, 17, 15, 18, N'Giặt sấy', N'[giat]', N'Trung bình', CAST(270000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-14T14:31:38.0730903' AS DateTime2), CAST(N'2026-05-14T14:31:38.0731976' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (24, 17, 15, 18, N'Hư hỏng', N'[Vòi nước bị rỉ / hỏng] Vị trí: Trong phòng | không thể tắm được', N'Trung bình', CAST(0.00 AS Decimal(15, 2)), N'Chờ xử lý', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-15T04:47:29.0966485' AS DateTime2), CAST(N'2026-05-15T04:47:29.0967335' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (25, 17, 15, 18, N'Dịch vụ', N'[nuoc] Sáng (6h–12h) | Đã nhắc: roi | không thấy bình nước', N'Khẩn cấp', CAST(0.00 AS Decimal(15, 2)), N'Chờ xử lý', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-15T04:48:12.2548450' AS DateTime2), CAST(N'2026-05-15T04:48:12.2548452' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (26, 17, 15, 18, N'Dịch vụ', N'[nuoc] Sáng (6h–12h) | Đã nhắc: roi | chưa giao nước đã nhắc rồi', N'Trung bình', CAST(0.00 AS Decimal(15, 2)), N'Chờ xử lý', NULL, NULL, N'/uploads/su-co/17_1778820770508.jpg', NULL, NULL, NULL, NULL, CAST(N'2026-05-15T04:52:50.5147544' AS DateTime2), CAST(N'2026-05-15T04:52:50.5147549' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (27, 17, 15, 18, N'Dịch vụ', N'[nuoc] Sáng (6h–12h) | Đã nhắc: roi | đã nhắc giao nước nhưng chưa thấy', N'Trung bình', CAST(0.00 AS Decimal(15, 2)), N'Chờ xử lý', NULL, NULL, N'/uploads/su-co/17_1778821035871.jpg', NULL, NULL, NULL, NULL, CAST(N'2026-05-15T04:57:15.8804517' AS DateTime2), CAST(N'2026-05-15T04:57:15.8805725' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (28, 17, 15, 18, N'Dịch vụ', N'[nuoc] Sáng (6h–12h) | Đã nhắc: roi | đã nhắc giao nước', N'Trung bình', CAST(0.00 AS Decimal(15, 2)), N'Chờ xử lý', NULL, NULL, N'/uploads/su-co/17_1778821156504.jpg', NULL, NULL, NULL, NULL, CAST(N'2026-05-15T04:59:16.5127625' AS DateTime2), CAST(N'2026-05-15T04:59:16.5128438' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (29, 17, 15, 18, N'Giặt sấy', N'[giat]', N'Trung bình', CAST(25000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'/uploads/bill/9f556f7b-fc25-45b5-b560-bc10273adc1d.jpg', NULL, NULL, CAST(N'2026-05-16T08:33:50.2533333' AS DateTime2), NULL, CAST(N'2026-05-15T21:07:39.1523721' AS DateTime2), CAST(N'2026-05-16T09:18:53.2879587' AS DateTime2), NULL)
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (31, 17, 15, 18, N'Giặt sấy', N'[giat-say]', N'Trung bình', CAST(27000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'/uploads/bill/fd951277-a1dd-464a-bf0e-e3093e4900df.jpg', NULL, NULL, CAST(N'2026-05-16T10:17:47.1400000' AS DateTime2), NULL, CAST(N'2026-05-16T10:16:54.6961636' AS DateTime2), CAST(N'2026-05-16T10:25:52.0647496' AS DateTime2), CAST(N'2026-05-23T10:16:54.6962426' AS DateTime2))
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (32, 17, 15, 18, N'Giặt sấy', N'[giat-say]', N'Trung bình', CAST(27000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'/uploads/bill/0c95afa4-549d-409a-a0bd-987c8713d374.jpg', NULL, N'2kg', CAST(N'2026-05-16T11:17:24.0566329' AS DateTime2), NULL, CAST(N'2026-05-16T10:42:17.3328058' AS DateTime2), CAST(N'2026-05-16T11:17:24.0568641' AS DateTime2), CAST(N'2026-05-23T10:42:17.3328940' AS DateTime2))
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (33, 17, 15, 18, N'Giặt sấy', N'[giat-say]', N'Trung bình', CAST(75000000.00 AS Decimal(15, 2)), N'Thành công', NULL, NULL, N'/uploads/bill/03f2987e-a7f1-4be2-8493-18692d198298.png', NULL, N'15kg', CAST(N'2026-05-16T14:31:55.6758441' AS DateTime2), NULL, CAST(N'2026-05-16T14:09:21.3102923' AS DateTime2), CAST(N'2026-05-16T14:31:55.6760036' AS DateTime2), CAST(N'2026-05-23T14:09:21.3103545' AS DateTime2))
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (34, 17, 15, 18, N'Giặt sấy', N'[giat-say]', N'Trung bình', CAST(0.00 AS Decimal(15, 2)), N'Chờ xử lý', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-16T14:58:18.6626003' AS DateTime2), CAST(N'2026-05-16T14:58:18.6627901' AS DateTime2), CAST(N'2026-05-23T14:58:18.6626713' AS DateTime2))
INSERT [dbo].[DONDV] ([IDDonDV], [IDUser], [IDPhong], [IDManagerXuLy], [LoaiDV], [NoiDung], [MucDo], [TongTien], [TrangThai_DV], [LyDoHuy], [NguoiHuy], [AnhBienLai], [AnhKetQua], [GhiChuXuLy], [NgayXuLy], [NgayHoanThanh], [NgayTao], [UpdatedAt], [NgayHetHan]) VALUES (35, 17, 15, 18, N'Nước bình', N'Số lượng: 5 bình. Trả vỏ: Không.', N'Trung bình', CAST(75000.00 AS Decimal(15, 2)), N'Đang xử lý', NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(N'2026-05-16T14:58:26.1497481' AS DateTime2), CAST(N'2026-05-16T14:58:26.1497534' AS DateTime2), CAST(N'2026-05-23T14:58:26.1497505' AS DateTime2))
SET IDENTITY_INSERT [dbo].[DONDV] OFF
GO
SET IDENTITY_INSERT [dbo].[HDTHANG] ON 

INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (1, 1, 1, 2, N'05/2024', CAST(2500000.00 AS Decimal(15, 2)), CAST(175000.00 AS Decimal(15, 2)), CAST(100000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(2775000.00 AS Decimal(15, 2)), CAST(N'2024-06-05' AS Date), N'Đã hoàn thành', N'tt_p01_0524.jpg', CAST(N'2024-05-28T10:00:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (2, 2, 2, NULL, N'05/2024', CAST(2500000.00 AS Decimal(15, 2)), CAST(210000.00 AS Decimal(15, 2)), CAST(120000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(2830000.00 AS Decimal(15, 2)), CAST(N'2024-06-05' AS Date), N'Chờ duyệt', N'tt_p02_0524.jpg', NULL, NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (3, 3, 3, NULL, N'05/2024', CAST(2500000.00 AS Decimal(15, 2)), CAST(280000.00 AS Decimal(15, 2)), CAST(120000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(2900000.00 AS Decimal(15, 2)), CAST(N'2024-06-05' AS Date), N'Chưa đóng', NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (4, 4, 4, 2, N'05/2024', CAST(2800000.00 AS Decimal(15, 2)), CAST(210000.00 AS Decimal(15, 2)), CAST(140000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(3150000.00 AS Decimal(15, 2)), CAST(N'2024-06-05' AS Date), N'Đã hoàn thành', N'tt_p04_0524.jpg', CAST(N'2024-05-29T09:00:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (5, 5, 5, NULL, N'05/2024', CAST(2800000.00 AS Decimal(15, 2)), CAST(245000.00 AS Decimal(15, 2)), CAST(160000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(3205000.00 AS Decimal(15, 2)), CAST(N'2024-06-05' AS Date), N'Chưa đóng', NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (6, 6, 6, 2, N'05/2024', CAST(3000000.00 AS Decimal(15, 2)), CAST(315000.00 AS Decimal(15, 2)), CAST(140000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(3455000.00 AS Decimal(15, 2)), CAST(N'2024-06-05' AS Date), N'Đã hoàn thành', N'tt_p06_0524.jpg', CAST(N'2024-05-27T14:00:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (7, 7, 7, NULL, N'05/2024', CAST(3000000.00 AS Decimal(15, 2)), CAST(280000.00 AS Decimal(15, 2)), CAST(140000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(3420000.00 AS Decimal(15, 2)), CAST(N'2024-06-05' AS Date), N'Chưa đóng', NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (8, 8, 8, NULL, N'05/2024', CAST(3000000.00 AS Decimal(15, 2)), CAST(280000.00 AS Decimal(15, 2)), CAST(160000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(3440000.00 AS Decimal(15, 2)), CAST(N'2024-06-05' AS Date), N'Chờ duyệt', N'tt_p08_0524.jpg', NULL, NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (9, 9, 9, 2, N'05/2024', CAST(3200000.00 AS Decimal(15, 2)), CAST(245000.00 AS Decimal(15, 2)), CAST(120000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(3565000.00 AS Decimal(15, 2)), CAST(N'2024-06-05' AS Date), N'Đã hoàn thành', N'tt_p09_0524.jpg', CAST(N'2024-05-30T11:00:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (10, 10, 10, NULL, N'05/2024', CAST(3200000.00 AS Decimal(15, 2)), CAST(280000.00 AS Decimal(15, 2)), CAST(140000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(3620000.00 AS Decimal(15, 2)), CAST(N'2024-06-05' AS Date), N'Chưa đóng', NULL, NULL, NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (11, 11, 11, 3, N'05/2024', CAST(3500000.00 AS Decimal(15, 2)), CAST(280000.00 AS Decimal(15, 2)), CAST(140000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(3920000.00 AS Decimal(15, 2)), CAST(N'2024-05-05' AS Date), N'Đã hoàn thành', N'tt_p11_0524.jpg', CAST(N'2024-05-28T15:00:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (12, 12, 12, 3, N'05/2024', CAST(3500000.00 AS Decimal(15, 2)), CAST(315000.00 AS Decimal(15, 2)), CAST(160000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(3975000.00 AS Decimal(15, 2)), CAST(N'2024-06-05' AS Date), N'Chờ duyệt', N'tt_p12_0524.jpg', NULL, NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (13, 1, 13, 2, N'04/2024', CAST(1750000.00 AS Decimal(15, 2)), CAST(140000.00 AS Decimal(15, 2)), CAST(100000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(2740000.00 AS Decimal(15, 2)), CAST(N'2024-05-05' AS Date), N'Đã hoàn thành', N'tt_p01_0424.jpg', CAST(N'2024-04-28T10:00:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (14, 2, 14, 2, N'04/2024', CAST(1500000.00 AS Decimal(15, 2)), CAST(175000.00 AS Decimal(15, 2)), CAST(80000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(2755000.00 AS Decimal(15, 2)), CAST(N'2024-05-05' AS Date), N'Đã hoàn thành', N'tt_p02_0424.jpg', CAST(N'2024-04-29T09:00:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (15, 3, 15, 2, N'04/2024', CAST(1500000.00 AS Decimal(15, 2)), CAST(140000.00 AS Decimal(15, 2)), CAST(100000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(2740000.00 AS Decimal(15, 2)), CAST(N'2024-05-05' AS Date), N'Đã hoàn thành', N'tt_p03_0424.jpg', CAST(N'2024-04-30T11:00:00.0000000' AS DateTime2), NULL, CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), CAST(N'2026-05-11T12:52:36.2635994' AS DateTime2), NULL, NULL, 0, 0)
INSERT [dbo].[HDTHANG] ([IDHDThang], [IDPhong], [IDDienNuoc], [IDManagerDuyet], [KyThanhToan], [TienPhong], [TienDienSum], [TienNuocSum], [TienDV], [TongCong], [HanDong], [TrangThai_TT], [AnhChuyenKhoan], [NgayDuyet], [GhiChuDuyet], [NgayXuatHD], [UpdatedAt], [TienNoDV], [NgayHetHan], [DuocCongVaoTro], [DaCoNhacNo]) VALUES (16, 15, NULL, 18, N'05/2026', CAST(1500000.00 AS Decimal(15, 2)), CAST(420000.00 AS Decimal(15, 2)), CAST(80000.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(2000000.00 AS Decimal(15, 2)), CAST(N'2026-05-16' AS Date), N'Đã hoàn thành', N'/uploads/bills/16_20260512092614.jpg', NULL, NULL, CAST(N'2026-05-12T01:46:48.9437953' AS DateTime2), CAST(N'2026-05-12T02:26:14.2092597' AS DateTime2), NULL, NULL, 0, 0)
SET IDENTITY_INSERT [dbo].[HDTHANG] OFF
GO
SET IDENTITY_INSERT [dbo].[HOPDONG] ON 

INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (1, 4, 1, 2, CAST(N'2024-01-01' AS Date), CAST(N'2026-01-01' AS Date), 100, 10, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-12T01:46:48.7837127' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (2, 5, 2, 2, CAST(N'2024-01-05' AS Date), CAST(N'2026-05-17' AS Date), 150, 12, CAST(2500000.00 AS Decimal(15, 2)), N'Đã kết thúc', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-12T01:46:48.7837127' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (3, 6, 3, 2, CAST(N'2024-02-01' AS Date), CAST(N'2026-02-01' AS Date), 200, 20, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-12T01:46:48.7837127' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (4, 7, 4, 2, CAST(N'2024-02-15' AS Date), CAST(N'2026-02-15' AS Date), 300, 25, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-12T01:46:48.7837127' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (5, 8, 5, 2, CAST(N'2024-03-01' AS Date), CAST(N'2026-03-01' AS Date), 350, 30, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-12T01:46:48.7837127' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (6, 9, 6, 2, CAST(N'2024-03-10' AS Date), CAST(N'2026-03-10' AS Date), 400, 40, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-12T01:46:48.7837127' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (7, 10, 7, 2, CAST(N'2024-04-01' AS Date), CAST(N'2026-04-01' AS Date), 450, 45, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-12T01:46:48.7837127' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (8, 11, 8, 2, CAST(N'2024-04-20' AS Date), CAST(N'2026-04-20' AS Date), 500, 50, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-12T01:46:48.7837127' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (9, 12, 9, 2, CAST(N'2024-05-01' AS Date), CAST(N'2026-05-01' AS Date), 550, 55, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-12T01:46:48.7837127' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (10, 13, 10, 3, CAST(N'2024-05-15' AS Date), CAST(N'2026-05-15' AS Date), 600, 60, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-12T01:46:48.7837127' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (11, 14, 11, 3, CAST(N'2024-06-01' AS Date), CAST(N'2026-06-01' AS Date), 650, 65, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-12T01:46:48.7837127' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (12, 15, 12, 3, CAST(N'2024-06-10' AS Date), CAST(N'2026-06-10' AS Date), 700, 70, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-12T01:46:48.7837127' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (13, 4, 13, 3, CAST(N'2023-01-01' AS Date), CAST(N'2023-12-31' AS Date), 50, 5, CAST(2500000.00 AS Decimal(15, 2)), N'Đã kết thúc', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (14, 5, 14, 3, CAST(N'2023-02-01' AS Date), CAST(N'2024-01-31' AS Date), 80, 8, CAST(2500000.00 AS Decimal(15, 2)), N'Đã kết thúc', NULL, CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2029-05-11T12:52:36.2145955' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (15, 17, 15, 3, CAST(N'2023-03-01' AS Date), CAST(N'2029-07-28' AS Date), 90, 9, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', N'', CAST(N'2026-05-11T12:52:36.2145955' AS DateTime2), CAST(N'2026-05-17T05:35:22.1437427' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (16, 19, 1, 18, CAST(N'2026-05-12' AS Date), CAST(N'2027-05-12' AS Date), 100, 10, CAST(2500000.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-12T01:46:48.8574763' AS DateTime2), CAST(N'2029-05-12T01:46:48.8574763' AS DateTime2))
INSERT [dbo].[HOPDONG] ([IDHopDong], [IDUser], [IDPhong], [IDManager], [NgayBatDau], [NgayKetThuc], [DienDauKy], [NuocDauKy], [TienCocBanDau], [TrangThaiHD], [GhiChu], [CreatedAt], [UpdatedAt]) VALUES (17, 20, 13, NULL, CAST(N'2026-05-13' AS Date), CAST(N'2027-06-09' AS Date), 145, 48, CAST(0.00 AS Decimal(15, 2)), N'Đang hiệu lực', NULL, CAST(N'2026-05-16T07:03:10.7266667' AS DateTime2), CAST(N'2026-05-16T07:03:10.7266667' AS DateTime2))
SET IDENTITY_INSERT [dbo].[HOPDONG] OFF
GO
SET IDENTITY_INSERT [dbo].[KHACH_THUE] ON 

INSERT [dbo].[KHACH_THUE] ([IDKhachThue], [IDUser], [HoTen], [SoCCCD], [NgaySinh], [GioiTinh], [SoDienThoai], [QueQuan], [AnhChanDung], [NgayVaoO], [GhiChu], [DiaChiThuongTru]) VALUES (1, 16, N'Trần Minh Quân', N'001085005555', CAST(N'1985-01-01' AS Date), N'Nam', N'0911222333', N'Cần Thơ', NULL, CAST(N'2022-01-01' AS Date), NULL, NULL)
INSERT [dbo].[KHACH_THUE] ([IDKhachThue], [IDUser], [HoTen], [SoCCCD], [NgaySinh], [GioiTinh], [SoDienThoai], [QueQuan], [AnhChanDung], [NgayVaoO], [GhiChu], [DiaChiThuongTru]) VALUES (5, 17, N'Nguyễn Yến Ngọc', N'001085000017', CAST(N'2006-10-22' AS Date), N'Nữ', N'0911222017', N'Bạc Liêu', NULL, CAST(N'2022-01-01' AS Date), NULL, N'Nhà trọ An Gia, đường Nguyễn Văn Trường, quận bình thủy, phường long tuyền
Phường Long Tuyền, Thành phố Cần Thơ')
INSERT [dbo].[KHACH_THUE] ([IDKhachThue], [IDUser], [HoTen], [SoCCCD], [NgaySinh], [GioiTinh], [SoDienThoai], [QueQuan], [AnhChanDung], [NgayVaoO], [GhiChu], [DiaChiThuongTru]) VALUES (6, 18, N'Nguyễn Yến Ngọt', N'001085000018', CAST(N'1992-10-20' AS Date), N'Nữ', N'0911222018', N'Cần Thơ', NULL, CAST(N'2022-01-01' AS Date), NULL, NULL)
INSERT [dbo].[KHACH_THUE] ([IDKhachThue], [IDUser], [HoTen], [SoCCCD], [NgaySinh], [GioiTinh], [SoDienThoai], [QueQuan], [AnhChanDung], [NgayVaoO], [GhiChu], [DiaChiThuongTru]) VALUES (7, 19, N'Lê Văn Tân', N'001085000019', CAST(N'1998-05-12' AS Date), N'Nam', N'0911222019', N'Nghệ An', NULL, CAST(N'2023-06-01' AS Date), NULL, NULL)
SET IDENTITY_INSERT [dbo].[KHACH_THUE] OFF
GO
SET IDENTITY_INSERT [dbo].[PHONG] ON 

INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (1, N'101', 1, CAST(20.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Trống', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 1)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (2, N'102', 1, CAST(20.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Trống', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 2)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (3, N'103', 1, CAST(20.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Đã thuê', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 1)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (4, N'104', 1, CAST(25.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Đã thuê', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 2)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (5, N'105', 1, CAST(25.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Đã thuê', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 2)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (6, N'201', 2, CAST(25.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Đã thuê', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 2)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (7, N'202', 2, CAST(25.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Đã thuê', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 2)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (8, N'203', 2, CAST(28.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Đã thuê', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 2)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (9, N'204', 2, CAST(28.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Đã thuê', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 2)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (10, N'301', 3, CAST(30.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Đã thuê', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 3)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (11, N'302', 3, CAST(30.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Đã thuê', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 3)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (12, N'303', 3, CAST(32.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Đã thuê', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 3)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (13, N'401', 4, CAST(35.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Đã thuê', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 3)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (14, N'402', 4, CAST(35.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Trống', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 1)
INSERT [dbo].[PHONG] ([IDPhong], [SoPhong], [Tang], [DienTich], [GiaPhongFix], [MoTa], [TrangThai], [CreatedAt], [soluong]) VALUES (15, N'403', 4, CAST(35.00 AS Decimal(6, 2)), CAST(1500000.00 AS Decimal(15, 2)), NULL, N'Đã thuê', CAST(N'2026-05-11T12:52:36.1954002' AS DateTime2), 1)
SET IDENTITY_INSERT [dbo].[PHONG] OFF
GO
SET IDENTITY_INSERT [dbo].[PHONG_MANAGER] ON 

INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (1, 1, 2, 1, N'Tầng 1 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (2, 2, 2, 1, N'Tầng 1 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (3, 3, 2, 1, N'Tầng 1 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (4, 4, 2, 1, N'Tầng 1 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (5, 5, 2, 1, N'Tầng 1 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (6, 6, 2, 1, N'Tầng 2 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (7, 7, 2, 1, N'Tầng 2 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (8, 8, 2, 1, N'Tầng 2 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (9, 9, 2, 1, N'Tầng 2 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (10, 10, 18, 1, N'Tầng 3 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (11, 11, 18, 1, N'Tầng 3 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (12, 12, 18, 1, N'Tầng 3 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (13, 13, 18, 1, N'Tầng 4 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (14, 14, 18, 1, N'Tầng 4 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
INSERT [dbo].[PHONG_MANAGER] ([ID], [IDPhong], [IDManager], [IsActive], [GhiChu], [NgayPhanCong]) VALUES (15, 15, 18, 1, N'Tầng 4 – phụ trách chính', CAST(N'2026-05-11T12:52:36.2035076' AS DateTime2))
SET IDENTITY_INSERT [dbo].[PHONG_MANAGER] OFF
GO
SET IDENTITY_INSERT [dbo].[THONGBAO] ON 

INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (1, NULL, 4, 3, N'HoaDon', N'Hóa đơn tháng 05/2024 sắp đến hạn', N'Hóa đơn 2.900.000đ đến hạn ngày 05/06/2024. Vui lòng thanh toán đúng hạn.', N'canh-bao', 0, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (2, NULL, 4, 1, N'DiemNuoc', N'Chỉ số điện nước đã được duyệt', N'Chỉ số điện nước kỳ 05/2024 phòng 101 đã được quản lý xác nhận.', N'thong-tin', 0, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (3, NULL, 4, 1, N'DonDV', N'Đơn nước bình đã giao thành công', N'3 bình Vihawa 20L đã được giao vào lúc 10:30.', N'thong-tin', 1, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (4, NULL, 4, NULL, N'HeThong', N'Cập nhật giá điện từ 01/06/2024', N'Giá điện điều chỉnh lên 3.800đ/kWh từ kỳ tháng 06/2024.', N'he-thong', 0, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (5, NULL, 4, 13, N'HoaDon', N'Hóa đơn tháng 04/2024 đã hoàn thành', N'Cảm ơn bạn đã thanh toán đúng hạn. Hóa đơn tháng 04/2024 đã được xác nhận.', N'thanh-toan', 1, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (6, NULL, 5, 2, N'HoaDon', N'Hóa đơn tháng 05/2024 sắp đến hạn', N'Hóa đơn 2.830.000đ đến hạn ngày 05/06/2024.', N'canh-bao', 0, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (7, NULL, 5, 2, N'DonDV', N'Đơn giặt sấy đang xử lý', N'Đơn 5kg giặt ướt của bạn đang được xử lý. Dự kiến hoàn thành trong 2 giờ.', N'thong-tin', 0, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (8, NULL, 6, 15, N'DonDV', N'Báo sự cố đã được tiếp nhận', N'Sự cố "vòi nước bị rỉ" phòng 103 đã được ghi nhận và sẽ xử lý trong 24h.', N'canh-bao', 0, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (9, NULL, 7, 4, N'HoaDon', N'Hóa đơn tháng 05/2024 đã hoàn thành', N'Cảm ơn bạn đã thanh toán. Mã giao dịch: HD-2024-05-004.', N'thanh-toan', 1, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (10, NULL, 8, 8, N'HoaDon', N'Chờ xác nhận chuyển khoản', N'Hệ thống đã nhận ảnh chuyển khoản. Quản lý sẽ xác nhận trong vòng 2 giờ làm việc.', N'canh-bao', 0, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (11, NULL, 9, 9, N'DiemNuoc', N'Chỉ số điện nước kỳ 05/2024 chờ duyệt', N'Quản lý đang kiểm tra chỉ số bạn đã gửi. Kết quả sẽ được thông báo sớm.', N'thong-tin', 0, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (12, NULL, 10, 9, N'HoaDon', N'Hóa đơn tháng 05/2024 đã hoàn thành', N'Hóa đơn 3.620.000đ đã được xác nhận thành công.', N'thanh-toan', 1, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (13, NULL, 11, 11, N'HoaDon', N'Hóa đơn tháng 05/2024 đã hoàn thành', N'Hóa đơn 3.920.000đ đã được xác nhận thành công.', N'thanh-toan', 1, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (14, NULL, 12, 12, N'HoaDon', N'Chờ xác nhận chuyển khoản', N'Ảnh chuyển khoản 3.975.000đ đã được gửi. Đang chờ quản lý xác nhận.', N'canh-bao', 0, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (15, NULL, NULL, NULL, N'HeThong', N'Bảo trì hệ thống ngày 02/06/2024', N'Hệ thống sẽ bảo trì từ 23:00–01:00 ngày 02/06/2024. Xin lỗi vì sự bất tiện.', N'he-thong', 1, CAST(N'2026-05-11T12:52:36.2762188' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (16, 17, 3, NULL, N'DonDV', N'Đơn Giặt Sấy mới', N'Phòng 15 vừa đặt dịch vụ giặt sấy (giat).', N'thong-tin', 0, CAST(N'2026-05-12T12:13:11.3941525' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (17, 17, 3, NULL, N'DonDV', N'Đơn Bình Nước mới', N'Phòng 15 đặt 1 bình nước. Tổng: 30.000đ.', N'thong-tin', 0, CAST(N'2026-05-12T12:13:20.3698737' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (18, 17, 3, NULL, N'DonDV', N'Đơn Giặt Sấy mới', N'Phòng 15 vừa đặt dịch vụ giặt sấy (giat).', N'thong-tin', 0, CAST(N'2026-05-12T12:23:16.5251390' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (19, 17, 3, NULL, N'DonDV', N'Đơn Giặt Sấy mới', N'Phòng 15 vừa đặt dịch vụ giặt sấy (giat).', N'thong-tin', 0, CAST(N'2026-05-12T12:52:27.9519665' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (20, 17, 3, NULL, N'DonDV', N'Chỉ số điện/nước mới', N'Phòng 15 đã gửi chỉ số điện/nước kỳ 05/2026. Cần xác nhận.', N'thanh-toan', 0, CAST(N'2026-05-12T18:55:18.5668075' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (21, 17, 18, NULL, N'DonDV', N'Đơn Nước Bình mới', N'Phòng 15 vừa đặt 1 bình nước.', N'thong-tin', 0, CAST(N'2026-05-14T12:40:00.0459238' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (22, 17, 18, NULL, N'DonDV', N'Đơn Nước Bình mới', N'Phòng 15 vừa đặt 1 bình nước.', N'thong-tin', 0, CAST(N'2026-05-14T12:59:40.6400707' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (23, 17, 18, NULL, N'DonDV', N'Đơn Giặt Sấy mới', N'Phòng 15 vừa đặt dịch vụ giặt sấy.', N'thong-tin', 0, CAST(N'2026-05-14T14:31:38.3889490' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (24, 17, 18, NULL, N'DonDV', N'Đơn Giặt Sấy mới', N'Phòng 15 vừa đặt dịch vụ giặt sấy.', N'thong-tin', 0, CAST(N'2026-05-15T21:07:39.4477952' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (25, NULL, 17, 29, N'DonDV', N'Giặt sấy hoàn tất — vui lòng thanh toán', N'Đơn giặt sấy phòng 403 đã xong. Số tiền: 25.000 đ.', N'thanh-toan', 1, CAST(N'2026-05-16T08:33:50.2566667' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (26, NULL, 17, 22, N'DonDV', N'Nước bình đã được giao', N'Đơn nước bình phòng 403 đã được giao. Số tiền: 15.000 đ. Vui lòng thanh toán đúng hạn.', N'thanh-toan', 1, CAST(N'2026-05-16T08:34:07.6566667' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (27, 17, 18, NULL, N'DonDV', N'Xác nhận thanh toán', N'Phòng 15 đã gửi ảnh bill thanh toán (gop).', N'thanh-toan', 0, CAST(N'2026-05-16T09:18:53.5200238' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (28, 17, 18, NULL, N'DonDV', N'Đơn Giặt Sấy mới', N'Phòng 15 vừa đặt dịch vụ giặt sấy.', N'thong-tin', 0, CAST(N'2026-05-16T10:16:54.9228547' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (29, NULL, 17, 31, N'DonDV', N'Giặt sấy hoàn tất — vui lòng thanh toán', N'Đơn giặt sấy phòng 403 đã xong. Số tiền: 27.000 đ.', N'thanh-toan', 1, CAST(N'2026-05-16T10:17:47.1400000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (30, 17, 18, NULL, N'DonDV', N'Xác nhận thanh toán', N'Phòng 15 đã gửi ảnh bill thanh toán (gs).', N'thanh-toan', 0, CAST(N'2026-05-16T10:25:52.0977578' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (31, 17, 18, NULL, N'DonDV', N'Đơn Giặt Sấy mới', N'Phòng 15 vừa đặt dịch vụ giặt sấy.', N'thong-tin', 0, CAST(N'2026-05-16T10:42:17.5901008' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (32, NULL, 17, 32, N'DonDV', N'Giặt sấy hoàn tất — vui lòng thanh toán', N'Đơn giặt sấy phòng 403 đã xong. Số tiền: 27.000 đ.', N'thanh-toan', 1, CAST(N'2026-05-16T10:49:07.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (33, 17, 18, NULL, N'DonDV', N'Xác nhận thanh toán', N'Phòng 15 đã gửi ảnh bill thanh toán (gs).', N'thanh-toan', 0, CAST(N'2026-05-16T11:09:12.0109018' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (34, NULL, 4, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (35, NULL, 5, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (36, NULL, 6, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (37, NULL, 7, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (38, NULL, 8, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (39, NULL, 9, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (40, NULL, 10, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (41, NULL, 11, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (42, NULL, 12, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (43, NULL, 13, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (44, NULL, 14, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (45, NULL, 15, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (46, NULL, 17, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 1, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (47, NULL, 19, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (48, NULL, 20, NULL, N'HeThong', N'thông báo tất cả thành viên biến khỏi trọ', N'tui là chí luận nè', N'thong-tin', 0, CAST(N'2026-05-16T14:03:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (49, NULL, 4, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (50, NULL, 5, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (51, NULL, 6, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (52, NULL, 7, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (53, NULL, 8, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (54, NULL, 9, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (55, NULL, 10, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (56, NULL, 11, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (57, NULL, 12, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (58, NULL, 13, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (59, NULL, 14, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (60, NULL, 15, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (61, NULL, 17, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 1, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (62, NULL, 19, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (63, NULL, 20, NULL, N'HeThong', N'chủ trọ cần tiền đánh bacarat', N'tất cả thành viên đống trước 2th tiền trọ.cảm ơn nhé', N'thong-tin', 0, CAST(N'2026-05-16T14:04:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (64, 17, 18, NULL, N'DonDV', N'Đơn Giặt Sấy mới', N'Phòng 15 vừa đặt dịch vụ giặt sấy.', N'thong-tin', 0, CAST(N'2026-05-16T14:09:21.3399813' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (65, NULL, 17, 33, N'DonDV', N'Giặt sấy hoàn tất — vui lòng thanh toán', N'Đơn giặt sấy phòng 403 đã xong. Số tiền: 75.000.000 đ.', N'thanh-toan', 1, CAST(N'2026-05-16T14:10:24.4300000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (66, 17, 18, NULL, N'DonDV', N'Xác nhận thanh toán', N'Phòng 15 đã gửi ảnh bill thanh toán (gs).', N'thanh-toan', 0, CAST(N'2026-05-16T14:11:44.8376475' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (67, 17, 18, NULL, N'DonDV', N'Xác nhận thanh toán', N'Phòng 15 đã gửi ảnh bill thanh toán (gs).', N'thanh-toan', 0, CAST(N'2026-05-16T14:31:44.8484253' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (68, 17, 18, NULL, N'DonDV', N'Đơn Giặt Sấy mới', N'Phòng 15 vừa đặt dịch vụ giặt sấy.', N'thong-tin', 0, CAST(N'2026-05-16T14:58:18.8692003' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (69, 17, 18, NULL, N'DonDV', N'Đơn Nước Bình mới', N'Phòng 15 vừa đặt 5 bình nước.', N'thong-tin', 0, CAST(N'2026-05-16T14:58:26.1623175' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (70, NULL, 6, NULL, N'HeThong', N'abc', N'cho tôi ăn cơm', N'thong-tin', 0, CAST(N'2026-05-18T18:18:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (71, NULL, 7, NULL, N'HeThong', N'abc', N'cho tôi ăn cơm', N'thong-tin', 0, CAST(N'2026-05-18T18:18:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (72, NULL, 8, NULL, N'HeThong', N'abc', N'cho tôi ăn cơm', N'thong-tin', 0, CAST(N'2026-05-18T18:18:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (73, NULL, 9, NULL, N'HeThong', N'abc', N'cho tôi ăn cơm', N'thong-tin', 0, CAST(N'2026-05-18T18:18:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (74, NULL, 10, NULL, N'HeThong', N'abc', N'cho tôi ăn cơm', N'thong-tin', 0, CAST(N'2026-05-18T18:18:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (75, NULL, 11, NULL, N'HeThong', N'abc', N'cho tôi ăn cơm', N'thong-tin', 0, CAST(N'2026-05-18T18:18:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (76, NULL, 12, NULL, N'HeThong', N'abc', N'cho tôi ăn cơm', N'thong-tin', 0, CAST(N'2026-05-18T18:18:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (77, NULL, 13, NULL, N'HeThong', N'abc', N'cho tôi ăn cơm', N'thong-tin', 0, CAST(N'2026-05-18T18:18:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (78, NULL, 14, NULL, N'HeThong', N'abc', N'cho tôi ăn cơm', N'thong-tin', 0, CAST(N'2026-05-18T18:18:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (79, NULL, 15, NULL, N'HeThong', N'abc', N'cho tôi ăn cơm', N'thong-tin', 0, CAST(N'2026-05-18T18:18:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (80, NULL, 17, NULL, N'HeThong', N'abc', N'cho tôi ăn cơm', N'thong-tin', 0, CAST(N'2026-05-18T18:18:00.0000000' AS DateTime2))
INSERT [dbo].[THONGBAO] ([IDThongBao], [IDNguoiGui], [IDUser], [IDNguonTB], [LoaiNguon], [TieuDe], [NoiDung], [LoaiTB], [DaDoc], [NgayTao]) VALUES (81, NULL, 20, NULL, N'HeThong', N'abc', N'cho tôi ăn cơm', N'thong-tin', 0, CAST(N'2026-05-18T18:18:00.0000000' AS DateTime2))
SET IDENTITY_INSERT [dbo].[THONGBAO] OFF
GO
SET IDENTITY_INSERT [dbo].[THONGKE_DOANHTHU_THANG] ON 

INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (1, 2023, 3, CAST(28000000.00 AS Decimal(15, 2)), CAST(2800000.00 AS Decimal(15, 2)), CAST(1200000.00 AS Decimal(15, 2)), CAST(800000.00 AS Decimal(15, 2)), CAST(32800000.00 AS Decimal(15, 2)), 9, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (2, 2023, 4, CAST(28500000.00 AS Decimal(15, 2)), CAST(3000000.00 AS Decimal(15, 2)), CAST(1300000.00 AS Decimal(15, 2)), CAST(900000.00 AS Decimal(15, 2)), CAST(33700000.00 AS Decimal(15, 2)), 9, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (3, 2023, 5, CAST(29000000.00 AS Decimal(15, 2)), CAST(3400000.00 AS Decimal(15, 2)), CAST(1400000.00 AS Decimal(15, 2)), CAST(950000.00 AS Decimal(15, 2)), CAST(34750000.00 AS Decimal(15, 2)), 10, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (4, 2023, 6, CAST(29000000.00 AS Decimal(15, 2)), CAST(3800000.00 AS Decimal(15, 2)), CAST(1500000.00 AS Decimal(15, 2)), CAST(1000000.00 AS Decimal(15, 2)), CAST(35300000.00 AS Decimal(15, 2)), 10, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (5, 2023, 7, CAST(30000000.00 AS Decimal(15, 2)), CAST(4100000.00 AS Decimal(15, 2)), CAST(1600000.00 AS Decimal(15, 2)), CAST(1050000.00 AS Decimal(15, 2)), CAST(36750000.00 AS Decimal(15, 2)), 10, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (6, 2023, 8, CAST(30000000.00 AS Decimal(15, 2)), CAST(4000000.00 AS Decimal(15, 2)), CAST(1600000.00 AS Decimal(15, 2)), CAST(1000000.00 AS Decimal(15, 2)), CAST(36600000.00 AS Decimal(15, 2)), 10, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (7, 2023, 9, CAST(31000000.00 AS Decimal(15, 2)), CAST(3700000.00 AS Decimal(15, 2)), CAST(1500000.00 AS Decimal(15, 2)), CAST(1100000.00 AS Decimal(15, 2)), CAST(37300000.00 AS Decimal(15, 2)), 11, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (8, 2023, 10, CAST(31000000.00 AS Decimal(15, 2)), CAST(3500000.00 AS Decimal(15, 2)), CAST(1400000.00 AS Decimal(15, 2)), CAST(1100000.00 AS Decimal(15, 2)), CAST(37000000.00 AS Decimal(15, 2)), 11, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(11.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (9, 2023, 11, CAST(32000000.00 AS Decimal(15, 2)), CAST(3300000.00 AS Decimal(15, 2)), CAST(1300000.00 AS Decimal(15, 2)), CAST(1150000.00 AS Decimal(15, 2)), CAST(37750000.00 AS Decimal(15, 2)), 11, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (10, 2023, 12, CAST(33000000.00 AS Decimal(15, 2)), CAST(3100000.00 AS Decimal(15, 2)), CAST(1300000.00 AS Decimal(15, 2)), CAST(1200000.00 AS Decimal(15, 2)), CAST(38600000.00 AS Decimal(15, 2)), 11, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (11, 2024, 1, CAST(34000000.00 AS Decimal(15, 2)), CAST(2900000.00 AS Decimal(15, 2)), CAST(1200000.00 AS Decimal(15, 2)), CAST(1250000.00 AS Decimal(15, 2)), CAST(39350000.00 AS Decimal(15, 2)), 12, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (12, 2024, 2, CAST(34000000.00 AS Decimal(15, 2)), CAST(3000000.00 AS Decimal(15, 2)), CAST(1200000.00 AS Decimal(15, 2)), CAST(1300000.00 AS Decimal(15, 2)), CAST(39500000.00 AS Decimal(15, 2)), 12, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (13, 2024, 3, CAST(35000000.00 AS Decimal(15, 2)), CAST(3300000.00 AS Decimal(15, 2)), CAST(1300000.00 AS Decimal(15, 2)), CAST(1350000.00 AS Decimal(15, 2)), CAST(40950000.00 AS Decimal(15, 2)), 12, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (14, 2024, 4, CAST(36000000.00 AS Decimal(15, 2)), CAST(3800000.00 AS Decimal(15, 2)), CAST(1400000.00 AS Decimal(15, 2)), CAST(1400000.00 AS Decimal(15, 2)), CAST(42600000.00 AS Decimal(15, 2)), 12, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
INSERT [dbo].[THONGKE_DOANHTHU_THANG] ([IDThongKe], [Nam], [Thang], [TongTienPhong], [TongTienDien], [TongTienNuoc], [TongTienDV], [TongCong], [SoHoaDonDaDong], [NgayCapNhat], [ChiPhiThang]) VALUES (15, 2024, 5, CAST(37000000.00 AS Decimal(15, 2)), CAST(4100000.00 AS Decimal(15, 2)), CAST(1500000.00 AS Decimal(15, 2)), CAST(1450000.00 AS Decimal(15, 2)), CAST(44050000.00 AS Decimal(15, 2)), 12, CAST(N'2026-05-11T12:52:36.2901935' AS DateTime2), CAST(1.00 AS Decimal(15, 2)))
SET IDENTITY_INSERT [dbo].[THONGKE_DOANHTHU_THANG] OFF
GO
INSERT [dbo].[THONGKE_TONG] ([ID], [TongSoPhong], [PhongDangThue], [PhongConTrong], [PhongDangSua], [TiLeLapDay], [DoanhThuThangNay], [DoanhThuThangTruoc], [TangTruongDoanhThu], [HoaDonChuaDong], [HoaDonSapDenHan], [HoaDonQuaHan], [DonDVChoXuLy], [DonDVKhanCap], [NgayCapNhat]) VALUES (1, 15, 12, 2, 1, CAST(80.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(15, 2)), CAST(0.00 AS Decimal(5, 2)), 4, 0, 4, 3, 1, CAST(N'0001-01-01T00:00:00.0000000' AS DateTime2))
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ACCOUNT__536C85E41D50AD61]    Script Date: 19/05/2026 7:45:37 CH ******/
ALTER TABLE [dbo].[ACCOUNT] ADD UNIQUE NONCLUSTERED 
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ACCOUNT_IsActive]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_ACCOUNT_IsActive] ON [dbo].[ACCOUNT]
(
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ACCOUNT_Roles]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_ACCOUNT_Roles] ON [dbo].[ACCOUNT]
(
	[Roles] ASC
)
WHERE ([IsActive]=(1))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__CONFIG_G__C0E6DE8E4E44E239]    Script Date: 19/05/2026 7:45:37 CH ******/
ALTER TABLE [dbo].[CONFIG_GIA] ADD UNIQUE NONCLUSTERED 
(
	[MaDichVu] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_CONFIG_MaDV]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_CONFIG_MaDV] ON [dbo].[CONFIG_GIA]
(
	[MaDichVu] ASC
)
WHERE ([IsActive]=(1))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_DIENNUOC_Phong_Ky]    Script Date: 19/05/2026 7:45:37 CH ******/
ALTER TABLE [dbo].[DIENNUOC] ADD  CONSTRAINT [UQ_DIENNUOC_Phong_Ky] UNIQUE NONCLUSTERED 
(
	[IDPhong] ASC,
	[KyGhiNhan] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_DIENNUOC_Duyet]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_DIENNUOC_Duyet] ON [dbo].[DIENNUOC]
(
	[TrangThaiDuyet] ASC
)
WHERE ([TrangThaiDuyet]=(0))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_DIENNUOC_Phong_Ky]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_DIENNUOC_Phong_Ky] ON [dbo].[DIENNUOC]
(
	[IDPhong] ASC,
	[KyGhiNhan] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_DONDV_IDManager]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_DONDV_IDManager] ON [dbo].[DONDV]
(
	[IDManagerXuLy] ASC
)
WHERE ([IDManagerXuLy] IS NOT NULL)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_DONDV_IDPhong]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_DONDV_IDPhong] ON [dbo].[DONDV]
(
	[IDPhong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_DONDV_IDUser]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_DONDV_IDUser] ON [dbo].[DONDV]
(
	[IDUser] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_DONDV_LoaiDV]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_DONDV_LoaiDV] ON [dbo].[DONDV]
(
	[LoaiDV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_DONDV_Phong_Trang]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_DONDV_Phong_Trang] ON [dbo].[DONDV]
(
	[IDPhong] ASC,
	[TrangThai_DV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_DONDV_TrangThai]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_DONDV_TrangThai] ON [dbo].[DONDV]
(
	[TrangThai_DV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_HDTHANG_Phong_Ky]    Script Date: 19/05/2026 7:45:37 CH ******/
ALTER TABLE [dbo].[HDTHANG] ADD  CONSTRAINT [UQ_HDTHANG_Phong_Ky] UNIQUE NONCLUSTERED 
(
	[IDPhong] ASC,
	[KyThanhToan] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_HDTHANG_IDManager]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_HDTHANG_IDManager] ON [dbo].[HDTHANG]
(
	[IDManagerDuyet] ASC
)
WHERE ([IDManagerDuyet] IS NOT NULL)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_HDTHANG_Ky_Trang]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_HDTHANG_Ky_Trang] ON [dbo].[HDTHANG]
(
	[KyThanhToan] ASC,
	[TrangThai_TT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_HDTHANG_Phong_Ky]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_HDTHANG_Phong_Ky] ON [dbo].[HDTHANG]
(
	[IDPhong] ASC,
	[KyThanhToan] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_HDTHANG_TrangThai]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_HDTHANG_TrangThai] ON [dbo].[HDTHANG]
(
	[TrangThai_TT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_HOPDONG_IDManager]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_HOPDONG_IDManager] ON [dbo].[HOPDONG]
(
	[IDManager] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_HOPDONG_IDPhong]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_HOPDONG_IDPhong] ON [dbo].[HOPDONG]
(
	[IDPhong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_HOPDONG_IDUser]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_HOPDONG_IDUser] ON [dbo].[HOPDONG]
(
	[IDUser] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_HOPDONG_TrangThai]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_HOPDONG_TrangThai] ON [dbo].[HOPDONG]
(
	[TrangThaiHD] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__KHACH_TH__8A547D3A63E651A6]    Script Date: 19/05/2026 7:45:37 CH ******/
ALTER TABLE [dbo].[KHACH_THUE] ADD UNIQUE NONCLUSTERED 
(
	[SoCCCD] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ__KHACH_TH__EAE6D9DEE4D66652]    Script Date: 19/05/2026 7:45:37 CH ******/
ALTER TABLE [dbo].[KHACH_THUE] ADD UNIQUE NONCLUSTERED 
(
	[IDUser] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__PHONG__7C736CA13AD8D98F]    Script Date: 19/05/2026 7:45:37 CH ******/
ALTER TABLE [dbo].[PHONG] ADD UNIQUE NONCLUSTERED 
(
	[SoPhong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_PHONG_TrangThai]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_PHONG_TrangThai] ON [dbo].[PHONG]
(
	[TrangThai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_PHONG_MANAGER_ACTIVE]    Script Date: 19/05/2026 7:45:37 CH ******/
ALTER TABLE [dbo].[PHONG_MANAGER] ADD  CONSTRAINT [UQ_PHONG_MANAGER_ACTIVE] UNIQUE NONCLUSTERED 
(
	[IDPhong] ASC,
	[IDManager] ASC,
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_PM_IDManager]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_PM_IDManager] ON [dbo].[PHONG_MANAGER]
(
	[IDManager] ASC
)
WHERE ([IsActive]=(1))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_PM_IDPhong]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_PM_IDPhong] ON [dbo].[PHONG_MANAGER]
(
	[IDPhong] ASC
)
WHERE ([IsActive]=(1))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__REFRESH___1EB4F817275048DB]    Script Date: 19/05/2026 7:45:37 CH ******/
ALTER TABLE [dbo].[REFRESH_TOKEN] ADD UNIQUE NONCLUSTERED 
(
	[Token] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RTOKEN_IDUser]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_RTOKEN_IDUser] ON [dbo].[REFRESH_TOKEN]
(
	[IDUser] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_RTOKEN_Token]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_RTOKEN_Token] ON [dbo].[REFRESH_TOKEN]
(
	[Token] ASC
)
WHERE ([IsRevoked]=(0))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_THONGBAO_NgayTao]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_THONGBAO_NgayTao] ON [dbo].[THONGBAO]
(
	[NgayTao] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_THONGBAO_User_Doc]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_THONGBAO_User_Doc] ON [dbo].[THONGBAO]
(
	[IDUser] ASC,
	[DaDoc] ASC
)
WHERE ([DaDoc]=(0))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_NAM_THANG]    Script Date: 19/05/2026 7:45:37 CH ******/
ALTER TABLE [dbo].[THONGKE_DOANHTHU_THANG] ADD  CONSTRAINT [UQ_NAM_THANG] UNIQUE NONCLUSTERED 
(
	[Nam] ASC,
	[Thang] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_DOANHTHU_Nam]    Script Date: 19/05/2026 7:45:37 CH ******/
CREATE NONCLUSTERED INDEX [IX_DOANHTHU_Nam] ON [dbo].[THONGKE_DOANHTHU_THANG]
(
	[Nam] ASC,
	[Thang] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ACCOUNT] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ACCOUNT] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ACCOUNT] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[CONFIG_GIA] ADD  DEFAULT (N'lần') FOR [DonVi]
GO
ALTER TABLE [dbo].[CONFIG_GIA] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[CONFIG_GIA] ADD  DEFAULT (getutcdate()) FOR [NgayApDung]
GO
ALTER TABLE [dbo].[DIENNUOC] ADD  DEFAULT ((0)) FOR [TrangThaiDuyet]
GO
ALTER TABLE [dbo].[DIENNUOC] ADD  DEFAULT (getutcdate()) FOR [NgayGhi]
GO
ALTER TABLE [dbo].[DONDV] ADD  DEFAULT (N'Trung bình') FOR [MucDo]
GO
ALTER TABLE [dbo].[DONDV] ADD  DEFAULT ((0)) FOR [TongTien]
GO
ALTER TABLE [dbo].[DONDV] ADD  DEFAULT (N'Chờ xử lý') FOR [TrangThai_DV]
GO
ALTER TABLE [dbo].[DONDV] ADD  DEFAULT (getutcdate()) FOR [NgayTao]
GO
ALTER TABLE [dbo].[DONDV] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[HDTHANG] ADD  DEFAULT ((0.0)) FOR [TienDV]
GO
ALTER TABLE [dbo].[HDTHANG] ADD  DEFAULT (N'Chưa đóng') FOR [TrangThai_TT]
GO
ALTER TABLE [dbo].[HDTHANG] ADD  DEFAULT (getutcdate()) FOR [NgayXuatHD]
GO
ALTER TABLE [dbo].[HDTHANG] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[HDTHANG] ADD  DEFAULT (CONVERT([bit],(0))) FOR [DuocCongVaoTro]
GO
ALTER TABLE [dbo].[HDTHANG] ADD  DEFAULT (CONVERT([bit],(0))) FOR [DaCoNhacNo]
GO
ALTER TABLE [dbo].[HOPDONG] ADD  DEFAULT ((0)) FOR [DienDauKy]
GO
ALTER TABLE [dbo].[HOPDONG] ADD  DEFAULT ((0)) FOR [NuocDauKy]
GO
ALTER TABLE [dbo].[HOPDONG] ADD  DEFAULT ((0)) FOR [TienCocBanDau]
GO
ALTER TABLE [dbo].[HOPDONG] ADD  DEFAULT (N'Đang hiệu lực') FOR [TrangThaiHD]
GO
ALTER TABLE [dbo].[HOPDONG] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[HOPDONG] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[KHACH_THUE] ADD  DEFAULT (getdate()) FOR [NgayVaoO]
GO
ALTER TABLE [dbo].[PHONG] ADD  DEFAULT ((1)) FOR [Tang]
GO
ALTER TABLE [dbo].[PHONG] ADD  DEFAULT (N'Trống') FOR [TrangThai]
GO
ALTER TABLE [dbo].[PHONG] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[PHONG_MANAGER] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[PHONG_MANAGER] ADD  DEFAULT (getutcdate()) FOR [NgayPhanCong]
GO
ALTER TABLE [dbo].[REFRESH_TOKEN] ADD  DEFAULT ((0)) FOR [IsRevoked]
GO
ALTER TABLE [dbo].[REFRESH_TOKEN] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[THONGBAO] ADD  DEFAULT (N'thong-tin') FOR [LoaiTB]
GO
ALTER TABLE [dbo].[THONGBAO] ADD  DEFAULT ((0)) FOR [DaDoc]
GO
ALTER TABLE [dbo].[THONGBAO] ADD  DEFAULT (getutcdate()) FOR [NgayTao]
GO
ALTER TABLE [dbo].[THONGKE_DOANHTHU_THANG] ADD  DEFAULT ((0)) FOR [TongTienPhong]
GO
ALTER TABLE [dbo].[THONGKE_DOANHTHU_THANG] ADD  DEFAULT ((0)) FOR [TongTienDien]
GO
ALTER TABLE [dbo].[THONGKE_DOANHTHU_THANG] ADD  DEFAULT ((0)) FOR [TongTienNuoc]
GO
ALTER TABLE [dbo].[THONGKE_DOANHTHU_THANG] ADD  DEFAULT ((0)) FOR [TongTienDV]
GO
ALTER TABLE [dbo].[THONGKE_DOANHTHU_THANG] ADD  DEFAULT ((0)) FOR [TongCong]
GO
ALTER TABLE [dbo].[THONGKE_DOANHTHU_THANG] ADD  DEFAULT ((0)) FOR [SoHoaDonDaDong]
GO
ALTER TABLE [dbo].[THONGKE_DOANHTHU_THANG] ADD  DEFAULT (getutcdate()) FOR [NgayCapNhat]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((1)) FOR [ID]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [TongSoPhong]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [PhongDangThue]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [PhongConTrong]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [PhongDangSua]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [TiLeLapDay]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [DoanhThuThangNay]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [DoanhThuThangTruoc]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [TangTruongDoanhThu]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [HoaDonChuaDong]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [HoaDonSapDenHan]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [HoaDonQuaHan]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [DonDVChoXuLy]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT ((0)) FOR [DonDVKhanCap]
GO
ALTER TABLE [dbo].[THONGKE_TONG] ADD  DEFAULT (getutcdate()) FOR [NgayCapNhat]
GO
ALTER TABLE [dbo].[DIENNUOC]  WITH CHECK ADD FOREIGN KEY([IDManagerDuyet])
REFERENCES [dbo].[ACCOUNT] ([IDUser])
GO
ALTER TABLE [dbo].[DIENNUOC]  WITH CHECK ADD FOREIGN KEY([IDPhong])
REFERENCES [dbo].[PHONG] ([IDPhong])
GO
ALTER TABLE [dbo].[DONDV]  WITH CHECK ADD FOREIGN KEY([IDManagerXuLy])
REFERENCES [dbo].[ACCOUNT] ([IDUser])
GO
ALTER TABLE [dbo].[DONDV]  WITH CHECK ADD FOREIGN KEY([IDPhong])
REFERENCES [dbo].[PHONG] ([IDPhong])
GO
ALTER TABLE [dbo].[DONDV]  WITH CHECK ADD FOREIGN KEY([IDUser])
REFERENCES [dbo].[ACCOUNT] ([IDUser])
GO
ALTER TABLE [dbo].[HDTHANG]  WITH CHECK ADD FOREIGN KEY([IDDienNuoc])
REFERENCES [dbo].[DIENNUOC] ([IDGhiNhan])
GO
ALTER TABLE [dbo].[HDTHANG]  WITH CHECK ADD FOREIGN KEY([IDManagerDuyet])
REFERENCES [dbo].[ACCOUNT] ([IDUser])
GO
ALTER TABLE [dbo].[HDTHANG]  WITH CHECK ADD FOREIGN KEY([IDPhong])
REFERENCES [dbo].[PHONG] ([IDPhong])
GO
ALTER TABLE [dbo].[HOPDONG]  WITH CHECK ADD FOREIGN KEY([IDManager])
REFERENCES [dbo].[ACCOUNT] ([IDUser])
GO
ALTER TABLE [dbo].[HOPDONG]  WITH CHECK ADD FOREIGN KEY([IDPhong])
REFERENCES [dbo].[PHONG] ([IDPhong])
GO
ALTER TABLE [dbo].[HOPDONG]  WITH CHECK ADD FOREIGN KEY([IDUser])
REFERENCES [dbo].[ACCOUNT] ([IDUser])
GO
ALTER TABLE [dbo].[KHACH_THUE]  WITH CHECK ADD  CONSTRAINT [FK_KhachThue_Account] FOREIGN KEY([IDUser])
REFERENCES [dbo].[ACCOUNT] ([IDUser])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[KHACH_THUE] CHECK CONSTRAINT [FK_KhachThue_Account]
GO
ALTER TABLE [dbo].[PHONG_MANAGER]  WITH CHECK ADD FOREIGN KEY([IDManager])
REFERENCES [dbo].[ACCOUNT] ([IDUser])
GO
ALTER TABLE [dbo].[PHONG_MANAGER]  WITH CHECK ADD FOREIGN KEY([IDPhong])
REFERENCES [dbo].[PHONG] ([IDPhong])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[REFRESH_TOKEN]  WITH CHECK ADD FOREIGN KEY([IDUser])
REFERENCES [dbo].[ACCOUNT] ([IDUser])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[THONGBAO]  WITH CHECK ADD FOREIGN KEY([IDUser])
REFERENCES [dbo].[ACCOUNT] ([IDUser])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[ACCOUNT]  WITH CHECK ADD CHECK  (([Roles]='Tenant' OR [Roles]='Manager' OR [Roles]='Admin'))
GO
ALTER TABLE [dbo].[DONDV]  WITH CHECK ADD CHECK  (([LoaiDV]=N'Dịch vụ' OR [LoaiDV]=N'Hư hỏng' OR [LoaiDV]=N'Giặt sấy' OR [LoaiDV]=N'Nước bình'))
GO
ALTER TABLE [dbo].[DONDV]  WITH CHECK ADD CHECK  (([MucDo]=N'Khẩn cấp' OR [MucDo]=N'Trung bình' OR [MucDo]=N'Thấp'))
GO
ALTER TABLE [dbo].[DONDV]  WITH CHECK ADD  CONSTRAINT [CHK_DONDV_TrangThai_DV] CHECK  (([TrangThai_DV]=N'Lưu trữ' OR [TrangThai_DV]=N'Từ chối' OR [TrangThai_DV]=N'Đã hủy' OR [TrangThai_DV]=N'Đã hoàn thành' OR [TrangThai_DV]=N'Thành công' OR [TrangThai_DV]=N'Chờ duyệt' OR [TrangThai_DV]=N'Chờ thanh toán' OR [TrangThai_DV]=N'Đang xử lý' OR [TrangThai_DV]=N'Chờ xử lý'))
GO
ALTER TABLE [dbo].[DONDV] CHECK CONSTRAINT [CHK_DONDV_TrangThai_DV]
GO
ALTER TABLE [dbo].[HDTHANG]  WITH CHECK ADD CHECK  (([TrangThai_TT]=N'Quá hạn' OR [TrangThai_TT]=N'Đã hoàn thành' OR [TrangThai_TT]=N'Chờ duyệt' OR [TrangThai_TT]=N'Chưa đóng'))
GO
ALTER TABLE [dbo].[HOPDONG]  WITH CHECK ADD CHECK  (([TrangThaiHD]=N'Đã hủy' OR [TrangThaiHD]=N'Đã kết thúc' OR [TrangThaiHD]=N'Đang hiệu lực'))
GO
ALTER TABLE [dbo].[PHONG]  WITH CHECK ADD CHECK  (([TrangThai]=N'Đang sửa' OR [TrangThai]=N'Đã thuê' OR [TrangThai]=N'Trống'))
GO
ALTER TABLE [dbo].[THONGBAO]  WITH CHECK ADD CHECK  (([LoaiNguon]=NULL OR [LoaiNguon]='HeThong' OR [LoaiNguon]='DiemNuoc' OR [LoaiNguon]='HoaDon' OR [LoaiNguon]='DonDV'))
GO
ALTER TABLE [dbo].[THONGBAO]  WITH CHECK ADD CHECK  (([LoaiTB]=N'he-thong' OR [LoaiTB]=N'thanh-toan' OR [LoaiTB]=N'canh-bao' OR [LoaiTB]=N'thong-tin'))
GO
ALTER TABLE [dbo].[THONGKE_DOANHTHU_THANG]  WITH CHECK ADD CHECK  (([Thang]>=(1) AND [Thang]<=(12)))
GO
ALTER TABLE [dbo].[THONGKE_TONG]  WITH CHECK ADD  CONSTRAINT [CHK_ID_1] CHECK  (([ID]=(1)))
GO
ALTER TABLE [dbo].[THONGKE_TONG] CHECK CONSTRAINT [CHK_ID_1]
GO
/****** Object:  StoredProcedure [dbo].[SP_CapNhat_ThongKe_Tong]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- SP4: Cập nhật snapshot thống kê tổng (gọi sau mỗi transaction quan trọng)
CREATE   PROCEDURE [dbo].[SP_CapNhat_ThongKe_Tong]
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @KyHienTai VARCHAR(7) = FORMAT(GETDATE(), 'MM/yyyy');
    DECLARE @KyTruoc   VARCHAR(7) = FORMAT(DATEADD(MONTH, -1, GETDATE()), 'MM/yyyy');

    UPDATE THONGKE_TONG SET
        TongSoPhong         = (SELECT COUNT(*) FROM PHONG),
        PhongDangThue       = (SELECT COUNT(*) FROM PHONG WHERE TrangThai = N'Đã thuê'),
        PhongConTrong       = (SELECT COUNT(*) FROM PHONG WHERE TrangThai = N'Trống'),
        PhongDangSua        = (SELECT COUNT(*) FROM PHONG WHERE TrangThai = N'Đang sửa'),
        TiLeLapDay          = CAST(
                                (SELECT COUNT(*) FROM PHONG WHERE TrangThai = N'Đã thuê') * 100.0
                                / NULLIF((SELECT COUNT(*) FROM PHONG), 0)
                              AS DECIMAL(5,2)),
        DoanhThuThangNay    = ISNULL((SELECT SUM(TongCong) FROM HDTHANG
                                      WHERE KyThanhToan = @KyHienTai
                                        AND TrangThai_TT = N'Đã hoàn thành'), 0),
        DoanhThuThangTruoc  = ISNULL((SELECT SUM(TongCong) FROM HDTHANG
                                      WHERE KyThanhToan = @KyTruoc
                                        AND TrangThai_TT = N'Đã hoàn thành'), 0),
        TangTruongDoanhThu  = CASE
                                WHEN ISNULL((SELECT SUM(TongCong) FROM HDTHANG
                                             WHERE KyThanhToan = @KyTruoc
                                               AND TrangThai_TT = N'Đã hoàn thành'), 0) = 0
                                THEN 0
                                ELSE CAST(
                                    ((SELECT ISNULL(SUM(TongCong),0) FROM HDTHANG
                                       WHERE KyThanhToan = @KyHienTai
                                         AND TrangThai_TT = N'Đã hoàn thành')
                                     - (SELECT ISNULL(SUM(TongCong),0) FROM HDTHANG
                                        WHERE KyThanhToan = @KyTruoc
                                          AND TrangThai_TT = N'Đã hoàn thành'))
                                    * 100.0
                                    / (SELECT ISNULL(SUM(TongCong),1) FROM HDTHANG
                                       WHERE KyThanhToan = @KyTruoc
                                         AND TrangThai_TT = N'Đã hoàn thành')
                                AS DECIMAL(5,2))
                              END,
        HoaDonChuaDong      = (SELECT COUNT(*) FROM HDTHANG
                                WHERE TrangThai_TT = N'Chưa đóng'),
        HoaDonSapDenHan     = (SELECT COUNT(*) FROM HDTHANG
                                WHERE TrangThai_TT = N'Chưa đóng'
                                  AND HanDong BETWEEN CAST(GETDATE() AS DATE)
                                                  AND DATEADD(DAY, 7, CAST(GETDATE() AS DATE))),
        HoaDonQuaHan        = (SELECT COUNT(*) FROM HDTHANG
                                WHERE TrangThai_TT = N'Chưa đóng'
                                  AND HanDong < CAST(GETDATE() AS DATE)),
        DonDVChoXuLy        = (SELECT COUNT(*) FROM DONDV WHERE TrangThai_DV = N'Chờ xử lý'),
        DonDVKhanCap        = (SELECT COUNT(*) FROM DONDV
                                WHERE TrangThai_DV = N'Chờ xử lý'
                                  AND MucDo = N'Khẩn cấp'),
        NgayCapNhat         = SYSUTCDATETIME()
    WHERE ID = 1;
END;
GO
/****** Object:  StoredProcedure [dbo].[SP_ChiTiet_Phong]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- SP2: Chi tiết phòng đầy đủ (ChiTietPhong.cshtml)
CREATE   PROCEDURE [dbo].[SP_ChiTiet_Phong]
    @IDPhong INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Thông tin phòng + tenant hiện tại
    SELECT
        p.*,
        a.FullName   AS TenKhach,
        a.Phone      AS SdtKhach,
        a.Email      AS EmailKhach,
        hd.NgayBatDau, hd.NgayKetThuc,
        hd.TienCocBanDau,
        -- Manager phụ trách
        mgr.FullName AS TenManager,
        mgr.Phone    AS SdtManager
    FROM PHONG p
    LEFT JOIN HOPDONG hd   ON hd.IDPhong = p.IDPhong AND hd.TrangThaiHD = N'Đang hiệu lực'
    LEFT JOIN ACCOUNT a    ON a.IDUser = hd.IDUser
    LEFT JOIN PHONG_MANAGER pm ON pm.IDPhong = p.IDPhong AND pm.IsActive = 1
    LEFT JOIN ACCOUNT mgr  ON mgr.IDUser = pm.IDManager
    WHERE p.IDPhong = @IDPhong;

    -- 6 kỳ điện nước gần nhất
    SELECT TOP 6 * FROM DIENNUOC
    WHERE IDPhong = @IDPhong
    ORDER BY KyGhiNhan DESC;

    -- 6 hóa đơn gần nhất
    SELECT TOP 6 * FROM HDTHANG
    WHERE IDPhong = @IDPhong
    ORDER BY KyThanhToan DESC;

    -- Đơn DV chưa hoàn thành của phòng
    SELECT d.*, a.FullName AS TenKhach
    FROM DONDV d
    INNER JOIN ACCOUNT a ON a.IDUser = d.IDUser
    WHERE d.IDPhong = @IDPhong
      AND d.TrangThai_DV NOT IN (N'Thành công', N'Đã hủy')
    ORDER BY d.NgayTao DESC;
END;
GO
/****** Object:  StoredProcedure [dbo].[SP_Manager_Dashboard]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[SP_Manager_Dashboard]
    @IDManager INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Danh sách phòng được phân công
    SELECT
        p.IDPhong, p.SoPhong, p.Tang, p.TrangThai, p.GiaPhongFix,
        hd.IDUser      AS IDTenant,
        a.FullName     AS TenKhach,
        a.Phone        AS SdtKhach,
        hd.NgayBatDau, hd.NgayKetThuc,
        -- hóa đơn tháng hiện tại
        ht.TrangThai_TT AS TrangThaiHoaDon,
        ht.TongCong,
        ht.HanDong,
        -- đơn DV chờ xử lý
        (SELECT COUNT(*) FROM DONDV d
         WHERE d.IDPhong = p.IDPhong
           AND d.TrangThai_DV = N'Chờ xử lý') AS SoDonChoXuLy
    FROM PHONG_MANAGER pm
    INNER JOIN PHONG p ON p.IDPhong = pm.IDPhong
    LEFT JOIN HOPDONG hd ON hd.IDPhong = p.IDPhong
                         AND hd.TrangThaiHD = N'Đang hiệu lực'
    LEFT JOIN ACCOUNT a  ON a.IDUser = hd.IDUser
    LEFT JOIN HDTHANG ht ON ht.IDPhong = p.IDPhong
                         AND ht.KyThanhToan = FORMAT(GETDATE(), 'MM/yyyy')
    WHERE pm.IDManager = @IDManager
      AND pm.IsActive   = 1
    ORDER BY p.Tang, p.SoPhong;
END;
GO
/****** Object:  StoredProcedure [dbo].[SP_Manager_DonDV]    Script Date: 19/05/2026 7:45:37 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- SP3: Lấy đơn DV cho Manager (lọc theo phòng được giao + trạng thái)
CREATE   PROCEDURE [dbo].[SP_Manager_DonDV]
    @IDManager  INT,
    @TrangThai  NVARCHAR(30)  = NULL,   -- NULL = tất cả
    @LoaiDV     NVARCHAR(30)  = NULL,   -- NULL = tất cả
    @PageNumber INT           = 1,
    @PageSize   INT           = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        dv.IDDonDV, dv.LoaiDV, dv.NoiDung, dv.MucDo,
        dv.TrangThai_DV, dv.TongTien, dv.NgayTao,
        dv.GhiChuXuLy, dv.NgayXuLy,
        a.FullName  AS TenKhach,
        a.Phone     AS SdtKhach,
        p.SoPhong
    FROM DONDV dv
    INNER JOIN ACCOUNT a ON a.IDUser  = dv.IDUser
    INNER JOIN PHONG   p ON p.IDPhong = dv.IDPhong
    INNER JOIN PHONG_MANAGER pm ON pm.IDPhong   = dv.IDPhong
                                AND pm.IDManager = @IDManager
                                AND pm.IsActive  = 1
    WHERE (@TrangThai IS NULL OR dv.TrangThai_DV = @TrangThai)
      AND (@LoaiDV    IS NULL OR dv.LoaiDV       = @LoaiDV)
    ORDER BY
        CASE dv.MucDo WHEN N'Khẩn cấp' THEN 1 WHEN N'Trung bình' THEN 2 ELSE 3 END,
        dv.NgayTao DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO
USE [master]
GO
ALTER DATABASE [QUANLY_KHUTRO] SET  READ_WRITE 
GO
