/**
 * TaiKhoanQuanLy.js
 * Quản lý tài khoản quản lý – phân quyền & phân công phòng
 * Kết nối với TaiKhoanQuanLy.cshtml + .cshtml.cs
 * DB: ACCOUNT, PHONG, PHONG_MANAGER (QUANLY_KHUTRO)
 */

'use strict';

// ────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────
const GRADIENT_POOL = [
    'linear-gradient(135deg,#7c3aed,#a78bfa)',
    'linear-gradient(135deg,#b8720a,#e8971c)',
    'linear-gradient(135deg,#059669,#34d399)',
    'linear-gradient(135deg,#1a56db,#60a5fa)',
    'linear-gradient(135deg,#e11d48,#f87171)',
    'linear-gradient(135deg,#0891b2,#22d3ee)',
];

const PERMISSION_KEYS = [
    'tao-hd', 'huy-hd', 'thu-hd', 'dien-nuoc',
    'sua-chua', 'thong-bao', 'khach-thue',
];

// ────────────────────────────────────────────────────────────
// STATE
// ────────────────────────────────────────────────────────────
let state = {
    quanLyList: [],   // List<QuanLyViewModel> từ JSON embed
    phongList: [],   // List<PhongInfo> từ JSON embed
    selectedId: null, // IDUser đang chọn
    filterText: '',
    filterStatus: '',
};

// ────────────────────────────────────────────────────────────
// KHỞI TẠO
// ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Đọc dữ liệu thật embed từ server (JSON serialized từ DB)
    try {
        const qlEl = document.getElementById('data-quan-ly');
        const phEl = document.getElementById('data-phong');
        if (qlEl) state.quanLyList = JSON.parse(qlEl.textContent);
        if (phEl) state.phongList = JSON.parse(phEl.textContent);
    } catch (e) {
        console.error('[TaiKhoanQuanLy] Lỗi parse JSON embed:', e);
    }

    renderFloorGroups();
    apDungFilter();
});

// ────────────────────────────────────────────────────────────
// TOAST NOTIFICATION
// ────────────────────────────────────────────────────────────
/**
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration ms
 */
function hienToast(message, type = 'success', duration = 3200) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
    };
    const el = document.createElement('div');
    el.className = `toast-item ${type}`;
    el.innerHTML = `<i class="fas ${icons[type] ?? icons.info}"></i><span>${message}</span>`;
    container.appendChild(el);

    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(20px)';
        el.style.transition = 'all 0.3s';
        setTimeout(() => el.remove(), 320);
    }, duration);
}

// Alias tương thích cũ
function hienThongBao(msg, type = 'success') { hienToast(msg, type); }

// ────────────────────────────────────────────────────────────
// MODAL HELPERS
// ────────────────────────────────────────────────────────────
function moModal(id) {
    document.getElementById(id)?.classList.add('hien');
}
function dongModal(id) {
    document.getElementById(id)?.classList.remove('hien');
}
function dongModalNgoai(event, id) {
    if (event.target.id === id) dongModal(id);
}
function togglePass(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    const ico = btn.querySelector('i');
    if (inp.type === 'password') {
        inp.type = 'text';
        if (ico) ico.className = 'fas fa-eye-slash';
    } else {
        inp.type = 'password';
        if (ico) ico.className = 'fas fa-eye';
    }
}

// ────────────────────────────────────────────────────────────
// CONFIRM DIALOG
// ────────────────────────────────────────────────────────────
let _confirmCallback = null;

/**
 * @param {{ icon, title, msg, btnClass, btnLabel, onOk }} opts
 */
function moConfirm({ icon = '⚠️', title = 'Xác nhận', msg = '', btnClass = 'danger', btnLabel = 'Xác nhận', onOk }) {
    document.getElementById('confirm-icon').textContent = icon;
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').textContent = msg;

    const btnOk = document.getElementById('btn-confirm-ok');
    btnOk.className = `btn-confirm-ok ${btnClass}`;
    btnOk.textContent = btnLabel;

    _confirmCallback = onOk;
    document.getElementById('confirm-overlay').classList.add('hien');
}

function dongConfirm() {
    document.getElementById('confirm-overlay').classList.remove('hien');
    _confirmCallback = null;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-confirm-ok')?.addEventListener('click', () => {
        dongConfirm();
        if (typeof _confirmCallback === 'function') _confirmCallback();
    });
});

// ────────────────────────────────────────────────────────────
// CHỌN QUẢN LÝ – cập nhật panel quyền & phân phòng
// ────────────────────────────────────────────────────────────
function chonQuanLy(idUser) {
    state.selectedId = idUser;

    // Highlight row trong bảng
    document.querySelectorAll('#tbody-quan-ly tr').forEach(tr => {
        tr.classList.toggle('selected-row', parseInt(tr.dataset.id) === idUser);
    });

    const ql = state.quanLyList.find(q => q.IDUser === idUser);
    if (!ql) return;

    // ── Panel quyền ─────────────────────────────────────────
    document.getElementById('quyen-no-selection').style.display = 'none';
    document.getElementById('quyen-content').style.display = '';

    const bg = GRADIENT_POOL[idUser % GRADIENT_POOL.length];
    const namePart = (ql.FullName || ql.Username || '?').trim().split(' ');
    const initials = namePart[namePart.length - 1][0].toUpperCase();

    const selAvatar = document.getElementById('sel-avatar');
    selAvatar.style.background = bg;
    selAvatar.textContent = initials;
    document.getElementById('sel-name').textContent = ql.FullName || ql.Username;

    PERMISSION_KEYS.forEach(key => {
        const el = document.getElementById(`perm-${key}`);
        if (el) el.checked = !!(ql.Permissions && ql.Permissions[key]);
    });
    document.getElementById('btn-luu-quyen').disabled = false;

    // ── Panel phân công phòng ───────────────────────────────
    document.getElementById('phong-no-selection').style.display = 'none';
    document.getElementById('phong-content').style.display = '';
    document.getElementById('btn-phan-cong').disabled = false;

    // Tick phòng đang được phân công
    const assignedIds = new Set((ql.Phongs || []).map(p => p.IDPhong));
    document.querySelectorAll('.chk-phong').forEach(cb => {
        cb.checked = assignedIds.has(parseInt(cb.dataset.idphong));
    });
}

// ────────────────────────────────────────────────────────────
// RENDER NHÓM PHÒNG THEO TẦNG (cột phải)
// ────────────────────────────────────────────────────────────
function renderFloorGroups() {
    const container = document.getElementById('floor-groups-container');
    if (!container || !state.phongList.length) return;

    // Nhóm theo Tang
    const byFloor = {};
    state.phongList.forEach(p => {
        if (!byFloor[p.Tang]) byFloor[p.Tang] = [];
        byFloor[p.Tang].push(p);
    });

    let html = '';
    Object.keys(byFloor).sort((a, b) => +a - +b).forEach(tang => {
        html += `<div class="floor-group">
            <div class="floor-group-title">
              <i class="fas fa-layer-group"></i> Tầng ${tang}
            </div>
            <div class="floor-rooms">`;

        byFloor[tang].forEach(p => {
            const ttClass = p.TrangThai === 'Đã thuê' ? 'da-thue'
                : p.TrangThai === 'Đang sửa' ? 'dang-sua'
                    : 'trong';
            html += `<label class="floor-room-item">
                <input type="checkbox"
                       class="chk-phong"
                       data-idphong="${p.IDPhong}"
                       data-tang="${p.Tang}" />
                <span>
                  <strong>${p.SoPhong}</strong>
                  <span class="room-tt ${ttClass}">${p.TrangThai}</span>
                </span>
              </label>`;
        });

        html += `</div></div>`;
    });

    container.innerHTML = html;
}

// ────────────────────────────────────────────────────────────
// MODAL: THÊM QUẢN LÝ
// ────────────────────────────────────────────────────────────
function moModalThemQuanLy() {
    // Reset form
    ['them-fullname', 'them-username', 'them-phone', 'them-email', 'them-password'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = ''; el.classList.remove('error'); }
    });
    moModal('modal-them-ql');
    document.getElementById('them-fullname')?.focus();
}

async function themQuanLy() {
    const fullName = document.getElementById('them-fullname')?.value.trim();
    const username = document.getElementById('them-username')?.value.trim();
    const phone = document.getElementById('them-phone')?.value.trim();
    const email = document.getElementById('them-email')?.value.trim() || null;
    const password = document.getElementById('them-password')?.value;

    // Validate
    let valid = true;
    [['them-fullname', fullName], ['them-username', username],
    ['them-phone', phone], ['them-password', password]].forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!val) { el?.classList.add('error'); valid = false; }
        else el?.classList.remove('error');
    });
    if (!valid) { hienToast('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error'); return; }
    if (password.length < 8) {
        hienToast('Mật khẩu phải có ít nhất 8 ký tự.', 'error');
        return;
    }

    const btn = document.getElementById('btn-them-luu');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo...';

    try {
        const res = await fetch('/Admin/TaiKhoanQuanLy?handler=TaoTaiKhoan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'RequestVerificationToken': _getAntiForgeryToken(),
            },
            body: JSON.stringify({ Username: username, Passwords: password, FullName: fullName, Phone: phone, Email: email }),
        });

        const data = await res.json();
        hienToast(data.message, res.ok ? 'success' : 'error');
        if (res.ok) {
            dongModal('modal-them-ql');
            setTimeout(() => location.reload(), 1200);
        }
    } catch (err) {
        console.error('[TaoTK]', err);
        hienToast('Lỗi kết nối. Vui lòng thử lại.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Tạo tài khoản';
    }
}

// Alias cũ
async function ThemUser() { await themQuanLy(); }

// ────────────────────────────────────────────────────────────
// MODAL: SỬA QUẢN LÝ
// ────────────────────────────────────────────────────────────
function moModalSuaQuanLy(idUser) {
    const ql = state.quanLyList.find(q => q.IDUser === idUser);
    if (!ql) { hienToast('Không tìm thấy thông tin quản lý.', 'error'); return; }

    document.getElementById('sua-iduser').value = ql.IDUser;
    document.getElementById('sua-fullname').value = ql.FullName || '';
    document.getElementById('sua-phone').value = ql.Phone || '';
    document.getElementById('sua-email').value = ql.Email || '';
    document.getElementById('sua-password').value = '';
    document.getElementById('sua-modal-sub').textContent = `Chỉnh sửa: @${ql.Username}`;

    moModal('modal-sua-ql');
    document.getElementById('sua-fullname')?.focus();
}

async function suaQuanLy() {
    const idUser = parseInt(document.getElementById('sua-iduser').value);
    const fullName = document.getElementById('sua-fullname')?.value.trim();
    const phone = document.getElementById('sua-phone')?.value.trim();
    const email = document.getElementById('sua-email')?.value.trim() || null;
    const newPass = document.getElementById('sua-password')?.value || null;

    if (!fullName || !phone) {
        hienToast('Họ tên và số điện thoại không được để trống.', 'error');
        return;
    }
    if (newPass && newPass.length < 8) {
        hienToast('Mật khẩu mới phải có ít nhất 8 ký tự.', 'error');
        return;
    }

    const btn = document.getElementById('btn-sua-luu');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

    try {
        const res = await fetch('/Admin/TaiKhoanQuanLy?handler=SuaTaiKhoan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'RequestVerificationToken': _getAntiForgeryToken(),
            },
            body: JSON.stringify({
                IDUser: idUser,
                FullName: fullName,
                Phone: phone,
                Email: email,
                NewPassword: newPass,
            }),
        });

        const data = await res.json();
        hienToast(data.message, res.ok ? 'success' : 'error');
        if (res.ok) {
            dongModal('modal-sua-ql');
            setTimeout(() => location.reload(), 1200);
        }
    } catch (err) {
        console.error('[SuaTK]', err);
        hienToast('Lỗi kết nối. Vui lòng thử lại.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Lưu thay đổi';
    }
}

// ────────────────────────────────────────────────────────────
// KHÓA / MỞ KHÓA TÀI KHOẢN
// ────────────────────────────────────────────────────────────
/**
 * @param {number}  idUser
 * @param {string}  tenQL
 * @param {boolean} isLocked  true = đang muốn khóa, false = muốn mở
 */
function khoaTaiKhoan(idUser, tenQL, isLocked) {
    moConfirm({
        icon: isLocked ? '🔒' : '🔓',
        title: isLocked ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?',
        msg: isLocked
            ? `Tài khoản của "${tenQL}" sẽ bị khóa và không thể đăng nhập.`
            : `Tài khoản của "${tenQL}" sẽ được mở khóa trở lại.`,
        btnClass: isLocked ? 'danger' : 'warning',
        btnLabel: isLocked ? 'Khóa ngay' : 'Mở khóa',
        onOk: async () => {
            try {
                const res = await fetch('/Admin/TaiKhoanQuanLy?handler=KhoaTaiKhoan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'RequestVerificationToken': _getAntiForgeryToken(),
                    },
                    body: JSON.stringify({ IDUser: idUser, IsLocked: isLocked }),
                });
                const data = await res.json();
                hienToast(data.message, res.ok ? 'success' : 'error');
                if (res.ok) setTimeout(() => location.reload(), 1200);
            } catch (err) {
                console.error('[KhoaTK]', err);
                hienToast('Lỗi kết nối.', 'error');
            }
        },
    });
}

// ────────────────────────────────────────────────────────────
// XÓA TÀI KHOẢN
// ────────────────────────────────────────────────────────────
function xoaQuanLy(idUser, tenQL) {
    moConfirm({
        icon: '🗑️',
        title: 'Xóa tài khoản quản lý?',
        msg: `Tài khoản "${tenQL}" và toàn bộ phân công phòng sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác!`,
        btnClass: 'danger',
        btnLabel: 'Xóa vĩnh viễn',
        onOk: async () => {
            try {
                const res = await fetch('/Admin/TaiKhoanQuanLy?handler=XoaTaiKhoan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'RequestVerificationToken': _getAntiForgeryToken(),
                    },
                    body: JSON.stringify({ IDUser: idUser }),
                });
                const data = await res.json();
                hienToast(data.message, res.ok ? 'success' : 'error');
                if (res.ok) setTimeout(() => location.reload(), 1200);
            } catch (err) {
                console.error('[XoaTK]', err);
                hienToast('Lỗi kết nối.', 'error');
            }
        },
    });
}

// ────────────────────────────────────────────────────────────
// LƯU PHÂN QUYỀN
// ────────────────────────────────────────────────────────────
async function luuQuyen() {
    if (!state.selectedId) { hienToast('Chưa chọn quản lý.', 'error'); return; }

    const permissions = {};
    PERMISSION_KEYS.forEach(key => {
        const el = document.getElementById(`perm-${key}`);
        permissions[key] = el ? el.checked : false;
    });

    const btn = document.getElementById('btn-luu-quyen');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

    try {
        const res = await fetch('/Admin/TaiKhoanQuanLy?handler=LuuQuyen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'RequestVerificationToken': _getAntiForgeryToken(),
            },
            body: JSON.stringify({ IDManager: state.selectedId, Permissions: permissions }),
        });
        const data = await res.json();
        hienToast(data.message, res.ok ? 'success' : 'error');

        // Cập nhật state local
        if (res.ok) {
            const ql = state.quanLyList.find(q => q.IDUser === state.selectedId);
            if (ql) ql.Permissions = permissions;
        }
    } catch (err) {
        console.error('[LuuQuyen]', err);
        hienToast('Lỗi kết nối.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Lưu phân quyền';
    }
}

// ────────────────────────────────────────────────────────────
// LƯU PHÂN CÔNG PHÒNG
// ────────────────────────────────────────────────────────────
async function luuPhanCong() {
    if (!state.selectedId) { hienToast('Chưa chọn quản lý.', 'error'); return; }

    const idPhongs = [];
    document.querySelectorAll('.chk-phong:checked').forEach(cb => {
        idPhongs.push(parseInt(cb.dataset.idphong));
    });

    const btn = document.getElementById('btn-phan-cong');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

    try {
        const res = await fetch('/Admin/TaiKhoanQuanLy?handler=PhanCongPhong', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'RequestVerificationToken': _getAntiForgeryToken(),
            },
            body: JSON.stringify({ IDManager: state.selectedId, IDPhongs: idPhongs }),
        });
        const data = await res.json();
        hienToast(data.message, res.ok ? 'success' : 'error');
        if (res.ok) setTimeout(() => location.reload(), 1200);
    } catch (err) {
        console.error('[PhanCong]', err);
        hienToast('Lỗi kết nối.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Lưu phân công';
    }
}

// ────────────────────────────────────────────────────────────
// TÌM KIẾM & LỌC
// ────────────────────────────────────────────────────────────
function timKiemQL(value) {
    state.filterText = value.toLowerCase().trim();
    apDungFilter();
}

function locTrangThai(value) {
    state.filterStatus = value;
    apDungFilter();
}

function apDungFilter() {
    const rows = document.querySelectorAll('#tbody-quan-ly tr');
    let visible = 0;

    rows.forEach(tr => {
        const name = (tr.dataset.name || '').toLowerCase();
        const phone = (tr.dataset.phone || '').toLowerCase();
        const status = (tr.dataset.status || '');

        const matchText = !state.filterText || name.includes(state.filterText) || phone.includes(state.filterText);
        const matchStatus = !state.filterStatus || status === state.filterStatus;

        const show = matchText && matchStatus;
        tr.style.display = show ? '' : 'none';
        if (show) visible++;
    });

    const el = document.getElementById('pg-count');
    if (el) el.textContent = visible;
}

// ────────────────────────────────────────────────────────────
// CHECKBOX CHỌN TẤT CẢ
// ────────────────────────────────────────────────────────────
function chonTatCa(checked) {
    document.querySelectorAll('.chk-row').forEach(cb => { cb.checked = checked; });
}

// ────────────────────────────────────────────────────────────
// AJAX REFRESH DANH SÁCH (không reload trang)
// ────────────────────────────────────────────────────────────
async function taiLaiDanhSach() {
    try {
        const res = await fetch('/Admin/TaiKhoanQuanLy?handler=DanhSachQuanLy', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        // Map về đúng key Pascal để khớp với state
        state.quanLyList = data.map(q => ({
            IDUser: q.idUser,
            FullName: q.fullName,
            Username: q.username,
            Phone: q.phone,
            Email: q.email,
            IsActive: q.isActive,
            Permissions: q.permissions,
            Phongs: (q.phongs || []).map(p => ({
                IDPhong: p.IDPhong,
                SoPhong: p.SoPhong,
                Tang: p.Tang,
                TrangThai: p.TrangThai,
            })),
        }));
        hienToast('Đã làm mới danh sách.', 'info');
    } catch (err) {
        console.error('[TaiLai]', err);
        hienToast('Không thể tải danh sách.', 'error');
    }
}

// ────────────────────────────────────────────────────────────
// HELPER: CSRF Token (Razor Pages anti-forgery)
// ────────────────────────────────────────────────────────────
function _getAntiForgeryToken() {
    const input = document.querySelector('input[name="__RequestVerificationToken"]');
    return input ? input.value : '';
}
