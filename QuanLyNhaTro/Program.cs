using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyNhaTro.Models;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// VÙNG 1: ĐĂNG KÝ DỊCH VỤ (SERVICES)
// ============================================================

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter(policyName: "fixed-ip", limiterOptions =>
    {
        limiterOptions.PermitLimit = 100;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 2;
    });
});
// 1. Đăng ký Razor Pages và Controllers
builder.Services.AddRazorPages(options =>
{
    options.Conventions.ConfigureFilter(new AutoValidateAntiforgeryTokenAttribute());


});

//giới hạn request

// 2. Cấu hình Database
var connectionString = builder.Configuration.GetConnectionString("QuanLyKhuNhaTro");
builder.Services.AddDbContext<QuanLyKhuNhaTro>(options =>
    options.UseSqlServer(connectionString));

// 3. Cấu hình Xác thực Cookie (Authentication)
builder.Services.AddAuthentication("MyCookieAuth")
    .AddCookie("MyCookieAuth", options =>
    {
        options.Cookie.Name = "MyCookieAuth";
        options.LoginPath = "/Index";
        options.AccessDeniedPath = "/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        options.SlidingExpiration = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Luôn yêu cầu HTTPS
        options.Cookie.SameSite = SameSiteMode.Lax;        // Hoặc Strict tùy vào yêu cầu UX
    });

// 4. Cấu hình Phân quyền
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

// 5. CẤU HÌNH SESSION (MỚI THÊM)
builder.Services.AddDistributedMemoryCache(); // Đăng ký bộ nhớ đệm
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Session hết hạn sau 30 phút
    options.Cookie.HttpOnly = true;                // Bảo mật Cookie
    options.Cookie.IsEssential = true;             // Đánh dấu là Cookie thiết yếu
});
builder.Services.AddHttpContextAccessor();
var app = builder.Build();
//
app.Use(async (context, next) =>
{
    var h = context.Response.Headers;
    h.Append("X-Frame-Options", "DENY");
    h.Append("X-Content-Type-Options", "nosniff");
    h.Append("X-XSS-Protection", "1; mode=block");
    h.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    h.Append("Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "style-src  'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "img-src    'self' data:;");
    await next();
});
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
app.UseRateLimiter();

// THỨ TỰ CỰC KỲ QUAN TRỌNG: 
app.UseSession(); // (MỚI THÊM - Phải đặt sau UseRouting và trước Authentication)

app.UseAuthentication();
app.UseAuthorization();

// Đăng ký các Endpoint
app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets().RequireRateLimiting("fixed-ip");
app.MapControllers();

// ============================================================
// VÙNG 3: TỰ ĐỘNG CẬP NHẬT CẤU TRÚC SQL (MIGRATION)
// ============================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<QuanLyKhuNhaTro>();
        context.Database.Migrate();
        Console.WriteLine(">>> Database đã được cập nhật thành công!");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Lỗi xảy ra khi đang tự động cập nhật Database.");
    }
}

app.Run();