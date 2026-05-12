var danhSachNguoiThue = [];
let phongAllData = [];
let phongCurFilter = 'all';
let phongSelectedId = null;
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


// ✅ Tách riêng hàm xử lý click
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
async function themNguoiThue() {
    const hoTen = document.getElementById('nt-hoten').value.trim();
    const soPhong = document.getElementById('nt-sophong').value.trim();
    const sdt = document.getElementById('nt-sdt').value.trim();
    const mk = document.getElementById('nt-matkhau').value.trim();
    const dienDauKy = document.getElementById('nt-dien-dau-ky').value.trim();
    const nuocDauKy = document.getElementById('nt-nuoc-dau-ky').value.trim();
    const username = document.getElementById('username-thue').value.trim();

    const duLieu = {
        hoTen: hoTen,
        soPhong: soPhong,
        sdt: sdt,
        matKhau: mk,
        dienDauKy: parseInt(dienDauKy) || 0,
        nuocDauKy: parseInt(nuocDauKy) || 0,
        username: username
    };
    let respone = await fetch('api/ChuTroThemNguoiThue')
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
        renderDanhSachNguoiThue(danhSachNguoiThue);
    } catch (err) {
        console.error('Lỗi load danh sách người thuê:', err);
    }
}
// Khởi tạo khi tải trang
document.addEventListener('DOMContentLoaded', function () {
    loadDanhSachNguoiThue();
});