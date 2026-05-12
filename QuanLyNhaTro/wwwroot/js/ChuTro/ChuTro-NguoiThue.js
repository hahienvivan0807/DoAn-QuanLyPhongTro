var danhSachNguoiThue = [];

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