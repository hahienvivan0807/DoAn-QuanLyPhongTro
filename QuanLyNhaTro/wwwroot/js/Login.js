/**
 * FILE: Login.js
 * Chức năng: Xử lý hiển thị thông báo và logic đăng nhập phân quyền
 */

// 1. Cấu hình các Icon SVG cho thông báo
const ICON = {
    loi: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
    thanhCong: `<circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>`,
    canhBao: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`
};

// 2. Hàm hiển thị thông báo (Toast message)
function hienThiThongBao(loai, noiDung) {
    // loai: 'loi' | 'thanh-cong' | 'canh-bao'
    const el = document.getElementById('thong-bao');
    if (!el) {
        console.error("Không tìm thấy phần tử id='thong-bao' trong HTML");
        return;
    }
    const icon = el.querySelector('.thong-bao-icon');
    const text = el.querySelector('.thong-bao-text');

    // Cập nhật giao diện theo loại thông báo
    el.className = 'thong-bao ' + loai;
    const keyMap = { 'loi': 'loi', 'thanh-cong': 'thanhCong', 'canh-bao': 'canhBao' };
    icon.innerHTML = ICON[keyMap[loai]] || ICON.loi;
    text.textContent = noiDung;

    // Hiển thị và tự động ẩn sau 3 giây (tùy chọn)
    el.style.display = 'flex';
}

// 3. Hàm xử lý đăng nhập chính
async function xuLyDangNhap(event) {
    // Ngăn chặn trang bị reload nếu nút nằm trong thẻ <form>
    if (event) event.preventDefault();

    const User = document.getElementById("ten-dang-nhap").value;
    const Pass = document.getElementById("mat-khau").value;

    if (!User || !Pass) {
        hienThiThongBao('canh-bao', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu!');
        return;
    }

    const dulieu = {
        UserName: User,
        PassWord: Pass
    };

    try {
        let Response = await fetch('api/XuLyDangNhap/DangNhap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dulieu)
        });

        // TRƯỜNG HỢP 1: Đăng nhập thành công (Status 200)
        if (Response.ok) {
            let result = await Response.json();
            const role = result.chucVu; // Lấy role từ Backend trả về

            hienThiThongBao('thanh-cong', result.message || 'Đăng nhập thành công!');

            // Điều hướng dựa trên quyền (Role)
            setTimeout(() => {
                if (role === "Admin") {
                    window.location.href = "/Admin/ChuTro";
                }
                else if (role === "Manager" || role === "QuanLy") {
                    window.location.href = "/Manager/Manager";
                }
                else if (role === "User" || role === "Tenant") {
                    window.location.href = "/KhachThue/KhachThue";
                }
                else {
                    hienThiThongBao('loi', 'Quyền truy cập không xác định: ' + role);
                }
            }, 800); // Chờ 0.8 giây để người dùng kịp thấy thông báo thành công
        }

        // TRƯỜNG HỢP 2: Lỗi nghiệp vụ (Status 400, 401...)
        else {
            const errorResult = await Response.json().catch(() => ({}));
            hienThiThongBao('loi', errorResult.message || 'Tài khoản hoặc mật khẩu không đúng!');
        }

    } catch (error) {
        // TRƯỜNG HỢP 3: Lỗi kết nối (Rớt mạng, Server die)
        console.error("Lỗi hệ thống:", error);
        hienThiThongBao('loi', 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau!');
    }

}
async function xuLyDangKy() {
    console.log("Hàm xuLyDangKy đã được kích hoạt!"); // Để kiểm tra xem nút có ăn hay không

    const messageDiv = document.getElementById('message');

    // Lấy dữ liệu từ các ô nhập
    const userVal = document.getElementById('username').value;
    const passVal = document.getElementById('password').value;
    const nameVal = document.getElementById('fullName').value;
    const phoneVal = document.getElementById('phone').value;
    const emailVal = document.getElementById('email').value;
    const roleVal = document.getElementById('roles').value;

    // Kiểm tra nhanh xem có bỏ trống trường bắt buộc không
    if (!userVal || !passVal || !nameVal || !phoneVal) {
        alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
        return;
    }

    const registerData = {
        username: userVal,
        passwords: passVal,
        fullName: nameVal,
        phone: phoneVal,
        email: emailVal,
        roles: roleVal
    };

    try {
        const response = await fetch('/api/Account/Register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });

        // Đọc dữ liệu trả về từ server
        const result = await response.json();

        if (response.ok) {
            // Nếu dùng hàm hiển thị thông báo cũ của bạn:
            if (typeof hienThiThongBao === "function") {
                hienThiThongBao('thanh-cong', result.message);
            } else {
                alert("Thành công: " + result.message);
            }
            document.getElementById('registerForm').reset();
        } else {
            if (typeof hienThiThongBao === "function") {
                hienThiThongBao('loi', result.message || "Đăng ký thất bại");
            } else {
                alert("Lỗi: " + (result.message || "Đăng ký thất bại"));
            }
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Không thể kết nối đến máy chủ. Kiểm tra lại Backend nhé!");
    }
}



console.log("File Login.js đã được tải thành công.");