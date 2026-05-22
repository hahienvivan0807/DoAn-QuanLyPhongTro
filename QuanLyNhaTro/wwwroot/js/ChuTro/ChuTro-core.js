/* ============================================================
   ChuTro-core.js
   File JS dùng chung cho toàn bộ trang Admin Chủ Trọ.

   MỤC LỤC:
     1. TOAST NOTIFICATION SYSTEM  (nâng cấp từ hienThongBao cũ)
     2. ĐIỀU HƯỚNG MENU SIDEBAR
     3. MỞ / ĐÓNG MODAL  (helpers dùng chung)
     4. SIDEBAR TOGGLE
     5. LƯU TÀI KHOẢN QUẢN LÝ
     6. API: LẤP ĐẦY / DOANH THU / PROFILE
     7. ADMIN DROPDOWN
     8. ─── MODAL DISPATCHER (data-* attributes) ───
     9. MODAL 1 – CẤU HÌNH GIÁ THUÊ
    10. MODAL 2 – DỊCH VỤ THÔNG BÁO
    11. MODAL 3 – QUY ĐỊNH ĐẶT CỌC
    12. INIT (DOMContentLoaded)
============================================================ */

'use strict';

/* ============================================================
   1. TOAST NOTIFICATION SYSTEM
   Nâng cấp từ hienThongBao() — có progress bar + icon SVG.
   Giữ tên hienThongBao() để tương thích với code cũ.
============================================================ */

/**
 * Hiển thị toast thông báo hiện đại.
 * @param {string} title    - Tiêu đề ngắn
 * @param {string} message  - Nội dung phụ (có thể bỏ trống)
 * @param {'success'|'fail'|'warn'|'info'} type
 * @param {number} duration - ms, mặc định 3500
 */
function showToast(title, message = '', type = 'info', duration = 3500) {
    // Tự tạo container nếu chưa có trong DOM
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#639922" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" class="ring-svg"/><polyline points="9 12 11 14 15 10" class="check-path"/></svg>`,
        fail: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" class="ring-svg"/><line x1="9" y1="9" x2="15" y2="15" class="x-path"/><line x1="15" y1="9" x2="9" y2="15" class="x-path"/></svg>`,
        warn: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF9F27" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#378ADD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    };

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
        <div class="toast-icon-wrap">${icons[type] || icons.info}</div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            ${message ? `<div class="toast-msg">${message}</div>` : ''}
        </div>
        <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
        <div class="toast-progress" style="animation-duration:${duration}ms;"></div>
    `;
    container.appendChild(el);

    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));

    setTimeout(() => {
        el.classList.add('hide');
        setTimeout(() => el.remove(), 400);
    }, duration);
}

/**
 * Alias tương thích ngược — giữ nguyên để code cũ không bị vỡ.
 * Mapping: 'thanh-cong' → success | 'loi' → fail | 'canh-bao' → warn | 'info' → info
 */
function hienThongBao(noiDung, loai = 'info') {
    const map = {
        'thanh-cong': 'success',
        'loi': 'fail',
        'canh-bao': 'warn',
        'info': 'info',
    };
    showToast(noiDung, '', map[loai] || 'info');
}


/* ============================================================
   2. ĐIỀU HƯỚNG MENU SIDEBAR
   Giữ nguyên hoàn toàn từ code cũ.
============================================================ */
function chuyenMenu(tenTrang, phanTu) {
    document.querySelectorAll('.muc-menu').forEach(m => m.classList.remove('dang-chon'));
    if (phanTu) phanTu.classList.add('dang-chon');

    // ⚙️ BACKEND: Map tên trang → Razor Page route
    const bangDuongDan = {
        'trang-chu': '/Admin/ChuTro',
        'quan-ly-phong': '/Admin/QuanLyPhong',
        'nguoi-thue': '/Admin/QuanLyNguoiThue',
        'hop-dong': '/Admin/QuanLyHopDong',
        'Tai-Khoan': '/Admin/Taikhoanquanly',
        'hoa-don': '/Admin/HoaDon',
        'sua-chua': '/Admin/SuCoBaoTri',
        'bao-cao': '/Admin/ThongKe',
        'cai-dat': '/Admin/CaiDatHT',
    };
    const url = bangDuongDan[tenTrang];
    if (url) window.location.href = url;
    else console.log('Chưa có trang:', tenTrang);
}


/* ============================================================
   3. MỞ / ĐÓNG MODAL  –  helpers dùng chung
   Giữ nguyên từ code cũ + thêm guard null-safe.
============================================================ */
function moModal(idModal) {
    const el = document.getElementById(idModal);
    if (!el) return;
    el.classList.add('hien');
    document.body.style.overflow = 'hidden';
}

function dongModal(idModal) {
    const el = document.getElementById(idModal);
    if (!el) return;
    el.classList.remove('hien');
    document.body.style.overflow = '';
}

function dongModalNhapNgoai(event, idModal) {
    if (event.target.id === idModal) dongModal(idModal);
}


/* ============================================================
   4. SIDEBAR TOGGLE
   Giữ nguyên từ code cũ.
============================================================ */
function dongMoSidebar() {
    document.getElementById('thanh-sidebar').classList.toggle('an');
}


/* ============================================================
   5. LƯU TÀI KHOẢN QUẢN LÝ
   Giữ nguyên từ code cũ.
   ⚙️ BACKEND: POST /api/quan-ly
============================================================ */
function luuTaiKhoanQuanLy() {
    const ten = document.getElementById('ten-quan-ly-moi')?.value;
    const email = document.getElementById('email-quan-ly-moi')?.value;
    if (!ten || !email) {
        hienThongBao('Vui lòng điền đầy đủ họ tên và email!', 'loi');
        return;
    }
    hienThongBao(`Đã tạo tài khoản cho "${ten}" thành công!`, 'thanh-cong');
    dongModal('modal-tai-khoan-quan-ly');
}

// Placeholder người thuê — giữ nguyên từ code cũ
function moChinhSuaNguoiThue() {
    if (typeof nguoiThueHienTai === 'undefined' || !nguoiThueHienTai) return;
    alert('Chức năng chỉnh sửa người thuê "' + nguoiThueHienTai.hoTen + '" sẽ được tích hợp với backend.');
}


/* ============================================================
   6. API: LẤP ĐẦY / DOANH THU / PROFILE
   Giữ nguyên hoàn toàn từ code cũ.
============================================================ */
async function HienThiTyLeLapDay() {
    try {
        const response = await fetch('/api/ChuTro/TyLeLap');
        if (!response.ok) throw new Error('Lỗi khi gọi API');
        const data = await response.json();

        const theTongSoPhong = document.querySelector('.card-phong .con-so');
        const theTyLe = document.querySelector('.card-phong .the-ty-le');
        if (theTongSoPhong && theTyLe) {
            theTongSoPhong.textContent = data.tongSoPhong;
            theTyLe.textContent = `↑ ${data.tyLeLapDay}% lấp đầy`;
        }
    } catch (error) {
        console.error('Đã xảy ra lỗi:', error);
    }
}

async function TyLeDoanhThu() {
    try {
        const tyLeElement = document.getElementById('hien-thi-ty-le');
        const doanhThuElement = document.getElementById('hien-thi-doanh-thu');
        const thangElement = document.getElementById('hien-thi-thang');
        if (!tyLeElement || !doanhThuElement || !thangElement) return;

        const response = await fetch('/api/ChuTro/TyLeDoanhThu');
        const data = await response.json();

        const doanhThuFormat = (data.doanhThuT / 1_000_000).toFixed(1) + 'M';

        if (data.tyleDT > 0) {
            tyLeElement.innerText = `↑ +${data.tyleDT.toFixed(1)}% tháng trước`;
            tyLeElement.className = 'the-ty-le tang';
        } else if (data.tyleDT < 0) {
            tyLeElement.innerText = `↓ ${data.tyleDT.toFixed(1)}% tháng trước`;
            tyLeElement.className = 'the-ty-le giam';
        } else {
            tyLeElement.innerText = '- 0% tháng trước';
            tyLeElement.className = 'the-ty-le';
        }
        doanhThuElement.innerText = doanhThuFormat;
        thangElement.innerText = `Doanh thu tháng ${data.thang}`;
    } catch (error) {
        console.error('Lỗi khi load dữ liệu doanh thu:', error);
    }
}

async function HienThiProfile() {
    try {
        const respone = await fetch('/api/ChuTro/Profile');
        const dulieu = await respone.json();
        const adminHeader = document.querySelector('.ten-admin-header');
        if (adminHeader) adminHeader.textContent = dulieu.fullName;

        const tenChuTro = document.querySelector('.ten-chu strong');
        if (tenChuTro) tenChuTro.textContent = dulieu.fullName;

        const ddEmail = document.getElementById('dd-email');
        if (ddEmail) ddEmail.textContent = dulieu.email ?? 'Chưa cập nhật';

        const theChaoHoi = document.querySelector('.dong-tieu-de-trang h2');
        if (theChaoHoi) theChaoHoi.textContent = `Xin chào, ${dulieu.fullName}! 👑`;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu profile:', error);
    }
}
async function SoLieuTaskBar() {
    try {
        const respone = await fetch('/api/ChuTro/SLTaskBar');
        const dulieu = await respone.json();
        console.log(dulieu);
        if (respone.ok) {
            console.log("hello");
            document.getElementById("huy-hieu-sua-chua").innerText = dulieu.dem;
        }
    } catch (error) {
        alert("Có lỗi xảy ra");
    }
}
///////////////////Chỗ chưa sửa ////////////
function toggleAdminMenu() {
    const dd = document.getElementById('adminDropdown');
    const ch = document.getElementById('adminChevron');
    const open = dd?.classList.toggle('show');
    if (ch) ch.style.transform = open ? 'rotate(180deg)' : '';
}

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
    moModal('modal-doi-mat-khau');
}

function xacNhanDangXuat() {
    toggleAdminMenu();
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        window.location.href = '/Index'; // đổi route khi làm BE
    }
}
function chgDong() {
    dongModal('modal-cau-hinh-gia-v2');
}

// Đóng khi click ra ngoài
function chgDongNgoai(event) {
    if (event.target.id === 'modal-cau-hinh-gia-v2') {
        chgDong();
    }
}

/* ============================================================
   12. INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Các hàm API chỉ chạy khi trang có element tương ứng
    HienThiProfile();
    HienThiTyLeLapDay();
    TyLeDoanhThu();
});
document.addEventListener('DOMContentLoaded', () => {
    SoLieuTaskBar();
});
