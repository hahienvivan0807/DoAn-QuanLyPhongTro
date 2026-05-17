/**
 * ================================================================
 *  ChuTro-NguoiThue.js
 *  Phân hệ Quản lý Người Thuê
 *  Mapping: KHACH_THUE + ACCOUNT + PHONG + HOPDONG
 * ================================================================
 */

'use strict';

/* ================================================================
   STATE
================================================================ */
const NT = {
    duLieu: [],          // Toàn bộ dữ liệu gốc từ API
    duLieuLoc: [],       // Dữ liệu sau khi lọc/tìm kiếm
    trangHienTai: 1,
    soTrangMoiTrang: 10,
    sapXepTheo: 'NgayVaoO',
    sapXepTangDan: false,
    viewHienTai: 'table',  // 'table' | 'grid'
    dangTai: false,
    idDangXoa: null,

    // Danh sách phòng (dùng cho dropdown chọn phòng)
    danhSachPhong: [],
};

/* ================================================================
   MOCK DATA — Xóa khi tích hợp API thật
   Mapping với KHACH_THUE + ACCOUNT + PHONG
================================================================ */
const NT_MOCK_DATA = [
    {
        IDKhachThue: 1, IDUser: 10,
        HoTen: 'Nguyễn Văn An', SoDienThoai: '0912 345 678',
        Email: 'nguyenvanan@gmail.com', SoCCCD: '012345678901',
        NgaySinh: '1995-03-15', GioiTinh: 'Nam',
        QueQuan: 'Cần Thơ', DiaChiThuongTru: '12 Trần Hưng Đạo, Ninh Kiều, Cần Thơ',
        AnhChanDung: null, GhiChu: '',
        NgayVaoO: '2024-01-10', TrangThai: 'dang-o',
        SoPhong: '101', IDPhong: 1,
        Username: 'nguyenvanan',
    },
    {
        IDKhachThue: 2, IDUser: 11,
        HoTen: 'Trần Thị Bích', SoDienThoai: '0987 654 321',
        Email: 'tranbich@gmail.com', SoCCCD: '056789012345',
        NgaySinh: '1998-07-20', GioiTinh: 'Nữ',
        QueQuan: 'Vĩnh Long', DiaChiThuongTru: '45 Nguyễn Trãi, TP. Vĩnh Long',
        AnhChanDung: null, GhiChu: 'Sinh viên ĐH Cần Thơ',
        NgayVaoO: '2024-03-01', TrangThai: 'dang-o',
        SoPhong: '102', IDPhong: 2,
        Username: 'tranbich98',
    },
    {
        IDKhachThue: 3, IDUser: 12,
        HoTen: 'Lê Hoàng Phúc', SoDienThoai: '0901 111 222',
        Email: '', SoCCCD: '079123456789',
        NgaySinh: '1993-11-05', GioiTinh: 'Nam',
        QueQuan: 'Kiên Giang', DiaChiThuongTru: '',
        AnhChanDung: null, GhiChu: 'Đã trả phòng tháng 4/2025',
        NgayVaoO: '2023-06-15', TrangThai: 'da-roi',
        SoPhong: '201', IDPhong: 3,
        Username: 'hoangphuc93',
    },
    {
        IDKhachThue: 4, IDUser: 13,
        HoTen: 'Phạm Thị Cẩm Tú', SoDienThoai: '0933 789 000',
        Email: 'camtu@yahoo.com', SoCCCD: '001234567890',
        NgaySinh: '2000-01-25', GioiTinh: 'Nữ',
        QueQuan: 'Hậu Giang', DiaChiThuongTru: '78 Lý Tự Trọng, Vị Thanh, Hậu Giang',
        AnhChanDung: null, GhiChu: '',
        NgayVaoO: '2025-01-05', TrangThai: 'dang-o',
        SoPhong: '202', IDPhong: 4,
        Username: 'camtu2000',
    },
    {
        IDKhachThue: 5, IDUser: 14,
        HoTen: 'Võ Minh Khoa', SoDienThoai: '0972 456 789',
        Email: 'vmkhoa@gmail.com', SoCCCD: '087654321098',
        NgaySinh: '1990-08-30', GioiTinh: 'Nam',
        QueQuan: 'An Giang', DiaChiThuongTru: '23 Trần Phú, Long Xuyên, An Giang',
        AnhChanDung: null, GhiChu: 'Nhân viên văn phòng',
        NgayVaoO: '2024-09-20', TrangThai: 'dang-o',
        SoPhong: '301', IDPhong: 5,
        Username: 'vmkhoa90',
    },
    {
        IDKhachThue: 6, IDUser: 15,
        HoTen: 'Bùi Thị Lan', SoDienThoai: '0909 222 333',
        Email: 'builan@gmail.com', SoCCCD: '091234567801',
        NgaySinh: '1997-04-12', GioiTinh: 'Nữ',
        QueQuan: 'Sóc Trăng', DiaChiThuongTru: '',
        AnhChanDung: null, GhiChu: '',
        NgayVaoO: '2024-11-15', TrangThai: 'dang-o',
        SoPhong: '302', IDPhong: 6,
        Username: 'builan97',
    },
    {
        IDKhachThue: 7, IDUser: 16,
        HoTen: 'Đặng Quốc Hưng', SoDienThoai: '0868 111 444',
        Email: '', SoCCCD: '038901234567',
        NgaySinh: '1988-12-01', GioiTinh: 'Nam',
        QueQuan: 'Đồng Tháp', DiaChiThuongTru: '5 Nguyễn Huệ, Cao Lãnh, Đồng Tháp',
        AnhChanDung: null, GhiChu: 'Hết hợp đồng tháng 2/2025',
        NgayVaoO: '2023-02-01', TrangThai: 'da-roi',
        SoPhong: '401', IDPhong: 7,
        Username: 'dqhung88',
    },
];

const NT_MOCK_ROOMS = [
    { IDPhong: 8, SoPhong: '401', TrangThai: 'Trống', GiaPhongFix: 2500000, DienTich: 22 },
    { IDPhong: 9, SoPhong: '402', TrangThai: 'Trống', GiaPhongFix: 2800000, DienTich: 25 },
    { IDPhong: 10, SoPhong: '501', TrangThai: 'Trống', GiaPhongFix: 3200000, DienTich: 30 },
];

/* ================================================================
   KHỞI TẠO
================================================================ */
function ntKhoiTao() {
    ntTaiDuLieu();
    ntTaiDanhSachPhong();

    // Đặt ngày vào ở mặc định = hôm nay
    const today = new Date().toISOString().split('T')[0];
    const inpNgay = document.getElementById('inp-ngay-vao-o');
    if (inpNgay) inpNgay.value = today;

    // Lắng nghe chọn phòng → show room preview
    const inpPhong = document.getElementById('inp-id-phong');
    if (inpPhong) inpPhong.addEventListener('change', ntCapNhatRoomPreview);
}

/* ================================================================
   API CALLS (thay bằng fetch thật khi tích hợp)
================================================================ */

/**
 * Tải danh sách người thuê từ API
 * API endpoint: GET /api/nguoithue
 * Response: KhachThueDto[] (kết hợp KHACH_THUE + ACCOUNT + PHONG)
 */
async function ntTaiDuLieu() {
    ntHienThiLoading(true);
    try {
        const res = await fetch('/api/ChuTroQuanLyNguoiThue/ds-phong');
        if (!res.ok) throw new Error('Lỗi mạng hoặc server');

        const result = await res.json();

        if (result.success) {
            NT.duLieu = result.danhSach
                .filter(p => p.hopDong !== null && p.hopDong !== undefined)
                .map(p => ({
                    IDKhachThue: p.hopDong.idHopDong,
                    IDUser: p.hopDong.idUser,
                    HoTen: p.hopDong.tenKhachThue || '—',
                    SoDienThoai: p.hopDong.soDienThoai || '',
                    Email: '',
                    SoCCCD: '',
                    NgaySinh: null,
                    GioiTinh: '',
                    QueQuan: '',
                    DiaChiThuongTru: '',
                    AnhChanDung: null,
                    GhiChu: p.moTa || '',
                    NgayVaoO: p.hopDong.ngayBatDau,
                    NgayKetThuc: p.hopDong.ngayKetThuc,
                    TienCoc: p.hopDong.tienCocBanDau,
                    SoNgayConLai: p.hopDong.soNgayConLai,
                    SoPhong: p.soPhong,
                    IDPhong: p.idPhong,

                    TrangThai: p.hopDong.isActive ? 'dang-o' : 'da-roi',

                    Username: '',
                }));

            ntCapNhatThongKe();
            ntLocDuLieu();
        } else {
            throw new Error('API trả về lỗi');
        }
    } catch (e) {
        console.error('ntTaiDuLieu:', e);
        hienToast('Lỗi tải danh sách người thuê: ' + e.message, 'error');
    } finally {
        ntHienThiLoading(false);
    }
}
/**
 * Tải danh sách phòng trống
 * API endpoint: GET /api/phong?trangThai=Trống
 */
async function ntTaiDanhSachPhong() {
    try {
        // Gọi API và lọc ra những phòng có trạng thái 'Trống'
        const res = await fetch('/api/ChuTroQuanLyNguoiThue/ds-phong?trangThai=Trống');
        const result = await res.json();

        if (result.success) {
            NT.danhSachPhong = result.danhSach.map(p => ({
                IDPhong: p.idPhong,
                SoPhong: p.soPhong,
                TrangThai: p.trangThai,
                GiaPhongFix: p.giaPhongFix,
                DienTich: p.dienTich
            }));
            ntRenderSelectPhong();
            ntRenderFilterPhong();
        }
    } catch (e) {
        console.error('ntTaiDanhSachPhong:', e);
    }
}

/**
 * Lưu người thuê (Thêm mới hoặc Cập nhật)
 * POST /api/nguoithue        → Thêm mới
 * PUT  /api/nguoithue/{id}   → Cập nhật
 */
async function ntLuuNguoiThue() {
    if (!ntValidate()) return;

    const mode = document.getElementById('nt-modal-mode').value;
    const id = document.getElementById('inp-id-khach-thue').value;
    const idUser = document.getElementById('inp-id-user').value;
    const payload = ntLayPayload();

    const btnSubmit = document.getElementById('nt-btn-submit');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

    try {
        if (mode === 'them') {
            // ── Thêm mới (giữ nguyên mock hoặc fetch thật) ──
            // const res = await fetch('/api/nguoithue', { method:'POST', ... });
            await new Promise(r => setTimeout(r, 800));
            const mock = { ...payload, IDKhachThue: Date.now(), TrangThai: 'dang-o' };
            NT.duLieu.unshift(mock);
            hienToast(`Đã thêm người thuê "${payload.HoTen}"!`, 'success');

        } else {
            // ── Cập nhật ──
            const trangThaiMoi = document.getElementById('inp-trang-thai').value;
            const trangThaiCu = NT.duLieu.find(x => x.IDKhachThue == id)?.TrangThai;
            const doiTrangThai = trangThaiMoi !== trangThaiCu;

            // Nếu đổi sang "Rời đi" → gọi API cập nhật IsActive + PHONG + HOPDONG
            if (doiTrangThai && trangThaiMoi === 'da-roi') {
                const resTraPhong = await fetch(
                    `/api/ChuTroQuanLyNguoiThue/tra-phong/${idUser}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ GhiChu: payload.GhiChu })
                });
                if (!resTraPhong.ok) throw new Error('Lỗi khi cập nhật trạng thái rời đi');
            }

            // Nếu đổi lại sang "Đang ở" → bật lại IsActive
            if (doiTrangThai && trangThaiMoi === 'dang-o') {
                const resKhoiPhuc = await fetch(
                    `/api/ChuTroQuanLyNguoiThue/khoi-phuc/${idUser}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!resKhoiPhuc.ok) throw new Error('Lỗi khi khôi phục trạng thái');
            }

            // Cập nhật thông tin cơ bản
            // const res = await fetch(`/api/nguoithue/${id}`, { method:'PUT', ... });
            await new Promise(r => setTimeout(r, 600));

            const idx = NT.duLieu.findIndex(x => x.IDKhachThue == id);
            if (idx > -1) Object.assign(NT.duLieu[idx], { ...payload, TrangThai: trangThaiMoi });
            hienToast(`Đã cập nhật thông tin "${payload.HoTen}"!`, 'success');
        }

        ntDongModal();
        ntCapNhatThongKe();
        ntLocDuLieu();

    } catch (e) {
        console.error('ntLuuNguoiThue:', e);
        hienToast(e.message || 'Lỗi lưu dữ liệu!', 'error');
    } finally {
        btnSubmit.disabled = false;
        const label = mode === 'them' ? 'Thêm người thuê' : 'Lưu thay đổi';
        btnSubmit.innerHTML = `<i class="fas fa-check"></i> <span id="nt-btn-submit-label">${label}</span>`;
    }
}

/**
 * Xác nhận trả phòng / xóa người thuê
 * PUT /api/nguoithue/{id}/tra-phong
 */
async function ntXacNhanXoa() {
    const id = document.getElementById('inp-xoa-id-khach-thue').value;
    const lyDo = document.getElementById('inp-ly-do-xoa').value.trim();

    const btnXoa = document.getElementById('nt-btn-confirm-xoa');
    btnXoa.disabled = true;
    btnXoa.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

    try {
        // const res = await fetch(`/api/nguoithue/${id}/tra-phong`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${layToken()}` },
        //   body: JSON.stringify({ LyDo: lyDo })
        // });
        // if (!res.ok) throw new Error('Lỗi xử lý');

        await new Promise(r => setTimeout(r, 600)); // Mock

        const item = NT.duLieu.find(x => x.IDKhachThue == id);
        if (item) item.TrangThai = 'da-roi';

        hienToast(`Đã trả phòng thành công!`, 'success');
        ntDongModalXoa();
        ntCapNhatThongKe();
        ntLocDuLieu();
    } catch (e) {
        hienToast('Lỗi xử lý, vui lòng thử lại!', 'error');
    } finally {
        btnXoa.disabled = false;
        btnXoa.innerHTML = '<i class="fas fa-check"></i> Xác nhận trả phòng';
    }
}

/* ================================================================
   LỌC / TÌM KIẾM / SẮP XẾP
================================================================ */
function ntLocDuLieu() {
    const q = (document.getElementById('nt-search-input')?.value || '').toLowerCase().trim();
    const phong = document.getElementById('nt-filter-phong')?.value || '';
    const trangThai = document.getElementById('nt-filter-trang-thai')?.value || '';
    const gioiTinh = document.getElementById('nt-filter-gioi-tinh')?.value || '';

    // Show/hide clear button
    const btnClear = document.getElementById('nt-btn-clear-search');
    if (btnClear) btnClear.style.display = q ? 'flex' : 'none';

    let ket = [...NT.duLieu];

    if (q) {
        ket = ket.filter(x =>
            (x.HoTen || '').toLowerCase().includes(q) ||
            (x.SoDienThoai || '').replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
            (x.SoCCCD || '').includes(q) ||
            (x.Email || '').toLowerCase().includes(q) ||
            (x.SoPhong || '').toLowerCase().includes(q)
        );
    }
    if (phong) ket = ket.filter(x => x.SoPhong === phong);
    if (trangThai) ket = ket.filter(x => x.TrangThai === trangThai);
    if (gioiTinh) ket = ket.filter(x => x.GioiTinh === gioiTinh);

    // Sắp xếp
    ket.sort((a, b) => {
        let va = a[NT.sapXepTheo] || '';
        let vb = b[NT.sapXepTheo] || '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return NT.sapXepTangDan ? -1 : 1;
        if (va > vb) return NT.sapXepTangDan ? 1 : -1;
        return 0;
    });

    NT.duLieuLoc = ket;
    NT.trangHienTai = 1;
    ntRenderHienTai();
}

function ntSapXep(truong) {
    if (NT.sapXepTheo === truong) {
        NT.sapXepTangDan = !NT.sapXepTangDan;
    } else {
        NT.sapXepTheo = truong;
        NT.sapXepTangDan = true;
    }
    // Cập nhật icon
    document.querySelectorAll('.nt-sort-icon').forEach(i => i.className = 'fas fa-sort nt-sort-icon');
    const icon = document.getElementById(`sort-${truong}`);
    if (icon) icon.className = `fas fa-sort-${NT.sapXepTangDan ? 'up' : 'down'} nt-sort-icon ${NT.sapXepTangDan ? 'asc' : 'desc'}`;
    ntLocDuLieu();
}

function ntXoaTimKiem() {
    document.getElementById('nt-search-input').value = '';
    ntLocDuLieu();
}

function ntDatLaiLoc() {
    document.getElementById('nt-search-input').value = '';
    document.getElementById('nt-filter-phong').value = '';
    document.getElementById('nt-filter-trang-thai').value = '';
    document.getElementById('nt-filter-gioi-tinh').value = '';
    ntLocDuLieu();
}

/* ================================================================
   RENDER
================================================================ */
function ntRenderHienTai() {
    ntHienThiLoading(false);
    if (NT.viewHienTai === 'table') {
        ntRenderBang();
    } else {
        ntRenderLuoi();
    }
    ntRenderPhanTrang();
}

/** Lấy dữ liệu trang hiện tại */
function ntLayTrang() {
    const start = (NT.trangHienTai - 1) * NT.soTrangMoiTrang;
    return NT.duLieuLoc.slice(start, start + NT.soTrangMoiTrang);
}

/** Render bảng */
function ntRenderBang() {
    const tbody = document.getElementById('nt-table-body');
    const empty = document.getElementById('nt-empty-state');
    if (!tbody) return;

    const trang = ntLayTrang();

    if (NT.duLieuLoc.length === 0) {
        tbody.innerHTML = '';
        if (empty) empty.style.display = 'flex';
        return;
    }
    if (empty) empty.style.display = 'none';

    const start = (NT.trangHienTai - 1) * NT.soTrangMoiTrang;

    tbody.innerHTML = trang.map((x, i) => {
        const soNgay = x.SoNgayConLai;
        let hdHtml = '<span class="nt-hd-unlimited">Không thời hạn</span>';
        if (x.NgayKetThuc) {
            if (soNgay !== null && soNgay <= 30 && soNgay >= 0) {
                hdHtml = `<div class="nt-hd-cell nt-hd-warning">${ntDinhDangNgay(x.NgayKetThuc)}</div>
                      <div class="nt-date-diff">Còn ${soNgay} ngày</div>`;
            } else if (soNgay !== null && soNgay < 0) {
                hdHtml = `<div class="nt-hd-cell nt-hd-expired">${ntDinhDangNgay(x.NgayKetThuc)}</div>
                      <div class="nt-date-diff">Đã hết hạn</div>`;
            } else {
                hdHtml = `<div class="nt-hd-cell nt-hd-normal">${ntDinhDangNgay(x.NgayKetThuc)}</div>`;
            }
        }

        return `
    <tr>
      <td class="nt-col-stt">
        <span class="nt-stt-num">${start + i + 1}</span>
      </td>
      <td class="nt-col-khach">
        <div class="nt-khach-cell">
          <div class="nt-avatar">
            ${x.AnhChanDung
                ? `<img src="${ntEscape(x.AnhChanDung)}" alt="${ntEscape(x.HoTen)}">`
                : ntLayChuCai(x.HoTen)}
          </div>
          <div>
            <div class="nt-khach-name">${ntEscape(x.HoTen)}</div>
            <div class="nt-khach-cccd">
              <i class="fas fa-id-card" style="font-size:9px;"></i>
              ${ntEscape(x.SoCCCD || '—')}
            </div>
          </div>
        </div>
      </td>
      <td class="nt-col-phong">
        <span class="nt-phong-tag">
          <i class="fas fa-door-open" style="font-size:10px;"></i>
          ${ntEscape(x.SoPhong || '—')}
        </span>
      </td>
      <td class="nt-col-lienhe">
        <div class="nt-lienhe-row">
          <div class="nt-lienhe-phone">
            <i class="fas fa-phone"></i>
            ${ntEscape(x.SoDienThoai || '—')}
          </div>
          <div class="nt-lienhe-email">${ntEscape(x.Email || '')}</div>
        </div>
      </td>
      <td class="nt-col-ngayvao">
        <div class="nt-date-cell">${ntDinhDangNgay(x.NgayVaoO)}</div>
      </td>
      <td class="nt-col-coc">
        <span class="nt-coc-val">${x.TienCoc ? ntDinhDangTien(x.TienCoc) : '—'}</span>
      </td>
      <td class="nt-col-hd">${hdHtml}</td>
      <td class="nt-col-trangthai">${ntBadgeTrangThai(x.TrangThai)}</td>
      <td class="nt-col-action">
        <div class="nt-action-row">
          <button class="nt-act nt-act-view" title="Xem chi tiết"
                  onclick="ntXemChiTiet(${x.IDKhachThue})">
            <i class="fas fa-eye"></i>
          </button>
          <button class="nt-act nt-act-edit" title="Chỉnh sửa"
                  onclick="ntMoModalSua(${x.IDKhachThue})">
            <i class="fas fa-pen"></i>
          </button>
          ${x.TrangThai === 'dang-o' ? `
          <button class="nt-act nt-act-del" title="Trả phòng"
                  onclick="ntMoModalXoa(${x.IDKhachThue})">
            <i class="fas fa-sign-out-alt"></i>
          </button>` : ''}
        </div>
      </td>
    </tr>`;
    }).join('');
}

/** Render lưới */
function ntRenderLuoi() {
    const grid = document.getElementById('nt-grid-body');
    const trang = ntLayTrang();
    if (!grid) return;

    if (NT.duLieuLoc.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--mau-chu-phu);padding:40px;grid-column:1/-1;">Không có dữ liệu</p>';
        return;
    }

    grid.innerHTML = trang.map(x => `
    <div class="nt-grid-card">
      <div class="nt-gc-header">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="nt-gc-avatar">
            ${x.AnhChanDung ? `<img src="${x.AnhChanDung}" alt="">` : ntLayChuCai(x.HoTen)}
          </div>
          <div>
            <div class="nt-gc-name">${ntEscape(x.HoTen)}</div>
            <div class="nt-gc-phone">
              <i class="fas fa-phone" style="font-size:9px;margin-right:3px;"></i>
              ${ntEscape(x.SoDienThoai || '—')}
            </div>
          </div>
        </div>
        ${ntBadgeTrangThai(x.TrangThai)}
      </div>

      <div class="nt-gc-info">
        <div class="nt-gc-row">
          <i class="fas fa-door-open"></i>
          Phòng: <span>${ntEscape(x.SoPhong || '—')}</span>
        </div>
        <div class="nt-gc-row">
          <i class="fas fa-calendar-check"></i>
          Vào ở: <span>${ntDinhDangNgay(x.NgayVaoO)}</span>
        </div>
        <div class="nt-gc-row">
          <i class="fas fa-id-card"></i>
          CCCD: <span>${ntEscape(x.SoCCCD || '—')}</span>
        </div>
        ${x.GioiTinh ? `<div class="nt-gc-row">
          <i class="fas fa-venus-mars"></i>
          Giới tính: <span>${ntEscape(x.GioiTinh)}</span>
        </div>` : ''}
      </div>

      <div class="nt-gc-footer">
        <div style="font-size:11px;color:var(--mau-chu-phu);">
          <i class="fas fa-map-pin" style="color:#0891b2;margin-right:3px;"></i>
          ${ntEscape(x.QueQuan || '—')}
        </div>
        <div class="nt-action-btns">
          <button class="nt-act-btn nt-act-view" title="Xem" onclick="ntXemChiTiet(${x.IDKhachThue})">
            <i class="fas fa-eye"></i>
          </button>
          <button class="nt-act-btn nt-act-edit" title="Sửa" onclick="ntMoModalSua(${x.IDKhachThue})">
            <i class="fas fa-pen"></i>
          </button>
          ${x.TrangThai === 'dang-o' ? `
          <button class="nt-act-btn nt-act-del" title="Trả phòng" onclick="ntMoModalXoa(${x.IDKhachThue})">
            <i class="fas fa-sign-out-alt"></i>
          </button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

/** Render phân trang */
function ntRenderPhanTrang() {
    const tongSo = NT.duLieuLoc.length;
    const tongTrang = Math.ceil(tongSo / NT.soTrangMoiTrang);
    const start = (NT.trangHienTai - 1) * NT.soTrangMoiTrang + 1;
    const end = Math.min(NT.trangHienTai * NT.soTrangMoiTrang, tongSo);

    const info = document.getElementById('nt-page-info');
    if (info) info.innerHTML = tongSo > 0
        ? `Hiển thị <strong>${start}–${end}</strong> trong <strong>${tongSo}</strong> người thuê`
        : 'Không có dữ liệu';

    const btns = document.getElementById('nt-page-btns');
    if (!btns) return;

    let html = '';
    html += `<button class="nt-page-btn" onclick="ntChuyenTrang(${NT.trangHienTai - 1})"
            ${NT.trangHienTai <= 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
           </button>`;

    // Số trang
    const ds = ntLaySoTrang(NT.trangHienTai, tongTrang);
    ds.forEach(p => {
        if (p === '...') {
            html += `<button class="nt-page-btn" disabled>…</button>`;
        } else {
            html += `<button class="nt-page-btn ${p === NT.trangHienTai ? 'active' : ''}"
                onclick="ntChuyenTrang(${p})">${p}</button>`;
        }
    });

    html += `<button class="nt-page-btn" onclick="ntChuyenTrang(${NT.trangHienTai + 1})"
            ${NT.trangHienTai >= tongTrang ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
           </button>`;

    btns.innerHTML = html;
}

function ntLaySoTrang(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
}

function ntChuyenTrang(p) {
    const max = Math.ceil(NT.duLieuLoc.length / NT.soTrangMoiTrang);
    if (p < 1 || p > max) return;
    NT.trangHienTai = p;
    ntRenderHienTai();
    // Cuộn lên đầu bảng
    document.getElementById('nt-table-body')?.closest('.nt-table-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** Render dropdown chọn phòng trong form */
function ntRenderSelectPhong() {
    const sel = document.getElementById('inp-id-phong');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Chọn phòng --</option>' +
        NT.danhSachPhong.map(p =>
            `<option value="${p.IDPhong}" data-gia="${p.GiaPhongFix}" data-dt="${p.DienTich || ''}">
        Phòng ${p.SoPhong} — ${ntDinhDangTien(p.GiaPhongFix)}/tháng
       </option>`
        ).join('');
}

/** Render filter phòng */
function ntRenderFilterPhong() {
    const sel = document.getElementById('nt-filter-phong');
    if (!sel) return;
    const phong = [...new Set(NT.duLieu.map(x => x.SoPhong))].sort();
    sel.innerHTML = '<option value="">Tất cả phòng</option>' +
        phong.map(p => `<option value="${p}">Phòng ${p}</option>`).join('');
}

/** Cập nhật thống kê */
function ntCapNhatThongKe() {
    const dangO = NT.duLieu.filter(x => x.TrangThai === 'dang-o').length;
    const daRoi = NT.duLieu.filter(x => x.TrangThai === 'da-roi').length;
    const phong = [...new Set(NT.duLieu.filter(x => x.TrangThai === 'dang-o').map(x => x.SoPhong))].length;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('nt-stat-dang-o', dangO);
    set('nt-stat-da-roi', daRoi);
    set('nt-stat-tong', NT.duLieu.length);
    set('nt-stat-phong', phong);
}

/** Room preview khi chọn phòng */
function ntCapNhatRoomPreview() {
    const sel = document.getElementById('inp-id-phong');
    const wrap = document.getElementById('nt-room-preview');
    const body = document.getElementById('nt-rp-body');
    if (!sel || !wrap || !body) return;

    const opt = sel.options[sel.selectedIndex];
    if (!opt || !opt.value) { wrap.style.display = 'none'; return; }

    const gia = parseInt(opt.dataset.gia) || 0;
    const dt = opt.dataset.dt || '—';
    body.innerHTML = `
    <div class="nt-rp-row"><span class="nt-rp-key">Phòng</span><span class="nt-rp-val">${ntEscape(opt.text.split('—')[0].trim())}</span></div>
    <div class="nt-rp-row"><span class="nt-rp-key">Giá thuê</span><span class="nt-rp-val">${ntDinhDangTien(gia)}/tháng</span></div>
    <div class="nt-rp-row"><span class="nt-rp-key">Diện tích</span><span class="nt-rp-val">${dt} m²</span></div>
  `;
    wrap.style.display = 'block';
}

/* ================================================================
   MODAL: THÊM / SỬA
================================================================ */
function ntMoModalThem() {
    ntResetForm();
    document.getElementById('nt-modal-mode').value = 'them';
    document.getElementById('nt-modal-tieu-de').textContent = 'Thêm người thuê mới';
    document.getElementById('nt-modal-mo-ta').textContent = 'Điền thông tin để tạo hồ sơ khách thuê';
    document.getElementById('nt-btn-submit-label').textContent = 'Thêm người thuê';
    document.getElementById('nt-modal-icon').innerHTML = '<i class="fas fa-user-plus"></i>';
    document.getElementById('field-password').style.display = '';

    document.getElementById('field-trang-thai').style.display = 'none';

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inp-ngay-vao-o').value = today;

    ntMoOverlay('nt-modal-overlay');
    ntChuyenTabById('tab-co-ban');
}

function ntMoModalSua(id) {
    const item = NT.duLieu.find(x => x.IDKhachThue === id);
    if (!item) return;

    ntResetForm();
    document.getElementById('nt-modal-mode').value = 'sua';
    document.getElementById('inp-id-khach-thue').value = id;
    document.getElementById('inp-id-user').value = item.IDUser;
    document.getElementById('nt-modal-tieu-de').textContent = 'Chỉnh sửa thông tin';
    document.getElementById('nt-modal-mo-ta').textContent = `Cập nhật hồ sơ: ${item.HoTen}`;
    document.getElementById('nt-btn-submit-label').textContent = 'Lưu thay đổi';
    document.getElementById('nt-modal-icon').innerHTML = '<i class="fas fa-user-edit"></i>';
    document.getElementById('field-password').style.display = 'none';
    document.getElementById('field-trang-thai').style.display = '';
    document.getElementById('inp-trang-thai').value = item.TrangThai;
    document.getElementById('canh-bao-trang-thai').style.display = 'none';

    const set = (elId, val) => {
        const el = document.getElementById(elId);
        if (el) el.value = val || '';
    };

    set('inp-ho-ten', item.HoTen);
    set('inp-so-dien-thoai', item.SoDienThoai);
    set('inp-email', item.Email);
    set('inp-ngay-sinh', item.NgaySinh ? item.NgaySinh.split('T')[0] : '');
    set('inp-gioi-tinh', item.GioiTinh);
    set('inp-so-cccd', item.SoCCCD);
    set('inp-que-quan', item.QueQuan);
    set('inp-dia-chi-thuong-tru', item.DiaChiThuongTru);
    set('inp-ghi-chu', item.GhiChu);

    // ✅ Username lấy từ item — nếu API chưa trả về thì gọi thêm API
    set('inp-username', item.Username);

    // Nếu Username rỗng → tự động lấy từ API Account
    if (!item.Username && item.IDUser) {
        ntLayUsername(item.IDUser);
    }

    // Tab Phòng & Hợp đồng
    ntChuyenCheDoPHong('sua', item);

    if (item.AnhChanDung) {
        document.getElementById('nt-avatar-preview').innerHTML =
            `<img src="${item.AnhChanDung}" alt="">`;
    }

    ntMoOverlay('nt-modal-overlay');
    ntChuyenTabById('tab-co-ban');
}
async function ntLayUsername(idUser) {
    try {
        const res = await fetch(`/api/ChuTroQuanLyNguoiThue/account/${idUser}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.username) {
            const el = document.getElementById('inp-username');
            if (el && !el.value) el.value = data.username;

            // Cập nhật lại trong NT.duLieu để lần sau không cần gọi lại
            const item = NT.duLieu.find(x => x.IDUser === idUser);
            if (item) item.Username = data.username;
        }
    } catch (e) {
        console.warn('Không lấy được username:', e);
    }
}

function ntDongModal(e) {
    if (e && e.target !== document.getElementById('nt-modal-overlay')) return;
    ntDongOverlay('nt-modal-overlay');
}

/* ================================================================
   MODAL: CHI TIẾT
================================================================ */
function ntXemChiTiet(id) {
    const item = NT.duLieu.find(x => x.IDKhachThue === id);
    if (!item) return;

    document.getElementById('nt-detail-mo-ta').textContent = `Hồ sơ: ${item.HoTen}`;

    const body = document.getElementById('nt-detail-body');
    body.innerHTML = `
    <!-- Profile -->
    <div class="nt-detail-profile">
      <div class="nt-detail-avatar">
        ${item.AnhChanDung ? `<img src="${ntEscape(item.AnhChanDung)}" alt="">` : ntLayChuCai(item.HoTen)}
      </div>
      <div>
        <div class="nt-detail-name">${ntEscape(item.HoTen)}</div>
        <div class="nt-detail-sub">
          <i class="fas fa-phone" style="color:#0891b2;margin-right:4px;font-size:11px;"></i>${ntEscape(item.SoDienThoai || '—')}
          &nbsp;•&nbsp;
          ${ntBadgeTrangThai(item.TrangThai)}
        </div>
      </div>
    </div>

    <!-- Thông tin cá nhân -->
    <div class="nt-detail-sec-title"><i class="fas fa-id-card"></i> Thông tin cá nhân</div>
    <div class="nt-detail-grid">
      <div class="nt-detail-item">
        <div class="nt-detail-key">Ngày sinh</div>
        <div class="nt-detail-val">${ntDinhDangNgay(item.NgaySinh) || '—'}</div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Giới tính</div>
        <div class="nt-detail-val">${ntEscape(item.GioiTinh || '—')}</div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Số CCCD / CMND</div>
        <div class="nt-detail-val">${ntEscape(item.SoCCCD || '—')}</div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Email</div>
        <div class="nt-detail-val">${ntEscape(item.Email || '—')}</div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Quê quán</div>
        <div class="nt-detail-val">${ntEscape(item.QueQuan || '—')}</div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Tên đăng nhập</div>
        <div class="nt-detail-val">${ntEscape(item.Username || '—')}</div>
      </div>
      <div class="nt-detail-item full">
        <div class="nt-detail-key">Địa chỉ thường trú</div>
        <div class="nt-detail-val">${ntEscape(item.DiaChiThuongTru || '—')}</div>
      </div>
    </div>

    <!-- Thông tin phòng -->
    <div class="nt-detail-sec-title" style="margin-top:8px;"><i class="fas fa-door-open"></i> Thông tin phòng & Hợp đồng</div>
    <div class="nt-detail-grid">
      <div class="nt-detail-item">
        <div class="nt-detail-key">Phòng hiện tại</div>
        <div class="nt-detail-val">${ntEscape(item.SoPhong || '—')}</div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Ngày vào ở</div>
        <div class="nt-detail-val">${ntDinhDangNgay(item.NgayVaoO) || '—'}</div>
      </div>
    </div>

    ${item.GhiChu ? `
    <div class="nt-detail-sec-title" style="margin-top:8px;"><i class="fas fa-sticky-note"></i> Ghi chú</div>
    <div class="nt-detail-item full" style="background:var(--mau-nen);padding:10px 14px;border-radius:var(--radius-sm);">
      <div class="nt-detail-val" style="font-weight:400;">${ntEscape(item.GhiChu)}</div>
    </div>` : ''}
  `;

    // Gán sự kiện nút Sửa trong modal detail

    ntMoOverlay('nt-modal-detail-overlay');
}

function ntDongModalDetail(e) {
    if (e && e.target !== document.getElementById('nt-modal-detail-overlay')) return;
    ntDongOverlay('nt-modal-detail-overlay');
}

/* ================================================================
   MODAL: XÓA / TRẢ PHÒNG
================================================================ */
function ntMoModalXoa(id) {
    const item = NT.duLieu.find(x => x.IDKhachThue === id);
    if (!item) return;

    document.getElementById('inp-xoa-id-khach-thue').value = id;
    document.getElementById('inp-ly-do-xoa').value = '';
    document.getElementById('nt-xoa-noi-dung').innerHTML =
        `Bạn có chắc muốn trả phòng cho <strong>${ntEscape(item.HoTen)}</strong> (Phòng ${ntEscape(item.SoPhong)})?
     Thao tác này sẽ kết thúc hợp đồng và đánh dấu phòng là trống.`;

    ntMoOverlay('nt-confirm-overlay');
}

function ntDongModalXoa(e) {
    if (e && e.target !== document.getElementById('nt-confirm-overlay')) return;
    ntDongOverlay('nt-confirm-overlay');
}

/* ================================================================
   VALIDATE
================================================================ */
function ntValidate() {
    let ok = true;
    const setErr = (id, msg) => {
        const el = document.getElementById(id);
        if (el) el.textContent = msg;
    };
    const getVal = id => (document.getElementById(id)?.value || '').trim();

    // Reset tất cả lỗi trước
    ['err-ho-ten', 'err-so-dien-thoai', 'err-username',
        'err-password', 'err-ngay-vao-o', 'err-id-phong']
        .forEach(id => setErr(id, ''));

    const mode = document.getElementById('nt-modal-mode').value;

    // ══════════════════════════════════════════════════
    // VALIDATE CHUNG (cả thêm mới lẫn chỉnh sửa)
    // Chỉ báo lỗi nếu FIELD RỖNG — không ép nhập thêm
    // ══════════════════════════════════════════════════

    // Họ tên: bắt buộc trong mọi trường hợp
    if (!getVal('inp-ho-ten')) {
        setErr('err-ho-ten', 'Họ tên không được để trống');
        ntChuyenTabById('tab-co-ban');
        ok = false;
    }

    // SĐT: chỉ validate nếu có nhập (không ép format khi để trống lúc sửa)
    const sdt = getVal('inp-so-dien-thoai').replace(/\s/g, '');
    if (!sdt) {
        setErr('err-so-dien-thoai', 'Số điện thoại không được để trống');
        ntChuyenTabById('tab-co-ban');
        ok = false;
    } else if (!/^0\d{9}$/.test(sdt)) {
        setErr('err-so-dien-thoai', 'Số điện thoại không hợp lệ (VD: 0912345678)');
        ntChuyenTabById('tab-co-ban');
        ok = false;
    }

    // Username: chỉ báo lỗi nếu bị XÓA TRẮNG (không bắt buộc điền khi sửa)
    if (!getVal('inp-username')) {
        setErr('err-username', 'Tên đăng nhập không được để trống');
        ntChuyenTabById('tab-cu-tru');
        ok = false;
    }

    // ══════════════════════════════════════════════════
    // VALIDATE CHỈ KHI THÊM MỚI
    // ══════════════════════════════════════════════════
    if (mode === 'them') {

        // Mật khẩu bắt buộc khi thêm mới
        if (!getVal('inp-password')) {
            setErr('err-password', 'Vui lòng nhập mật khẩu');
            ntChuyenTabById('tab-cu-tru');
            ok = false;
        } else if (getVal('inp-password').length < 6) {
            setErr('err-password', 'Mật khẩu tối thiểu 6 ký tự');
            ntChuyenTabById('tab-cu-tru');
            ok = false;
        }

        // Ngày vào ở bắt buộc khi thêm mới
        if (!getVal('inp-ngay-vao-o')) {
            setErr('err-ngay-vao-o', 'Vui lòng chọn ngày vào ở');
            ntChuyenTabById('tab-phong');
            ok = false;
        }

        // Phòng bắt buộc khi thêm mới
        if (!getVal('inp-id-phong')) {
            setErr('err-id-phong', 'Vui lòng chọn phòng');
            ntChuyenTabById('tab-phong');
            ok = false;
        }
    }

    // Khi SỬA: không validate phòng, ngày vào ở, mật khẩu
    // → chỉ cần họ tên, SĐT, username không rỗng là được lưu

    return ok;
}   

/* ================================================================
   LẤY PAYLOAD
================================================================ */
function ntLayPayload() {
    const get = id => (document.getElementById(id)?.value || '').trim();
    return {
        // KHACH_THUE fields
        HoTen: get('inp-ho-ten'),
        SoDienThoai: get('inp-so-dien-thoai').replace(/\s/g, ''),
        SoCCCD: get('inp-so-cccd'),
        NgaySinh: get('inp-ngay-sinh') || null,
        GioiTinh: get('inp-gioi-tinh') || null,
        QueQuan: get('inp-que-quan'),
        DiaChiThuongTru: get('inp-dia-chi-thuong-tru'),
        GhiChu: get('inp-ghi-chu'),
        NgayVaoO: get('inp-ngay-vao-o'),

        // ACCOUNT fields
        Username: get('inp-username'),
        Passwords: get('inp-password') || undefined, // Chỉ gửi khi thêm mới
        Email: get('inp-email') || null,
        FullName: get('inp-ho-ten'),
        Phone: get('inp-so-dien-thoai').replace(/\s/g, ''),
        Roles: 'Tenant',

        // HOPDONG fields
        IDPhong: parseInt(get('inp-id-phong')) || null,
        TienCocBanDau: parseFloat(get('inp-tien-coc')) || 0,
        DienDauKy: parseInt(get('inp-dien-dau-ky')) || 0,
        NuocDauKy: parseInt(get('inp-nuoc-dau-ky')) || 0,
        NgayKetThuc: get('inp-ngay-ket-thuc') || null,
        GhiChuHD: get('inp-ghi-chu-hd'),

        // Cho mock: thêm SoPhong
        SoPhong: (function () {
            const sel = document.getElementById('inp-id-phong');
            const opt = sel?.options[sel.selectedIndex];
            return opt?.text?.match(/Phòng (\S+)/)?.[1] || '';
        })(),
    };
}

/* ================================================================
   RESET FORM
================================================================ */
function ntResetForm() {
    const ids = ['inp-ho-ten', 'inp-so-dien-thoai', 'inp-email', 'inp-ngay-sinh', 'inp-gioi-tinh',
        'inp-so-cccd', 'inp-que-quan', 'inp-dia-chi-thuong-tru', 'inp-ghi-chu',
        'inp-username', 'inp-password', 'inp-ngay-vao-o', 'inp-id-phong',
        'inp-tien-coc', 'inp-dien-dau-ky', 'inp-nuoc-dau-ky', 'inp-ngay-ket-thuc', 'inp-ghi-chu-hd',
        'inp-id-khach-thue', 'inp-id-user'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

    ['err-ho-ten', 'err-so-dien-thoai', 'err-username', 'err-password', 'err-ngay-vao-o', 'err-id-phong']
        .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });

    document.getElementById('nt-avatar-preview').innerHTML = '<i class="fas fa-user"></i>';
    document.getElementById('nt-room-preview').style.display = 'none';
}

/* ================================================================
   TAB HANDLING
================================================================ */
function ntChuyenTab(btn) {
    document.querySelectorAll('.nt-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nt-tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const tabId = btn.dataset.tab;
    document.getElementById(tabId)?.classList.add('active');
}

function ntChuyenTabById(tabId) {
    // Map tên gọi → id thực trong HTML
    const tabMap = {
        'thong-tin-co-ban': 'tab-co-ban',
        'thong-tin-cu-tru': 'tab-cu-tru',
        'thong-tin-phong': 'tab-phong',
        // fallback: dùng thẳng id
    };
    const realId = tabMap[tabId] || tabId;
    const btn = document.querySelector(`.nt-tab[data-tab="${realId}"]`);
    if (btn) ntChuyenTab(btn);
}

/* ================================================================
   VIEW TOGGLE
================================================================ */
function ntChuyenView(v) {
    NT.viewHienTai = v;

    document.getElementById('nt-btn-view-table')?.classList.toggle('active', v === 'table');
    document.getElementById('nt-btn-view-grid')?.classList.toggle('active', v === 'grid');
    document.getElementById('nt-view-table').style.display = v === 'table' ? '' : 'none';
    document.getElementById('nt-view-grid').style.display = v === 'grid' ? '' : 'none';

    ntRenderHienTai();
}

/* ================================================================
   AVATAR PREVIEW
================================================================ */
function ntXemTruocAnh(input) {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { hienToast('Ảnh không được quá 2MB', 'warning'); return; }

    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('nt-avatar-preview').innerHTML =
            `<img src="${e.target.result}" alt="avatar">`;
    };
    reader.readAsDataURL(file);
}

/* ================================================================
   TOGGLE PASSWORD
================================================================ */
function ntTogglePassword(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    const isHidden = inp.type === 'password';
    inp.type = isHidden ? 'text' : 'password';
    btn.querySelector('i').className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
}

/* ================================================================
   OVERLAY HELPERS
================================================================ */
function ntMoOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('mo');
    document.body.style.overflow = 'hidden';
}

function ntDongOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('mo');
    document.body.style.overflow = '';
}

/* ================================================================
   LOADING STATE
================================================================ */
function ntHienThiLoading(show) {
    NT.dangTai = show;
    const loading = document.getElementById('nt-loading');
    const body = document.getElementById('nt-table-body');
    const empty = document.getElementById('nt-empty-state');

    if (loading) loading.style.display = show ? 'flex' : 'none';
    if (body && show) body.innerHTML = '';
    if (empty && show) empty.style.display = 'none';
}

/* ================================================================
   UTILS
================================================================ */
function ntEscape(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function ntLayChuCai(ten) {
    if (!ten) return '?';
    const parts = ten.trim().split(/\s+/);
    const last = parts[parts.length - 1];
    return (last?.[0] || '?').toUpperCase();
}

function ntDinhDangNgay(dateStr) {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        if (isNaN(d)) return '—';
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch { return '—'; }
}

function ntDinhDangTien(so) {
    if (so == null) return '—';
    return new Intl.NumberFormat('vi-VN').format(so) + 'đ';
}

function ntBadgeTrangThai(tt) {
    if (tt === 'dang-o') return '<span class="nt-badge nt-badge-green">Đang ở</span>';
    return '<span class="nt-badge nt-badge-gray">Đã rời đi</span>';
}

/* ================================================================
   TOAST (dùng chung hàm hienToast của ChuTro-core.js nếu có)
   Nếu chưa có, dùng fallback bên dưới
================================================================ */
function hienToast(msg, type = 'info') {
    // Thử dùng toast container có sẵn trong ChuTro.cshtml
    const container = document.getElementById('toastContainer');
    if (!container) { alert(msg); return; }

    const colors = {
        success: '#0ea271', error: '#e53e3e',
        warning: '#b8720a', info: '#0891b2',
    };
    const icons = {
        success: 'fa-check-circle', error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle', info: 'fa-info-circle',
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
    background:#fff; border-radius:10px; padding:12px 16px;
    box-shadow:0 4px 20px rgba(0,0,0,0.14); display:flex; align-items:center; gap:10px;
    font-size:13px; font-weight:600; color:#111; min-width:240px; max-width:360px;
    border-left:3px solid ${colors[type] || '#0891b2'};
    animation: toastIn 0.3s ease;
  `;
    toast.innerHTML = `
    <i class="fas ${icons[type] || 'fa-info-circle'}" style="color:${colors[type]};font-size:16px;flex-shrink:0;"></i>
    <span>${msg}</span>
  `;

    const style = document.createElement('style');
    style.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}';
    document.head.appendChild(style);

    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}
document.addEventListener('DOMContentLoaded', function () {
    if (typeof ntKhoiTao === 'function') ntKhoiTao();
});

/* ================================================================
   ENTRY POINT — Gọi khi sidebar chuyển sang tab "Người thuê"
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Nếu section hiện ra ngay thì gọi luôn
    // Nếu dùng tab system của ChuTro-core.js, hàm ntKhoiTao() sẽ được
    // gọi từ ChuTro-core.js khi tab 'nguoi-thue' được chọn
    // VD: case 'nguoi-thue': ntKhoiTao(); break;
});
function ntThayDoiTrangThai(val) {
    const canhBao = document.getElementById('canh-bao-trang-thai');
    if (canhBao) canhBao.style.display = val === 'da-roi' ? 'block' : 'none';
}

// Export để ChuTro-core.js có thể gọi
window.ntKhoiTao = ntKhoiTao;
window.ntLocDuLieu = ntLocDuLieu;
window.ntMoModalThem = ntMoModalThem;
window.ntMoModalSua = ntMoModalSua;
window.ntMoModalXoa = ntMoModalXoa;
window.ntDongModal = ntDongModal;
window.ntDongModalDetail = ntDongModalDetail;
window.ntDongModalXoa = ntDongModalXoa;
window.ntXemChiTiet = ntXemChiTiet;
window.ntLuuNguoiThue = ntLuuNguoiThue;
window.ntXacNhanXoa = ntXacNhanXoa;
window.ntSapXep = ntSapXep;
window.ntChuyenTrang = ntChuyenTrang;
window.ntChuyenView = ntChuyenView;
window.ntChuyenTab = ntChuyenTab;
window.ntDatLaiLoc = ntDatLaiLoc;
window.ntXoaTimKiem = ntXoaTimKiem;
window.ntXemTruocAnh = ntXemTruocAnh;
window.ntTogglePassword = ntTogglePassword;
window.ntCapNhatRoomPreview = ntCapNhatRoomPreview;