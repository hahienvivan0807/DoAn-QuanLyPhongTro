Thêm các thư viện tại Manage Nuget Packet
1. BCrypt.NET-Next
2. JWT
3. Microsoft.EntityFramework.Tools
4. Microsoft.EntityFramework.Design
5. Microsoft.EntityFramework.SqlServer
6. Microsoft.EntityFramework.Tools
Hệ thống Quản lý Phòng trọ (Room Management API)

Đồ án xây dựng RESTful API phục vụ cho hệ thống quản lý phòng trọ. Ứng dụng cung cấp các đầu api (endpoints) để hỗ trợ chủ trọ quản lý danh sách phòng, khách thuê, tính toán chi phí và hỗ trợ người dùng.

Công nghệ sử dụng
Framework: ASP.NET Core Web App (Razor Pages) (C#)

Cơ sở dữ liệu: Microsoft SQL Server

ORM: Entity Framework Core

Xác thực & Phân quyền: Sử dụng cơ chế Authentication mặc định của ASP.NET kết hợp Attribute [Authorize]

Bảo mật mật khẩu: BCrypt.NET-Next

Tính năng nổi bật
Đăng nhập và Đăng ký tài khoản với cơ chế bảo mật mật khẩu (Hashing bằng BCrypt).

Thực hiện các thao tác CRUD (Thêm, Đọc, Sửa, Xóa) cho danh mục Phòng trọ.

Quản lý thông tin khách thuê phòng và hợp đồng.

Xử lý dữ liệu thông qua Entity Framework Core.

Hướng dẫn cài đặt
Bước 1: Clone repository này về máy.

Bước 2: Mở project bằng Visual Studio.

Bước 3: Thay đổi chuỗi kết nối (Connection String) trong file appsettings.json để trỏ tới database SQL Server local của bạn.

Bước 4: Mở Package Manager Console và chạy lệnh Update-Database để Entity Framework tự động khởi tạo các bảng dữ liệu.

Bước 5: Bấm Run (F5) để khởi chạy dự án và test API thông qua Swagger.
Mật khẩu chủ trọ cố định:
Tên đăng nhập: ChuTro
Mật Khẩu :123456
