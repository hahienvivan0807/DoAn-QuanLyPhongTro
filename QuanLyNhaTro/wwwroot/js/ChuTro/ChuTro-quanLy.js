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

function getRoomsOwnedByOthers(excludeId) {
    const taken = new Set();
    danhSachQL.forEach(q => {
        if (q.idUser === excludeId) return;
        (q.phongs || []).forEach(p => taken.add(p.IDPhong));
    });
    return taken;
}

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
    if (phongContent) tqlRenderPhongHD(phongContent, q.phongs);
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

    const myRoomIds = new Set((phongDuocPhanCong || []).map(p => p.IDPhong));
    const takenByOthers = getRoomsOwnedByOthers(idDangChon);

    // Group by letter prefix of SoPhong (A, B, C…)
    const groups = {};
    tatCaPhong.forEach(p => {
        const key = (p.SoPhong || p.soPhong || '?')[0].toUpperCase();
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
    });

    const keys = Object.keys(groups).sort();
    if (keys.length === 0) {
        container.innerHTML =
            '<p style="color:var(--mau-chu-phu);font-size:13px;">Chưa có phòng nào trong hệ thống.</p>';
        return;
    }
    const ql = danhSachQL.find(x => x.idUser === idDangChon);
    const gradients = [
        "linear-gradient(135deg,#7c3aed,#a78bfa)",
        "linear-gradient(135deg,#b8720a,#e8971c)",
        "linear-gradient(135deg,#059669,#34d399)",
        "linear-gradient(135deg,#1a56db,#60a5fa)",
        "linear-gradient(135deg,#e11d48,#f87171)",
        "linear-gradient(135deg,#0891b2,#22d3ee)"
    ];
    const avatarBg = ql ? gradients[ql.idUser % gradients.length] : '#7c3aed';
    const initials = ql ? (ql.fullName || '?').trim().split(' ').pop()[0].toUpperCase() : '?';

    const bannerHtml = `
    <div style="
        display:flex;align-items:center;gap:10px;
        padding:10px 12px;margin-bottom:14px;
        background:#f5f3ff;border:1px solid #ede9fe;
        border-radius:10px;">
        <div style="
            width:34px;height:34px;flex-shrink:0;border-radius:50%;
            background:${avatarBg};display:flex;align-items:center;
            justify-content:center;color:#fff;font-size:14px;font-weight:700;">
            ${initials}
        </div>
        <div>
            <div style="font-size:11px;color:#6d28d9;font-weight:700;
                        text-transform:uppercase;letter-spacing:0.5px;">
                Đang phân công phòng cho
            </div>
            <div style="font-size:13px;font-weight:700;color:#1e1b4b;">
                ${ql ? escHtml(ql.fullName) : '—'}
                <span style="font-size:11px;font-weight:400;
                             color:#7c86a2;margin-left:4px;">
                    @${ql ? escHtml(ql.username) : ''}
                </span>
            </div>
        </div>
    </div>`;

    container.innerHTML = bannerHtml + keys.map(key => {
        const rooms = groups[key];
        const chips = rooms.map(p => {
            const id = p.IDPhong;
            const soPhong = p.SoPhong || p.soPhong;
            const tt = p.TrangThai || p.trangThai || '';
            const isMine = myRoomIds.has(id);
            const isTaken = takenByOthers.has(id);

            const ttClass = tt === 'Trống' ? 'trong'
                : tt === 'Đã thuê' ? 'da-thue'
                    : 'dang-sua';

            const disabledAttr = isTaken ? 'disabled' : '';
            const checkedAttr = isMine ? 'checked' : '';
            const opacity = isTaken ? 'opacity:.4;cursor:not-allowed;' : '';
            const titleTxt = isTaken
                ? 'Đã phân công cho quản lý khác'
                : isMine ? 'Đang quản lý – bỏ chọn để thu hồi' : `Phòng ${soPhong}`;

            return `<label class="floor-room-item" style="${opacity}" title="${titleTxt}">
                <input type="checkbox" value="${id}"
                       ${checkedAttr} ${disabledAttr}
                       onchange="onCheckPhong()">
                <span>
                    <b>${soPhong}</b>
                    <span class="room-tt ${ttClass}">${tt}</span>
                </span>
            </label>`;
        }).join('');

        return `<div class="floor-group">
            <div class="floor-group-title">
                <i class="fas fa-layer-group" style="color:var(--mau-chu-de);"></i>
                Khu ${key} &mdash; ${rooms.length} phòng
            </div>
            <div class="floor-rooms">${chips}</div>
        </div>`;
    }).join('');
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
        `Xóa tài khoản "<strong>${escHtml(tenQL)}</strong>"?
         Tất cả phòng được phân công sẽ bị thu hồi ngay lập tức.`,
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

                // ── Remove from in-memory state IMMEDIATELY ──────────────────
                // This makes getRoomsOwnedByOthers() stop returning their rooms,
                // so the next renderFloorGroups() won't lock those rooms.
                danhSachQL = danhSachQL.filter(q => q.idUser !== idUser);

                // Remove the table row directly (no reload needed)
                document.querySelector(`#tbody-quan-ly tr[data-id="${idUser}"]`)?.remove();

                // If this was the selected manager, clear right panel
                if (idDangChon === idUser) {
                    idDangChon = null;
                    resetPanelPhai();
                } else if (idDangChon !== null) {
                    // Re-render grid for currently selected manager so
                    // the deleted manager's rooms are now unlocked
                    const current = danhSachQL.find(x => x.idUser === idDangChon);
                    if (current) renderFloorGroups(current.phongs || []);
                }

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

    // ── Read from in-memory Set (works across all pages) ────
    const container = document.getElementById('floor-groups-container');
    const myRoomIds = container?.__myRoomIds;
    const checked = myRoomIds ? [...myRoomIds] : [];

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

        // ── Update in-memory danhSachQL ──────────────────────
        const ql = danhSachQL.find(x => x.idUser === idDangChon);
        if (ql) {
            ql.phongs = tatCaPhong
                .filter(p => checked.includes(p.IDPhong))
                .map(p => ({
                    IDPhong: p.IDPhong,
                    SoPhong: p.SoPhong || p.soPhong,
                    tang: p.Tang || p.tang,
                    TrangThai: p.TrangThai || p.trangThai
                }));
        }

        // Refresh chip badges in the manager table row
        capNhatChipPhongTrongBang(idDangChon, ql?.phongs || []);

        // Re-render the paginated table (updates disabled states)
        renderFloorGroups(ql?.phongs || []);

    } catch {
        showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
        setBtnLoading('btn-phan-cong', false);
    }
}

function capNhatChipPhongTrongBang(idUser, phongs) {
    const row = document.querySelector(`#tbody-quan-ly tr[data-id="${idUser}"]`);
    if (!row) return;
    const td = row.querySelectorAll('td')[4]; // "Phòng phụ trách" column (0-indexed)
    if (!td) return;

    if (!phongs.length) {
        td.innerHTML = '<span class="badge badge-empty">Chưa phân công</span>';
        return;
    }
    const show = phongs.slice(0, 3);
    const more = phongs.length - 3;
    td.innerHTML =
        '<div class="room-chips">' +
        show.map(p => `<span class="room-chip">${p.SoPhong}</span>`).join('') +
        (more > 0 ? `<span class="room-chip more">+${more}</span>` : '') +
        '</div>';
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

function dongModal(id) {
    document.getElementById(id)?.classList.remove('hien');
    if (id === 'modal-them-ql') {
        moTabThem(0);          // reset về tab 0
        tqlResetPhongHDPanel(); // xóa chọn phòng
        // reset extra roles chips
        document.querySelectorAll('#them-extra-roles-wrap .them-role-chip')
            .forEach(el => el.classList.remove('selected'));
        document.getElementById('them-extra-roles').value = '';
    }
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
    const g = id => (document.getElementById(id)?.value || '').trim();

    const dulieu = {
        // Tab 0 — bắt buộc
        FullName: g('them-fullname'),
        Username: g('them-username'),
        Phone: g('them-phone'),
        Email: g('them-email') || null,
        Password: g('them-password'),

        // Tab 1 — tùy chọn
        CCCD: g('them-cccd') || null,
        NgaySinh: g('them-ngaysinh') || null,
        GioiTinh: g('them-gioitinh') || null,
        QueQuan: g('them-quequan') || null,
        DiaChiThuongTru: g('them-diachi') || null,
        GhiChu: g('them-ghichu') || null,
        ExtraRoles: g('them-extra-roles') || null,

        // Tab 2 — Phòng & HĐ
        ...tqlLayPayloadPhongHD(),
    };

    if (!dulieu.FullName || !dulieu.Username || !dulieu.Phone || !dulieu.Password) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error');
        moTabThem(0);
        return;
    }

    const btn = document.getElementById('btn-them-next');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo...';

    try {
        const res = await fetch('/api/ChuTro/tao-tai-khoan', {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(dulieu),
        });
        const data = await res.json();

        if (res.ok) {
            alert(data.message || 'Tạo tài khoản thành công!', 'success');
            dongModal('modal-them-ql');
            await laiDanhSach();
        } else {
            showToast(data.message || 'Lỗi khi tạo tài khoản.', 'error');
        }
    } catch {
        showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Tạo tài khoản';
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
            <div class="pc-tang">Khu ${p.khu}</div>
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
let __pcPage = 1;   // current page (1-based)
const __pcPerPage = 12; 
function renderFloorGroups(phongDuocPhanCong) {
    const container = document.getElementById('floor-groups-container');
    if (!container) return;

    const myRoomIds = new Set((phongDuocPhanCong || []).map(p => p.IDPhong));
    const takenByOthers = getRoomsOwnedByOthers(idDangChon);

    // ── Banner ──────────────────────────────────────────────
    const ql = danhSachQL.find(x => x.idUser === idDangChon);
    const gradients = [
        'linear-gradient(135deg,#7c3aed,#a78bfa)',
        'linear-gradient(135deg,#b8720a,#e8971c)',
        'linear-gradient(135deg,#059669,#34d399)',
        'linear-gradient(135deg,#1a56db,#60a5fa)',
        'linear-gradient(135deg,#e11d48,#f87171)',
        'linear-gradient(135deg,#0891b2,#22d3ee)'
    ];
    const avatarBg = ql ? gradients[ql.idUser % gradients.length] : '#7c3aed';
    const initials = ql ? (ql.fullName || '?').trim().split(' ').pop()[0].toUpperCase() : '?';
    const checkedCount = myRoomIds.size;

    const bannerHtml = `
    <div style="display:flex;align-items:center;gap:10px;
                padding:10px 12px;margin-bottom:12px;
                background:#f5f3ff;border:1px solid #ede9fe;border-radius:10px;">
        <div style="width:34px;height:34px;flex-shrink:0;border-radius:50%;
                    background:${avatarBg};display:flex;align-items:center;
                    justify-content:center;color:#fff;font-size:14px;font-weight:700;">
            ${initials}
        </div>
        <div style="flex:1;min-width:0;">
            <div style="font-size:10.5px;color:#6d28d9;font-weight:700;
                        text-transform:uppercase;letter-spacing:0.5px;">
                Đang phân công phòng cho
            </div>
            <div style="font-size:13px;font-weight:700;color:#1e1b4b;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${ql ? escHtml(ql.fullName) : '—'}
                <span style="font-size:11px;font-weight:400;color:#7c86a2;margin-left:4px;">
                    @${ql ? escHtml(ql.username) : ''}
                </span>
            </div>
        </div>
        <div id="pc-checked-badge" style="
                flex-shrink:0;background:#7c3aed;color:#fff;
                font-size:11px;font-weight:700;border-radius:20px;
                padding:3px 10px;white-space:nowrap;">
            ${checkedCount} phòng
        </div>
    </div>`;

    // ── Search + filter bar ─────────────────────────────────
    const filterBarHtml = `
    <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center;">
        <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:120px;
                    background:#fff;border:1.5px solid var(--mau-vien);
                    border-radius:20px;padding:5px 12px;">
            <i class="fas fa-search" style="color:var(--mau-chu-phu);font-size:11px;"></i>
            <input id="pc-search" type="text" placeholder="Tìm phòng..."
                   style="border:none;outline:none;font-size:12px;
                          width:100%;font-family:inherit;background:transparent;"
                   oninput="__pcPage=1;renderFloorGroupsPage()" />
        </div>
        <select id="pc-filter-tt" onchange="__pcPage=1;renderFloorGroupsPage()"
                style="padding:5px 10px;border:1.5px solid var(--mau-vien);
                       border-radius:8px;font-size:12px;font-family:inherit;
                       background:#fff;cursor:pointer;outline:none;">
            <option value="">Tất cả</option>
            <option value="Trống">🟢 Trống</option>
            <option value="Đã thuê">🔵 Đang thuê</option>
            <option value="Đang sửa">🟡 Bảo trì</option>
        </select>
        <label style="display:flex;align-items:center;gap:5px;
                      font-size:12px;color:var(--mau-chu-phu);
                      cursor:pointer;white-space:nowrap;">
            <input type="checkbox" id="pc-only-mine"
                   style="accent-color:#7c3aed;"
                   onchange="__pcPage=1;renderFloorGroupsPage()" />
            Đang phụ trách
        </label>
    </div>`;

    // ── Table skeleton (tbody filled by renderFloorGroupsPage) ─
    const tableHtml = `
    <div style="border:1.5px solid var(--mau-vien);border-radius:10px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
            <thead>
                <tr style="background:var(--mau-nen-card);">
                    <th style="width:36px;padding:8px 10px;text-align:center;">
                        <input type="checkbox" id="pc-chk-all-page"
                               style="accent-color:#7c3aed;cursor:pointer;"
                               onchange="__pcTogglePageAll(this.checked)" />
                    </th>
                    <th style="padding:8px 10px;text-align:left;font-weight:700;
                               color:var(--mau-chu-phu);letter-spacing:.4px;
                               text-transform:uppercase;font-size:10.5px;">Phòng</th>
                    <th style="padding:8px 10px;text-align:left;font-weight:700;
                               color:var(--mau-chu-phu);letter-spacing:.4px;
                               text-transform:uppercase;font-size:10.5px;">Khu</th>
                    <th style="padding:8px 10px;text-align:left;font-weight:700;
                               color:var(--mau-chu-phu);letter-spacing:.4px;
                               text-transform:uppercase;font-size:10.5px;">Trạng thái</th>
                    <th style="padding:8px 10px;text-align:left;font-weight:700;
                               color:var(--mau-chu-phu);letter-spacing:.4px;
                               text-transform:uppercase;font-size:10.5px;">Ghi chú</th>
                </tr>
            </thead>
            <tbody id="pc-tbody"></tbody>
        </table>
    </div>
    <div id="pc-pagination" style="display:flex;align-items:center;justify-content:space-between;
                                    margin-top:10px;font-size:12px;color:var(--mau-chu-phu);">
    </div>`;

    container.innerHTML = bannerHtml + filterBarHtml + tableHtml;

    // Store data on container for renderFloorGroupsPage() to read
    container.__myRoomIds = myRoomIds;
    container.__takenByOthers = takenByOthers;

    __pcPage = 1;
    renderFloorGroupsPage();
}

/**
 * Renders one page of the room table.
 * Called on page change, search, filter change.
 */
function renderFloorGroupsPage() {
    const container = document.getElementById('floor-groups-container');
    const tbody = document.getElementById('pc-tbody');
    const pagination = document.getElementById('pc-pagination');
    if (!tbody || !container) return;

    const myRoomIds = container.__myRoomIds || new Set();
    const takenByOthers = container.__takenByOthers || new Set();

    // ── Apply search + filter ───────────────────────────────
    const searchVal = (document.getElementById('pc-search')?.value || '').toLowerCase().trim();
    const filterTT = document.getElementById('pc-filter-tt')?.value || '';
    const onlyMine = document.getElementById('pc-only-mine')?.checked || false;

    const filtered = tatCaPhong.filter(p => {
        const soPhong = (p.SoPhong || p.soPhong || '').toLowerCase();
        const tt = p.TrangThai || p.trangThai || '';
        if (searchVal && !soPhong.includes(searchVal)) return false;
        if (filterTT && tt !== filterTT) return false;
        if (onlyMine && !myRoomIds.has(p.IDPhong)) return false;
        return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / __pcPerPage));
    if (__pcPage > totalPages) __pcPage = totalPages;

    const start = (__pcPage - 1) * __pcPerPage;
    const pageRows = filtered.slice(start, start + __pcPerPage);

    // ── Status helpers ──────────────────────────────────────
    const ttStyle = {
        'Trống': { bg: '#ecfdf5', color: '#059669', dot: '🟢' },
        'Đã thuê': { bg: '#eff6ff', color: '#2563eb', dot: '🔵' },
        'Đang sửa': { bg: '#fffbeb', color: '#d97706', dot: '🟡' },
    };

    // ── Render rows ─────────────────────────────────────────
    if (pageRows.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="5" style="padding:24px;text-align:center;color:var(--mau-chu-phu);">
                <i class="fas fa-door-closed" style="font-size:20px;opacity:.3;display:block;margin-bottom:8px;"></i>
                Không tìm thấy phòng nào.
            </td></tr>`;
    } else {
        tbody.innerHTML = pageRows.map(p => {
            const id = p.IDPhong;
            const soPhong = p.SoPhong || p.soPhong || '';
            const tt = p.TrangThai || p.trangThai || '';
            const khu = soPhong[0]?.toUpperCase() || '?';
            const isMine = myRoomIds.has(id);
            const isTaken = takenByOthers.has(id);

            const s = ttStyle[tt] || { bg: '#f1f5f9', color: '#64748b', dot: '⚪' };

            const rowBg = isMine ? 'background:#f5f3ff;'
                : isTaken ? 'background:#fafafa;opacity:.55;'
                    : '';
            const titleTxt = isTaken ? 'Đã phân công cho quản lý khác'
                : isMine ? 'Bỏ chọn để thu hồi'
                    : `Phân công phòng ${soPhong}`;

            const noteHtml = isTaken
                ? `<span style="font-size:10.5px;color:#e11d48;font-weight:600;">
                       <i class="fas fa-lock" style="font-size:9px;"></i> Đã phân công
                   </span>`
                : isMine
                    ? `<span style="font-size:10.5px;color:#7c3aed;font-weight:600;">
                       <i class="fas fa-check-circle" style="font-size:9px;"></i> Đang quản lý
                   </span>`
                    : `<span style="font-size:10.5px;color:var(--mau-chu-phu);">—</span>`;

            return `
            <tr style="border-top:1px solid var(--mau-vien);${rowBg}
                        transition:background .12s;cursor:${isTaken ? 'not-allowed' : 'pointer'};"
                title="${titleTxt}"
                onclick="${isTaken ? '' : `__pcToggleRow(${id})`}">
                <td style="padding:8px 10px;text-align:center;" onclick="event.stopPropagation()">
                    <input type="checkbox" value="${id}"
                           class="pc-row-chk"
                           ${isMine ? 'checked' : ''}
                           ${isTaken ? 'disabled' : ''}
                           style="accent-color:#7c3aed;cursor:${isTaken ? 'not-allowed' : 'pointer'};"
                           onchange="__pcOnCheck()" />
                </td>
                <td style="padding:8px 10px;font-weight:700;color:var(--mau-chu);">
                    ${escHtml(soPhong)}
                </td>
                <td style="padding:8px 10px;color:var(--mau-chu-phu);">
                    Khu ${escHtml(khu)}
                </td>
                <td style="padding:8px 10px;">
                    <span style="display:inline-flex;align-items:center;gap:4px;
                                 padding:2px 8px;border-radius:20px;font-size:11px;
                                 font-weight:600;background:${s.bg};color:${s.color};">
                        ${s.dot} ${escHtml(tt || 'N/A')}
                    </span>
                </td>
                <td style="padding:8px 10px;">${noteHtml}</td>
            </tr>`;
        }).join('');
    }

    // ── Update "select-all on page" checkbox state ──────────
    const pageCheckable = pageRows.filter(p => !takenByOthers.has(p.IDPhong));
    const pageChecked = pageCheckable.filter(p => myRoomIds.has(p.IDPhong));
    const allChk = document.getElementById('pc-chk-all-page');
    if (allChk) {
        allChk.checked = pageCheckable.length > 0 && pageChecked.length === pageCheckable.length;
        allChk.indeterminate = pageChecked.length > 0 && pageChecked.length < pageCheckable.length;
    }

    // ── Update badge count ──────────────────────────────────
    const badge = document.getElementById('pc-checked-badge');
    if (badge) badge.textContent = `${myRoomIds.size} phòng`;

    // ── Pagination controls ─────────────────────────────────
    if (!pagination) return;
    if (totalPages <= 1) {
        pagination.innerHTML = `<span>Hiển thị ${total} phòng</span>`;
        return;
    }

    const btnStyle = (active) => `
        display:inline-flex;align-items:center;justify-content:center;
        width:28px;height:28px;border-radius:6px;border:1.5px solid;
        font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;
        ${active
            ? 'background:#7c3aed;border-color:#7c3aed;color:#fff;'
            : 'background:#fff;border-color:var(--mau-vien);color:var(--mau-chu-phu);'}`;

    // Show up to 5 page buttons around current page
    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, __pcPage - delta); i <= Math.min(totalPages, __pcPage + delta); i++) {
        pages.push(i);
    }

    pagination.innerHTML = `
        <span style="color:var(--mau-chu-phu);">
            ${start + 1}–${Math.min(start + __pcPerPage, total)} / ${total} phòng
        </span>
        <div style="display:flex;gap:4px;align-items:center;">
            <button style="${btnStyle(false)}opacity:${__pcPage === 1 ? .4 : 1};"
                    onclick="if(__pcPage>1){__pcPage--;renderFloorGroupsPage();}"
                    title="Trang trước">
                <i class="fas fa-chevron-left"></i>
            </button>
            ${pages.map(pg => `
                <button style="${btnStyle(pg === __pcPage)}"
                        onclick="__pcPage=${pg};renderFloorGroupsPage();">
                    ${pg}
                </button>`).join('')}
            <button style="${btnStyle(false)}opacity:${__pcPage === totalPages ? .4 : 1};"
                    onclick="if(__pcPage<${totalPages}){__pcPage++;renderFloorGroupsPage();}"
                    title="Trang sau">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>`;
}

// ── Toggle a single row checkbox (clicking the row) ────────
function __pcToggleRow(idPhong) {
    const cb = document.querySelector(`#pc-tbody input[value="${idPhong}"]`);
    if (!cb || cb.disabled) return;
    cb.checked = !cb.checked;
    __pcOnCheck();
}

// ── Sync myRoomIds when any checkbox changes ────────────────
function __pcOnCheck() {
    const container = document.getElementById('floor-groups-container');
    if (!container) return;

    // Rebuild myRoomIds from ALL checked (not just current page)
    // Strategy: start from current set, apply changes visible on this page
    const myRoomIds = container.__myRoomIds;

    document.querySelectorAll('#pc-tbody input.pc-row-chk').forEach(cb => {
        const id = parseInt(cb.value);
        if (cb.checked) myRoomIds.add(id);
        else myRoomIds.delete(id);
    });

    // Update badge
    const badge = document.getElementById('pc-checked-badge');
    if (badge) badge.textContent = `${myRoomIds.size} phòng`;

    // Update select-all state
    const container2 = document.getElementById('floor-groups-container');
    const takenByOthers = container2.__takenByOthers || new Set();
    const allOnPage = [...document.querySelectorAll('#pc-tbody input.pc-row-chk:not([disabled])')];
    const checkedOnPage = allOnPage.filter(cb => cb.checked);
    const allChk = document.getElementById('pc-chk-all-page');
    if (allChk) {
        allChk.checked = allOnPage.length > 0 && checkedOnPage.length === allOnPage.length;
        allChk.indeterminate = checkedOnPage.length > 0 && checkedOnPage.length < allOnPage.length;
    }
}

// ── Select / deselect all rows on current page ──────────────
function __pcTogglePageAll(checked) {
    document.querySelectorAll('#pc-tbody input.pc-row-chk:not([disabled])').forEach(cb => {
        cb.checked = checked;
    });
    __pcOnCheck();
}
function onCheckPhong() { }
// ── Search + filter wrappers for table toolbar ──────────────
function timKiemQL(keyword) {
    const kw = (keyword || '').toLowerCase().trim();
    const filterTT = document.getElementById('sel-filter')?.value || '';

    const filtered = danhSachQL.filter(q => {
        const matchKW = !kw
            || q.fullName.toLowerCase().includes(kw)
            || (q.username || '').toLowerCase().includes(kw)
            || (q.phone || '').includes(kw);
        const matchTT = !filterTT
            || (filterTT === 'active' && q.isActive)
            || (filterTT === 'locked' && !q.isActive);
        return matchKW && matchTT;
    });

    _renderTable(filtered);
}

function locTrangThai(value) {
    const kw = (document.getElementById('inp-search')?.value || '').toLowerCase().trim();
    timKiemQL(kw); // reuse timKiemQL which already reads sel-filter
}

function _renderTable(ds) {
    const count = document.getElementById('pg-count');
    if (count) count.textContent = ds.length;

    const tbody = document.getElementById('tbody-quan-ly');
    if (!tbody) return;

    // Show/hide rows based on filtered set
    const allRows = tbody.querySelectorAll('tr[data-id]');
    const visibleIds = new Set(ds.map(q => q.idUser));
    allRows.forEach(row => {
        row.style.display = visibleIds.has(parseInt(row.dataset.id)) ? '' : 'none';
    });
} function _tqlRenderPickerGrid(list) {
    const loading = document.getElementById('tql-picker-loading');
    const grid = document.getElementById('tql-picker-grid');
    const empty = document.getElementById('tql-picker-empty');

    if (loading) loading.style.display = 'none';

    if (!list.length) {
        if (grid) grid.style.display = 'none';
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';
    if (grid) grid.style.display = 'grid';

    const badgeCls = {
        'Trống': 'rp-badge-trong',
        'Đã thuê': 'rp-badge-datthue',
        'Đang sửa': 'rp-badge-suachua',
    };

    const badgeIcon = {
        'Trống': '🟢',
        'Đã thuê': '🔵',
        'Đang sửa': '🟡',
    };

    grid.innerHTML = list.map(p => {
        const isSelected = _tqlPhongDaChon && _tqlPhongDaChon.idPhong === p.idPhong;
        const isDisabled = p.trangThai !== 'Trống';
        const cardClass = [
            'rp-card',
            isSelected ? 'selected' : '',
            isDisabled ? 'disabled' : '',
        ].filter(Boolean).join(' ');

        const onClick = isDisabled
            ? ''
            : `onclick="_tqlChonPhong(${p.idPhong})"`;

        return `
        <div class="${cardClass}" ${onClick}>
            <div class="rp-check"><i class="fas fa-check"></i></div>
            <div class="rp-so-phong">P.${_tqlEsc(p.soPhong)}</div>
            <div class="rp-tang">Khu ${_tqlEsc(String(p.khu ?? ''))}</div>
            <span class="rp-badge ${badgeCls[p.trangThai] || 'rp-badge-trong'}">
                ${badgeIcon[p.trangThai] || ''} ${_tqlEsc(p.trangThai)}
            </span>
            <div class="rp-gia">${_tqlFmtTien(p.giaPhongFix)}/tháng</div>
        </div>`;
    }).join('');
}