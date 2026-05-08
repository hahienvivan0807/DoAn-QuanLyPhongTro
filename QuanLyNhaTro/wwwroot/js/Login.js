/* ===== XỬ LÝ ĐĂNG NHẬP (kết nối với backend Razor Pages) ===== */
async function xuLyDangNhap() {
    const User = document.getElementById("ten-dang-nhap").value;
    const Pass = document.getElementById("mat-khau").value;
    const dulieu = {
        UserName: User,
        PassWord: Pass
    }

    /* ===== Kết nối API ===== */
    try {
        let Response = await fetch('api/XuLyDangNhap/DangNhap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dulieu)
        });

        // CHỈNH SỬA CHÍNH: Kiểm tra Response.ok trước khi gọi .json()
        if (Response.ok) {
            let result = await Response.json(); // Đưa vào trong khối if thành công
            const Chucvucnguoidung = result.chucVu;

            if (Chucvucnguoidung == "Admin") {
                alert("Đang chuyển tới trang Chủ trọ...");
                window.location.href = "/Admin/ChuTro";
            }
            else if (Chucvucnguoidung == "Manager") { // Dùng else if để tối ưu
                alert("Đang chuyển đến trang quản lý....");
                window.location.href = "/Manager/Manger";
            }
            else if (Chucvucnguoidung == "User") {
                alert("Đang chuyển hướng đến trang Khách thuê");
                window.location.href = "/KhachThue/KhachThue";
            }
        }
        else {
            // Nếu lỗi 401, 404, 500... code sẽ chạy vào đây
            alert("Đăng nhập không thành công: Sai tài khoản hoặc mật khẩu");
        }

    } catch (error) {
        // Nếu mất mạng hoặc API crash hoàn toàn, code nhảy vào đây
        alert("Không thể kết nối");
        console.error(error);
    }
}
