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
        options.LoginPath = "/Index";
        options.AccessDeniedPath = "/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        options.SlidingExpiration = true;
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
app.UseSession(); // (MỚI THÊM - Phải đặt sau UseRouting và trước Authentication)

app.UseAuthentication();
app.UseAuthorization();

// Đăng ký các Endpoint
app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();
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