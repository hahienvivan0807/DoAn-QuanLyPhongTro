// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
/* ===== XỬ LÝ ĐĂNG NHẬP (kết nối với backend Razor Pages) ===== */
function xuLyDangNhap() {
    const User = document.getElementById("ten-dang-nhap").value;
    const Pass = document.getElementById("mat-khau").value;

    alert('Đang đăng nhập... (Kết nối backend tại hàm xuLyDangNhap)');
}