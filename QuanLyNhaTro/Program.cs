using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// VÙNG 1: ĐĂNG KÝ DỊCH VỤ (SERVICES)
// ============================================================

// 1. Đăng ký Razor Pages và Controllers
builder.Services.AddRazorPages();
builder.Services.AddControllers();

// 2. Cấu hình Database
var connectionString = builder.Configuration.GetConnectionString("QuanLyKhuNhaTro");
builder.Services.AddDbContext<QuanLyKhuNhaTro>(options =>
    options.UseSqlServer(connectionString));

// 3. Cấu hình Xác thực Cookie (Authentication)
builder.Services.AddAuthentication("MyCookieAuth")
    .AddCookie("MyCookieAuth", options =>
    {
        options.Cookie.Name = "MyCookieAuth";
        options.LoginPath = "/Login";          // Trang chuyển hướng khi chưa đăng nhập
        options.AccessDeniedPath = "/AccessDenied"; // Trang chuyển hướng khi sai quyền (403)
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30); // Cookie hết hạn sau 30p
        options.SlidingExpiration = true;      // Tự động gia hạn khi người dùng còn hoạt động
    });

// 4. Cấu hình Phân quyền (Authorization) - CÁCH LÀM TRIỆT ĐỂ
builder.Services.AddAuthorization(options =>
{
    // Tạo một chính sách mặc định: Mọi trang đều yêu cầu đăng nhập
    // Nếu bạn muốn mở trang nào cho khách, hãy dùng [AllowAnonymous] ở file .cshtml.cs đó
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

var app = builder.Build();

// ============================================================
// VÙNG 2: CẤU HÌNH PIPELINE (MIDDLEWARE)
// ============================================================

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// THỨ TỰ CỰC KỲ QUAN TRỌNG: 
// Authentication (Xác thực) phải đứng TRƯỚC Authorization (Phân quyền)
app.UseAuthentication();
app.UseAuthorization();

// Đăng ký các Endpoint
app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();
app.MapControllers();

app.Run();