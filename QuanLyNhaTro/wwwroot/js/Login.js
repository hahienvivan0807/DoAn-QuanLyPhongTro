// ---- Hàm chung hiển thị thông báo ----
const ICON = {
    loi: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
    thanhCong: `<circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>`,
    canhBao: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`
};
function hienThiThongBao(loai, noiDung) {
    // loai: 'loi' | 'thanh-cong' | 'canh-bao'
    const el = document.getElementById('thong-bao');
    const icon = el.querySelector('.thong-bao-icon');
    const text = el.querySelector('.thong-bao-text');

    // Reset class cũ
    el.className = 'thong-bao ' + loai;

    // Gán icon theo loại
    const keyMap = { 'loi': 'loi', 'thanh-cong': 'thanhCong', 'canh-bao': 'canhBao' };
    icon.innerHTML = ICON[keyMap[loai]] || ICON.loi;

    text.textContent = noiDung;
    el.style.display = 'flex';
}

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
        let result = await Response.json()
        if (Response.ok) {
            const Chucvucnguoidung = result.chucVu;
            if (Chucvucnguoidung == "Admin") {
                hienThiThongBao('thanh-cong', result.message || 'Đăng nhập thành công!, Đang chuyển tới trang chủ trọ');
                window.location.href = "/Admin/ChuTro"
            }
            if (Chucvucnguoidung == "Manager") {
                hienThiThongBao('thanh-cong', result.message || 'Đăng nhập thành công!, Đang chuyển tới trang quản lý');
                window.location.href = "/Manager/Manger"
            }
            if (Chucvucnguoidung == "User") {
                hienThiThongBao('thanh-cong', result.message || 'Đăng nhập thành công!');
                window.location.href = "/KhachThue/KhachThue";
            }

        }
        else {
            hienThiThongBao('loi', result.message || 'Sai tên hoặc mật khẩu.');
        }

    }
    catch (error) {
        hienThiThongBao('loi', result.message);
        console.error(error);
    }
   
}
async function DangKy() {
    const User = document.getElementById("pusername").value;
    const Pass = document.getElementById("password").value;
    const dulieu = {
        UserNameDK: User,
        PassWordDK: Pass
    }
    try {
        let Response = await fetch('api/XuLyDangNhap/DangKy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dulieu)
        });
        if (Response.ok) {
            alert("Dang ky thanh cong");
        } else {
            alert("khong thanh cong");
        }
    } catch (error) {
        console.error(error);
        alert("Loi ko ket noi");
    }
}

