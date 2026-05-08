
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
                alert("Đang chuyển tới trang Chủ trọ...");
                window.location.href = "/Admin/ChuTro"
            }
            if (Chucvucnguoidung == "Manager") {
                alert("Đang chuyển đến trang quản lý....");
                window.location.href = "/Manager/Manger"
            }
            if (Chucvucnguoidung == "User") {
                alert("Đang chuyển hướng đến trang Khách thuê");
                window.location.href = "/KhachThue/KhachThue";
            }

        }
        else {
            alert("Đăng nhập không thành công");
        }

    }
    catch (error) {
        alert("Không thể kết nối");
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

