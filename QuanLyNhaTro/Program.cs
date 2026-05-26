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

// Giới hạn request (Rate Limiting)
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
        options.LoginPath = "/Index";
        options.AccessDeniedPath = "/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        options.SlidingExpiration = true;

        // ✅ FIX 1: SecurePolicy.Always khiến cookie không được gửi khi chạy HTTP
        // trên localhost → API không nhận được auth → 401/500.
        // Dùng SameAsRequest để tự động dùng HTTP hoặc HTTPS tùy môi trường.
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest   // HTTP hoặc HTTPS đều được khi dev
            : CookieSecurePolicy.Always;          // Chỉ HTTPS khi production

        options.Cookie.SameSite = SameSiteMode.Lax;

        // ✅ FIX 2: Khi API bị 401, mặc định framework redirect về /Index (HTML).
        // Override để API trả về 401 JSON thay vì redirect — tránh browser log 404.
        options.Events = new CookieAuthenticationEvents
        {
            OnRedirectToLogin = ctx =>
            {
                // Nếu là API request → trả 401 thay vì redirect 302 về trang login
                if (ctx.Request.Path.StartsWithSegments("/api"))
                {
                    ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    ctx.Response.ContentType = "application/json";
                    return ctx.Response.WriteAsync("{\"message\":\"Chưa đăng nhập\"}");
                }
                ctx.Response.Redirect(ctx.RedirectUri);
                return Task.CompletedTask;
            },
            OnRedirectToAccessDenied = ctx =>
            {
                if (ctx.Request.Path.StartsWithSegments("/api"))
                {
                    ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                    ctx.Response.ContentType = "application/json";
                    return ctx.Response.WriteAsync("{\"message\":\"Không có quyền truy cập\"}");
                }
                ctx.Response.Redirect(ctx.RedirectUri);
                return Task.CompletedTask;
            }
        };
    });

// 4. Cấu hình Phân quyền (Authorization)
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

// 5. Cấu hình Session
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.AddHttpContextAccessor();

// Cấu hình Kestrel bảo mật hơn
builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
});

var app = builder.Build();

// ============================================================
// VÙNG 2: CẤU HÌNH PIPELINE (MIDDLEWARE)
// ============================================================

// 1. Custom Middleware: Security Headers
app.Use(async (context, next) =>
{
    var h = context.Response.Headers;

    h.Append("Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
        "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; " +
        "img-src 'self' data:; " +

        // ✅ FIX 3: Thêm wss://localhost:* vào connect-src để tắt lỗi
        // "Connecting to browserLinkSignalR violates Content Security Policy"
        "connect-src 'self' ws://localhost:* wss://localhost:* https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;");

    h.Append("X-Frame-Options", "DENY");
    h.Append("X-Content-Type-Options", "nosniff");
    h.Append("X-XSS-Protection", "1; mode=block");
    h.Append("Referrer-Policy", "strict-origin-when-cross-origin");

    try
    {
        await next();
    }
    catch (Exception ex) when (ex is IOException || ex is OperationCanceledException)
    {
        Console.WriteLine($"[Thông báo] Kết nối bị ngắt bởi Client hoặc Timeout: {ex.Message}");
    }
});

// 2. Các Middleware chuẩn
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseRateLimiter();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

// 3. Đăng ký Endpoints
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
