/**
 * ChuTro-quanLy.js
 * Xử lý toàn bộ tương tác trang Tài Khoản Quản Lý
 * Phụ thuộc: data-quan-ly, data-phong, data-chu-tro (embed từ Razor)
 */

// ═══════════════════════════════════════════════════════════
// 1. KHỞI TẠO DỮ LIỆU TỪ SERVER
// ═══════════════════════════════════════════════════════════
let danhSachQL = JSON.parse(document.getElementById('data-quan-ly')?.textContent || '[]');
let tatCaPhong = JSON.parse(document.getElementById('data-phong')?.textContent || '[]');
const chuTroInfo = JSON.parse(document.getElementById('data-chu-tro')?.textContent || '{}');

// Quản lý đang được chọn ở cột phải
let idDangChon = null;

// ─── Anti-forgery token (Razor Pages) ───────────────────────
function layToken() {
    return document.querySelector('input[name="__RequestVerificationToken"]')?.value ?? '';
}

// ─── Tiêu đề request chung ──────────────────────────────────
function headers() {
    return {
        'Content-Type': 'application/json',
        'RequestVerificationToken': layToken()
    };
}

// ═══════════════════════════════════════════════════════════
// 2. RENDER SIDEBAR THÔNG TIN CHỦ TRỌ
// ═══════════════════════════════════════════════════════════
function renderThongTinChuTro() {
    const el = document.getElementById('thong-tin-chu-tro-sidebar');
    if (!el || !chuTroInfo.fullName) return;

    const avatarEl = el.querySelector('.anh-chu-tro');
    const tenEl = el.querySelector('.ten-chu');
    const vaiTroEl = el.querySelector('.vai-tro-chu');

    if (avatarEl) {
        avatarEl.style.background = chuTroInfo.roleGradient || '';
        avatarEl.textContent = chuTroInfo.initials || '?';
    }
    if (tenEl) tenEl.textContent = chuTroInfo.fullName;
    if (vaiTroEl) vaiTroEl.textContent = chuTroInfo.vaiTroLabel || chuTroInfo.roles;
}

// ═══════════════════════════════════════════════════════════
// 3. RENDER DANH SÁCH QUẢN LÝ
// ═══════════════════════════════════════════════════════════
function renderDanhSach(ds) {
    const container = document.getElementById('danh-sach-quan-ly');
    if (!container) return;

    if (!ds || ds.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:var(--mau-chu-phu);">
                <i class="fas fa-users-slash" style="font-size:36px;opacity:.3;display:block;margin-bottom:12px;"></i>
                Chưa có tài khoản quản lý nào.
            </div>`;
        return;
    }

    const gradients = [
        "linear-gradient(135deg,#7c3aed,#a78bfa)",
        "linear-gradient(135deg,#b8720a,#e8971c)",
        "linear-gradient(135deg,#059669,#34d399)",
        "linear-gradient(135deg,#1a56db,#60a5fa)",
        "linear-gradient(135deg,#e11d48,#f87171)",
        "linear-gradient(135deg,#0891b2,#22d3ee)"
    ];

    container.innerHTML = ds.map((q, i) => {
        const initials = (q.fullName || '?').trim().split(' ').pop()[0].toUpperCase();
        const gradient = gradients[i % gradients.length];
        const soPhong = q.phongs ? q.phongs.length : 0;
        const isActive = q.isActive;
        const selected = q.idUser === idDangChon ? 'dang-chon' : '';

        return `
        <div class="tql-item ${selected}" data-id="${q.idUser}" onclick="chonQuanLy(${q.idUser})">
            <div class="tql-avatar" style="background:${gradient}">${initials}</div>
            <div class="tql-info">
                <div class="tql-name">${escHtml(q.fullName)}</div>
                <div class="tql-meta">
                    <span><i class="fas fa-at"></i> ${escHtml(q.username)}</span>
                    <span><i class="fas fa-phone"></i> ${escHtml(q.phone || '—')}</span>
                </div>
                <div class="tql-meta" style="margin-top:3px;">
                    <span><i class="fas fa-door-open"></i> ${soPhong} phòng</span>
                    <span class="tql-badge ${isActive ? 'xanh' : 'do'}">${isActive ? 'Hoạt động' : 'Đã khóa'}</span>
                </div>
            </div>
            <div class="tql-actions" onclick="event.stopPropagation()">
                <button class="btn-icon" title="Sửa" onclick="moModalSua(${q.idUser})"><i class="fas fa-pen"></i></button>
                <button class="btn-icon ${isActive ? 'do' : 'xanh'}" title="${isActive ? 'Khóa' : 'Mở khóa'}"
                    onclick="khoaTaiKhoan(${q.idUser}, ${isActive})">
                    <i class="fas fa-${isActive ? 'lock' : 'lock-open'}"></i>
                </button>
                <button class="btn-icon do" title="Xóa" onclick="xoaTaiKhoan(${q.idUser}, '${escHtml(q.fullName)}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>`;
    }).join('');
}

// ═══════════════════════════════════════════════════════════
// 4. CHỌN QUẢN LÝ → HIỂN THỊ PANEL PHẢI
// ═══════════════════════════════════════════════════════════
function chonQuanLy(idUser) {
    idDangChon = idUser;
    const q = danhSachQL.find(x => x.idUser === idUser);

    // Highlight item
    document.querySelectorAll('.tql-item').forEach(el => {
        el.classList.toggle('dang-chon', parseInt(el.dataset.id) === idUser);
    });

    if (!q) return;

    // ─── Panel Thông tin ────────────────────────────────────
    const panelInfo = document.getElementById('quan-ly-no-selection');
    const panelContent = document.getElementById('quan-ly-content');
    if (panelInfo) panelInfo.style.display = 'none';
    if (panelContent) panelContent.style.display = '';

    // Điền thông tin
    setValue('ql-ten', q.fullName);
    setValue('ql-username', '@' + q.username);
    setValue('ql-phone', q.phone || '—');
    setValue('ql-email', q.email || '—');
    setValue('ql-ngay', q.createdAt || '—');
    setValue('ql-so-phong', (q.phongs?.length || 0) + ' phòng');

    const badgeEl = document.getElementById('ql-trang-thai');
    if (badgeEl) {
        badgeEl.textContent = q.isActive ? 'Hoạt động' : 'Đã khóa';
        badgeEl.className = 'tql-badge ' + (q.isActive ? 'xanh' : 'do');
    }

    // ─── Panel Phân quyền ────────────────────────────────────
    const pqInfo = document.getElementById('pq-no-selection');
    const pqContent = document.getElementById('pq-content');
    if (pqInfo) pqInfo.style.display = 'none';
    if (pqContent) pqContent.style.display = '';

    const perms = q.permissions || {};
    Object.keys(perms).forEach(key => {
        const toggle = document.getElementById('perm-' + key);
        if (toggle) toggle.checked = !!perms[key];
    });

    const btnQuyen = document.getElementById('btn-luu-quyen');
    if (btnQuyen) btnQuyen.disabled = false;

    // ─── Panel Phân công phòng ───────────────────────────────
    const phongInfo = document.getElementById('phong-no-selection');
    const phongContent = document.getElementById('phong-content');
    if (phongInfo) phongInfo.style.display = 'none';
    if (phongContent) phongContent.style.display = '';

    renderFloorGroups(q.phongs || []);

    const btnPC = document.getElementById('btn-phan-cong');
    if (btnPC) btnPC.disabled = false;
}

// ─── Render nhóm tầng + checkbox phòng ─────────────────────
function renderFloorGroups(phongDuocPhanCong) {
    const container = document.getElementById('floor-groups-container');
    if (!container) return;

    const assignedIds = new Set((phongDuocPhanCong || []).map(p => p.IDPhong));
    const byFloor = {};
    tatCaPhong.forEach(p => {
        const tang = p.Tang ?? p.tang ?? 0;
        if (!byFloor[tang]) byFloor[tang] = [];
        byFloor[tang].push(p);
    });

    const tangs = Object.keys(byFloor).sort((a, b) => a - b);
    if (tangs.length === 0) {
        container.innerHTML = '<p style="color:var(--mau-chu-phu);font-size:13px;">Chưa có phòng nào trong hệ thống.</p>';
        return;
    }

    container.innerHTML = tangs.map(tang => {
        const phongs = byFloor[tang];
        const allChecked = phongs.every(p => assignedIds.has(p.IDPhong));
        const someChecked = phongs.some(p => assignedIds.has(p.IDPhong));

        const roomChips = phongs.map(p => {
            const id = p.IDPhong;
            const so = p.SoPhong || p.soPhong;
            const tt = p.TrangThai || p.trangThai || '';
            const chk = assignedIds.has(id) ? 'checked' : '';
            const cls = tt === 'Trống' ? 'trong' : tt === 'Đang thuê' ? 'thue' : '';
            return `<label class="room-chip ${cls}">
                <input type="checkbox" value="${id}" ${chk} onchange="onCheckPhong()"> P.${so}
            </label>`;
        }).join('');

        return `
        <div class="floor-group">
            <div class="floor-header">
                <label class="floor-chk-all">
                    <input type="checkbox" class="chk-all-tang" data-tang="${tang}"
                        ${allChecked ? 'checked' : (someChecked ? 'indeterminate' : '')}
                        onchange="chkAllTang(this,'${tang}')">
                    Tầng ${tang}
                </label>
                <span class="floor-count">${phongs.length} phòng</span>
            </div>
            <div class="room-chips">${roomChips}</div>
        </div>`;
    }).join('');

    // Set indeterminate state
    document.querySelectorAll('.chk-all-tang').forEach(el => {
        const tang = el.dataset.tang;
        const phongs = byFloor[tang] || [];
        const checked = phongs.filter(p => {
            const cb = container.querySelector(`input[value="${p.IDPhong}"]`);
            return cb && cb.checked;
        });
        if (checked.length > 0 && checked.length < phongs.length) {
            el.indeterminate = true;
        }
    });
}

function chkAllTang(masterCb, tang) {
    const container = document.getElementById('floor-groups-container');
    const phongs = tatCaPhong.filter(p => String(p.Tang ?? p.tang) === String(tang));
    phongs.forEach(p => {
        const cb = container.querySelector(`input[value="${p.IDPhong}"]`);
        if (cb) cb.checked = masterCb.checked;
    });
}

function onCheckPhong() {
    // Cập nhật trạng thái indeterminate của chk-all-tang
    const container = document.getElementById('floor-groups-container');
    const byFloor = {};
    tatCaPhong.forEach(p => {
        const tang = p.Tang ?? p.tang ?? 0;
        if (!byFloor[tang]) byFloor[tang] = [];
        byFloor[tang].push(p);
    });

    document.querySelectorAll('.chk-all-tang').forEach(el => {
        const tang = el.dataset.tang;
        const phongs = byFloor[tang] || [];
        const total = phongs.length;
        const cntChk = phongs.filter(p => {
            const cb = container.querySelector(`input[value="${p.IDPhong}"]`);
            return cb && cb.checked;
        }).length;
        el.checked = cntChk === total;
        el.indeterminate = cntChk > 0 && cntChk < total;
    });
}

// ═══════════════════════════════════════════════════════════
// 5. THÊM QUẢN LÝ
// ═══════════════════════════════════════════════════════════
function moModalThem() {
    clearForm(['them-fullname', 'them-username', 'them-phone', 'them-email', 'them-password']);
    moModal('modal-them-ql');
}

async function themQuanLy() {
    const fullName = val('them-fullname');
    const username = val('them-username');
    const phone = val('them-phone');
    const email = val('them-email');
    const password = val('them-password');

    if (!fullName || !username || !phone || !password) {
        return showToast('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error');
    }
    if (password.length < 8) {
        return showToast('Mật khẩu phải có ít nhất 8 ký tự.', 'error');
    }

    setBtnLoading('btn-them-luu', true);
    try {
        const res = await fetch('/Admin/Taikhoanquanly?handler=TaoTaiKhoan', {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ Username: username, Passwords: password, FullName: fullName, Phone: phone, Email: email || null })
        });
        const data = await res.json();

        if (!res.ok) return showToast(data.message || 'Lỗi khi tạo tài khoản.', 'error');

        showToast(data.message || 'Tạo tài khoản thành công!', 'success');
        dongModal('modal-them-ql');
        await laiDanhSach();
    } catch {
        showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
        setBtnLoading('btn-them-luu', false);
    }
}

// ═══════════════════════════════════════════════════════════
// 6. SỬA QUẢN LÝ
// ═══════════════════════════════════════════════════════════
function moModalSuaQuanLy(idUser) {
    const q = danhSachQL.find(x => x.idUser === idUser);
    if (!q) return;

    document.getElementById('sua-iduser').value = q.idUser;
    document.getElementById('sua-fullname').value = q.fullName;
    document.getElementById('sua-phone').value = q.phone || '';
    document.getElementById('sua-email').value = q.email || '';
    document.getElementById('sua-password').value = '';

    const sub = document.getElementById('sua-modal-sub');
    if (sub) sub.textContent = `Chỉnh sửa: @${q.username}`;

    moModal('modal-sua-ql');
}

async function suaQuanLy() {
    const idUser = parseInt(document.getElementById('sua-iduser').value);
    const fullName = val('sua-fullname');
    const phone = val('sua-phone');
    const email = val('sua-email');
    const newPass = val('sua-password');

    if (!fullName || !phone) return showToast('Họ tên và số điện thoại là bắt buộc.', 'error');
    if (newPass && newPass.length < 8) return showToast('Mật khẩu mới phải có ít nhất 8 ký tự.', 'error');

    setBtnLoading('btn-sua-luu', true);
    try {
        const res = await fetch('/Admin/Taikhoanquanly?handler=SuaTaiKhoan', {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ IDUser: idUser, FullName: fullName, Phone: phone, Email: email || null, NewPassword: newPass || null })
        });
        const data = await res.json();

        if (!res.ok) return showToast(data.message || 'Lỗi cập nhật.', 'error');

        showToast(data.message || 'Đã cập nhật thành công.', 'success');
        dongModal('modal-sua-ql');
        await laiDanhSach();
        if (idDangChon === idUser) chonQuanLy(idUser);
    } catch {
        showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
        setBtnLoading('btn-sua-luu', false);
    }
}

// ═══════════════════════════════════════════════════════════
// 7. KHÓA / MỞ KHÓA TÀI KHOẢN
// ═══════════════════════════════════════════════════════════
function khoaTaiKhoan(idUser, isCurrentlyActive) {
    const action = isCurrentlyActive ? 'khóa' : 'mở khóa';
    hienConfirm(
        isCurrentlyActive ? '🔒 Khóa tài khoản?' : '🔓 Mở khóa tài khoản?',
        `Bạn có chắc muốn ${action} tài khoản này không?`,
        async () => {
            try {
                // isLocked=true → khóa (IsActive=0); isLocked=false → mở khóa (IsActive=1)
                const res = await fetch('/Admin/Taikhoanquanly?handler=KhoaTaiKhoan', {
                    method: 'POST',
                    headers: headers(),
                    body: JSON.stringify({ IDUser: idUser, IsLocked: isCurrentlyActive })
                });
                const data = await res.json();
                if (!res.ok) return showToast(data.message || 'Lỗi thao tác.', 'error');

                showToast(data.message, 'success');
                await laiDanhSach();
                if (idDangChon === idUser) chonQuanLy(idUser);
            } catch {
                showToast('Lỗi kết nối máy chủ.', 'error');
            }
        }
    );
}

// ═══════════════════════════════════════════════════════════
// 8. XÓA TÀI KHOẢN
// ═══════════════════════════════════════════════════════════
function xoaTaiKhoan(idUser, tenQL) {
    hienConfirm(
        '🗑️ Xóa tài khoản?',
        `Xóa tài khoản "<strong>${escHtml(tenQL)}</strong>"? Thao tác không thể hoàn tác.`,
        async () => {
            try {
                const res = await fetch('/Admin/Taikhoanquanly?handler=XoaTaiKhoan', {
                    method: 'POST',
                    headers: headers(),
                    body: JSON.stringify({ IDUser: idUser })
                });
                const data = await res.json();
                if (!res.ok) return showToast(data.message || 'Lỗi xóa.', 'error');

                showToast(data.message, 'success');
                if (idDangChon === idUser) {
                    idDangChon = null;
                    resetPanelPhai();
                }
                await laiDanhSach();
            } catch {
                showToast('Lỗi kết nối máy chủ.', 'error');
            }
        }
    );
}

// ═══════════════════════════════════════════════════════════
// 9. LƯU PHÂN QUYỀN
// ═══════════════════════════════════════════════════════════
async function luuPhanQuyen() {
    if (!idDangChon) return showToast('Chưa chọn quản lý.', 'error');

    const perms = {};
    document.querySelectorAll('[id^="perm-"]').forEach(toggle => {
        const key = toggle.id.replace('perm-', '');
        perms[key] = toggle.checked;
    });

    setBtnLoading('btn-luu-quyen', true);
    try {
        const res = await fetch('/Admin/Taikhoanquanly?handler=LuuQuyen', {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ IDManager: idDangChon, Permissions: perms })
        });
        const data = await res.json();
        if (!res.ok) return showToast(data.message || 'Lỗi lưu quyền.', 'error');

        showToast(data.message || 'Đã lưu phân quyền.', 'success');
        // Cập nhật local
        const q = danhSachQL.find(x => x.idUser === idDangChon);
        if (q) q.permissions = { ...perms };
    } catch {
        showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
        setBtnLoading('btn-luu-quyen', false);
    }
}

// ═══════════════════════════════════════════════════════════
// 10. LƯU PHÂN CÔNG PHÒNG
// ═══════════════════════════════════════════════════════════
async function luuPhanCong() {
    if (!idDangChon) return showToast('Chưa chọn quản lý.', 'error');

    const checked = [...document.querySelectorAll('#floor-groups-container input[type="checkbox"]:not(.chk-all-tang):checked')]
        .map(cb => parseInt(cb.value));

    setBtnLoading('btn-phan-cong', true);
    try {
        const res = await fetch('/Admin/Taikhoanquanly?handler=PhanCongPhong', {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ IDManager: idDangChon, IDPhongs: checked })
        });
        const data = await res.json();
        if (!res.ok) return showToast(data.message || 'Lỗi phân công.', 'error');

        showToast(data.message || `Đã phân công ${checked.length} phòng.`, 'success');
        await laiDanhSach();
        chonQuanLy(idDangChon);
    } catch {
        showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
        setBtnLoading('btn-phan-cong', false);
    }
}

// ═══════════════════════════════════════════════════════════
// 11. TẢI LẠI DANH SÁCH (AJAX, không reload trang)
// ═══════════════════════════════════════════════════════════
async function laiDanhSach() {
    try {
        const res = await fetch('/Admin/Taikhoanquanly?handler=DanhSachQuanLy');
        const data = await res.json();
        if (res.ok) {
            danhSachQL = data;
            renderDanhSach(danhSachQL);
            capNhatSoLieu();
        }
    } catch {
        // Không làm gì — UI vẫn hiển thị dữ liệu cũ
    }
}

function capNhatSoLieu() {
    const el = {
        tongQL: document.getElementById('stat-tong-ql'),
        hoatDong: document.getElementById('stat-hoat-dong'),
        chuaPC: document.getElementById('stat-chua-phan-cong')
    };
    if (el.tongQL) el.tongQL.textContent = danhSachQL.length;
    if (el.hoatDong) el.hoatDong.textContent = danhSachQL.filter(q => q.isActive).length;
    if (el.chuaPC) {
        const assigned = new Set(danhSachQL.flatMap(q => (q.phongs || []).map(p => p.IDPhong)));
        el.chuaPC.textContent = tatCaPhong.filter(p => !assigned.has(p.IDPhong)).length;
    }
}

// ═══════════════════════════════════════════════════════════
// 12. TÌM KIẾM
// ═══════════════════════════════════════════════════════════
function timKiem(keyword) {
    const kw = (keyword || '').toLowerCase().trim();
    const filtered = kw
        ? danhSachQL.filter(q =>
            q.fullName.toLowerCase().includes(kw) ||
            q.username.toLowerCase().includes(kw) ||
            (q.phone || '').includes(kw))
        : danhSachQL;
    renderDanhSach(filtered);
}

// ═══════════════════════════════════════════════════════════
// 13. MODAL HELPERS
// ═══════════════════════════════════════════════════════════
function moModal(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'flex'; el.classList.add('hien'); }
}

function dongModal(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = ''; el.classList.remove('hien'); }
}

function dongModalNgoai(event, id) {
    if (event.target === event.currentTarget) dongModal(id);
}

// ─── Confirm dialog ─────────────────────────────────────────
let _confirmCb = null;

function hienConfirm(title, msg, cb) {
    _confirmCb = cb;
    const el = {
        overlay: document.getElementById('confirm-overlay'),
        title: document.getElementById('confirm-title'),
        msg: document.getElementById('confirm-msg'),
        btnOk: document.getElementById('btn-confirm-ok')
    };
    if (el.title) el.title.textContent = title;
    if (el.msg) el.msg.innerHTML = msg;
    if (el.overlay) el.overlay.style.display = 'flex';
    if (el.btnOk) {
        el.btnOk.onclick = () => { dongConfirm(); _confirmCb && _confirmCb(); };
    }
}

function dongConfirm() {
    const el = document.getElementById('confirm-overlay');
    if (el) el.style.display = '';
    _confirmCb = null;
}

// ═══════════════════════════════════════════════════════════
// 14. TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════
function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle';
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${msg}`;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('hien'));

    setTimeout(() => {
        toast.classList.remove('hien');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3500);
}

// ═══════════════════════════════════════════════════════════
// 15. TIỆN ÍCH
// ═══════════════════════════════════════════════════════════
function val(id) {
    return (document.getElementById(id)?.value || '').trim();
}

function setValue(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function clearForm(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setBtnLoading(id, loading) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
        btn.dataset.origHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    } else {
        if (btn.dataset.origHtml) btn.innerHTML = btn.dataset.origHtml;
    }
}

function resetPanelPhai() {
    ['quan-ly-no-selection', 'pq-no-selection', 'phong-no-selection'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
    });
    ['quan-ly-content', 'pq-content', 'phong-content'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function togglePass(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) icon.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// ═══════════════════════════════════════════════════════════
// 16. KHỞI ĐỘNG
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    renderThongTinChuTro();
    renderDanhSach(danhSachQL);
    capNhatSoLieu();

    // Thanh tìm kiếm (nếu có)
    const searchInput = document.getElementById('input-tim-kiem');
    if (searchInput) {
        searchInput.addEventListener('input', e => timKiem(e.target.value));
    }
});
function moModalDanhSachQuanLy() {
    // Reset hidden input & label
    const inp = document.getElementById('them-phong-phan-cong');
    const lbl = document.getElementById('phong-selected-label');
    if (inp) inp.value = '0';
    if (lbl) lbl.textContent = '';

    // Reset filter về "Tất cả"
    __filterHienTai = '';
    document.querySelectorAll('.btn-filter-phong')
        .forEach(b => b.classList.remove('active'));
    const btnAll = document.querySelector('.btn-filter-phong[data-filter=""]');
    if (btnAll) btnAll.classList.add('active');

    // Load phòng từ API
    loadDanhSachPhong();

    // Clear form fields
    clearForm(['them-fullname', 'them-username', 'them-phone',
        'them-email', 'them-password']);

    moModal('modal-them-ql');
}
// ── Hàm gom nhóm dữ liệu và gửi lên Server tạo tài khoản ──
async function themQuanLyFull() {

    const dulieu = {
        // --- Tab 1: Tài khoản ---
        FullName: document.getElementById('them-fullname')?.value.trim(),
        Username: document.getElementById('them-username')?.value.trim(),
        Phone: document.getElementById('them-phone')?.value.trim(),
        Email: document.getElementById('them-email')?.value.trim(),
        Password: document.getElementById('them-password')?.value.trim(),

        // --- Tab 2: Hồ sơ cá nhân ---
        CCCD: document.getElementById('them-cccd')?.value.trim(),
        NgaySinh: document.getElementById('them-ngaysinh')?.value,
        GioiTinh: document.getElementById('them-gioitinh')?.value,
        QueQuan: document.getElementById('them-quequan')?.value.trim(),
        DiaChiThuongTru: document.getElementById('them-diachi')?.value.trim(),
        GhiChu: document.getElementById('them-ghichu')?.value.trim(),

        // --- Tab 3: Hợp đồng & Phòng ---
        // Lấy ID phòng từ input hidden (như bạn đã code ở hàm chonPhongCard)
        IDPhong: parseInt(document.getElementById('them-phong-phan-cong')?.value || '0'),

        NgayBatDauHD: document.getElementById('them-ngay-bd-hd')?.value,
        NgayKetThucHD: document.getElementById('them-ngay-kt-hd')?.value,

        DienDauKy: parseInt(document.getElementById('them-dien-dau-ky')?.value || '0'),
        NuocDauKy: parseInt(document.getElementById('them-nuoc-dau-ky')?.value || '0'),
        TienCoc: parseFloat(document.getElementById('them-tien-coc')?.value || '0')
    };

    console.log("📦 Toàn bộ dulieu đã được gom nhóm chuẩn bị gửi:", dulieu);

    if (!dulieu.FullName || !dulieu.Username || !dulieu.Phone || !dulieu.Password || !dulieu.CCCD) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc ở tất cả các tab (Tài khoản, Hồ sơ cá nhân, Hợp đồng & Phòng).");
        return;
    }

    try {
        const respone = await fetch('/api/ChuTro/tao-tai-khoan', {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(dulieu)
        });
        let data = await respone.json();
        if (respone.ok) {
            alert(data.message || "Tạo tài khoản thành công!");
        } else {
            alert(data.message || "Lỗi khi tạo tài khoản. Vui lòng thử lại.");
        }
    } catch (error) {
        alert("Lỗi kết nối máy chủ. Vui lòng kiểm tra lại.");
    }
}
// ── Biến lưu toàn bộ phòng từ API ──────────────────────────
let __danhSachPhongAPI = [];
let __filterHienTai = '';

// ── Gọi API load phòng ──────────────────────────────────────
async function loadDanhSachPhong() {
    const container = document.getElementById('phong-grid-container');
    if (!container) return;

    container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;
                    color:var(--mau-chu-phu);padding:20px;font-size:13px;">
            <i class="fas fa-spinner fa-spin"></i> Đang tải...
        </div>`;

    try {
        const res = await fetch('/Admin/Taikhoanquanly?handler=DanhSachPhong', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);

        __danhSachPhongAPI = await res.json();
        renderPhongGrid(__danhSachPhongAPI, __filterHienTai);

    } catch (err) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;
                        color:var(--mau-do);padding:20px;font-size:13px;">
                <i class="fas fa-exclamation-circle"></i> Lỗi tải danh sách phòng.
                <br><button onclick="loadDanhSachPhong()"
                    style="margin-top:8px;padding:4px 12px;
                           border:1px solid var(--mau-do);border-radius:6px;
                           background:none;color:var(--mau-do);cursor:pointer;
                           font-family:inherit;">
                    Thử lại
                </button>
            </div>`;
    }
}

// ── Render grid phòng (có filter) ───────────────────────────
function renderPhongGrid(danhSach, filter) {
    const container = document.getElementById('phong-grid-container');
    if (!container) return;

    const idDangChon = parseInt(
        document.getElementById('them-phong-phan-cong')?.value || '0'
    );

    // Lọc theo trạng thái
    const ds = filter
        ? danhSach.filter(p => p.trangThai === filter)
        : danhSach;

    if (ds.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;
                        color:var(--mau-chu-phu);padding:20px;font-size:13px;">
                <i class="fas fa-door-closed"></i> Không có phòng nào.
            </div>`;
        return;
    }

    container.innerHTML = ds.map(p => {
        const disabled = p.trangThai !== 'Trống';
        const selected = p.iDPhong === idDangChon;
        const ttClass = p.trangThai === 'Trống' ? 'trong'
            : p.trangThai === 'Đã thuê' ? 'da-thue'
                : 'sua-chua';
        const ttLabel = p.trangThai === 'Trống' ? '○ Trống'
            : p.trangThai === 'Đã thuê' ? '● Đang thuê'
                : '⚠ Bảo trì';

        return `
        <div class="phong-card ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}"
             data-id="${p.iDPhong}"
             data-so="${p.soPhong}"
             onclick="${disabled ? '' : `chonPhongCard(this,${p.iDPhong},'${p.soPhong}')`}"
             title="${disabled ? p.trangThai + ' – không thể chọn' : 'Chọn P.' + p.soPhong}">
            <div class="pc-so">P.${p.soPhong}</div>
            <div class="pc-tang">Tầng ${p.tang}</div>
            <div class="pc-tt ${ttClass}">${ttLabel}</div>
        </div>`;
    }).join('');
}

// ── Chọn một phòng card ─────────────────────────────────────
function chonPhongCard(el, idPhong, soPhong) {
    // Bỏ chọn card cũ
    document.querySelectorAll('#phong-grid-container .phong-card.selected')
        .forEach(c => c.classList.remove('selected'));

    // Nếu click lại card đang chọn → bỏ chọn
    const hiddenInput = document.getElementById('them-phong-phan-cong');
    const label = document.getElementById('phong-selected-label');

    if (parseInt(hiddenInput.value) === idPhong) {
        hiddenInput.value = '0';
        if (label) label.textContent = '';
        return;
    }

    // Chọn mới
    el.classList.add('selected');
    hiddenInput.value = idPhong;
    if (label) label.innerHTML =
        `<i class="fas fa-check-circle" style="color:#7c3aed;"></i>
         Đã chọn: <strong>Phòng ${soPhong}</strong>`;
}

// ── Bộ lọc trạng thái ───────────────────────────────────────
function filterPhong(btn, trangThai) {
    __filterHienTai = trangThai;

    // Cập nhật style nút
    document.querySelectorAll('.btn-filter-phong')
        .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    renderPhongGrid(__danhSachPhongAPI, trangThai);
}