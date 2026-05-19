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
        'bao-cao': '/Admin/BaoCao',
        'cai-dat': '/Admin/CaiDat',
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
        console.log(dulieu);

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


/* ============================================================
   7. ADMIN DROPDOWN
   Giữ nguyên từ code cũ.
============================================================ */
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
        window.location.href = '/logout';
    }
}


/* ============================================================
   8. MODAL DISPATCHER  –  data-* attributes
   ─────────────────────────────────────────────────────────
   Cách dùng trên bất kỳ nút nào trong toàn app:

   <button data-modal="cau-hinh-gia">Cấu hình giá</button>
   <button data-modal="cau-hinh-gia" data-tab="phong">Sửa phòng</button>
   <button data-modal="thong-bao"
           data-title="Cắt điện tháng 6"
           data-muc-do="khan-cap">Gửi thông báo</button>
   <button data-modal="dat-coc">Quy định đặt cọc</button>

   Hoặc gọi trực tiếp qua JS:
   ModalChung.mo('cau-hinh-gia')
   ModalChung.mo('thong-bao', { tieuDe: 'TB khẩn', mucDo: 'khan-cap' })
   ModalChung.dong('dat-coc')
   ModalChung.toast('Lưu thành công', '', 'success')
============================================================ */

/** Map key ngắn → id DOM thực */
const _MODAL_MAP = {
    'cau-hinh-gia': 'modal-cau-hinh-gia-v2',
    'thong-bao': 'modal-chi-phi-dich-vu',
    'dat-coc': 'modal-dat-coc',
};

const ModalChung = (() => {
    function mo(key, options = {}) {
        const id = _MODAL_MAP[key] ?? key;
        const el = document.getElementById(id);
        if (!el) { console.warn(`[ModalChung] Không tìm thấy modal: "${id}"`); return; }

        if (id === 'modal-cau-hinh-gia-v2') _initCauHinhGia(options);
        if (id === 'modal-chi-phi-dich-vu') _initThongBao(options);
        if (id === 'modal-dat-coc') _initDatCoc(options);

        el.classList.add('hien');
        document.body.style.overflow = 'hidden';
    }

    function dong(key) {
        const id = _MODAL_MAP[key] ?? key;
        dongModal(id); // tái dùng helper ở mục 3
    }

    function toast(title, message = '', type = 'info', duration = 3500) {
        showToast(title, message, type, duration);
    }

    return { mo, dong, toast };
})();

// Event delegation — lắng nghe toàn bộ click [data-modal] chỉ 1 listener
document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-modal]');
    if (!btn) return;

    const key = btn.dataset.modal;
    const options = {};
    if (btn.dataset.title) options.tieuDe = btn.dataset.title;
    if (btn.dataset.tab) options.tab = btn.dataset.tab;
    if (btn.dataset.phongId) options.phongId = btn.dataset.phongId;
    if (btn.dataset.mucDo) options.mucDo = btn.dataset.mucDo;

    ModalChung.mo(key, options);
});


/* ============================================================
   9. MODAL 1 – CẤU HÌNH GIÁ THUÊ
   #modal-cau-hinh-gia-v2
   ─────────────────────────────────────────────────────────
   API endpoints:
     GET    /api/ConfigGia          – danh sách dịch vụ
     POST   /api/ConfigGia          – thêm dịch vụ
     PUT    /api/ConfigGia/{id}     – sửa dịch vụ
     DELETE /api/ConfigGia/{id}     – xoá dịch vụ
     GET    /api/Phong              – danh sách phòng
     PUT    /api/Phong/{id}         – cập nhật phòng
============================================================ */

function _initCauHinhGia(options = {}) {
    chgSwitch(options.tab || 'dv');
    chgTaiDanhSachDV();
    chgTaiDanhSachPhong().then(() => {
        if (options.phongId) chgChonPhong(Number(options.phongId));
    });
}

// Alias tương thích ngược với code cũ (nếu có nơi gọi trực tiếp)
function moModalCauHinhGia() { ModalChung.mo('cau-hinh-gia'); }
function chgDong() { ModalChung.dong('cau-hinh-gia'); }
function chgDongNgoai(event) { if (event.target.id === 'modal-cau-hinh-gia-v2') chgDong(); }

/** Chuyển tab: 'dv' | 'phong' */
function chgSwitch(tab) {
    document.querySelectorAll('#modal-cau-hinh-gia-v2 .chg-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#modal-cau-hinh-gia-v2 .chg-panel').forEach(p => p.classList.remove('show'));
    document.getElementById(`chg-tab-${tab}`)?.classList.add('active');
    document.getElementById(`chg-panel-${tab}`)?.classList.add('show');
    const label = document.getElementById('chg-btn-label');
    if (label) label.textContent = tab === 'dv' ? 'Lưu cấu hình dịch vụ' : 'Lưu thông tin phòng';
}

/* ── Tab Dịch Vụ ── */

let _chgDvId = null; // null = thêm mới | number = đang sửa

async function chgTaiDanhSachDV() {
    const c = document.getElementById('chg-dv-list');
    if (!c) return;
    c.innerHTML = '<div class="chg-loading"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';
    try {
        const res = await fetch('/api/ConfigGia');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        chgRenderDanhSachDV(await res.json());
    } catch (err) {
        console.error('[chgTaiDanhSachDV]', err);
        c.innerHTML = '<div class="chg-loading" style="color:#dc2626;"><i class="fas fa-exclamation-circle"></i> Không tải được dữ liệu.</div>';
    }
}

function chgRenderDanhSachDV(data) {
    const c = document.getElementById('chg-dv-list');
    if (!c) return;
    if (!data?.length) {
        c.innerHTML = '<div class="chg-loading">Chưa có dịch vụ nào. Hãy thêm dịch vụ đầu tiên.</div>';
        return;
    }
    const iconMap = { 'kWh': 'fa-bolt', 'm3': 'fa-tint', 'phong/thang': 'fa-wifi', 'xe/thang': 'fa-motorcycle', 'thang': 'fa-box' };
    c.innerHTML = data.map(dv => `
        <div class="dv-row" id="dv-row-${dv.id}">
            <div class="dv-icon"><i class="fas ${iconMap[dv.donViTinh] || 'fa-cog'}"></i></div>
            <div class="dv-info">
                <div class="dv-ten">${dv.tenDV}
                    <span style="font-size:10px;color:#6b7a99;font-weight:600;margin-left:4px;">[${dv.maDV}]</span>
                </div>
                <div class="dv-gia">${Number(dv.donGia).toLocaleString('vi-VN')} đ / ${dv.donViTinh}</div>
            </div>
            <div class="dv-actions">
                <button class="dv-btn edit" onclick="chgSuaDV(${dv.id})"    title="Sửa"><i class="fas fa-pen"></i></button>
                <button class="dv-btn del"  onclick="chgXoaDV(${dv.id},'${dv.tenDV}')" title="Xoá"><i class="fas fa-trash"></i></button>
            </div>
        </div>`).join('');
}

async function chgSuaDV(id) {
    try {
        const res = await fetch(`/api/ConfigGia/${id}`);        // ⚙️ GET /api/ConfigGia/{id}
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const dv = await res.json();
        document.getElementById('dv-ma').value = dv.maDV;
        document.getElementById('dv-ten').value = dv.tenDV;
        document.getElementById('dv-gia').value = dv.donGia;
        document.getElementById('dv-donvi').value = dv.donViTinh;
        _chgDvId = id;
        showToast('Đã tải dữ liệu', `Đang sửa dịch vụ: ${dv.tenDV}`, 'info');
    } catch (err) {
        console.error('[chgSuaDV]', err);
        showToast('Lỗi', 'Không tải được dữ liệu dịch vụ.', 'fail');
    }
}

async function chgXoaDV(id, tenDV) {
    if (!confirm(`Xoá dịch vụ "${tenDV}"? Hành động này không thể hoàn tác.`)) return;
    try {
        const res = await fetch(`/api/ConfigGia/${id}`, { method: 'DELETE' }); // ⚙️ DELETE
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showToast('Đã xoá', `Dịch vụ "${tenDV}" đã được xoá.`, 'success');
        await chgTaiDanhSachDV();
    } catch (err) {
        console.error('[chgXoaDV]', err);
        showToast('Lỗi', 'Không thể xoá dịch vụ này.', 'fail');
    }
}

function chgThemDichVu() {
    const ma = document.getElementById('dv-ma')?.value.trim();
    const ten = document.getElementById('dv-ten')?.value.trim();
    const gia = parseFloat(document.getElementById('dv-gia')?.value);
    const donvi = document.getElementById('dv-donvi')?.value;

    if (!ma) { showToast('Thiếu thông tin', 'Vui lòng nhập mã dịch vụ.', 'warn'); return; }
    if (!ten) { showToast('Thiếu thông tin', 'Vui lòng nhập tên dịch vụ.', 'warn'); return; }
    if (!gia || gia < 0) { showToast('Thiếu thông tin', 'Đơn giá không hợp lệ.', 'warn'); return; }
    if (!donvi) { showToast('Thiếu thông tin', 'Vui lòng chọn đơn vị tính.', 'warn'); return; }

    _chgDvSave({ maDV: ma, tenDV: ten, donGia: gia, donViTinh: donvi });
}

async function _chgDvSave(payload) {
    const isEdit = _chgDvId !== null;
    const url = isEdit ? `/api/ConfigGia/${_chgDvId}` : '/api/ConfigGia';
    try {
        const res = await fetch(url, {               // ⚙️ POST hoặc PUT /api/ConfigGia
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showToast('Thành công', isEdit ? 'Đã cập nhật dịch vụ.' : 'Đã thêm dịch vụ mới.', 'success');
        _chgDvId = null;
        ['dv-ma', 'dv-ten', 'dv-gia'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        const dvd = document.getElementById('dv-donvi'); if (dvd) dvd.value = '';
        await chgTaiDanhSachDV();
    } catch (err) {
        console.error('[_chgDvSave]', err);
        showToast('Lỗi', 'Không thể lưu dịch vụ.', 'fail');
    }
}

/* ── Tab Phòng – Room Picker ── */

let _chgPhongData = [];
let _chgPhongFilter = 'all';
let _chgPhongId = null;

async function chgTaiDanhSachPhong() {
    try {
        const res = await fetch('/api/Phong');        // ⚙️ GET /api/Phong
        if (!res.ok) throw new Error('HTTP ' + res.status);
        _chgPhongData = await res.json();
        chgRenderRooms();
    } catch (err) {
        console.error('[chgTaiDanhSachPhong]', err);
    }
}

function toggleRoomChg() {
    const panel = document.getElementById('chgRoomPanel');
    const btn = document.getElementById('chgRoomBtn');
    const isOpen = panel?.classList.toggle('open');
    btn?.classList.toggle('open-state', isOpen);
}

function chgSetFilter(filter, el) {
    _chgPhongFilter = filter;
    document.querySelectorAll('#modal-cau-hinh-gia-v2 .rfc').forEach(b => b.classList.remove('ra'));
    el.classList.add('ra');
    chgRenderRooms();
}

function chgRenderRooms() {
    const list = document.getElementById('chgRpList');
    if (!list) return;
    const q = (document.getElementById('chg-rp-q')?.value || '').toLowerCase();
    const items = _chgPhongData.filter(p => {
        const matchFilter = _chgPhongFilter === 'all' || p.trangThai === _chgPhongFilter;
        const matchQ = !q || p.soPhong.toLowerCase().includes(q) || String(p.tang).includes(q);
        return matchFilter && matchQ;
    });
    if (!items.length) {
        list.innerHTML = '<div style="text-align:center;padding:20px;color:#6b7a99;font-size:12px;">Không tìm thấy phòng phù hợp</div>';
        return;
    }
    const badgeMap = { 'Trống': 'b-empty', 'Đã thuê': 'b-rented', 'Đang sửa': 'b-repair' };
    list.innerHTML = items.map(p => `
        <div class="rpc-row ${p.id === _chgPhongId ? 'sel' : ''}" onclick="chgChonPhong(${p.id})">
            <div>
                <div class="rpc-num">Phòng ${p.soPhong}</div>
                <div class="rpc-sub">Tầng ${p.tang} · ${p.dienTich}m²</div>
            </div>
            <span class="bdg ${badgeMap[p.trangThai] || ''}">${p.trangThai}</span>
        </div>`).join('');
}

function chgChonPhong(id) {
    const phong = _chgPhongData.find(p => p.id === id);
    if (!phong) return;
    _chgPhongId = id;

    const btn = document.getElementById('chgRoomBtn');
    if (btn) { btn.textContent = `Phòng ${phong.soPhong} – Tầng ${phong.tang}`; btn.classList.add('picked'); }
    document.getElementById('chgRoomPanel')?.classList.remove('open');
    btn?.classList.remove('open-state');

    document.getElementById('phong-so').value = phong.soPhong;
    document.getElementById('phong-tang').value = phong.tang;
    document.getElementById('phong-trang-thai').value = phong.trangThai;
    document.getElementById('phong-dien-tich').value = phong.dienTich;
    document.getElementById('phong-gia-fix').value = phong.giaPhongFix || '';
    document.getElementById('phong-mo-ta').value = phong.moTa || '';

    const fields = document.getElementById('chg-phong-fields');
    fields?.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
    fields?.classList.replace('locked', 'unlocked');
    const hint = document.getElementById('chg-phong-hint');
    if (hint) hint.style.display = 'none';

    chgRenderRooms();
}

async function chgSubmit() {
    const isTabDV = document.getElementById('chg-tab-dv')?.classList.contains('active');

    if (isTabDV) {
        chgThemDichVu();
        return;
    }

    // Tab Phòng
    if (!_chgPhongId) { showToast('Chưa chọn phòng', 'Vui lòng chọn phòng cần chỉnh sửa.', 'warn'); return; }

    const payload = {
        soPhong: document.getElementById('phong-so')?.value.trim(),
        tang: parseInt(document.getElementById('phong-tang')?.value),
        trangThai: document.getElementById('phong-trang-thai')?.value,
        dienTich: parseFloat(document.getElementById('phong-dien-tich')?.value),
        giaPhongFix: parseFloat(document.getElementById('phong-gia-fix')?.value) || null,
        moTa: document.getElementById('phong-mo-ta')?.value.trim(),
    };

    if (!payload.soPhong || isNaN(payload.tang) || isNaN(payload.dienTich)) {
        showToast('Thiếu thông tin', 'Vui lòng điền đủ các trường bắt buộc.', 'warn');
        return;
    }

    try {
        const res = await fetch(`/api/Phong/${_chgPhongId}`, {  // ⚙️ PUT /api/Phong/{id}
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showToast('Đã lưu', `Phòng ${payload.soPhong} đã được cập nhật.`, 'success');

        // Reset room picker
        _chgPhongId = null;
        const btn = document.getElementById('chgRoomBtn');
        if (btn) { btn.textContent = 'Nhấn để chọn phòng cần chỉnh sửa...'; btn.classList.remove('picked'); }
        const fields = document.getElementById('chg-phong-fields');
        fields?.querySelectorAll('input, select, textarea').forEach(el => { el.disabled = true; el.value = ''; });
        fields?.classList.replace('unlocked', 'locked');
        const hint = document.getElementById('chg-phong-hint');
        if (hint) hint.style.display = '';
        await chgTaiDanhSachPhong();
    } catch (err) {
        console.error('[chgSubmit phong]', err);
        showToast('Lỗi', 'Không thể lưu thông tin phòng.', 'fail');
    }
}

// Đóng room picker khi click ra ngoài
document.addEventListener('click', function (e) {
    const wrap = document.getElementById('chgRoomWrap');
    if (wrap && !wrap.contains(e.target)) {
        document.getElementById('chgRoomPanel')?.classList.remove('open');
        document.getElementById('chgRoomBtn')?.classList.remove('open-state');
    }
});


/* ============================================================
   10. MODAL 2 – DỊCH VỤ THÔNG BÁO
   #modal-chi-phi-dich-vu
   ─────────────────────────────────────────────────────────
   API endpoints:
     GET  /api/Phong?trangThai=Đã thuê  – danh sách phòng đang thuê
     GET  /api/NguoiThue                – danh sách người thuê
     POST /api/ThongBao                 – gửi thông báo
============================================================ */

async function _initThongBao(options = {}) {
    // Reset toàn bộ form
    const tbTieuDe = document.getElementById('tb-tieu-de');
    if (tbTieuDe) tbTieuDe.value = options.tieuDe || '';
    const tbNoiDung = document.getElementById('tb-noi-dung');
    if (tbNoiDung) tbNoiDung.value = '';
    const tbLoai = document.getElementById('tb-loai-nguoi-nhan');
    if (tbLoai) tbLoai.value = 'all';
    tbChuyenLoaiNguoiNhan('all');

    const mucDo = options.mucDo || 'thong-tin';
    tbCapNhatMucDo(mucDo);
    const tbMucDo = document.getElementById('tb-muc-do');
    if (tbMucDo) tbMucDo.value = mucDo;

    // Ngày gửi = bây giờ
    const tbNgay = document.getElementById('tb-ngay-gui');
    if (tbNgay) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        tbNgay.value = now.toISOString().slice(0, 16);
    }

    await Promise.all([_tbLoadPhong(), _tbLoadNguoiThue()]);
}

// Alias tương thích ngược
async function moModalThongBao() { ModalChung.mo('thong-bao'); }

async function _tbLoadPhong() {
    const sel = document.getElementById('tb-phong-id');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Đang tải... --</option>';
    try {
        const res = await fetch('/api/Phong?trangThai=Đã thuê');  // ⚙️ GET
        if (!res.ok) throw new Error();
        const data = await res.json();
        sel.innerHTML = '<option value="">-- Chọn phòng --</option>' +
            data.map(p => `<option value="${p.id}">Phòng ${p.soPhong}</option>`).join('');
    } catch {
        sel.innerHTML = '<option value="">-- Lỗi tải phòng --</option>';
    }
}

async function _tbLoadNguoiThue() {
    const sel = document.getElementById('tb-user-id');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Đang tải... --</option>';
    try {
        const res = await fetch('/api/NguoiThue');                // ⚙️ GET
        if (!res.ok) throw new Error();
        const data = await res.json();
        sel.innerHTML = '<option value="">-- Chọn người thuê --</option>' +
            data.map(u => `<option value="${u.id}">${u.hoTen}</option>`).join('');
    } catch {
        sel.innerHTML = '<option value="">-- Lỗi tải người thuê --</option>';
    }
}

function tbChuyenLoaiNguoiNhan(loai) {
    const phongDiv = document.getElementById('tb-chon-phong');
    const nguoiDiv = document.getElementById('tb-chon-nguoi');
    const previewDiv = document.getElementById('tb-preview-nguoi-nhan');
    const previewTxt = document.getElementById('tb-preview-text');

    if (phongDiv) phongDiv.style.display = loai === 'phong' ? 'block' : 'none';
    if (nguoiDiv) nguoiDiv.style.display = loai === 'nguoi' ? 'block' : 'none';
    if (previewDiv) previewDiv.style.display = 'block';

    const map = {
        all: 'Sẽ gửi đến <strong>tất cả người thuê</strong> trong hệ thống.',
        phong: 'Sẽ gửi đến <strong>người thuê của phòng</strong> được chọn bên trên.',
        nguoi: 'Sẽ gửi đến <strong>người thuê cụ thể</strong> được chọn bên trên.',
    };
    if (previewTxt) previewTxt.innerHTML = map[loai] || '';
}

function tbCapNhatMucDo(value) {
    const badge = document.getElementById('tb-badge-muc-do');
    if (!badge) return;
    badge.className = 'tb-badge';
    const map = {
        'thong-tin': { cls: 'muc-thong-tin', txt: '🔵 Thông tin thông thường' },
        'canh-bao': { cls: 'muc-canh-bao', txt: '🟡 Thông báo quan trọng' },
        'khan-cap': { cls: 'muc-khan-cap', txt: '🔴 Thông báo khẩn cấp' },
    };
    const cfg = map[value] || map['thong-tin'];
    badge.classList.add(cfg.cls);
    badge.textContent = cfg.txt;
}

async function guiThongBao() {
    const tieuDe = document.getElementById('tb-tieu-de')?.value.trim();
    const noiDung = document.getElementById('tb-noi-dung')?.value.trim();
    const loai = document.getElementById('tb-loai-nguoi-nhan')?.value;
    const mucDo = document.getElementById('tb-muc-do')?.value;
    const ngayGui = document.getElementById('tb-ngay-gui')?.value;

    if (!tieuDe) { showToast('Thiếu thông tin', 'Vui lòng nhập tiêu đề thông báo.', 'warn'); return; }
    if (!noiDung) { showToast('Thiếu thông tin', 'Vui lòng nhập nội dung thông báo.', 'warn'); return; }
    if (!ngayGui) { showToast('Thiếu thông tin', 'Vui lòng chọn ngày gửi.', 'warn'); return; }

    const payload = { tieuDe, noiDung, loaiNguoiNhan: loai, mucDo, ngayGui };

    if (loai === 'phong') {
        const phongId = document.getElementById('tb-phong-id')?.value;
        if (!phongId) { showToast('Thiếu thông tin', 'Vui lòng chọn phòng nhận thông báo.', 'warn'); return; }
        payload.phongId = phongId;
    }
    if (loai === 'nguoi') {
        const userId = document.getElementById('tb-user-id')?.value;
        if (!userId) { showToast('Thiếu thông tin', 'Vui lòng chọn người thuê nhận thông báo.', 'warn'); return; }
        payload.userId = userId;
    }

    const btn = document.getElementById('tb-btn-gui');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...'; }

    try {
        const res = await fetch('/api/ThongBao', {                 // ⚙️ POST /api/ThongBao
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showToast('Gửi thành công', `Thông báo "${tieuDe}" đã được gửi.`, 'success');
        dongModal('modal-chi-phi-dich-vu');
    } catch (err) {
        console.error('[guiThongBao]', err);
        showToast('Lỗi gửi thông báo', 'Kiểm tra kết nối API và thử lại.', 'fail');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi thông báo'; }
    }
}


/* ============================================================
   11. MODAL 3 – QUY ĐỊNH ĐẶT CỌC
   #modal-dat-coc
   ─────────────────────────────────────────────────────────
   API endpoints:
     POST /api/QuyDinhDatCoc  – lưu quy định
============================================================ */

function _initDatCoc(options = {}) {
    const soThang = document.getElementById('so-thang-dat-coc');
    if (soThang) datCocChuyenLoai(soThang.value);
}

function datCocChuyenLoai(value) {
    const nhomCoDinh = document.getElementById('nhom-so-tien-co-dinh');
    const nhomPreview = document.getElementById('nhom-preview-coc');
    const previewTxt = document.getElementById('dc-preview-text');

    if (value === 'co-dinh') {
        if (nhomCoDinh) nhomCoDinh.style.display = 'block';
        if (nhomPreview) nhomPreview.style.display = 'none';
    } else {
        if (nhomCoDinh) nhomCoDinh.style.display = 'none';
        if (nhomPreview) nhomPreview.style.display = 'block';
        if (previewTxt) previewTxt.textContent = `= ${value} tháng tiền thuê phòng`;
    }
}

async function luuQuyDinhDatCoc() {
    const soThang = document.getElementById('so-thang-dat-coc')?.value;
    const thoiHan = document.getElementById('thoi-han-hoan-coc')?.value;
    const baoTruoc = parseInt(document.getElementById('bao-truoc-ngay')?.value);
    const ghiChu = document.getElementById('ghi-chu-dat-coc')?.value.trim();

    if (isNaN(baoTruoc) || baoTruoc < 7 || baoTruoc > 90) {
        showToast('Giá trị không hợp lệ', 'Số ngày báo trước phải từ 7 đến 90 ngày.', 'warn');
        return;
    }

    const payload = {
        soThangDatCoc: soThang,
        thoiHanHoanCoc: thoiHan,
        baoTruocNgay: baoTruoc,
        kauTruNoTien: document.getElementById('kt-no-tien')?.checked ?? false,
        kauTruHuHong: document.getElementById('kt-hu-hong')?.checked ?? false,
        kauTruKhongBao: document.getElementById('kt-khong-bao')?.checked ?? false,
        kauTruViPham: document.getElementById('kt-vi-pham')?.checked ?? false,
        ghiChu,
    };

    if (soThang === 'co-dinh') {
        const soTien = parseFloat(document.getElementById('so-tien-co-dinh-coc')?.value);
        if (!soTien || soTien <= 0) {
            showToast('Thiếu thông tin', 'Vui lòng nhập số tiền đặt cọc cố định.', 'warn');
            return;
        }
        payload.soTienCoDinh = soTien;
    }

    try {
        const res = await fetch('/api/QuyDinhDatCoc', {            // ⚙️ POST /api/QuyDinhDatCoc
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showToast('Đã lưu', 'Quy định đặt cọc đã được cập nhật thành công.', 'success');
        dongModal('modal-dat-coc');
    } catch (err) {
        console.error('[luuQuyDinhDatCoc]', err);
        showToast('Lỗi lưu dữ liệu', 'Kiểm tra kết nối API và thử lại.', 'fail');
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

    // Preview mức cọc mặc định (chỉ có hiệu lực khi _ModalChung.cshtml được include)
    const soThang = document.getElementById('so-thang-dat-coc');
    if (soThang) datCocChuyenLoai(soThang.value);

    const tbLoai = document.getElementById('tb-loai-nguoi-nhan');
    if (tbLoai) tbChuyenLoaiNguoiNhan(tbLoai.value);

    const tbNgay = document.getElementById('tb-ngay-gui');
    if (tbNgay) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        tbNgay.value = now.toISOString().slice(0, 16);
    }

    console.log('[ChuTro-core.js] ✅ Đã khởi tạo: Core + ModalChung (3 modal)');
});