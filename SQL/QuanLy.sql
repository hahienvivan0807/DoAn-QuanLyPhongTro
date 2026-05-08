/* ====================================================================
HỆ THỐNG QUẢN LÝ KHU TỰ TRỊ (KHU TRỌ) - SQL FULL SCHEMA
Phiên bản: Tối ưu hóa thực tế (Time-series meter readings & QR payment)
====================================================================
*/

CREATE DATABASE QUANLY_KHUTRO;
USE QUANLY_KHUTRO;

-- 1. BẢNG TÀI KHOẢN (Người dùng hệ thống)
CREATE TABLE ACCOUNT (
    IDUser VARCHAR(20) PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Passwords VARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Phone VARCHAR(15) NOT NULL,
    Roles VARCHAR(20) NOT NULL, -- 'Tenant', 'Manager', 'Admin'
    QR_Link VARCHAR(255) NULL, -- Chỉ Manager/Admin cần để hiện mã QR nhận tiền
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG PHÒNG
CREATE TABLE PHONG (
    IDPhong VARCHAR(20) PRIMARY KEY,
    SoPhong VARCHAR(10) NOT NULL UNIQUE,
    GiaPhongFix DECIMAL(15, 2) NOT NULL, -- Giá thuê cố định hàng tháng
    TrangThai NVARCHAR(30) DEFAULT N'Trống' -- Trống, Đã thuê, Đang sửa
);

-- 3. BẢNG HỢP ĐỒNG (Kết nối Khách - Phòng)
CREATE TABLE HOPDONG (
    IDHopDong VARCHAR(20) PRIMARY KEY,
    IDUser VARCHAR(20) NOT NULL,
    IDPhong VARCHAR(20) NOT NULL,
    NgayBatDau DATE NOT NULL,
    NgayKetThuc DATE NULL,
    -- Quan trọng: Chốt số điện nước lúc khách mới dọn vào
    DienDauKy INT NOT NULL DEFAULT 0,
    NuocDauKy INT NOT NULL DEFAULT 0,
    TrangThaiHD NVARCHAR(30) DEFAULT N'Đang hiệu lực',
    FOREIGN KEY (IDUser) REFERENCES ACCOUNT(IDUser),
    FOREIGN KEY (IDPhong) REFERENCES PHONG(IDPhong)
);

-- 4. BẢNG ĐƠN DỊCH VỤ (Nước bình & Giặt sấy) - Thanh toán cho Manager
CREATE TABLE DONDV (
    IDDonDV VARCHAR(20) PRIMARY KEY,
    IDUser VARCHAR(20) NOT NULL, -- Khách đặt đơn
    LoaiDV NVARCHAR(30) NOT NULL, -- 'Nước bình', 'Giặt sấy'
    NoiDung NVARCHAR(255), -- Ví dụ: '3 bình nước', '2kg đồ màu'
    TongTien DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Quản lý báo giá sau khi xử lý
    TrangThai_DV NVARCHAR(50) DEFAULT N'Chờ xử lý', -- Chờ xử lý -> Chờ thanh toán -> Thành công
    AnhBienLai VARCHAR(255) NULL, -- Link ảnh khách chuyển khoản cho Manager
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IDUser) REFERENCES ACCOUNT(IDUser)
);

-- 5. BẢNG CHỈ SỐ ĐIỆN NƯỚC (Lưu theo kỳ - Không ghi đè)
CREATE TABLE DIENNUOC (
    IDGhiNhan VARCHAR(20) PRIMARY KEY,
    IDPhong VARCHAR(20) NOT NULL,
    KyGhiNhan VARCHAR(7) NOT NULL, -- Định dạng 'MM/YYYY' (Ví dụ: '05/2024')
    SoDienMoi INT NOT NULL,
    SoNuocMoi INT NOT NULL,
    SoNuocCu int not null,
    SoDienCu int not null,
    AnhChupDongHo VARCHAR(255) NOT NULL, -- Bằng chứng hình ảnh
    TrangThaiDuyet BIT DEFAULT 0, -- 0: Chờ duyệt, 1: Manager đã duyệt
    NgayGhi DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IDPhong) REFERENCES PHONG(IDPhong)
);

-- 6. BẢNG HÓA ĐƠN THÁNG (Doanh thu hàng tháng - Thanh toán cho Admin)
CREATE TABLE HDTHANG (
    IDHDThang VARCHAR(20) PRIMARY KEY,
    IDPhong VARCHAR(20) NOT NULL,
    KyThanhToan VARCHAR(7) NOT NULL, -- 'MM/YYYY'
    
    -- Chi tiết hóa đơn
    TienPhong DECIMAL(15, 2) NOT NULL,
    TienDienSum DECIMAL(15, 2) NOT NULL, -- (Số mới - Số cũ) * Đơn giá
    TienNuocSum DECIMAL(15, 2) NOT NULL, -- (Số mới - Số cũ) * Đơn giá
    TongCong DECIMAL(15, 2) NOT NULL,
    
    HanDong DATE NOT NULL,
    TrangThai_TT NVARCHAR(30) DEFAULT N'Chưa đóng', -- Chưa đóng -> Chờ duyệt -> Đã hoàn thành
    AnhChuyenKhoan VARCHAR(255) NULL, -- Link ảnh khách chuyển khoản cho Chủ trọ
    NgayXuatHD DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IDPhong) REFERENCES PHONG(IDPhong)
);

-- 7. BẢNG CÀI ĐẶT GIÁ (Để Backend lấy đơn giá tính tiền)

    CREATE TABLE CONFIG_GIA (
    IDConfig INT PRIMARY KEY IDENTITY(1,1),
    TenDichVu NVARCHAR(50), 
    DonGia DECIMAL(15, 2) NOT NULL,
    NgayApDung DATETIME DEFAULT CURRENT_TIMESTAMP
);
--7 Bang thong ke
/* Bang thong ke tong hop - 1 dong duy nhat */
create table THONGKE_TONG
(
    ID                  int             not null default 1,
    TongSoPhong         int             not null default 0,
    PhongDangThue       int             not null default 0,
    PhongConTrong       int             not null default 0,
    TiLeLapDay          decimal(5,2)    not null default 0,
    DoanhThuThangNay    decimal(15,2)   not null default 0,
    DoanhThuThangTruoc  decimal(15,2)   not null default 0,
    TangTruongDoanhThu  decimal(5,2)    not null default 0,
    HoaDonChuaDong      int             not null default 0,
    HoaDonSapDenHan     int             not null default 0,
    HoaDonQuaHan        int             not null default 0,
    DonDVChoXuLy        int             not null default 0,
    NgayCapNhat         datetime        not null default getdate(),
    constraint PK_THONGKE_TONG primary key(ID)
)
go

/* Tao dong mac dinh ID=1 ngay khi cai dat */
insert into THONGKE_TONG (ID) values (1)
go

/* Bang thong ke doanh thu theo tung thang - danh cho bieu do */
create table THONGKE_DOANHTHU_THANG
(
    IDThongKe           int             not null identity(1,1),
    Nam                 int             not null,
    Thang               int             not null,
    TongTienPhong       decimal(15,2)   not null default 0,
    TongTienDien        decimal(15,2)   not null default 0,
    TongTienNuoc        decimal(15,2)   not null default 0,
    TongCong            decimal(15,2)   not null default 0,
    SoHoaDonDaDong      int             not null default 0,
    NgayCapNhat         datetime        not null default getdate(),
    constraint PK_THONGKE_DOANHTHU primary key(IDThongKe),
    constraint UQ_NAM_THANG         unique(Nam, Thang)
)
USE QUANLY_KHUTRO;
GO

-- =======================================================
-- 1. THÊM 20 DỮ LIỆU BẢNG ACCOUNT
-- (1 Admin, 2 Manager, 17 Tenant)
-- =======================================================
INSERT INTO ACCOUNT (IDUser, Username, Passwords, FullName, Phone, Roles, QR_Link) VALUES 
('U01', 'admin', '123456', N'Nguyễn Admin', '0900111222', 'Admin', NULL),
('U02', 'manager1', '123456', N'Trần Quản Lý Một', '0900222333', 'Manager', 'qr_link_1.png'),
('U03', 'manager2', '123456', N'Lê Quản Lý Hai', '0900333444', 'Manager', 'qr_link_2.png'),
('U04', 'tenant01', '123456', N'Phạm Khách Thuê 1', '0911000001', 'Tenant', NULL),
('U05', 'tenant02', '123456', N'Hoàng Khách Thuê 2', '0911000002', 'Tenant', NULL),
('U06', 'tenant03', '123456', N'Vũ Khách Thuê 3', '0911000003', 'Tenant', NULL),
('U07', 'tenant04', '123456', N'Đặng Khách Thuê 4', '0911000004', 'Tenant', NULL),
('U08', 'tenant05', '123456', N'Bùi Khách Thuê 5', '0911000005', 'Tenant', NULL),
('U09', 'tenant06', '123456', N'Đỗ Khách Thuê 6', '0911000006', 'Tenant', NULL),
('U10', 'tenant07', '123456', N'Hồ Khách Thuê 7', '0911000007', 'Tenant', NULL),
('U11', 'tenant08', '123456', N'Ngô Khách Thuê 8', '0911000008', 'Tenant', NULL),
('U12', 'tenant09', '123456', N'Dương Khách Thuê 9', '0911000009', 'Tenant', NULL),
('U13', 'tenant10', '123456', N'Lý Khách Thuê 10', '0911000010', 'Tenant', NULL),
('U14', 'tenant11', '123456', N'Đào Khách Thuê 11', '0911000011', 'Tenant', NULL),
('U15', 'tenant12', '123456', N'Đoàn Khách Thuê 12', '0911000012', 'Tenant', NULL),
('U16', 'tenant13', '123456', N'Vương Khách Thuê 13', '0911000013', 'Tenant', NULL),
('U17', 'tenant14', '123456', N'Trịnh Khách Thuê 14', '0911000014', 'Tenant', NULL),
('U18', 'tenant15', '123456', N'Đinh Khách Thuê 15', '0911000015', 'Tenant', NULL),
('U19', 'tenant16', '123456', N'Lâm Khách Thuê 16', '0911000016', 'Tenant', NULL),
('U20', 'tenant17', '123456', N'Phùng Khách Thuê 17', '0911000017', 'Tenant', NULL);
GO

-- =======================================================
-- 2. THÊM 20 DỮ LIỆU BẢNG PHÒNG
-- (17 phòng đang thuê, 2 phòng trống, 1 phòng đang sửa)
-- =======================================================
INSERT INTO PHONG (IDPhong, SoPhong, GiaPhongFix, TrangThai) VALUES 
('P01', '101', 2500000, N'Đã thuê'),
('P02', '102', 2500000, N'Đã thuê'),
('P03', '103', 2500000, N'Đã thuê'),
('P04', '104', 2800000, N'Đã thuê'),
('P05', '105', 2800000, N'Đã thuê'),
('P06', '201', 3000000, N'Đã thuê'),
('P07', '202', 3000000, N'Đã thuê'),
('P08', '203', 3000000, N'Đã thuê'),
('P09', '204', 3200000, N'Đã thuê'),
('P10', '205', 3200000, N'Đã thuê'),
('P11', '301', 3500000, N'Đã thuê'),
('P12', '302', 3500000, N'Đã thuê'),
('P13', '303', 3500000, N'Đã thuê'),
('P14', '304', 3800000, N'Đã thuê'),
('P15', '305', 3800000, N'Đã thuê'),
('P16', '401', 4000000, N'Đã thuê'),
('P17', '402', 4000000, N'Đã thuê'),
('P18', '403', 4000000, N'Trống'),
('P19', '404', 4000000, N'Trống'),
('P20', '405', 4000000, N'Đang sửa');
GO

-- =======================================================
-- 3. THÊM 20 DỮ LIỆU BẢNG HỢP ĐỒNG 
-- (Gán cho 17 khách hàng từ U04 -> U20 và 17 Phòng P01 -> P17. Thêm 3 HĐ cũ đã kết thúc)
-- =======================================================
INSERT INTO HOPDONG (IDHopDong, IDUser, IDPhong, NgayBatDau, NgayKetThuc, DienDauKy, NuocDauKy, TrangThaiHD) VALUES 
('HD01', 'U04', 'P01', '2024-01-01', '2024-12-31', 100, 10, N'Đang hiệu lực'),
('HD02', 'U05', 'P02', '2024-01-05', '2025-01-05', 150, 12, N'Đang hiệu lực'),
('HD03', 'U06', 'P03', '2024-02-01', '2025-02-01', 200, 20, N'Đang hiệu lực'),
('HD04', 'U07', 'P04', '2024-02-15', '2025-02-15', 300, 25, N'Đang hiệu lực'),
('HD05', 'U08', 'P05', '2024-03-01', '2025-03-01', 350, 30, N'Đang hiệu lực'),
('HD06', 'U09', 'P06', '2024-03-10', '2025-03-10', 400, 40, N'Đang hiệu lực'),
('HD07', 'U10', 'P07', '2024-04-01', '2025-04-01', 450, 45, N'Đang hiệu lực'),
('HD08', 'U11', 'P08', '2024-04-20', '2025-04-20', 500, 50, N'Đang hiệu lực'),
('HD09', 'U12', 'P09', '2024-05-01', '2025-05-01', 550, 55, N'Đang hiệu lực'),
('HD10', 'U13', 'P10', '2024-05-15', '2025-05-15', 600, 60, N'Đang hiệu lực'),
('HD11', 'U14', 'P11', '2024-06-01', '2025-06-01', 650, 65, N'Đang hiệu lực'),
('HD12', 'U15', 'P12', '2024-06-10', '2025-06-10', 700, 70, N'Đang hiệu lực'),
('HD13', 'U16', 'P13', '2024-07-01', '2025-07-01', 750, 75, N'Đang hiệu lực'),
('HD14', 'U17', 'P14', '2024-07-20', '2025-07-20', 800, 80, N'Đang hiệu lực'),
('HD15', 'U18', 'P15', '2024-08-01', '2025-08-01', 850, 85, N'Đang hiệu lực'),
('HD16', 'U19', 'P16', '2024-08-15', '2025-08-15', 900, 90, N'Đang hiệu lực'),
('HD17', 'U20', 'P17', '2024-09-01', '2025-09-01', 950, 95, N'Đang hiệu lực'),
-- 3 Hợp đồng cũ đã hết hạn
('HD18', 'U04', 'P18', '2023-01-01', '2023-12-31', 50, 5, N'Đã kết thúc'),
('HD19', 'U05', 'P19', '2023-02-01', '2024-01-31', 80, 8, N'Đã kết thúc'),
('HD20', 'U06', 'P20', '2023-03-01', '2024-02-28', 90, 9, N'Đã kết thúc');
GO

-- =======================================================
-- 4. THÊM 20 DỮ LIỆU BẢNG ĐƠN DỊCH VỤ (DONDV)
-- =======================================================
INSERT INTO DONDV (IDDonDV, IDUser, LoaiDV, NoiDung, TongTien, TrangThai_DV, AnhBienLai) VALUES 
('DV01', 'U04', N'Nước bình', N'3 bình nước Vihawa', 150000, N'Thành công', 'bill01.jpg'),
('DV02', 'U05', N'Giặt sấy', N'5kg giặt ướt', 50000, N'Chờ xử lý', NULL),
('DV03', 'U06', N'Nước bình', N'2 bình Lavie', 120000, N'Chờ thanh toán', NULL),
('DV04', 'U07', N'Giặt sấy', N'Chăn ga mền', 80000, N'Thành công', 'bill04.jpg'),
('DV05', 'U08', N'Nước bình', N'5 bình nước lọc', 100000, N'Thành công', 'bill05.jpg'),
('DV06', 'U09', N'Giặt sấy', N'3kg đồ màu', 45000, N'Chờ xử lý', NULL),
('DV07', 'U10', N'Nước bình', N'1 bình Vĩnh Hảo', 55000, N'Thành công', 'bill07.jpg'),
('DV08', 'U11', N'Giặt sấy', N'Giặt giày', 60000, N'Chờ thanh toán', NULL),
('DV09', 'U12', N'Nước bình', N'2 bình Aquafina', 110000, N'Thành công', 'bill09.jpg'),
('DV10', 'U13', N'Giặt sấy', N'2kg đồ trắng', 30000, N'Thành công', 'bill10.jpg'),
('DV11', 'U14', N'Nước bình', N'4 bình nước Vihawa', 200000, N'Chờ xử lý', NULL),
('DV12', 'U15', N'Giặt sấy', N'8kg giặt sấy khô', 120000, N'Thành công', 'bill12.jpg'),
('DV13', 'U16', N'Nước bình', N'3 bình Lavie', 180000, N'Thành công', 'bill13.jpg'),
('DV14', 'U17', N'Giặt sấy', N'Sấy gấu bông', 40000, N'Chờ thanh toán', NULL),
('DV15', 'U18', N'Nước bình', N'2 bình nước lọc', 40000, N'Thành công', 'bill15.jpg'),
('DV16', 'U19', N'Giặt sấy', N'Giặt hấp áo vest', 150000, N'Thành công', 'bill16.jpg'),
('DV17', 'U20', N'Nước bình', N'1 bình Vihawa', 50000, N'Chờ xử lý', NULL),
('DV18', 'U04', N'Giặt sấy', N'Giặt 5kg đồ', 50000, N'Thành công', 'bill18.jpg'),
('DV19', 'U05', N'Nước bình', N'5 bình Aquafina', 275000, N'Chờ thanh toán', NULL),
('DV20', 'U06', N'Giặt sấy', N'Giặt mền lớn', 70000, N'Thành công', 'bill20.jpg');
GO

-- =======================================================
-- 5. THÊM 20 DỮ LIỆU BẢNG CHỈ SỐ ĐIỆN NƯỚC (DIENNUOC)
-- =======================================================
INSERT INTO DIENNUOC (IDGhiNhan, IDPhong, KyGhiNhan, SoDienMoi, SoNuocMoi, SoDienCu, SoNuocCu, AnhChupDongHo, TrangThaiDuyet) VALUES 
('DN01', 'P01', '05/2024', 150, 15, 100, 10, 'dn_p01_052024.jpg', 1),
('DN02', 'P02', '05/2024', 210, 18, 150, 12, 'dn_p02_052024.jpg', 1),
('DN03', 'P03', '05/2024', 280, 26, 200, 20, 'dn_p03_052024.jpg', 1),
('DN04', 'P04', '05/2024', 360, 32, 300, 25, 'dn_p04_052024.jpg', 1),
('DN05', 'P05', '05/2024', 420, 38, 350, 30, 'dn_p05_052024.jpg', 1),
('DN06', 'P06', '05/2024', 490, 47, 400, 40, 'dn_p06_052024.jpg', 1),
('DN07', 'P07', '05/2024', 530, 52, 450, 45, 'dn_p07_052024.jpg', 1),
('DN08', 'P08', '05/2024', 580, 58, 500, 50, 'dn_p08_052024.jpg', 1),
('DN09', 'P09', '05/2024', 620, 61, 550, 55, 'dn_p09_052024.jpg', 0),
('DN10', 'P10', '05/2024', 680, 67, 600, 60, 'dn_p10_052024.jpg', 0),
('DN11', 'P11', '05/2024', 730, 72, 650, 65, 'dn_p11_052024.jpg', 0),
('DN12', 'P12', '05/2024', 790, 78, 700, 70, 'dn_p12_052024.jpg', 0),
('DN13', 'P13', '05/2024', 840, 82, 750, 75, 'dn_p13_052024.jpg', 1),
('DN14', 'P14', '05/2024', 880, 88, 800, 80, 'dn_p14_052024.jpg', 1),
('DN15', 'P15', '05/2024', 940, 93, 850, 85, 'dn_p15_052024.jpg', 1),
('DN16', 'P16', '05/2024', 980, 98, 900, 90, 'dn_p16_052024.jpg', 1),
('DN17', 'P17', '05/2024', 1030, 102, 950, 95, 'dn_p17_052024.jpg', 1),
-- Dữ liệu kỳ trước (Tháng 4/2024)
('DN18', 'P01', '04/2024', 100, 10, 60, 5, 'dn_p01_042024.jpg', 1),
('DN19', 'P02', '04/2024', 150, 12, 100, 8, 'dn_p02_042024.jpg', 1),
('DN20', 'P03', '04/2024', 200, 20, 160, 15, 'dn_p03_042024.jpg', 1);
GO

-- =======================================================
-- 6. THÊM 20 DỮ LIỆU BẢNG HÓA ĐƠN THÁNG (HDTHANG)
-- =======================================================
INSERT INTO HDTHANG (IDHDThang, IDPhong, KyThanhToan, TienPhong, TienDienSum, TienNuocSum, TongCong, HanDong, TrangThai_TT, AnhChuyenKhoan) VALUES 
('HDT01', 'P01', '05/2024', 2500000, 175000, 100000, 2775000, '2024-06-05', N'Đã hoàn thành', 'tt_p01.jpg'),
('HDT02', 'P02', '05/2024', 2500000, 210000, 120000, 2830000, '2024-06-05', N'Chờ duyệt', 'tt_p02.jpg'),
('HDT03', 'P03', '05/2024', 2500000, 280000, 120000, 2900000, '2024-06-05', N'Chưa đóng', NULL),
('HDT04', 'P04', '05/2024', 2800000, 210000, 140000, 3150000, '2024-06-05', N'Đã hoàn thành', 'tt_p04.jpg'),
('HDT05', 'P05', '05/2024', 2800000, 245000, 160000, 3205000, '2024-06-05', N'Chưa đóng', NULL),
('HDT06', 'P06', '05/2024', 3000000, 315000, 140000, 3455000, '2024-06-05', N'Đã hoàn thành', 'tt_p06.jpg'),
('HDT07', 'P07', '05/2024', 3000000, 280000, 140000, 3420000, '2024-06-05', N'Chưa đóng', NULL),
('HDT08', 'P08', '05/2024', 3000000, 280000, 160000, 3440000, '2024-06-05', N'Chờ duyệt', 'tt_p08.jpg'),
('HDT09', 'P09', '05/2024', 3200000, 245000, 120000, 3565000, '2024-06-05', N'Đã hoàn thành', 'tt_p09.jpg'),
('HDT10', 'P10', '05/2024', 3200000, 280000, 140000, 3620000, '2024-06-05', N'Chưa đóng', NULL),
('HDT11', 'P11', '05/2024', 3500000, 280000, 140000, 3920000, '2024-06-05', N'Đã hoàn thành', 'tt_p11.jpg'),
('HDT12', 'P12', '05/2024', 3500000, 315000, 160000, 3975000, '2024-06-05', N'Chờ duyệt', 'tt_p12.jpg'),
('HDT13', 'P13', '05/2024', 3500000, 315000, 140000, 3955000, '2024-06-05', N'Đã hoàn thành', 'tt_p13.jpg'),
('HDT14', 'P14', '05/2024', 3800000, 280000, 160000, 4240000, '2024-06-05', N'Chưa đóng', NULL),
('HDT15', 'P15', '05/2024', 3800000, 315000, 160000, 4275000, '2024-06-05', N'Đã hoàn thành', 'tt_p15.jpg'),
('HDT16', 'P16', '05/2024', 4000000, 280000, 160000, 4440000, '2024-06-05', N'Chờ duyệt', 'tt_p16.jpg'),
('HDT17', 'P17', '05/2024', 4000000, 280000, 140000, 4420000, '2024-06-05', N'Đã hoàn thành', 'tt_p17.jpg'),
-- Dữ liệu hóa đơn cũ
('HDT18', 'P01', '04/2024', 2500000, 140000, 100000, 2740000, '2024-05-05', N'Đã hoàn thành', 'tt_p01_cu.jpg'),
('HDT19', 'P02', '04/2024', 2500000, 175000, 80000, 2755000, '2024-05-05', N'Đã hoàn thành', 'tt_p02_cu.jpg'),
('HDT20', 'P03', '04/2024', 2500000, 140000, 100000, 2740000, '2024-05-05', N'Đã hoàn thành', 'tt_p03_cu.jpg');
GO

-- =======================================================
-- 7. THÊM 20 DỮ LIỆU BẢNG CONFIG_GIA (CÀI ĐẶT DỊCH VỤ)
-- =======================================================
INSERT INTO CONFIG_GIA (TenDichVu, DonGia) VALUES 
(N'Giá Điện (kWh)', 3500),
(N'Giá Nước (m3)', 20000),
(N'Phí Rác sinh hoạt', 30000),
(N'Wifi / Internet', 50000),
(N'Gửi xe máy', 100000),
(N'Gửi xe đạp', 50000),
(N'Giặt sấy khô (kg)', 15000),
(N'Giặt sấy ướt (kg)', 10000),
(N'Nước bình Vihawa 20L', 50000),
(N'Nước bình Lavie 19L', 60000),
(N'Dọn vệ sinh phòng', 100000),
(N'Phí quản lý chung', 50000),
(N'Phí bảo trì thang máy', 30000),
(N'Thẻ từ ra vào', 50000),
(N'Phí phạt trễ hạn HĐ', 200000),
(N'Truyền hình cáp', 40000),
(N'Phí đăng ký tạm trú', 0),
(N'Sửa máy lạnh', 250000),
(N'Bơm ga máy lạnh', 150000),
(N'Sửa đường ống nước', 100000);
GO

-- =======================================================
-- 8. BẢNG THONGKE_TONG (Chỉ 1 dòng - Nên UPDATE thay vì INSERT)
-- =======================================================
UPDATE THONGKE_TONG 
SET TongSoPhong = 20, 
    PhongDangThue = 17, 
    PhongConTrong = 2, 
    TiLeLapDay = 85.00,
    DoanhThuThangNay = 56230000,
    DoanhThuThangTruoc = 51200000,
    TangTruongDoanhThu = 9.82,
    HoaDonChuaDong = 4,
    HoaDonSapDenHan = 1,
    HoaDonQuaHan = 0,
    DonDVChoXuLy = 4,
    NgayCapNhat = GETDATE()
WHERE ID = 1;
GO

-- =======================================================
-- 9. THÊM 20 DỮ LIỆU BẢNG THONGKE_DOANHTHU_THANG 
-- (Thống kê 20 tháng từ T1/2023 -> T8/2024)
-- =======================================================
INSERT INTO THONGKE_DOANHTHU_THANG (Nam, Thang, TongTienPhong, TongTienDien, TongTienNuoc, TongCong, SoHoaDonDaDong) VALUES 
(2023, 1, 40000000, 4500000, 2000000, 46500000, 15),
(2023, 2, 40500000, 4600000, 2100000, 47200000, 15),
(2023, 3, 41000000, 4800000, 2200000, 48000000, 16),
(2023, 4, 42000000, 5000000, 2300000, 49300000, 16),
(2023, 5, 43000000, 5500000, 2400000, 50900000, 16),
(2023, 6, 43000000, 6000000, 2500000, 51500000, 17),
(2023, 7, 44000000, 6200000, 2600000, 52800000, 17),
(2023, 8, 44000000, 6100000, 2600000, 52700000, 17),
(2023, 9, 45000000, 5800000, 2500000, 53300000, 17),
(2023, 10, 45000000, 5500000, 2400000, 52900000, 17),
(2023, 11, 46000000, 5200000, 2300000, 53500000, 17),
(2023, 12, 47000000, 5000000, 2300000, 54300000, 17),
(2024, 1, 48000000, 4800000, 2200000, 55000000, 17),
(2024, 2, 48000000, 4900000, 2200000, 55100000, 17),
(2024, 3, 49000000, 5200000, 2300000, 56500000, 17),
(2024, 4, 50000000, 6000000, 2500000, 58500000, 17),
(2024, 5, 51000000, 6500000, 2600000, 60100000, 17),
(2024, 6, 52000000, 7000000, 2800000, 61800000, 17),
(2024, 7, 52000000, 7200000, 2800000, 62000000, 17),
(2024, 8, 53000000, 6800000, 2700000, 62500000, 17);
GO

