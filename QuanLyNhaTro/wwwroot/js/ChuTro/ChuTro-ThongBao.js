function moModalThongBao() {
    // Set ngày giờ mặc định = hiện tại
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    document.getElementById('tb-ngay-gui').value =
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    // Reset form
    document.getElementById('tb-tieu-de').value = '';
    document.getElementById('tb-noi-dung').value = '';
    document.getElementById('tb-loai-nguoi-nhan').value = 'all';
    document.getElementById('tb-muc-do').value = 'thong-tin';
    document.getElementById('tb-chon-phong').style.display = 'none';
    document.getElementById('tb-chon-nguoi').style.display = 'none';
    tbCapNhatPreview('all');
    tbCapNhatMucDo('thong-tin');

    // Load dữ liệu dropdown
    tbTaiDanhSachPhong();
    tbTaiDanhSachNguoiThue();

    moModal('modal-chi-phi-dich-vu');
}

// Chuyển loại người nhận
function tbChuyenLoaiNguoiNhan(loai) {
    document.getElementById('tb-chon-phong').style.display = loai === 'phong' ? 'block' : 'none';
    document.getElementById('tb-chon-nguoi').style.display = loai === 'nguoi' ? 'block' : 'none';
    tbCapNhatPreview(loai);
}

// Cập nhật preview người nhận
function tbCapNhatPreview(loai) {
    const el = document.getElementById('tb-preview-nguoi-nhan');
    const txt = document.getElementById('tb-preview-text');
    el.style.display = 'block';
    if (loai === 'all') {
        txt.textContent = 'Sẽ gửi đến tất cả người thuê đang hoạt động.';
    } else if (loai === 'phong') {
        txt.textContent = 'Sẽ gửi đến người thuê của phòng được chọn.';
    } else {
        txt.textContent = 'Sẽ gửi đến người thuê được chọn.';
    }
}

// Cập nhật badge mức độ
function tbCapNhatMucDo(mucDo) {
    const badge = document.getElementById('tb-badge-muc-do');
    badge.className = '';
    const map = {
        'thong-tin': { cls: 'muc-thong-tin', text: '🔵 Thông tin thông thường' },
        'canh-bao': { cls: 'muc-canh-bao', text: '🟡 Quan trọng – Cần chú ý' },
        'khan-cap': { cls: 'muc-khan-cap', text: '🔴 Khẩn cấp – Xử lý ngay' },
        'he-thong': { cls: 'muc-thong-tin', text: '🔵 Thông tin thông thường' },
    };
    const m = map[mucDo] || map['thong-tin'];
    badge.className = m.cls;
    badge.textContent = m.text;
}

// Tải danh sách phòng vào <select>
async function tbTaiDanhSachPhong() {
    const sel = document.getElementById('tb-phong-id');
    try {
        const res = await fetch('/api/phong');
        if (!res.ok) throw new Error();
        const data = await res.json();
        sel.innerHTML = '<option value="">-- Chọn phòng --</option>' +
            data.map(p =>
                `<option value="${p.IDPhong}">Phòng ${p.SoPhong} – Tầng ${p.Tang} (${p.TrangThai})</option>`
            ).join('');
    } catch {
        sel.innerHTML = '<option value="">Không tải được danh sách phòng</option>';
    }
}

// Tải danh sách người thuê vào <select>
async function tbTaiDanhSachNguoiThue() {
    const sel = document.getElementById('tb-user-id');
    try {
        const res = await fetch('/api/account/tenants');
        if (!res.ok) throw new Error();
        const data = await res.json();
        sel.innerHTML = '<option value="">-- Chọn người thuê --</option>' +
            data.map(u =>
                `<option value="${u.IDUser}">${u.FullName} – ${u.Phone}</option>`
            ).join('');
    } catch {
        sel.innerHTML = '<option value="">Không tải được danh sách người thuê</option>';
    }
}

// Gửi thông báo
async function guiThongBao() {

    const tieuDe = document.getElementById('tb-tieu-de').value.trim();
    const noiDung = document.getElementById('tb-noi-dung').value.trim();
    const loai = document.getElementById('tb-loai-nguoi-nhan').value;
    const loaiTB = document.getElementById('tb-muc-do').value;
    const ngayGui = document.getElementById('tb-ngay-gui').value;

    if (!tieuDe) { showToast('warn', 'Thiếu thông tin', 'Vui lòng nhập tiêu đề thông báo.'); return; }
    if (!noiDung) { showToast('warn', 'Thiếu thông tin', 'Vui lòng nhập nội dung thông báo.'); return; }
    if (!ngayGui) { showToast('warn', 'Thiếu thông tin', 'Vui lòng chọn ngày gửi.'); return; }

    let idNguon = null, loaiNguon = 'HeThong', idUser = null;

    if (loai === 'phong') {
        idNguon = document.getElementById('tb-phong-id').value;
        loaiNguon = 'HeThong';
        if (!idNguon) { showToast('warn', 'Chưa chọn phòng', 'Vui lòng chọn phòng.'); return; }
    } else if (loai === 'nguoi') {
        idUser = document.getElementById('tb-user-id').value;
        if (!idUser) { showToast('warn', 'Chưa chọn người thuê', 'Vui lòng chọn người thuê.'); return; }
    }

    const body = {
        TieuDe: tieuDe,
        NoiDung: noiDung,
        LoaiTB: loaiTB,
        LoaiNguon: loaiNguon,
        IDNguonTB: idNguon ? parseInt(idNguon) : null,
        IDUser: idUser ? parseInt(idUser) : null,   // null = gửi tất cả
        LoaiGui: loai,   // "all" | "phong" | "nguoi"
        NgayGui: ngayGui
    };

    const btn = document.getElementById('tb-btn-gui');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';

    try {
        const res = await fetch('/api/thongbao/gui', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await res.json();
        if (!res.ok) {
            showToast('fail', 'Gửi thất bại', result.message || 'Có lỗi xảy ra, vui lòng thử lại.');
            return;
        }
        showToast('success', 'Gửi thành công', result.message || 'Thông báo đã được gửi đến người thuê.');
        dongModal('modal-chi-phi-dich-vu');
    } catch {
        showToast('fail', 'Gửi thất bại', 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi thông báo';
    }
}