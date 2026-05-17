function hienThongBao(noiDung, loai = 'info') {
    const mauNen = { 'thanh-cong': '#059669', 'loi': '#dc2626', 'canh-bao': '#d97706', 'info': '#1d4ed8' };
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed; bottom:28px; right:28px; z-index:99999;
      background:${mauNen[loai]}; color:#fff; padding:14px 20px;
      border-radius:12px; font-size:13px; font-weight:700;
      box-shadow:0 8px 32px rgba(0,0,0,0.2); max-width:320px;
      animation: truot-len 0.3s ease; font-family:'Be Vietnam Pro',sans-serif;
    `;
    toast.textContent = noiDung;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)'; toast.style.transition = 'all 0.3s'; }, 2700);
    setTimeout(() => toast.remove(), 3100);
}
// ===== HÀM ĐIỀU HƯỚNG MENU SIDEBAR ======
function chuyenMenu(tenTrang, phanTu) {
    document.querySelectorAll('.muc-menu').forEach(m => m.classList.remove('dang-chon'));
    if (phanTu) phanTu.classList.add('dang-chon');
    // ⚙️ BACKEND: Map tên trang → Razor Page route
    const bangDuongDan = {
        'trang-chu': '/Admin/ChuTro',
        'quan-ly-phong': '/ChiTietPhong',
        'nguoi-thue': '/QuanLyNguoiThue',
        'hop-dong': '/Admin/QuanLyHopDong',
        'hoa-don': '/HoaDon',
        'sua-chua': '/SuCoBaoTri',
        'bao-cao': '/BaoCao',
        'cai-dat': '/CaiDat',
    };
    const url = bangDuongDan[tenTrang];
    if (url) window.location.href = url;
    else console.log('Chưa có trang:', tenTrang);
}
// ===== MỞ / ĐÓNG MODAL =====
function moModal(idModal) {
    document.getElementById(idModal).classList.add('hien');
    document.body.style.overflow = 'hidden';
}
function dongModal(idModal) {
    document.getElementById(idModal).classList.remove('hien');
    document.body.style.overflow = '';
}
function dongModalNhapNgoai(event, idModal) {
    if (event.target.id === idModal) dongModal(idModal);
}
// ===== ĐÓng/MỞ SIDEBAR =====
function dongMoSidebar() {
    document.getElementById('thanh-sidebar').classList.toggle('an');
}

// ===== HÀM LƯU CÁC MODAL =====

// Lưu tài khoản quản lý mới
// ⚙️ BACKEND: POST /api/quan-ly
function luuTaiKhoanQuanLy() {
    const ten = document.getElementById('ten-quan-ly-moi').value;
    const email = document.getElementById('email-quan-ly-moi').value;
    if (!ten || !email) { hienThongBao('Vui lòng điền đầy đủ họ tên và email!', 'loi'); return; }
    hienThongBao(`Đã tạo tài khoản cho "${ten}" thành công!`, 'thanh-cong');
    dongModal('modal-tai-khoan-quan-ly');
}
// ===== HÀM: Mở chỉnh sửa người thuê (placeholder) =====
function moChinhSuaNguoiThue() {
    if (!nguoiThueHienTai) return;
    // TODO: Mở form chỉnh sửa / kết nối API
    alert('Chức năng chỉnh sửa người thuê "' + nguoiThueHienTai.hoTen + '" sẽ được tích hợp với backend.');
}
async function HienThiTyLeLapDay() {
    try {
        const response = await fetch('/api/ChuTro/TyLeLap');

        if (!response.ok) {
            throw new Error('Lỗi khi gọi API');
        }
        const data = await response.json();
        console.log("Dữ Liệu nhận được: ",data)
        const theTongSoPhong = document.querySelector('.card-phong .con-so');
        const theTyLe = document.querySelector('.card-phong .the-ty-le');

        if (theTongSoPhong && theTyLe) {

            theTongSoPhong.textContent = data.tongSoPhong;
            theTyLe.textContent = `↑ ${data.tyLeLapDay}% lấp đầy`;
        }

    } catch (error) {
        console.error("Đã xảy ra lỗi:", error);
    }
}
async function TyLeDoanhThu() {
    try {
        // Kiểm tra trước — nếu không có element thì không cần gọi API
        const tyLeElement = document.getElementById('hien-thi-ty-le');
        const doanhThuElement = document.getElementById('hien-thi-doanh-thu');
        const thangElement = document.getElementById('hien-thi-thang');

        if (!tyLeElement || !doanhThuElement || !thangElement) return; // ← thoát sớm

        const response = await fetch('/api/ChuTro/TyLeDoanhThu');
        const data = await response.json();

        const thang = data.thang;
        const doanhThu = data.doanhThuT;
        const tyLe = data.tyleDT;

        const doanhThuFormat = (doanhThu / 1000000).toFixed(1) + 'M';

        if (tyLe > 0) {
            tyLeElement.innerText = `↑ +${tyLe.toFixed(1)}% tháng trước`;
            tyLeElement.className = "the-ty-le tang";
        } else if (tyLe < 0) {
            tyLeElement.innerText = `↓ ${tyLe.toFixed(1)}% tháng trước`;
            tyLeElement.className = "the-ty-le giam";
        } else {
            tyLeElement.innerText = `- 0% tháng trước`;
            tyLeElement.className = "the-ty-le";
        }

        doanhThuElement.innerText = doanhThuFormat;
        thangElement.innerText = `Doanh thu tháng ${thang}`;

    } catch (error) {
        console.error("Lỗi khi load dữ liệu doanh thu:", error);
    }
}
async function HienThiProfile() {
    try {
    const respone = await fetch('/api/ChuTro/Profile');
        const dulieu = await respone.json();
         console.log(dulieu);
        const adminHeader = document.querySelector('.ten-admin-header');
        if (adminHeader) adminHeader.textContent = dulieu.fullName;

        const tenChuTro = document.querySelector('.ten-chu strong');
        if (tenChuTro) tenChuTro.textContent = dulieu.fullName;

        document.getElementById('dd-email').textContent = dulieu.email ?? 'Chưa cập nhật';

        const theChaoHoi = document.querySelector('.dong-tieu-de-trang h2');
        if (theChaoHoi) theChaoHoi.textContent = `Xin chào, ${dulieu.fullName}! 👑`;
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu profile:", error);
    }
}
///////////////////Chỗ chưa sửa ////////////
function toggleAdminMenu() {
    const dd = document.getElementById('adminDropdown');
    const ch = document.getElementById('adminChevron');
    const open = dd.classList.toggle('show');
    ch.style.transform = open ? 'rotate(180deg)' : '';
}

// Đóng khi click ra ngoài
document.addEventListener('click', function (e) {
    const wrap = document.getElementById('adminHeaderWrap');
    if (wrap && !wrap.contains(e.target)) {
        document.getElementById('adminDropdown')?.classList.remove('show');
        const ch = document.getElementById('adminChevron');
        if (ch) ch.style.transform = '';
    }
});

function moDoiMatKhau() {
    toggleAdminMenu();
    moModal('modal-doi-mat-khau'); // gắn vào modal sau khi làm BE
}

function xacNhanDangXuat() {
    toggleAdminMenu();
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        window.location.href = '/logout'; // đổi route khi làm BE
    }
}
document.addEventListener('DOMContentLoaded', () => {
    HienThiProfile();
})
document.addEventListener('DOMContentLoaded', () => {
    HienThiTyLeLapDay();
});
document.addEventListener('DOMContentLoaded', () => {
    TyLeDoanhThu();
});
