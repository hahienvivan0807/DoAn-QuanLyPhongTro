function dongModalNhapNgoai(event, id) {
    if (event.target === document.getElementById(id)) dongModal(id);
}

// ── LỌC DANH SÁCH PHÒNG ──
// ── LỌC DANH SÁCH PHÒNG ──
function locDanhSachPhong() {
    const tuKhoa = document.getElementById('tim-phong-input').value.toLowerCase().trim();
    const tt = document.getElementById('loc-trang-thai').value;
    const tang = document.getElementById('loc-tang').value;
    const rows = Array.from(document.querySelectorAll('#tbody-phong tr'));

    // Bước 1: Hiện toàn bộ (xóa filter phân trang), giữ display=none của lọc sẽ set lại
    rows.forEach(row => { delete row.dataset.phanTrang; row.style.display = ''; });

    // Bước 2: Áp dụng bộ lọc tìm kiếm
    let soHienThi = 0;
    rows.forEach(row => {
        const soPhong = row.dataset.soPhong || '';
        const trangThai = row.dataset.trangThai || '';
        const tangRow = row.dataset.tang || '';
        const khopTu = !tuKhoa || soPhong.includes(tuKhoa);
        const khopTT = !tt || trangThai === tt;
        const khopTang = !tang || tangRow === tang;
        if (khopTu && khopTT && khopTang) { soHienThi++; }
        else row.style.display = 'none';
    });

    document.getElementById('so-ket-qua').textContent = soHienThi + ' phòng';
    document.getElementById('bang-rong').style.display = soHienThi === 0 ? 'block' : 'none';

    // Bước 3: Cập nhật cache rows đã lọc rồi reset về trang 1
    rowsLocGlobal = rows.filter(r => r.style.display !== 'none');
    denTrang(1);
}

// ── PHÂN TRANG ──
// rowsLocGlobal: cache danh sách rows qua bộ lọc (không ẩn bởi phân trang)
let trangHienTai = 1;
const soPhongMotTrang = @Model.SoPhongMotTrang;
let rowsLocGlobal = [];   // được set bởi locDanhSachPhong() hoặc khi init

function chuyenTrang(buoc) { denTrang(trangHienTai + buoc); }

function denTrang(trang) {
    // rowsLocGlobal phải được cập nhật trước khi gọi hàm này.
    // Nếu chưa có (lần đầu), lấy toàn bộ rows.
    if (rowsLocGlobal.length === 0) {
        rowsLocGlobal = Array.from(document.querySelectorAll('#tbody-phong tr'));
    }

    const tongTrang = Math.max(1, Math.ceil(rowsLocGlobal.length / soPhongMotTrang));
    trangHienTai = Math.max(1, Math.min(trang, tongTrang));

    const batDau = (trangHienTai - 1) * soPhongMotTrang;
    const ketThuc = batDau + soPhongMotTrang;

    // Ẩn toàn bộ rows (kể cả không trong bộ lọc)
    document.querySelectorAll('#tbody-phong tr').forEach(r => r.style.display = 'none');

    // Hiện đúng rows của trang hiện tại
    rowsLocGlobal.forEach((row, idx) => {
        row.style.display = (idx >= batDau && idx < ketThuc) ? '' : 'none';
    });

    // Cập nhật text info
    const soHienThiTrang = Math.min(soPhongMotTrang, rowsLocGlobal.length - batDau);
    const tuSo = rowsLocGlobal.length === 0 ? 0 : batDau + 1;
    const denSo = batDau + soHienThiTrang;
    document.getElementById('phan-trang-info').textContent =
        `Hiển thị ${tuSo} – ${denSo} / ${rowsLocGlobal.length} phòng`;

    // Cập nhật nút số trang: xóa cũ rồi tạo mới
    const nhom = document.getElementById('nhom-nut-trang');
    nhom.querySelectorAll(':not(#nut-trang-truoc):not(#nut-trang-tiep)').forEach(el => el.remove());

    const nutTiep = document.getElementById('nut-trang-tiep');
    phanTrangSo(trangHienTai, tongTrang).forEach(item => {
        if (item === '...') {
            const span = document.createElement('span');
            span.textContent = '…';
            span.style.cssText = 'padding:0 4px;color:var(--mau-chu-phu);font-size:13px;align-self:center;';
            nhom.insertBefore(span, nutTiep);
        } else {
            const btn = document.createElement('button');
            btn.className = 'nut-trang' + (item === trangHienTai ? ' hien-tai' : '');
            btn.textContent = item;
            btn.onclick = () => denTrang(item);
            nhom.insertBefore(btn, nutTiep);
        }
    });

    // Trạng thái nút prev / next
    document.getElementById('nut-trang-truoc').disabled = trangHienTai <= 1;
    document.getElementById('nut-trang-tiep').disabled = trangHienTai >= tongTrang;
}

// Sinh danh sách số trang có dấu "..."
function phanTrangSo(hienTai, tongTrang) {
    if (tongTrang <= 7) return Array.from({ length: tongTrang }, (_, i) => i + 1);
    const ds = [];
    if (hienTai <= 4) {
        for (let i = 1; i <= 5; i++) ds.push(i);
        ds.push('...'); ds.push(tongTrang);
    } else if (hienTai >= tongTrang - 3) {
        ds.push(1); ds.push('...');
        for (let i = tongTrang - 4; i <= tongTrang; i++) ds.push(i);
    } else {
        ds.push(1); ds.push('...');
        ds.push(hienTai - 1); ds.push(hienTai); ds.push(hienTai + 1);
        ds.push('...'); ds.push(tongTrang);
    }
    return ds;
}

// ── CHỌN TRẠNG THÁI MODAL ──
function chonTrangThai(gt, loai) {
    document.getElementById(loai + '-trang-thai').value = gt;
    const nhom = document.querySelectorAll('#modal-' + (loai === 'them' ? 'them' : 'sua') + '-phong .nut-chon-tt');
    nhom.forEach(n => n.classList.remove('chon-trong', 'chon-da-thue', 'chon-dang-sua'));
    const mapClass = { 'Trống': 'chon-trong', 'Đã thuê': 'chon-da-thue', 'Đang sửa': 'chon-dang-sua' };
    event.currentTarget.classList.add(mapClass[gt] || 'chon-trong');
}

// ── MODAL THÊM PHÒNG ──
function moModalThemPhong() {
    ['them-so-phong', 'them-dien-tich', 'them-gia-phong', 'them-mo-ta'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('them-so-luong').value = 1;
    document.getElementById('them-tang').value = 1;
    document.getElementById('them-trang-thai').value = 'Trống';
    const nhom = document.querySelectorAll('#modal-them-phong .nut-chon-tt');
    nhom.forEach(n => n.classList.remove('chon-trong', 'chon-da-thue', 'chon-dang-sua'));
    nhom[0].classList.add('chon-trong');
    moModal('modal-them-phong');
}

function xacNhanThemPhong() {
    const soPhong = document.getElementById('them-so-phong').value.trim();
    const tang = parseInt(document.getElementById('them-tang').value);
    const soLuong = parseInt(document.getElementById('them-so-luong').value) || 1;
    const dienTich = document.getElementById('them-dien-tich').value;
    const giaPhong = parseFloat(document.getElementById('them-gia-phong').value);
    const trangThai = document.getElementById('them-trang-thai').value;
    const moTa = document.getElementById('them-mo-ta').value.trim();
    if (!soPhong) { hienThiThongBao('Vui lòng nhập số phòng!', 'canh-bao'); return; }
    if (!tang || tang < 1 || tang > 20) { hienThiThongBao('Tầng phải từ 1 đến 20!', 'canh-bao'); return; }
    if (!soLuong || soLuong < 1) { hienThiThongBao('Số lượng người ở phải ít nhất là 1!', 'canh-bao'); return; }
    if (!giaPhong || giaPhong < 0) { hienThiThongBao('Vui lòng nhập giá phòng hợp lệ!', 'canh-bao'); return; }
    fetch('?handler=ThemPhong', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value || ''
        },
        body: JSON.stringify({ soPhong, tang, soLuong, dienTich: dienTich ? parseFloat(dienTich) : null, giaPhongFix: giaPhong, trangThai, moTa: moTa || null })
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) { hienThiThongBao('Thêm phòng ' + soPhong + ' thành công!', 'thanh-cong'); dongModal('modal-them-phong'); setTimeout(() => location.reload(), 900); }
            else hienThiThongBao(data.message || 'Có lỗi xảy ra!', 'loi');
        })
        .catch(() => hienThiThongBao('Lỗi kết nối máy chủ!', 'loi'));
}

// ── MODAL SỬA PHÒNG ──
const danhSachPhongData = @Html.Raw(Model.DanhSachPhongJson);
let idPhongHienTai = null;

function moModalSuaPhong(idPhong) {
    const phong = danhSachPhongData.find(p => p.idPhong === idPhong);
    if (!phong) return;
    idPhongHienTai = idPhong;
    document.getElementById('sua-id-phong').value = idPhong;
    document.getElementById('sua-so-phong').value = phong.soPhong;
    document.getElementById('sua-tang').value = phong.tang;
    document.getElementById('sua-so-luong').value = phong.soLuong ?? 1;
    document.getElementById('sua-dien-tich').value = phong.dienTich ?? '';
    document.getElementById('sua-gia-phong').value = phong.giaPhongFix;
    document.getElementById('sua-trang-thai').value = phong.trangThai;
    document.getElementById('sua-mo-ta').value = phong.moTa ?? '';
    document.getElementById('sua-phu-tieu-de').textContent = 'Phòng ' + phong.soPhong;
    const mapId = { 'Trống': 'sua-tt-trong', 'Đã thuê': 'sua-tt-da-thue', 'Đang sửa': 'sua-tt-dang-sua' };
    const mapCls = { 'Trống': 'chon-trong', 'Đã thuê': 'chon-da-thue', 'Đang sửa': 'chon-dang-sua' };
    ['sua-tt-trong', 'sua-tt-da-thue', 'sua-tt-dang-sua'].forEach(id => document.getElementById(id).classList.remove('chon-trong', 'chon-da-thue', 'chon-dang-sua'));
    const nutId = mapId[phong.trangThai];
    if (nutId) document.getElementById(nutId).classList.add(mapCls[phong.trangThai]);
    moModal('modal-sua-phong');
}

function xacNhanSuaPhong() {
    const idPhong = parseInt(document.getElementById('sua-id-phong').value);
    const soPhong = document.getElementById('sua-so-phong').value.trim();
    const tang = parseInt(document.getElementById('sua-tang').value);
    const soLuong = parseInt(document.getElementById('sua-so-luong').value) || 1;
    const dienTich = document.getElementById('sua-dien-tich').value;
    const giaPhong = parseFloat(document.getElementById('sua-gia-phong').value);
    const trangThai = document.getElementById('sua-trang-thai').value;
    const moTa = document.getElementById('sua-mo-ta').value.trim();
    if (!soPhong) { hienThiThongBao('Vui lòng nhập số phòng!', 'canh-bao'); return; }
    if (!tang || tang < 1 || tang > 20) { hienThiThongBao('Tầng phải từ 1 đến 20!', 'canh-bao'); return; }
    if (!soLuong || soLuong < 1) { hienThiThongBao('Số lượng người ở phải ít nhất là 1!', 'canh-bao'); return; }
    if (!giaPhong || giaPhong < 0) { hienThiThongBao('Vui lòng nhập giá phòng hợp lệ!', 'canh-bao'); return; }

    // Lưu trạng thái cũ để so sánh sau khi lưu
    const phongCu = danhSachPhongData.find(p => p.idPhong === idPhong);
    const trangThaiCu = phongCu?.trangThai;

    fetch('?handler=SuaPhong', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value || ''
        },
        body: JSON.stringify({ idPhong, soPhong, tang, soLuong, dienTich: dienTich ? parseFloat(dienTich) : null, giaPhongFix: giaPhong, trangThai, moTa: moTa || null })
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                // ── Cập nhật dữ liệu local ngay lập tức ──
                if (phongCu) {
                    phongCu.soPhong = soPhong;
                    phongCu.tang = tang;
                    phongCu.soLuong = soLuong;
                    phongCu.dienTich = dienTich ? parseFloat(dienTich) : null;
                    phongCu.giaPhongFix = giaPhong;
                    phongCu.trangThai = trangThai;
                    phongCu.moTa = moTa || null;
                    // Nếu chuyển sang Trống → xóa thông tin người thuê trong local data
                    if (trangThaiCu !== 'Trống' && trangThai === 'Trống') {
                        phongCu.tenNguoiThue = null;
                        phongCu.sdtNguoiThue = null;
                    }
                }

                // ── Cập nhật dòng trong bảng DOM ──
                capNhatDongBang(idPhong, soPhong, tang, soLuong, dienTich, giaPhong, trangThai, trangThaiCu);

                hienThiThongBao('Cập nhật phòng ' + soPhong + ' thành công!', 'thanh-cong');
                dongModal('modal-sua-phong');
            } else {
                hienThiThongBao(data.message || 'Có lỗi xảy ra!', 'loi');
            }
        })
        .catch(() => hienThiThongBao('Lỗi kết nối máy chủ!', 'loi'));
}

// ── Cập nhật DOM dòng bảng sau khi sửa phòng ──
function capNhatDongBang(idPhong, soPhong, tang, soLuong, dienTich, giaPhong, trangThai, trangThaiCu) {
    // Tìm row dựa vào nút sửa có idPhong tương ứng
    const nutSua = document.querySelector(`#tbody-phong button[onclick*="moModalSuaPhong(${idPhong})"]`);
    if (!nutSua) return;
    const row = nutSua.closest('tr');
    if (!row) return;

    // Cập nhật data attribute để bộ lọc hoạt động đúng
    row.dataset.soPhong = soPhong.toLowerCase();
    row.dataset.trangThai = trangThai;
    row.dataset.tang = tang;

    const cells = row.querySelectorAll('td');

    // Cột 0: Số phòng
    cells[0].querySelector('.ten-phong-noi-bat').textContent = soPhong;

    // Cột 1: Tầng
    cells[1].querySelector('span').textContent = 'Tầng ' + tang;

    // Cột 2: Diện tích
    cells[2].innerHTML = dienTich
        ? `<span>${parseFloat(dienTich).toFixed(1)} m²</span>`
        : `<span style="color:var(--mau-chu-phu);font-style:italic;">—</span>`;

    // Cột 3: Giá cố định
    cells[3].querySelector('.gia-phong-hien').textContent = new Intl.NumberFormat('vi-VN').format(giaPhong) + ' ₫';

    // Cột 4: Trạng thái
    const mapCss = { 'Trống': 'tt-trong', 'Đã thuê': 'tt-da-thue', 'Đang sửa': 'tt-dang-sua' };
    const ttSpan = cells[4].querySelector('.trang-thai-phong');
    ttSpan.className = 'trang-thai-phong ' + (mapCss[trangThai] || 'tt-trong');
    ttSpan.textContent = trangThai;

    // Cột 5: Số người ở
    if (trangThai === 'Trống') {
        cells[5].innerHTML = `<span style="color:var(--mau-chu-phu);font-size:12px;font-style:italic;">— Không có người ở —</span>`;
    } else {
        cells[5].innerHTML = `<span style="display:inline-flex;align-items:center;gap:5px;font-weight:700;font-size:13px;color:var(--mau-chu);">
        <i class="fas fa-users" style="color:var(--mau-chu-phu);font-size:11px;"></i>
        ${soLuong} người
        </span>`;
    }

    // Cột 6: Người thuê hiện tại
    // Nếu chuyển sang Trống → xóa thông tin người thuê
    if (trangThaiCu !== 'Trống' && trangThai === 'Trống') {
        cells[6].innerHTML = `<span style="color:var(--mau-chu-phu);font-size:12px;font-style:italic;">— Chưa có người thuê —</span>`;
    }

    // Cột 8: Nút thao tác — ẩn/hiện nút xóa
    const nhomNut = cells[8].querySelector('.nhom-nut-bang');
    let nutXoa = nhomNut.querySelector('.nut-hanh-dong-bang.xoa');
    if (trangThai !== 'Đã thuê') {
        if (!nutXoa) {
            nutXoa = document.createElement('button');
            nutXoa.className = 'nut-hanh-dong-bang xoa';
            nutXoa.title = 'Xóa phòng';
            nutXoa.innerHTML = '<i class="fas fa-trash"></i>';
            nutXoa.setAttribute('onclick', `moModalXoaPhong(${idPhong}, '${soPhong}')`);
            nhomNut.appendChild(nutXoa);
        }
    } else {
        nutXoa?.remove();
    }
}

// ── MODAL XÓA PHÒNG ──
function moModalXoaPhong(idPhong, soPhong) {
    idPhongHienTai = idPhong;
    document.getElementById('xoa-id-phong').value = idPhong;
    document.getElementById('xoa-ten-phong').textContent = soPhong;
    moModal('modal-xoa-phong');
}

function xacNhanXoaPhong() {
    const idPhong = parseInt(document.getElementById('xoa-id-phong').value);
    fetch('?handler=XoaPhong', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value || ''
        },
        body: JSON.stringify({ idPhong })
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) { hienThiThongBao('Đã xóa phòng thành công!', 'thanh-cong'); dongModal('modal-xoa-phong'); setTimeout(() => location.reload(), 900); }
            else hienThiThongBao(data.message || 'Không thể xóa phòng này!', 'loi');
        })
        .catch(() => hienThiThongBao('Lỗi kết nối máy chủ!', 'loi'));
}

// ── MODAL CHI TIẾT PHÒNG ──
function moModalChiTietPhong(idPhong) {
    const phong = danhSachPhongData.find(p => p.idPhong === idPhong);
    if (!phong) return;
    idPhongHienTai = idPhong;

    document.getElementById('cdt-ten-phong').textContent = 'Phòng ' + phong.soPhong;
    document.getElementById('cdt-trang-thai-header').textContent = phong.trangThai;
    document.getElementById('cdt-so-phong').textContent = phong.soPhong;
    document.getElementById('cdt-tang').textContent = 'Khu ' + phong.khu;
    document.getElementById('cdt-so-luong').textContent = phong.trangThai === 'Trống' ? '— Không có người ở —' : (phong.soLuong ?? 1) + ' người';
    document.getElementById('cdt-dien-tich').textContent = phong.dienTich ? phong.dienTich.toFixed(1) + ' m²' : '— Chưa cập nhật —';
    document.getElementById('cdt-gia-phong').textContent = new Intl.NumberFormat('vi-VN').format(phong.giaPhongFix) + ' ₫';
    document.getElementById('cdt-ngay-tao').textContent = phong.createdAt;
    document.getElementById('cdt-mo-ta').textContent = phong.moTa || '— Chưa có mô tả —';

    const container = document.getElementById('cdt-nguoi-thue-container');
    const khach = phong.danhSachKhachO;

    if (khach && khach.length > 0) {
        container.innerHTML = khach.map(k => {
            const mauAvatar = k.isChinhChu
                ? 'linear-gradient(135deg,var(--mau-xanh-bien),#60a5fa)'
                : 'linear-gradient(135deg,var(--mau-xanh),#34d399)';
            const nhanQuanHe = k.isChinhChu
                ? `<span class="trang-thai-phong tt-da-thue">Chính chủ</span>`
                : `<span style="font-size:10.5px;color:var(--mau-chu-phu);">${k.quanHe || 'Người ở ghép'}</span>`;
            return `
            <div class="khung-nguoi-thue" style="margin-bottom:8px;">
                <div class="anh-nguoi-thue" style="background:${mauAvatar}">${k.hoTen[0]}</div>
                <div class="thong-tin-nguoi-thue">
                    <div class="ten-nguoi-thue">${k.hoTen}</div>
                    <div class="phu-nguoi-thue">
                        <i class="fas fa-phone" style="width:12px;margin-right:4px;"></i>${k.sdt || '—'}
                    </div>
                </div>
                ${nhanQuanHe}
            </div>`;
        }).join('');
    } else {
        container.innerHTML = `
        <div class="trong-phong-hint">
            <i class="fas fa-user-slash"></i>
            Phòng hiện chưa có người thuê
        </div>`;
    }

    moModal('modal-chi-tiet-phong');
}

function chuyenSangSuaTuChiTiet() {
    dongModal('modal-chi-tiet-phong');
    moModalSuaPhong(idPhongHienTai);
}

function chuyenSangSuaTuChiTiet() {
    dongModal('modal-chi-tiet-phong');
    moModalSuaPhong(idPhongHienTai);
}

function chuyenSangSuaTuChiTiet() {
    dongModal('modal-chi-tiet-phong');
    moModalSuaPhong(idPhongHienTai);
}

// ── TOAST ──
function hienThiThongBao(noiDung, loai) {
    if (typeof toastQuickShow === 'function') { toastQuickShow(noiDung, loai); return; }
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const mauMap = { 'thanh-cong': '#059669', 'loi': '#dc2626', 'canh-bao': '#d97706', 'thong-tin': '#2563eb' };
    const iconMap = { 'thanh-cong': 'fa-check-circle', 'loi': 'fa-times-circle', 'canh-bao': 'fa-exclamation-triangle', 'thong-tin': 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.style.cssText = `display:flex;align-items:center;gap:10px;padding:12px 16px;background:#fff;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,0.14);border-left:4px solid ${mauMap[loai] || '#2563eb'};min-width:260px;font-size:13px;font-family:'Be Vietnam Pro',sans-serif;`;
    toast.innerHTML = `<i class="fas ${iconMap[loai] || 'fa-info-circle'}" style="color:${mauMap[loai]};font-size:15px;flex-shrink:0;"></i><span>${noiDung}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ── LOAD PROFILE từ API (đồng bộ ChuTro-core.js) ──
async function HienThiProfile() {
    try {
        const res = await fetch('/api/ChuTro/Profile');
        const dulieu = await res.json();
        const adminHeader = document.querySelector('.ten-admin-header');
        if (adminHeader) adminHeader.textContent = dulieu.fullName;
        const tenChuEl = document.querySelector('.ten-chu-strong');
        if (tenChuEl) tenChuEl.textContent = dulieu.fullName;
        const emailEl = document.getElementById('dd-email');
        if (emailEl) emailEl.textContent = dulieu.email ?? 'Chưa cập nhật';
        const avatarEls = document.querySelectorAll('.anh-chu-tro, .anh-dai-dien-header, .add-header-avatar');
        avatarEls.forEach(el => { if (dulieu.fullName) el.textContent = dulieu.fullName[0].toUpperCase(); });
    } catch (e) {
        console.error('Lỗi load profile:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    HienThiProfile();
    rowsLocGlobal = Array.from(document.querySelectorAll('#tbody-phong tr'));
    denTrang(1);  // Khởi tạo phân trang khi tải trang
});