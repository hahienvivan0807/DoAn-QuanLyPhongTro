var danhSachNguoiThue = [];
let phongAllData = [];
let phongCurFilter = 'all';
let phongSelectedId = null;

//Loại Thông báo (fail,warn,info,success)
const cfg = {
    success: { bg: '#EAF3DE', ic: '#3B6D11', bar: '#639922', ring: '#639922', icon: 'ti-check', label: 'Thành công' },
    fail: { bg: '#FCEBEB', ic: '#A32D2D', bar: '#E24B4A', ring: '#E24B4A', icon: 'ti-x', label: 'Thất bại' },
    warn: { bg: '#FAEEDA', ic: '#854F0B', bar: '#EF9F27', ring: '#EF9F27', icon: 'ti-alert-triangle', label: 'Cảnh báo' },
    info: { bg: '#E6F1FB', ic: '#185FA5', bar: '#378ADD', ring: '#378ADD', icon: 'ti-info-circle', label: 'Thông tin' },
};
const dur = 4000;
function showToast(type, title, msg) {
    const c = cfg[type];
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;

    const spinSvg = (type === 'success' || type === 'fail') ? `
  <svg class="ring-svg" width="36" height="36" viewBox="0 0 36 36" style="position:absolute;top:0;left:0;">
    <circle cx="18" cy="18" r="14" fill="none" stroke="${c.ring}" stroke-width="2" stroke-dasharray="6 4" opacity="0.5"/>
  </svg>`: '';

    const drawSvg = type === 'success' ? `
  <svg width="18" height="18" viewBox="0 0 18 18" style="position:relative;z-index:1;">
    <polyline class="check-path" points="3,9 7,13 15,5" fill="none" stroke="${c.ic}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
        : type === 'fail' ? `
  <svg width="18" height="18" viewBox="0 0 18 18" style="position:relative;z-index:1;">
    <line class="x-path" x1="4" y1="4" x2="14" y2="14" stroke="${c.ic}" stroke-width="2.2" stroke-linecap="round"/>
    <line class="x-path" x1="14" y1="4" x2="4" y2="14" stroke="${c.ic}" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`
            : type === 'warn' ? `
  <svg class="ring-svg" width="36" height="36" viewBox="0 0 36 36" style="position:absolute;top:0;left:0;">
    <circle cx="18" cy="18" r="14" fill="none" stroke="${c.ring}" stroke-width="2" stroke-dasharray="6 4" opacity="0.5"/>
  </svg>
  <svg width="18" height="18" viewBox="0 0 18 18" style="position:relative;z-index:1;">
    <line class="check-path" x1="9" y1="2" x2="9" y2="11" stroke="${c.ic}" stroke-width="2.2" stroke-linecap="round"/>
    <line class="check-path" x1="9" y1="14" x2="9" y2="15.5" stroke="${c.ic}" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`
                : `
  <svg class="ring-svg" width="36" height="36" viewBox="0 0 36 36" style="position:absolute;top:0;left:0;">
    <circle cx="18" cy="18" r="14" fill="none" stroke="${c.ring}" stroke-width="2" stroke-dasharray="6 4" opacity="0.5"/>
  </svg>
  <svg width="18" height="18" viewBox="0 0 18 18" style="position:relative;z-index:1;">
    <line class="x-path" x1="9" y1="3" x2="9" y2="10" stroke="${c.ic}" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="9" cy="14" r="1.2" fill="${c.ic}"/>
  </svg>`;

    el.innerHTML = `
    <div class="toast-icon-wrap" style="background:${c.bg};">
      ${spinSvg}${drawSvg}
    </div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <button class="toast-close" onclick="removeToast(this.closest('.toast'))"><i class="ti ti-x"></i></button>
    <div class="toast-progress" style="background:${c.bar};animation-duration:${dur}ms;"></div>
  `;

    const container = document.getElementById('toastContainer');
    container.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));

    const t = setTimeout(() => removeToast(el), dur);
    el._timer = t;
}
function removeToast(el) {
    if (!el) return;
    clearTimeout(el._timer);
    el.classList.remove('show');
    el.classList.add('hide');
    setTimeout(() => el.remove(), 300);
}
function openModal() {
    document.getElementById('backdrop').classList.add('show');
    document.body.style.overflow = 'hidden';
}
function moModalThemNguoiThue() {
    dongModal('modal-quan-ly-nguoi-thue');
    openModal(); // mở backdrop modal thêm người thuê
}
function closeModal() {
    document.getElementById('backdrop').classList.remove('show');
    document.body.style.overflow = '';
}
function handleBdClick(e) {
    if (e.target === document.getElementById('backdrop')) closeModal();
}
//Danh sách phòng
function renderRooms() {
    const list = document.getElementById('rpList');
    const q = (document.getElementById('rp-q')?.value || '').trim().toLowerCase();

    let data = phongAllData;

    if (phongCurFilter !== 'all') {
        data = data.filter(p => p.trangThai === phongCurFilter);
    }

    if (q) {
        data = data.filter(p =>
            String(p.soPhong || '').toLowerCase().includes(q) ||
            String(p.tang || '').toLowerCase().includes(q) ||
            String(p.moTa || '').toLowerCase().includes(q)
        );
    }

    if (!data.length) {
        list.innerHTML = `
            <div style="text-align:center;padding:20px;color:#9ca3af;font-size:12px;">
                Không tìm thấy phòng nào
            </div>`;
        return;
    }

    // ✅ Dùng data-* hoàn toàn, không nhét vào onclick string
    list.innerHTML = data.map(p => {
        const isLocked = p.trangThai !== 'Trống';
        const gia = Number(p.giaPhongFix || 0).toLocaleString('vi-VN') + ' đ/tháng';
        const isSelected = p.idPhong === phongSelectedId;

        let badge = '';
        if (p.trangThai === 'Trống') badge = `<span class="bdg b-empty">Trống</span>`;
        if (p.trangThai === 'Đã thuê') badge = `<span class="bdg b-rented">Đã thuê</span>`;
        if (p.trangThai === 'Đang sửa') badge = `<span class="bdg b-repair">Đang sửa</span>`;

        return `
            <div class="rp-row ${isLocked ? 'locked' : ''} ${isSelected ? 'sel' : ''}"
                 data-id="${p.idPhong ?? ''}"
                 data-sophong="${p.soPhong ?? ''}"
                 data-gia="${p.giaPhongFix ?? 0}"
                 data-locked="${isLocked}"
                 onclick="handleSelectRoom(this)">
                <div>
                    <div class="rp-num">Phòng ${p.soPhong ?? '?'} · Tầng ${p.tang ?? '?'}</div>
                    <div class="rp-sub">${p.dienTich ?? '?'} m² · ${gia}</div>
                </div>
                ${badge}
            </div>`;
    }).join('');
}


/* ---- CHỌN PHÒNG ---- */
function handleSelectRoom(el) {
    if (el.dataset.locked === 'true') return;

    phongSelectedId = Number(el.dataset.id);
    const soPhong = el.dataset.sophong;
    const gia = Number(el.dataset.gia);

    // Cập nhật nút
    const btn = document.getElementById('roomBtn');
    btn.textContent = `✓ Phòng ${soPhong} đã chọn`;
    btn.classList.add('picked');
    btn.dataset.sophong = soPhong;

    // Cập nhật giá thuê
    const priceVal = document.getElementById('priceVal');
    if (priceVal) {
        priceVal.textContent = gia.toLocaleString('vi-VN') + ' đ / tháng';
        priceVal.style.color = 'var(--text)';
    }

    // Gợi ý tiền cọc = 2 tháng
    const inputCoc = document.getElementById('nt-coc');
    if (inputCoc && !inputCoc.value) {
        inputCoc.value = gia * 2;
    }

    // Đóng dropdown
    document.getElementById('roomPanel').classList.remove('open');
    btn.classList.remove('open-state');

    // Re-render để highlight
    renderRooms();
}
async function toggleRoom() {
    const panel = document.getElementById('roomPanel');
    const btn = document.getElementById('roomBtn');

    if (panel.classList.contains('open')) {
        panel.classList.remove('open');
        btn.classList.remove('open-state');
        return;
    }

    panel.classList.add('open');
    btn.classList.add('open-state');

    document.getElementById('rpList').innerHTML = `
        <div style="text-align:center;padding:20px;color:#9ca3af;font-size:12px;">
            <i class="fas fa-spinner fa-spin"></i> Đang tải...
        </div>`;

    try {
        const res = await fetch('/api/ChuTro/DanhSachPhong');
        phongAllData = await res.json();
        console.log('Data từ API:', phongAllData[0]); 
        capNhatSoDem();
        renderRooms();
    } catch (err) {
        console.error('Lỗi fetch:', err);
        document.getElementById('rpList').innerHTML = `
            <div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">
                <i class="fas fa-exclamation-circle"></i> Lỗi kết nối API
            </div>`;
    }
}
function capNhatSoDem() {
    const total = phongAllData.length;
    const trong = phongAllData.filter(p => p.trangThai === 'Trống').length;
    const daThue = phongAllData.filter(p => p.trangThai === 'Đã thuê').length;
    const dangSua = phongAllData.filter(p => p.trangThai === 'Đang sửa').length;

    // ✅ Kiểm tra element tồn tại trước khi set
    const elAll = document.getElementById('btn-filter-all');
    console.log(elAll);
    const elTrong = document.getElementById('btn-filter-trong');
    const elDaThue = document.getElementById('btn-filter-datthue');
    const elSua = document.getElementById('btn-filter-dangsua');

    if (elAll) elAll.textContent = `Tất cả (${total})`;
    if (elTrong) elTrong.innerHTML = `<i class="fas fa-door-open" style="font-size:9px;"></i> Trống (${trong})`;
    if (elDaThue) elDaThue.innerHTML = `<i class="fas fa-user-check" style="font-size:9px;"></i> Đã thuê (${daThue})`;
    if (elSua) elSua.innerHTML = `<i class="fas fa-tools" style="font-size:9px;"></i> Đang sửa (${dangSua})`;
}
function resetFormThemNguoiThue() {
    // ===== SECTION 1: TÀI KHOẢN =====
    document.getElementById("nt-hoten").value = "";
    document.getElementById("nt-un").value = "";
    document.getElementById("nt-sdt").value = "";
    document.getElementById("nt-pw").value = "";
    document.getElementById("nt-email").value = "";

    // Reset icon mắt password
    document.getElementById("pw-ico").className = "fas fa-eye";
    document.getElementById("nt-pw").type = "password";

    // ===== SECTION 2: PHÒNG & HĐ =====
    // Reset room picker
    document.getElementById("roomBtn").textContent = "Nhấn để chọn phòng trống...";
    document.getElementById("roomBtn").dataset.sophong = "";
    document.getElementById("roomPanel").classList.remove("open"); // hoặc style display none tuỳ bạn
    document.getElementById("rp-q").value = "";

    // Reset ngày, tiền cọc
    document.getElementById("nt-start").value = "";
    document.getElementById("nt-end").value = "";
    document.getElementById("nt-coc").value = "";

    // Reset giá thuê
    const priceVal = document.getElementById("priceVal");
    priceVal.textContent = "Chưa chọn phòng";
    priceVal.style.color = "var(--muted)";

    // ===== SECTION 3: ĐIỆN NƯỚC =====
    document.getElementById("nt-dien").value = "";
    document.getElementById("nt-nuoc").value = "";
}
async function themNguoiThue() {
    const duLieu = {
        HoTen: document.getElementById("nt-hoten").value.trim(),
        Username: document.getElementById("nt-un").value.trim(),
        SoDienThoai: document.getElementById("nt-sdt").value.trim(),
        MatKhau: document.getElementById("nt-pw").value,
        SoPhong: document.getElementById("roomBtn").dataset.sophong,
        Email: document.getElementById("nt-email").value.trim(),
        NgayBatDau: document.getElementById("nt-start").value,
        NgayKetThuc: document.getElementById("nt-end").value,
        TienCoc: Number(document.getElementById("nt-coc").value),
        GiaThue: Number(document.getElementById("priceVal").innerText.replace(/[^\d]/g, "")),
        ChiSoDien: Number(document.getElementById("nt-dien").value),
        ChiSoNuoc: Number(document.getElementById("nt-nuoc").value),
    };
    ngayBatDau = document.getElementById("nt-start").value;
    soPhong = document.getElementById("roomBtn").dataset.sophong;
    if (!ngayBatDau) {
        showToast('warn', 'Thiếu thông tin', 'Vui lòng chọn ngày bắt đầu hợp đồng!');
        return;
    }
    if (!soPhong) {
        showToast('warn', 'Thiếu thông tin', 'Vui lòng chọn phòng!');
        return;
    }
    try {
        let respone = await fetch('/api/ChuTroThemNguoiThue/them-nguoi-thue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(duLieu)
        });
        const data = await respone.json();
        if (respone.ok) {
            showToast('success', 'Thêm thành công', data.message || 'Thêm thành công.');
            resetFormThemNguoiThue();
        } else {
            console.log("data trả về:", data);      
            console.log("data.message:", data.message); 
            showToast('warn', 'Thêm thất bại!', data.message || 'Có lỗi xảy ra.');
        }
    } catch (error) {
        showToast('fail', 'Lỗi kết nối', 'Không kết nối được với máy chủ' )
    }
}
function phongSetFilter(f) {
    phongCurFilter = f;
    phongResetFilterBtns();
    const map = {
        'all': { id: 'phong-f-all', bg: '#7c3aed', color: '#fff', border: '#7c3aed' },
        'Trống': { id: 'phong-f-empty', bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' },
        'Đang sửa': { id: 'phong-f-repair', bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
    };
    const btn = document.getElementById(map[f].id);
    if (btn) {
        btn.style.background = map[f].bg;
        btn.style.color = map[f].color;
        btn.style.borderColor = map[f].border;
    }
    phongFilterTable();
}

function phongResetFilterBtns() {
    ['phong-f-all', 'phong-f-empty', 'phong-f-repair'].forEach(id => {
        const b = document.getElementById(id);
        if (b) {
            b.style.background = 'var(--mau-nen)';
            b.style.color = 'var(--mau-chu-phu)';
            b.style.borderColor = 'var(--mau-vien)';
        }
    });
}
function phongRenderStats() {
    const total = phongAllData.length;
    const empty = phongAllData.filter(p => p.TrangThai === 'Trống').length;
    const rented = phongAllData.filter(p => p.TrangThai === 'Đã thuê').length;
    const repair = phongAllData.filter(p => p.TrangThai === 'Đang sửa').length;

    document.getElementById('phong-st-all').textContent = total;
    document.getElementById('phong-st-empty').textContent = empty;
    document.getElementById('phong-st-rented').textContent = rented;
    document.getElementById('phong-st-repair').textContent = repair;
    document.getElementById('phong-hd-sub').textContent = `Tổng ${total} phòng · ${empty} phòng trống`;
}
function phongFilterTable() {
    const q = (document.getElementById('phong-search-input').value || '').trim().toLowerCase();

    let data = phongAllData;

    if (phongCurFilter !== 'all') {
        data = data.filter(p => p.TrangThai === phongCurFilter);
    }

    if (q) {
        data = data.filter(p => {
            const soPhong = ('p' + p.SoPhong).toLowerCase();
            const tang = ('tầng ' + p.Tang).toLowerCase();
            const moTa = (p.MoTa || '').toLowerCase();
            return soPhong.includes(q) || tang.includes(q) || moTa.includes(q);
        });
    }

    phongRenderTable(data);
}


function phongRenderTable(data) {
    document.getElementById('phong-result-count').textContent = data;
}
function moModalQuanLyNguoiThue() {
    moModal('modal-quan-ly-nguoi-thue');
    renderDanhSachNguoiThue(danhSachNguoiThue);
}

function renderDanhSachNguoiThue(ds) {
    var container = document.getElementById('ds-nguoi-thue-trong-modal');
    var demEl = document.getElementById('dem-nguoi-thue');
    if (!container) return;
    demEl.textContent = ds.length;

    if (ds.length === 0) {
        container.innerHTML =
            '<div style="text-align:center;padding:32px;color:var(--mau-chu-phu);">' +
            '<i class="fas fa-user-slash" style="font-size:28px;margin-bottom:10px;display:block;opacity:0.4;"></i>' +
            'Không tìm thấy người thuê nào.' +
            '</div>';
        return;
    }

    var mauBg = [
        'linear-gradient(135deg,#7c3aed,#a78bfa)',
        'linear-gradient(135deg,#c9810a,#f5a623)',
        'linear-gradient(135deg,#059669,#34d399)',
        'linear-gradient(135deg,#1a56db,#60a5fa)',
        'linear-gradient(135deg,#e11d48,#f87171)',
        'linear-gradient(135deg,#0891b2,#22d3ee)'
    ];

    container.innerHTML = ds.map(function (nt, idx) {
        // ✅ camelCase khớp với JSON thực tế
        var ten = (nt.fullName && nt.fullName.trim()) ? nt.fullName.trim() : (nt.username || '?');
        var bg = mauBg[idx % mauBg.length];
        var chu = ten.split(' ').pop()[0].toUpperCase();

        return '<div onclick="xemChiTietNguoiThue(' + nt.idUser + ')"' + 'style="display:flex;align-items:center;gap:14px;padding:12px 14px;' +
            'background:var(--mau-trang);border:1.5px solid var(--mau-vien);border-radius:12px;' +
            'cursor:pointer;transition:all 0.2s;"' +
            ' onmouseover="this.style.borderColor=\'var(--mau-chu-de)\';this.style.transform=\'translateX(3px)\'"' +
            ' onmouseout="this.style.borderColor=\'var(--mau-vien)\';this.style.transform=\'none\'">' +
            '<div style="width:42px;height:42px;border-radius:12px;background:' + bg + ';' +
            'display:flex;align-items:center;justify-content:center;color:#fff;' +
            'font-size:16px;font-weight:800;flex-shrink:0;">' + chu + '</div>' +
            '<div style="flex:1;">' +
            '<div style="font-size:13.5px;font-weight:700;color:var(--mau-chu);">' + ten + '</div>' +
            '<div style="font-size:11.5px;color:var(--mau-chu-phu);margin-top:2px;">' +
            '<i class="fas fa-phone" style="font-size:10px;margin-right:4px;"></i>' + (nt.phone || '') +
            ' · @' + (nt.username || '') +
            '</div>' +
            '</div>' +
            '<i class="fas fa-chevron-right" style="color:var(--mau-chu-phu);font-size:11px;"></i>' +
            '</div>';
    }).join('');
}

function locDanhSachNguoiThue(tuKhoa) {
    var kq = danhSachNguoiThue.filter(function (nt) {
        var tk = tuKhoa.toLowerCase().trim();
        return (nt.fullName || '').toLowerCase().includes(tk) ||
            (nt.username || '').toLowerCase().includes(tk) ||
            (nt.phone || '').includes(tk);
    });
    renderDanhSachNguoiThue(kq);
}

async function xemChiTietNguoiThue(id) {
    const res = await fetch(`/api/ChuTro/chi-tiet-nguoi-thue/${id}`);
    if (!res.ok) {
        alert("Không thể tải thông tin chi tiết!");
        return;
    }
    const nt = await res.json();
    nguoiThueHienTai = nt;
    var html =
        '<div style="background:var(--mau-nen);border-radius:12px;padding:16px;margin-bottom:14px;">' +
        '<div style="font-size:11px;font-weight:800;color:var(--mau-chu-de);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">' +
        '<i class="fas fa-door-open" style="margin-right:6px;"></i>Thông tin phòng' +
        '</div>' +
        '<div class="luoi-form-2" style="gap:10px;">' +
        taoTruong('Số phòng', nt.soPhong) +
        taoTruong('Giá phòng', nt.giaPhong) +
        taoTruong('Tiền điện', nt.tienDien) +
        taoTruong('Tiền nước', nt.tienNuoc) +
        taoTruong('Tiền rác', nt.tienRac) +
        '</div>' +
        '</div>' +
        '<div style="background:var(--mau-nen);border-radius:12px;padding:16px;">' +
        '<div style="font-size:11px;font-weight:800;color:#7c3aed;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">' +
        '<i class="fas fa-id-card" style="margin-right:6px;"></i>Thông tin cá nhân' +
        '</div>' +
        '<div class="luoi-form-2" style="gap:10px;">' +
        taoTruong('Họ và tên', nt.fullName) +
        taoTruong('CCCD', nt.email) +
        taoTruong('Số điện thoại', nt.sdt) +
        '</div>' +
        '</div>';
    document.getElementById('noi-dung-chi-tiet-nguoi-thue').innerHTML = html;
    moModal('modal-chi-tiet-nguoi-thue');
}
async function loadDanhSachNguoiThue() {
    try {
        const res = await fetch('/api/ChuTro/danh-sach-nguoi-thue');
        const data = await res.json();
        danhSachNguoiThue = data;
        renderDanhSachNguoiThue(danhSachNguoiThue); // cũ - render modal

        // ✅ THÊM DÒNG NÀY - render bảng trang QuanLyNguoiThue
        if (typeof ntNhanDuLieu === 'function') {
            ntNhanDuLieu(data);
        }
    } catch (err) {
        console.error('Lỗi load danh sách người thuê:', err);
    }
}
async function CapLaiMatKhau() {
    const phone = document.getElementById('phone-reset').value.trim();
    const newPw = document.getElementById('password-reset').value.trim();
    if (!phone || !newPw) {
        showToast('warn', 'Thiếu thông tin', 'Vui lòng nhập đủ số điện thoại và mật khẩu mới.');
        return;
    }
    dulieu = {
        SDTKhach: phone,
        NewPassword: newPw
    }
    try {
        let respone = await fetch('/api/ChuTroThemNguoiThue/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dulieu)
        });
        const data = await respone.json();
        if (respone.ok) {
            showToast('success', data.message);
            console.log(data.messgage);
            document.getElementById('phone-reset').value = '';
            document.getElementById('password-reset').value = '';
        }else {
            showToast('warn', data.message, "Vui lòng kiểm tra lại");
        }
    } catch (error) {
        showToast('fail', "Lỗi kết nối server","Kiểm tra lại kết nối");
    }
}
// Khởi tạo khi tải trang
document.addEventListener('DOMContentLoaded', function () {
    loadDanhSachNguoiThue();
});