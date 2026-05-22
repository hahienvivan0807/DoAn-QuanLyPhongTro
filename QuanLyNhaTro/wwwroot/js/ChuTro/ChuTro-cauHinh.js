// ── Biến trạng thái ──
let chgActiveTab = 'dv';
let chgSelectedRoomId = null;
let chgRoomFilter = 'all';

// ── Các hàm modal cũ (giữ lại) ──
function luuCauHinhGia() {
    hienThongBao('Đã cập nhật bảng giá thuê mặc định!', 'thanh-cong');
    dongModal('modal-cau-hinh-gia');
}
function luuCauHinhDichVu() {
    hienThongBao('Đã cập nhật chi phí dịch vụ!', 'thanh-cong');
    dongModal('modal-chi-phi-dich-vu');
}
function luuQuyDinhDatCoc() {
    hienThongBao('Đã cập nhật quy định đặt cọc!', 'thanh-cong');
    dongModal('modal-dat-coc');
}
function xuatBaoCao() {
    hienThongBao('Đang tạo file PDF báo cáo tháng 5/2025...', 'info');
    setTimeout(() => dongModal('modal-bao-cao-chi-tiet'), 1200);
}

// ── Mở / Đóng modal config giá v2 ──

// ── Chuyển tab (CHỈ 1 lần khai báo) ──
window.chgSwitch = function (tab) {
    chgActiveTab = tab;
    document.getElementById('chg-tab-dv').classList.toggle('active', tab === 'dv');
    document.getElementById('chg-tab-phong').classList.toggle('active', tab === 'phong');
    document.getElementById('chg-panel-dv').classList.toggle('show', tab === 'dv');
    document.getElementById('chg-panel-phong').classList.toggle('show', tab === 'phong');
    document.getElementById('chg-btn-label').textContent =
        tab === 'dv' ? 'Xác nhận thay đổi' : 'Lưu thông tin phòng';
};

// ── Toggle dropdown phòng ──
async function toggleRoomChg() {
    const panel = document.getElementById('chgRoomPanel');
    const btn   = document.getElementById('chgRoomBtn');
    const isOpen = panel.classList.contains('open');

    panel.classList.toggle('open', !isOpen);
    btn.classList.toggle('open-state', !isOpen);

    if (!isOpen) {
        document.getElementById('chgRpList').innerHTML =
            `<div style="text-align:center;padding:20px;color:#9ca3af;font-size:12px;">
                <i class="fas fa-spinner fa-spin"></i> Đang tải...
            </div>`;
        try {
            const res = await fetch('/api/ChuTro/DanhSachPhong');
            phongAllData = await res.json();
            chgRenderRooms();
        } catch {
            document.getElementById('chgRpList').innerHTML =
                `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">
                    <i class="fas fa-exclamation-circle"></i> Lỗi kết nối API
                </div>`;
        }
    }
}

// ── Render danh sách phòng ──
function chgRenderRooms() {
    const list = document.getElementById('chgRpList');
    const q    = (document.getElementById('chg-rp-q')?.value || '').trim().toLowerCase();

    let data = phongAllData;
    if (chgRoomFilter !== 'all') data = data.filter(p => p.trangThai === chgRoomFilter);
    if (q) data = data.filter(p =>
        String(p.soPhong || '').toLowerCase().includes(q) ||
        String(p.tang    || '').toLowerCase().includes(q)
    );

    if (!data.length) {
        list.innerHTML = `<div style="text-align:center;padding:20px;color:#9ca3af;font-size:12px;">Không tìm thấy phòng</div>`;
        return;
    }

    const badgeMap = {
        'Trống':    `<span class="bdg b-empty">Trống</span>`,
        'Đã thuê':  `<span class="bdg b-rented">Đã thuê</span>`,
        'Đang sửa': `<span class="bdg b-repair">Đang sửa</span>`,
    };

    list.innerHTML = data.map(p => `
        <div class="rpc-row ${p.idPhong === chgSelectedRoomId ? 'sel' : ''}"
             data-id="${p.idPhong}" data-sophong="${p.soPhong}"
             data-tang="${p.tang}"  data-dientich="${p.dienTich}"
             data-gia="${p.giaPhongFix ?? 0}" data-trangthai="${p.trangThai}"
             data-mota="${p.moTa ?? ''}"
             onclick="handleSelectRoomChg(this)">
            <div>
                <div class="rpc-num">Phòng ${p.soPhong} · Tầng ${p.tang}</div>
                <div class="rpc-sub">${p.dienTich} m² · ${Number(p.giaPhongFix||0).toLocaleString('vi-VN')} đ/tháng</div>
            </div>
            ${badgeMap[p.trangThai] || ''}
        </div>`
    ).join('');
}

// ── Chọn phòng ──
function handleSelectRoomChg(el) {
    chgSelectedRoomId = Number(el.dataset.id);

    const btn = document.getElementById('chgRoomBtn');
    btn.textContent = `✓ Phòng ${el.dataset.sophong} đã chọn`;
    btn.classList.add('picked');

    document.getElementById('phong-so').value         = el.dataset.sophong;
    document.getElementById('phong-tang').value       = el.dataset.tang;
    document.getElementById('phong-trang-thai').value = el.dataset.trangthai;
    document.getElementById('phong-dien-tich').value  = el.dataset.dientich;
    document.getElementById('phong-gia-fix').value    = el.dataset.gia || '';
    document.getElementById('phong-mo-ta').value      = el.dataset.mota || '';

    const fields = document.getElementById('chg-phong-fields');
    fields.classList.remove('unlocked', 'locked');
    fields.querySelectorAll('.inp').forEach(i => i.disabled = false);
    document.getElementById('chg-phong-hint').style.display = 'none';
    requestAnimationFrame(() => requestAnimationFrame(() => fields.classList.add('unlocked')));

    document.getElementById('chgRoomPanel').classList.remove('open');
    btn.classList.remove('open-state');
    chgRenderRooms();
}

// ── Filter phòng ──
function chgSetFilter(f) {
    chgRoomFilter = f;
    chgRenderRooms();
}

// ── Điều phối submit ──
window.chgSubmit = () => chgActiveTab === 'dv' ? chgSubmitDichVu() : chgSubmitPhong();

function chgSubmitDichVu() {
    const ma    = document.getElementById('dv-ma').value.trim();
    const ten   = document.getElementById('dv-ten').value.trim();
    const gia   = document.getElementById('dv-gia').value;
    const donvi = document.getElementById('dv-donvi').value;

    if (!ma || !ten || !gia || !donvi) {
        showToast('warn', 'Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin dịch vụ!');
        return;
    }
    // TODO: fetch POST /api/CauHinh/them-dich-vu
    showToast('success', 'Đã lưu', `Cập nhật dịch vụ "${ten}" thành công!`);
}

async function chgSubmitPhong() {
    if (!chgSelectedRoomId) {
        showToast('warn', 'Chưa chọn phòng', 'Vui lòng chọn phòng trước khi lưu!');
        return;
    }

    const duLieu = {
        IdPhong:     chgSelectedRoomId,
        SoPhong:     document.getElementById('phong-so').value.trim(),
        Tang:        Number(document.getElementById('phong-tang').value),
        TrangThai:   document.getElementById('phong-trang-thai').value,
        DienTich:    Number(document.getElementById('phong-dien-tich').value),
        GiaPhongFix: Number(document.getElementById('phong-gia-fix').value) || null,
        MoTa:        document.getElementById('phong-mo-ta').value.trim(),
    };

    if (!duLieu.SoPhong || !duLieu.Tang || !duLieu.DienTich) {
        showToast('warn', 'Thiếu thông tin', 'Số phòng, tầng và diện tích là bắt buộc!');
        return;
    }

    try {
        const res  = await fetch(`/api/ChuTro/cap-nhat-phong/${chgSelectedRoomId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(duLieu)
        });
        const data = await res.json();

        if (res.ok) {
            showToast('success', 'Đã lưu', `Phòng ${duLieu.SoPhong} cập nhật thành công!`);
            phongAllData = await (await fetch('/api/ChuTro/DanhSachPhong')).json();
            chgRenderRooms();
        } else {
            showToast('fail', 'Lỗi', data.message || 'Cập nhật thất bại!');
        }
    } catch {
        showToast('fail', 'Lỗi kết nối', 'Không thể kết nối máy chủ!');
    }
}