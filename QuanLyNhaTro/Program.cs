using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using Microsoft.AspNetCore.Authentication.Cookies; // Thêm dòng này để dùng Cookie

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// VÙNG 1: ĐĂNG KÝ DỊCH VỤ (SERVICES) - TRƯỚC KHI BUILD
// ============================================================

// 1. Đăng ký Razor Pages
builder.Services.AddRazorPages();

// 2. Đăng ký Controllers (BẮT BUỘC để cái SimpleController của bạn chạy được)
builder.Services.AddControllers();

// 3. Cấu hình Database
var connectionString = builder.Configuration.GetConnectionString("QuanLyKhuNhaTro");
builder.Services.AddDbContext<QuanLyKhuNhaTro>(options =>
    options.UseSqlServer(connectionString));

// 4. Cấu hình xác thực Cookie (BẮT BUỘC để hàm SignInAsync hoạt động)
builder.Services.AddAuthentication("MyCookieAuth")
    .AddCookie("MyCookieAuth", options =>
    {
        options.Cookie.Name = "MyCookieAuth";
        options.LoginPath = "/Login"; // Đường dẫn đến trang đăng nhập của bạn
    });

// ============================================================
// VẠCH KẺ QUAN TRỌNG: CHỐT ĐƠN DỊCH VỤ
// ============================================================
var app = builder.Build();

// ============================================================
// VÙNG 2: CẤU HÌNH CÁCH WEB HOẠT ĐỘNG (MIDDLEWARE) - SAU KHI BUILD
// ============================================================

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Thêm cái này để nhận file CSS/JS/Hình ảnh
app.UseRouting();

// BẮT BUỘC: Phải có Authentication TRƯỚC Authorization
app.UseAuthentication();
app.UseAuthorization();

// Đăng ký các đầu mục đường dẫn
app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();
app.MapControllers(); // BẮT BUỘC để hệ thống tìm thấy API DangNhap trong Controller

app.Run();