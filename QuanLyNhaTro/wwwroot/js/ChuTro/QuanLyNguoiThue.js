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
 *
 * FIX: Deduplicate theo idHopDong để tránh render trùng khi API
 *      trả về nhiều row cho cùng một hợp đồng (do JOIN KHACH_O_GHEP).
 */
async function ntTaiDuLieu() {
    ntHienThiLoading(true);
    try {
        const res = await fetch('/api/ChuTroQuanLyNguoiThue/ds-nguoi-thue');
        if (!res.ok) throw new Error('Lỗi mạng hoặc server');
        const result = await res.json();

        if (result.success) {
            // ── FIX: dùng Map để group theo idHopDong, tránh duplicate ──
            const hopDongMap = new Map();

            result.danhSach.forEach(hd => {
                const key = hd.idHopDong;

                if (!hopDongMap.has(key)) {
                    // Lần đầu gặp hợp đồng này → tạo entry mới
                    hopDongMap.set(key, {
                        // IDs
                        IDKhachThue: hd.idHopDong,
                        IDUser: hd.idUser,
                        IDPhong: hd.idPhong,

                        // Ưu tiên KHACH_THUE, fallback sang ACCOUNT
                        HoTen: hd.khachThue?.hoTen || hd.tenKhachThue || '—',
                        SoDienThoai: hd.khachThue?.soDienThoai || hd.soDienThoai || '',
                        SoCCCD: hd.khachThue?.soCCCD || '',
                        NgaySinh: hd.khachThue?.ngaySinh || null,
                        GioiTinh: hd.khachThue?.gioiTinh || '',
                        QueQuan: hd.khachThue?.queQuan || '',
                        DiaChiThuongTru: hd.khachThue?.diaChiThuongTru || '',
                        AnhChanDung: hd.khachThue?.anhChanDung || null,
                        GhiChu: hd.khachThue?.ghiChu || hd.ghiChu || '',

                        // ACCOUNT
                        Email: hd.email || '',
                        Username: hd.username || '',
                        IsActive: hd.isActive,

                        // HOPDONG
                        NgayVaoO: hd.ngayBatDau,
                        NgayKetThuc: hd.ngayKetThuc,
                        TienCoc: hd.tienCocBanDau,
                        DienDauKy: hd.dienDauKy,
                        NuocDauKy: hd.nuocDauKy,
                        GhiChuHD: hd.ghiChu || '',
                        SoNgayConLai: hd.soNgayConLai,
                        TrangThaiHD: hd.trangThaiHD,

                        // PHONG
                        SoPhong: hd.soPhong,

                        // Trạng thái hiển thị
                        TrangThai: hd.trangThaiHD === 'Đang hiệu lực' ? 'dang-o' : 'da-roi',

                        // Người ở ghép — chỉ lấy khi hợp đồng đang hiệu lực.
                        // Hợp đồng đã kết thúc không được render người ghép (tránh duplicate).
                        NguoiOGhep: hd.trangThaiHD === 'Đang hiệu lực'
                            ? (hd.nguoiOGhep || [])
                            : [],
                        // Người ở ghép cần hợp đồng mới (chủ phòng đã trả phòng sớm)
                        NguoiGhepCanHopDong: hd.nguoiGhepCanHopDong || [],
                    });
                }
                // Nếu key đã tồn tại → bỏ qua, không thêm duplicate
            });

            // ── Pass 1: thu thập idKhachO đã có trong NguoiOGhep của hợp đồng ĐANG HIỆU LỰC ──
            // Đảm bảo người ghép chỉ xuất hiện dưới đúng 1 hợp đồng active,
            // kể cả khi API vẫn trả họ trong nguoiOGhep của hợp đồng cũ đã kết thúc.
            const ghepInActiveContracts = new Set();
            hopDongMap.forEach(row => {
                if (row.TrangThai === 'dang-o') {
                    (row.NguoiOGhep || []).forEach(ko => {
                        const id = ko.idKhachO ?? ko.IDKhachO;
                        if (id != null) ghepInActiveContracts.add(id);
                    });
                }
            });

            // ── Pass 2: thu thập idKhachO đã có trong NguoiGhepCanHopDong của hợp đồng ĐANG HIỆU LỰC ──
            // Ngăn cùng một người xuất hiện dưới cả hợp đồng đã kết thúc lẫn hợp đồng active
            // khi API trả NguoiGhepCanHopDong trùng trên cả hai contract của cùng một phòng.
            const ghepCanHDInActiveContracts = new Set();
            hopDongMap.forEach(row => {
                if (row.TrangThai === 'dang-o') {
                    (row.NguoiGhepCanHopDong || []).forEach(ko => {
                        const id = ko.idKhachO ?? ko.IDKhachO;
                        if (id != null) ghepCanHDInActiveContracts.add(id);
                    });
                }
            });

            // ── Pass 3: làm sạch từng contract ──
            hopDongMap.forEach(row => {
                // Hợp đồng đã kết thúc: xóa sạch NguoiOGhep (không render người ghép dưới contract cũ)
                if (row.TrangThai === 'da-roi') {
                    row.NguoiOGhep = [];
                }

                // NguoiGhepCanHopDong: loại bỏ bất kỳ ai đã xuất hiện trong NguoiGhepCanHopDong
                // của một hợp đồng ĐANG HIỆU LỰC (tránh hàng cam bị nhân đôi).
                // Cũng loại bỏ ai đã là NguoiOGhep của chính hợp đồng này (đã có HĐ, không cần cảnh báo).
                const nguoiOGhepCuaRow = new Set(
                    (row.NguoiOGhep || []).map(ko => ko.idKhachO ?? ko.IDKhachO)
                );
                row.NguoiGhepCanHopDong = (row.NguoiGhepCanHopDong || []).filter(ko => {
                    const id = ko.idKhachO ?? ko.IDKhachO;
                    // Giữ lại chỉ khi:
                    // 1. Không có trong NguoiGhepCanHopDong của bất kỳ hợp đồng dang-o nào khác
                    //    (trừ chính hợp đồng này)
                    // 2. Không đã là NguoiOGhep của hợp đồng này
                    const coTrongActiveCanHD = ghepCanHDInActiveContracts.has(id);
                    const daLaNguoiOGhep = nguoiOGhepCuaRow.has(id);
                    const dayLaHopDongDangO = row.TrangThai === 'dang-o';

                    if (daLaNguoiOGhep) return false; // đã có trong NguoiOGhep → không cần cảnh báo cam
                    if (coTrongActiveCanHD && !dayLaHopDongDangO) return false; // chỉ giữ ở contract dang-o
                    return true;
                });
            });

            NT.duLieu = Array.from(hopDongMap.values());

            ntCapNhatThongKe();
            ntRenderFilterPhong();
            ntLocDuLieu();
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
        const res = await fetch('/api/ChuTroQuanLyNguoiThue/ds-phong?trangThai=Trống');
        const result = await res.json();
        if (result.success) {
            NT.danhSachPhong = result.danhSach
                .filter(p => p.trangThai === 'Trống') // ← chỉ lấy phòng trống
                .map(p => ({
                    IDPhong: p.idPhong,
                    SoPhong: p.soPhong,
                    TrangThai: p.trangThai,
                    GiaPhongFix: p.giaPhongFix,
                    DienTich: p.dienTich
                }));
            ntRenderSelectPhong(); // ← chỉ render dropdown form
            // KHÔNG gọi ntRenderFilterPhong() ở đây
        }
    } catch (e) {
        console.error('ntTaiDanhSachPhong:', e);
    }
}


/**
 * Xác nhận trả phòng / xóa người thuê
 * PUT /api/nguoithue/{id}/tra-phong
 */
async function ntXacNhanXoa() {
    const id = document.getElementById('inp-xoa-id-khach-thue').value;
    const lyDo = document.getElementById('inp-ly-do-xoa').value.trim();
    const idUser = document.getElementById('inp-xoa-id-user').value;

    const btnXoa = document.getElementById('nt-btn-confirm-xoa');
    btnXoa.disabled = true;
    btnXoa.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

    try {
        const res = await fetch(`/api/ChuTroThemNguoiThue/${id}/tra-phong`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                LyDo: lyDo,
                IDUser: parseInt(idUser)
            })
        });
        if (!res.ok) throw new Error('Lỗi xử lý');

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
    const nguoiGhep = document.getElementById('nt-filter-nguoi-ghep')?.value || '';

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
    if (nguoiGhep === 'co-ghep') ket = ket.filter(x => x.NguoiOGhep?.length > 0);
    if (nguoiGhep === 'khong-ghep') ket = ket.filter(x => !x.NguoiOGhep?.length);

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
    document.getElementById('nt-filter-nguoi-ghep').value = '';
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
    let html = '';

    trang.forEach((x, i) => {
        // ── Ô hạn hợp đồng ──
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

        // ── Hàng chính (chủ phòng) ──
        html += `
        <tr class="nt-row-main">
            <td class="nt-col-stt">
                <span class="nt-stt-num">${start + i + 1}</span>
            </td>
            <td class="nt-col-khach">
                <div class="nt-khach-cell">
                    <div class="nt-avatar">
                        ${x.AnhChanDung
                ? `<img src="${ntEscape(x.AnhChanDung)}" alt="">`
                : ntLayChuCai(x.HoTen)}
                    </div>
                    <div>
                        <div class="nt-khach-name">${ntEscape(x.HoTen)}</div>
                        <div class="nt-khach-cccd">
                            <i class="fas fa-id-card" style="font-size:9px;"></i>
                            ${ntEscape(x.SoCCCD || '—')}
                        </div>
                        ${x.NguoiOGhep?.length > 0 ? `
                        <div style="font-size:10px;color:#7c3aed;margin-top:3px;font-weight:700;">
                            <i class="fas fa-user-friends" style="font-size:9px;"></i>
                            +${x.NguoiOGhep.length} người ở ghép
                        </div>` : ''}
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
                    <button class="nt-act nt-act-del" title="Trả phòng / Thanh lý"
                            onclick="traPhongV2.moModal(${x.IDUser}, ${x.IDKhachThue}, '${ntEscape(x.HoTen)}', '${ntEscape(x.SoPhong)}')">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>` : ''}
                </div>
            </td>
        </tr>`;

        // ── Hàng người ở ghép ──
        (x.NguoiOGhep || []).forEach(ko => {
            html += `
            <tr class="nt-row-ghep" style="background:linear-gradient(90deg,rgba(124,58,237,0.035),transparent);">
                <td class="nt-col-stt">
                    <div style="width:26px;height:26px;background:rgba(124,58,237,0.1);
                                border-radius:50%;display:inline-flex;align-items:center;
                                justify-content:center;">
                        <i class="fas fa-user-friends" style="font-size:9px;color:#7c3aed;"></i>
                    </div>
                </td>
                <td class="nt-col-khach">
                    <div class="nt-khach-cell" style="padding-left:14px;border-left:2px solid rgba(124,58,237,0.25);">
                        <div class="nt-avatar" style="width:32px;height:32px;font-size:12px;
                                    background:linear-gradient(135deg,#7c3aed,#9333ea);">
                            ${ntLayChuCai(ko.hoTen)}
                        </div>
                        <div>
                            <div class="nt-khach-name" style="font-size:12.5px;">
                                ${ntEscape(ko.hoTen)}
                            </div>
                            <div class="nt-khach-cccd">
                                <i class="fas fa-id-card" style="font-size:9px;"></i>
                                ${ntEscape(ko.soCCCD || '—')}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="nt-col-phong">
                    <span class="nt-phong-tag" style="background:rgba(124,58,237,0.08);
                                color:#7c3aed;border-color:rgba(124,58,237,0.2);">
                        <i class="fas fa-door-open" style="font-size:10px;"></i>
                        ${ntEscape(x.SoPhong || '—')}
                    </span>
                </td>
                <td class="nt-col-lienhe">
                    <div class="nt-lienhe-row">
                        <div class="nt-lienhe-phone">
                            <i class="fas fa-phone"></i>
                            ${ntEscape(ko.soDienThoai || '—')}
                        </div>
                        ${ko.quanHe ? `<div class="nt-lienhe-email">${ntEscape(ko.quanHe)}</div>` : ''}
                    </div>
                </td>
                <td class="nt-col-ngayvao">
                    <div class="nt-date-cell">${ntDinhDangNgay(ko.ngayVao)}</div>
                </td>
                <td class="nt-col-coc">
                    <span style="color:var(--mau-chu-phu);font-size:11.5px;font-style:italic;">—</span>
                </td>
                <td class="nt-col-hd">
                    <span style="display:inline-flex;align-items:center;gap:5px;
                                 padding:4px 10px;border-radius:var(--radius-full);
                                 font-size:11.5px;font-weight:700;
                                 background:rgba(124,58,237,0.1);color:#7c3aed;
                                 border:1px solid rgba(124,58,237,0.2);">
                        <i class="fas fa-user-friends" style="font-size:10px;"></i>
                        Người ở ghép
                    </span>
                </td>
                <td class="nt-col-trangthai">
                    <span class="nt-badge" style="background:rgba(124,58,237,0.1);
                                color:#7c3aed;border:1px solid rgba(124,58,237,0.2);">
                        <span class="nt-badge-dot"></span> Đang ở ghép
                    </span>
                </td>
                <td class="nt-col-action">
                    <div class="nt-action-row">
                        <button class="nt-act nt-act-view" title="Xem chi tiết"
                                style="background:rgba(124,58,237,0.1);color:#7c3aed;"
                                onclick="ntXemChiTietGhep(${ko.idKhachO}, ${x.IDKhachThue})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="nt-act nt-act-edit" title="Tạo hợp đồng mới"
                                style="background:rgba(5,150,105,0.1);color:#059669;"
                                onclick="ngGhep_moModalHD(${ko.idKhachO}, '${ntEscape(ko.hoTen)}', ${x.IDPhong}, '${ntEscape(x.SoPhong)}')">
                            <i class="fas fa-file-contract"></i>
                        </button>
                        <button class="nt-act nt-act-del" title="Gỡ khỏi phòng"
                                onclick="ngGhep_xacNhanXoa(${ko.idKhachO}, '${ntEscape(ko.hoTen)}')">
                            <i class="fas fa-user-minus"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        });

        // ── Hàng người ở ghép CẦN HỢP ĐỒNG MỚI (chủ phòng đã trả phòng sớm) ──
        (x.NguoiGhepCanHopDong || []).forEach(ko => {
            html += `
            <tr class="nt-row-ghep" style="background:linear-gradient(90deg,rgba(234,88,12,0.04),transparent);">
                <td class="nt-col-stt">
                    <div style="width:26px;height:26px;background:rgba(234,88,12,0.12);
                                border-radius:50%;display:inline-flex;align-items:center;
                                justify-content:center;" title="Cần lập hợp đồng mới">
                        <i class="fas fa-exclamation" style="font-size:9px;color:#ea580c;"></i>
                    </div>
                </td>
                <td class="nt-col-khach">
                    <div class="nt-khach-cell" style="padding-left:14px;border-left:2px solid rgba(234,88,12,0.35);">
                        <div class="nt-avatar" style="width:32px;height:32px;font-size:12px;
                                    background:linear-gradient(135deg,#ea580c,#f97316);">
                            ${ntLayChuCai(ko.hoTen || ko.HoTen)}
                        </div>
                        <div>
                            <div class="nt-khach-name" style="font-size:12.5px;">
                                ${ntEscape(ko.hoTen || ko.HoTen)}
                            </div>
                            <div class="nt-khach-cccd">
                                <i class="fas fa-id-card" style="font-size:9px;"></i>
                                ${ntEscape(ko.soCCCD || ko.SoCCCD || '—')}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="nt-col-phong">
                    <span class="nt-phong-tag" style="background:rgba(234,88,12,0.08);
                                color:#ea580c;border-color:rgba(234,88,12,0.25);">
                        <i class="fas fa-door-open" style="font-size:10px;"></i>
                        ${ntEscape(x.SoPhong || '—')}
                    </span>
                </td>
                <td class="nt-col-lienhe">
                    <div class="nt-lienhe-row">
                        <div class="nt-lienhe-phone">
                            <i class="fas fa-phone"></i>
                            ${ntEscape(ko.soDienThoai || ko.SoDienThoai || '—')}
                        </div>
                        ${(ko.quanHe || ko.QuanHe) ? `<div class="nt-lienhe-email">${ntEscape(ko.quanHe || ko.QuanHe)}</div>` : ''}
                    </div>
                </td>
                <td class="nt-col-ngayvao">
                    <div class="nt-date-cell">${ntDinhDangNgay(ko.ngayVao || ko.NgayVao)}</div>
                </td>
                <td class="nt-col-coc">
                    <span style="color:var(--mau-chu-phu);font-size:11.5px;font-style:italic;">—</span>
                </td>
                <td class="nt-col-hd">
                    <span style="display:inline-flex;align-items:center;gap:5px;
                                 padding:4px 10px;border-radius:var(--radius-full);
                                 font-size:11.5px;font-weight:700;
                                 background:rgba(234,88,12,0.1);color:#ea580c;
                                 border:1px solid rgba(234,88,12,0.25);">
                        <i class="fas fa-exclamation-circle" style="font-size:10px;"></i>
                        Chưa có hợp đồng
                    </span>
                </td>
                <td class="nt-col-trangthai">
                    <span class="nt-badge" style="background:rgba(234,88,12,0.1);
                                color:#ea580c;border:1px solid rgba(234,88,12,0.25);">
                        <span class="nt-badge-dot" style="background:#ea580c;"></span> Cần lập HĐ
                    </span>
                </td>
                <td class="nt-col-action">
                    <div class="nt-action-row">
                        <button class="nt-act nt-act-edit" title="Lập hợp đồng mới — trở thành chủ phòng"
                                style="background:rgba(5,150,105,0.1);color:#059669;"
                                onclick="ngGhep_moModalHD(${ko.idKhachO || ko.IDKhachO}, '${ntEscape(ko.hoTen || ko.HoTen)}', ${x.IDPhong}, '${ntEscape(x.SoPhong)}')">
                            <i class="fas fa-file-contract"></i>
                        </button>
                        <button class="nt-act nt-act-del" title="Gỡ khỏi phòng"
                                onclick="ngGhep_xacNhanXoa(${ko.idKhachO || ko.IDKhachO}, '${ntEscape(ko.hoTen || ko.HoTen)}')">
                            <i class="fas fa-user-minus"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        });
    });

    tbody.innerHTML = html;
}

/** Render lưới- */
function ntRenderLuoi() {
    const grid = document.getElementById('nt-grid-body');
    const trang = ntLayTrang();
    if (!grid) return;

    if (NT.duLieuLoc.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--mau-chu-phu);padding:40px;grid-column:1/-1;">Không có dữ liệu</p>';
        return;
    }

    grid.innerHTML = trang.map(x => `
    <div class="nt-gc">
      <div class="nt-gc-top">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="nt-gc-ava">
            ${x.AnhChanDung ? `<img src="${ntEscape(x.AnhChanDung)}" alt="">` : ntLayChuCai(x.HoTen)}
          </div>
          <div>
            <div class="nt-gc-name">${ntEscape(x.HoTen)}</div>
            <div class="nt-gc-phone">
              <i class="fas fa-phone" style="font-size:9px;"></i>
              ${ntEscape(x.SoDienThoai || '—')}
            </div>
          </div>
        </div>
        ${ntBadgeTrangThai(x.TrangThai)}
      </div>

      <div class="nt-gc-rows">
        <div class="nt-gc-row">
          <i class="fas fa-door-open"></i>
          Phòng: <strong>${ntEscape(x.SoPhong || '—')}</strong>
        </div>
        <div class="nt-gc-row">
          <i class="fas fa-calendar-check"></i>
          Vào ở: <strong>${ntDinhDangNgay(x.NgayVaoO)}</strong>
        </div>
        <div class="nt-gc-row">
          <i class="fas fa-id-card"></i>
          CCCD: <strong>${ntEscape(x.SoCCCD || '—')}</strong>
        </div>
        ${x.GioiTinh ? `
        <div class="nt-gc-row">
          <i class="fas fa-venus-mars"></i>
          Giới tính: <strong>${ntEscape(x.GioiTinh)}</strong>
        </div>` : ''}
      </div>

      <div class="nt-gc-foot">
        <div style="font-size:11px;color:var(--mau-chu-phu);">
          <i class="fas fa-map-pin" style="color:#0891b2;margin-right:3px;"></i>
          ${ntEscape(x.QueQuan || '—')}
        </div>
        <div style="display:flex;gap:4px;">
          <button class="nt-act nt-act-view" title="Xem" onclick="ntXemChiTiet(${x.IDKhachThue})">
            <i class="fas fa-eye"></i>
          </button>
          <button class="nt-act nt-act-edit" title="Sửa" onclick="ntMoModalSua(${x.IDKhachThue})">
            <i class="fas fa-pen"></i>
          </button>
          ${x.TrangThai === 'dang-o' ? `
          <button class="nt-act nt-act-del" title="Trả phòng" onclick="ntMoModalXoa(${x.IDKhachThue})">
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
    // Lấy từ NT.duLieu — bao gồm cả người đã rời
    const phong = [...new Set(NT.duLieu.map(x => x.SoPhong).filter(Boolean))].sort();
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

    document.getElementById('field-trang-thai-hd').style.display = 'none';
    document.getElementById('field-dien-dau-ky').style.display = '';
    document.getElementById('field-nuoc-dau-ky').style.display = '';

    const banner = document.getElementById('nt-phong-readonly-banner');
    if (banner) banner.style.display = 'none';

    const divPhongHienTai = document.getElementById('nt-phong-hien-tai');
    if (divPhongHienTai) divPhongHienTai.style.display = 'none';

    const pickerBox = document.getElementById('phong-display-box');
    if (pickerBox) { pickerBox.style.display = ''; pickerBox.style.pointerEvents = ''; }

    const inpPhong = document.getElementById('inp-id-phong');
    if (inpPhong) inpPhong.style.display = '';

    ntMoOverlay('nt-modal-overlay');
    ntChuyenTabById('tab-co-ban');
}

function ntMoModalSua(id) {
    const item = NT.duLieu.find(x => x.IDKhachThue === id);
    if (!item) return;

    const daKetThuc = item.TrangThai === 'da-roi';

    ntResetForm();
    document.getElementById('nt-modal-mode').value = 'sua';
    document.getElementById('inp-id-khach-thue').value = id;
    document.getElementById('inp-id-hop-dong').value = id;
    document.getElementById('inp-id-user').value = item.IDUser;

    // ── Tiêu đề ──
    if (daKetThuc) {
        document.getElementById('nt-modal-tieu-de').textContent = 'Xem thông tin người thuê';
        document.getElementById('nt-modal-mo-ta').textContent = `Hồ sơ đã kết thúc: ${item.HoTen}`;
        document.getElementById('nt-modal-icon').innerHTML = '<i class="fas fa-eye"></i>';
    } else {
        document.getElementById('nt-modal-tieu-de').textContent = 'Chỉnh sửa thông tin';
        document.getElementById('nt-modal-mo-ta').textContent = `Cập nhật hồ sơ: ${item.HoTen}`;
        document.getElementById('nt-modal-icon').innerHTML = '<i class="fas fa-user-edit"></i>';
    }

    // ── FIX BUG 1: Ghi đè toàn bộ nút submit, không chỉ span label ──
    const btnSubmit = document.getElementById('nt-btn-submit');
    if (btnSubmit) {
        btnSubmit.innerHTML = '<i class="fas fa-save"></i> <span id="nt-btn-submit-label">Lưu thay đổi</span>';
    }

    // ── Ẩn field password khi sửa ──
    document.getElementById('field-password').style.display = 'none';

    // ── Hiện field trạng thái ──
    document.getElementById('field-trang-thai').style.display = '';
    document.getElementById('inp-trang-thai').value = item.TrangThai === 'da-roi' ? 'da-roi' : 'dang-o';
    document.getElementById('canh-bao-trang-thai').style.display = 'none';

    // ── Điền dữ liệu ──
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
    set('inp-dia-chi', item.DiaChiThuongTru);
    set('inp-ghi-chu', item.GhiChu);
    set('inp-username', item.Username);

    if (!item.Username && item.IDUser) ntLayUsername(item.IDUser);

    ntChuyenCheDoPHong('sua', item);

    if (item.AnhChanDung) {
        document.getElementById('nt-avatar-preview').innerHTML =
            `<img src="${item.AnhChanDung}" alt="">`;
    }

    // ── Khóa modal nếu đã kết thúc ──
    _ntKhoaToanBoModal(daKetThuc);

    ntMoOverlay('nt-modal-overlay');
    ntChuyenTabById('tab-co-ban');
}

// Khóa/mở toàn bộ modal
function _ntKhoaToanBoModal(khoa) {
    const modal = document.getElementById('nt-modal-box');
    if (!modal) return;

    // Khóa tất cả input/select/textarea/button trong modal body
    const fields = modal.querySelectorAll(
        '.nt-modal-body input, .nt-modal-body select, ' +
        '.nt-modal-body textarea, .nt-modal-body button, ' +
        '#phong-display-box'
    );

    fields.forEach(el => {
        el.disabled = khoa;
        el.style.opacity = khoa ? '0.55' : '';
        el.style.cursor = khoa ? 'not-allowed' : '';
        el.style.pointerEvents = khoa ? 'none' : '';
    });

    // Ẩn/hiện nút Lưu
    const btnSubmit = document.getElementById('nt-btn-submit');
    if (btnSubmit) {
        btnSubmit.style.display = khoa ? 'none' : '';
    }

    // Banner cảnh báo toàn modal
    let banner = document.getElementById('nt-modal-readonly-banner');
    if (khoa) {
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'nt-modal-readonly-banner';
            banner.style.cssText = `
                display: flex; align-items: center; gap: 10px;
                padding: 10px 16px; margin: 0;
                background: #f3f4f6; border-bottom: 1px solid #e5e7eb;
                font-size: 12.5px; color: #6b7280; font-weight: 600;
                flex-shrink: 0;
            `;
            banner.innerHTML = `
                <i class="fas fa-lock" style="color:#9ca3af;font-size:13px;"></i>
                Hợp đồng đã kết thúc — chỉ xem, không thể chỉnh sửa.
            `;
            // Chèn banner vào sau tabs, trước modal-body
            const tabs = modal.querySelector('.nt-tabs');
            const body = modal.querySelector('.nt-modal-body');
            if (tabs && body) tabs.after(banner);
        }
        banner.style.display = 'flex';
    } else {
        if (banner) banner.style.display = 'none';
    }
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

    // Gán nút Sửa
    const btnSua = document.getElementById('nt-detail-btn-sua');
    if (btnSua) btnSua.onclick = () => {
        ntDongOverlay('nt-detail-overlay');
        ntMoModalSua(id);
    };

    const body = document.getElementById('nt-detail-body');
    body.innerHTML = `
    <!-- Profile hero -->
    <div class="nt-detail-hero">
      <div class="nt-detail-ava">
        ${item.AnhChanDung
            ? `<img src="${ntEscape(item.AnhChanDung)}" alt="">`
            : ntLayChuCai(item.HoTen)}
      </div>
      <div>
        <div class="nt-detail-name">${ntEscape(item.HoTen)}</div>
        <div class="nt-detail-sub">
          <i class="fas fa-phone" style="color:#0891b2;margin-right:4px;font-size:11px;"></i>
          ${ntEscape(item.SoDienThoai || '—')}
          &nbsp;•&nbsp;
          ${ntBadgeTrangThai(item.TrangThai)}
        </div>
      </div>
    </div>

    <!-- Thông tin cá nhân -->
    <div class="nt-detail-sec">
      <i class="fas fa-id-card"></i> Thông tin cá nhân
    </div>
    <div class="nt-detail-grid">
      <div class="nt-detail-item">
        <div class="nt-detail-key">Họ và tên</div>
        <div class="nt-detail-val">${ntEscape(item.HoTen || '—')}</div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Số điện thoại</div>
        <div class="nt-detail-val">${ntEscape(item.SoDienThoai || '—')}</div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Email</div>
        <div class="nt-detail-val">${ntEscape(item.Email || '—')}</div>
      </div>
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
        <div class="nt-detail-key">Quê quán</div>
        <div class="nt-detail-val">${ntEscape(item.QueQuan || '—')}</div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Tên đăng nhập</div>
        <div class="nt-detail-val">
          <i class="fas fa-at" style="color:#0891b2;font-size:11px;margin-right:3px;"></i>
          ${ntEscape(item.Username || '—')}
        </div>
      </div>
      <div class="nt-detail-item full">
        <div class="nt-detail-key">Địa chỉ thường trú</div>
        <div class="nt-detail-val">${ntEscape(item.DiaChiThuongTru || '—')}</div>
      </div>
      ${item.GhiChu ? `
      <div class="nt-detail-item full">
        <div class="nt-detail-key">Ghi chú</div>
        <div class="nt-detail-val" style="font-weight:400;">${ntEscape(item.GhiChu)}</div>
      </div>` : ''}
    </div>

    <!-- Thông tin phòng & hợp đồng -->
    <div class="nt-detail-sec" style="margin-top:12px;">
      <i class="fas fa-door-open"></i> Phòng &amp; Hợp đồng
    </div>
    <div class="nt-detail-grid">
      <div class="nt-detail-item">
        <div class="nt-detail-key">Phòng</div>
        <div class="nt-detail-val">
          <span style="background:var(--mau-chu-de-nhat);color:var(--mau-chu-de);
                       padding:2px 10px;border-radius:99px;font-weight:800;font-size:12px;">
            ${ntEscape(item.SoPhong || '—')}
          </span>
        </div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Trạng thái HĐ</div>
        <div class="nt-detail-val">${ntEscape(item.TrangThaiHD || '—')}</div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Ngày vào ở</div>
        <div class="nt-detail-val">${ntDinhDangNgay(item.NgayVaoO) || '—'}</div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Ngày hết hạn HĐ</div>
        <div class="nt-detail-val">
          ${item.NgayKetThuc
            ? `${ntDinhDangNgay(item.NgayKetThuc)}
               <span style="font-size:10.5px;color:${(item.SoNgayConLai ?? 999) < 0 ? 'var(--mau-do)' : '#d97706'};">
                 (${(item.SoNgayConLai ?? 0) < 0
                ? 'Đã hết hạn'
                : `Còn ${item.SoNgayConLai} ngày`})
               </span>`
            : '<span style="color:var(--mau-chu-phu);font-style:italic;">Không thời hạn</span>'}
        </div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Tiền cọc</div>
        <div class="nt-detail-val" style="color:var(--mau-chu-de);font-weight:800;">
          ${item.TienCoc ? ntDinhDangTien(item.TienCoc) : '—'}
        </div>
      </div>
      <div class="nt-detail-item">
        <div class="nt-detail-key">Trạng thái tài khoản</div>
        <div class="nt-detail-val">
          ${item.IsActive
            ? '<span style="color:#059669;">✅ Đang hoạt động</span>'
            : '<span style="color:#9ca3af;">⛔ Đã khóa</span>'}
        </div>
      </div>
      ${item.DienDauKy != null ? `
      <div class="nt-detail-item">
        <div class="nt-detail-key">Điện đầu kỳ</div>
        <div class="nt-detail-val">${item.DienDauKy} kWh</div>
      </div>` : ''}
      ${item.NuocDauKy != null ? `
      <div class="nt-detail-item">
        <div class="nt-detail-key">Nước đầu kỳ</div>
        <div class="nt-detail-val">${item.NuocDauKy} m³</div>
      </div>` : ''}
      ${item.GhiChuHD ? `
      <div class="nt-detail-item full">
        <div class="nt-detail-key">Ghi chú hợp đồng</div>
        <div class="nt-detail-val" style="font-weight:400;">${ntEscape(item.GhiChuHD)}</div>
      </div>` : ''}
    </div>
${(item.NguoiOGhep?.length > 0 || item.NguoiGhepCanHopDong?.length > 0) ? `
    <div class="nt-detail-sec" style="margin-top:12px;">
        <i class="fas fa-user-friends"></i>
        Người ở ghép
        (${(item.NguoiOGhep?.length || 0) + (item.NguoiGhepCanHopDong?.length || 0)})
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;">

        ${(item.NguoiOGhep || []).map(ko => `
        <div style="display:flex;align-items:center;gap:12px;
                    background:var(--mau-nen);border-radius:var(--radius-sm);
                    padding:10px 13px;border:1px solid var(--mau-vien);">
            <div style="width:38px;height:38px;border-radius:50%;flex-shrink:0;
                        background:linear-gradient(135deg,#7c3aed,#9333ea);
                        display:flex;align-items:center;justify-content:center;
                        color:#fff;font-size:14px;font-weight:800;">
                ${ntLayChuCai(ko.hoTen)}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:13.5px;color:var(--mau-chu);">
                    ${ntEscape(ko.hoTen)}
                    ${ko.isChinhChu ? `<span style="font-size:10px;background:#fef3c7;
                        color:#b45309;padding:1px 6px;border-radius:99px;
                        font-weight:700;margin-left:5px;">Chủ phòng</span>` : ''}
                </div>
                <div style="font-size:11.5px;color:var(--mau-chu-phu);margin-top:2px;">
                    <i class="fas fa-phone" style="font-size:9px;color:#059669;"></i>
                    ${ntEscape(ko.soDienThoai || '—')}
                    ${ko.soCCCD ? ` &nbsp;·&nbsp; <i class="fas fa-id-card"
                        style="font-size:9px;"></i> ${ntEscape(ko.soCCCD)}` : ''}
                    ${ko.quanHe ? ` &nbsp;·&nbsp; ${ntEscape(ko.quanHe)}` : ''}
                </div>
                <div style="font-size:11px;color:var(--mau-chu-phu);margin-top:2px;">
                    <i class="fas fa-calendar-check" style="font-size:9px;color:#0891b2;"></i>
                    Vào: ${ntDinhDangNgay(ko.ngayVao)}
                </div>
            </div>
            <button class="nt-act nt-act-view"
                    title="Xem chi tiết"
                    style="background:rgba(124,58,237,0.1);color:#7c3aed;"
                    onclick="ntDongOverlay('nt-detail-overlay');
                             ntXemChiTietGhep(${ko.idKhachO}, ${item.IDKhachThue})">
                <i class="fas fa-eye"></i>
            </button>
        </div>`).join('')}

        ${(item.NguoiGhepCanHopDong || []).map(ko => `
        <div style="display:flex;align-items:center;gap:12px;
                    background:rgba(234,88,12,0.04);border-radius:var(--radius-sm);
                    padding:10px 13px;border:1px solid rgba(234,88,12,0.25);">
            <div style="width:38px;height:38px;border-radius:50%;flex-shrink:0;
                        background:linear-gradient(135deg,#ea580c,#f97316);
                        display:flex;align-items:center;justify-content:center;
                        color:#fff;font-size:14px;font-weight:800;">
                ${ntLayChuCai(ko.hoTen || ko.HoTen)}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:13.5px;color:var(--mau-chu);">
                    ${ntEscape(ko.hoTen || ko.HoTen)}
                    <span style="font-size:10px;background:rgba(234,88,12,0.1);
                        color:#ea580c;padding:1px 6px;border-radius:99px;
                        font-weight:700;margin-left:5px;">Chưa có HĐ</span>
                </div>
                <div style="font-size:11.5px;color:var(--mau-chu-phu);margin-top:2px;">
                    <i class="fas fa-phone" style="font-size:9px;color:#059669;"></i>
                    ${ntEscape(ko.soDienThoai || ko.SoDienThoai || '—')}
                    ${(ko.quanHe || ko.QuanHe) ? ` &nbsp;·&nbsp;
                        ${ntEscape(ko.quanHe || ko.QuanHe)}` : ''}
                </div>
                <div style="font-size:11px;color:var(--mau-chu-phu);margin-top:2px;">
                    <i class="fas fa-calendar-check" style="font-size:9px;color:#0891b2;"></i>
                    Vào: ${ntDinhDangNgay(ko.ngayVao || ko.NgayVao)}
                </div>
            </div>
            <button class="nt-act"
                    title="Lập hợp đồng mới"
                    style="background:rgba(5,150,105,0.1);color:#059669;
                           width:30px;height:30px;"
                    onclick="ntDongOverlay('nt-detail-overlay');
                             ngGhep_moModalHD(${ko.idKhachO || ko.IDKhachO},
                             '${ntEscape(ko.hoTen || ko.HoTen)}',
                             ${item.IDPhong}, '${ntEscape(item.SoPhong)}')">
                <i class="fas fa-file-contract"></i>
            </button>
        </div>`).join('')}

    </div>` : ''}
    `;

    ntMoOverlay('nt-detail-overlay');
}
function ntXemChiTietGhep(idKhachO, idChuPhong) {
    const chuPhong = NT.duLieu.find(x => x.IDKhachThue === idChuPhong);
    const ko = chuPhong?.NguoiOGhep?.find(k => k.idKhachO === idKhachO);
    if (!ko || !chuPhong) return;

    document.getElementById('nt-detail-mo-ta').textContent = `Người ở ghép — Phòng ${chuPhong.SoPhong}`;

    const btnSua = document.getElementById('nt-detail-btn-sua');
    if (btnSua) btnSua.style.display = 'none';

    const body = document.getElementById('nt-detail-body');
    body.innerHTML = `
    <!-- Hero người ở ghép (giữ nguyên) -->
    <div class="nt-detail-hero" style="background:rgba(124,58,237,0.06);border:1.5px solid rgba(124,58,237,0.15);">
        <div class="nt-detail-ava" style="background:linear-gradient(135deg,#7c3aed,#9333ea);">
            ${ntLayChuCai(ko.hoTen)}
        </div>
        <div>
            <div class="nt-detail-name">${ntEscape(ko.hoTen)}</div>
            <div class="nt-detail-sub">
                <span style="display:inline-flex;align-items:center;gap:5px;
                             background:rgba(124,58,237,0.1);color:#7c3aed;
                             padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">
                    <i class="fas fa-user-friends" style="font-size:9px;"></i>
                    Người ở ghép · Phòng ${ntEscape(chuPhong.SoPhong)}
                </span>
            </div>
        </div>
    </div>

    <!-- Thông tin cá nhân người ở ghép -->
    <div class="nt-detail-sec">
        <i class="fas fa-id-card"></i> Thông tin cá nhân
    </div>
    <div class="nt-detail-grid">
        <div class="nt-detail-item">
            <div class="nt-detail-key">Họ và tên</div>
            <div class="nt-detail-val">${ntEscape(ko.hoTen || '—')}</div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Số điện thoại</div>
            <div class="nt-detail-val">${ntEscape(ko.soDienThoai || '—')}</div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Số CCCD</div>
            <div class="nt-detail-val">${ntEscape(ko.soCCCD || '—')}</div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Ngày sinh</div>
            <div class="nt-detail-val">${ntDinhDangNgay(ko.ngaySinh) || '—'}</div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Giới tính</div>
            <div class="nt-detail-val">${ntEscape(ko.gioiTinh || '—')}</div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Quan hệ với chủ phòng</div>
            <div class="nt-detail-val">${ntEscape(ko.quanHe || '—')}</div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Ngày vào ở</div>
            <div class="nt-detail-val">${ntDinhDangNgay(ko.ngayVao) || '—'}</div>
        </div>
        ${ko.ghiChu ? `
        <div class="nt-detail-item full">
            <div class="nt-detail-key">Ghi chú</div>
            <div class="nt-detail-val" style="font-weight:400;">${ntEscape(ko.ghiChu)}</div>
        </div>` : ''}
    </div>

    <!-- THÊM MỚI: Thông tin chủ phòng -->
    <div class="nt-detail-sec" style="margin-top:12px;">
        <i class="fas fa-user-tie"></i> Thông tin chủ phòng
    </div>
    <div class="nt-detail-grid">
        <div class="nt-detail-item">
            <div class="nt-detail-key">Họ và tên</div>
            <div class="nt-detail-val">
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;
                                background:linear-gradient(135deg,#06b6d4,#0891b2);
                                display:flex;align-items:center;justify-content:center;
                                color:#fff;font-size:11px;font-weight:800;">
                        ${ntLayChuCai(chuPhong.HoTen)}
                    </div>
                    ${ntEscape(chuPhong.HoTen || '—')}
                </div>
            </div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Số điện thoại</div>
            <div class="nt-detail-val">
                <i class="fas fa-phone" style="color:#059669;font-size:11px;margin-right:4px;"></i>
                ${ntEscape(chuPhong.SoDienThoai || '—')}
            </div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Email</div>
            <div class="nt-detail-val">${ntEscape(chuPhong.Email || '—')}</div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Số CCCD</div>
            <div class="nt-detail-val">${ntEscape(chuPhong.SoCCCD || '—')}</div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Phòng</div>
            <div class="nt-detail-val">
                <span style="background:var(--mau-chu-de-nhat);color:var(--mau-chu-de);
                             padding:2px 10px;border-radius:99px;font-weight:800;font-size:12px;">
                    ${ntEscape(chuPhong.SoPhong || '—')}
                </span>
            </div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Trạng thái hợp đồng</div>
            <div class="nt-detail-val">${ntEscape(chuPhong.TrangThaiHD || '—')}</div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Ngày vào ở</div>
            <div class="nt-detail-val">${ntDinhDangNgay(chuPhong.NgayVaoO) || '—'}</div>
        </div>
        <div class="nt-detail-item">
            <div class="nt-detail-key">Hạn hợp đồng</div>
            <div class="nt-detail-val">
                ${chuPhong.NgayKetThuc
            ? `${ntDinhDangNgay(chuPhong.NgayKetThuc)}
                       <span style="font-size:10.5px;color:${(chuPhong.SoNgayConLai ?? 999) < 0 ? 'var(--mau-do)' : '#d97706'};">
                         (${(chuPhong.SoNgayConLai ?? 0) < 0 ? 'Đã hết hạn' : `Còn ${chuPhong.SoNgayConLai} ngày`})
                       </span>`
            : '<span style="color:var(--mau-chu-phu);font-style:italic;">Không thời hạn</span>'}
            </div>
        </div>
    </div>`;

    ntMoOverlay('nt-detail-overlay');
}

window.ntXemChiTietGhep = ntXemChiTietGhep;
function ntDongModalDetail(e) {
    // ✅ Dùng đúng id có trong HTML
    if (e && e.target !== document.getElementById('nt-detail-overlay')) return;
    ntDongOverlay('nt-detail-overlay');
}

/* ================================================================
   MODAL: XÓA / TRẢ PHÒNG
================================================================ */
function ntMoModalXoa(id) {
    const item = NT.duLieu.find(x => x.IDKhachThue === id);
    if (!item) return;

    document.getElementById('inp-xoa-id-khach-thue').value = id;
    document.getElementById('inp-ly-do-xoa').value = '';
    document.getElementById('inp-xoa-id-user').value = item.IDUser;

    const coNguoiGhep = item.NguoiOGhep?.length > 0;
    const tenNguoiGhep = coNguoiGhep
        ? item.NguoiOGhep.map(ng => `<strong>${ntEscape(ng.hoTen)}</strong>`).join(', ')
        : '';

    document.getElementById('nt-xoa-noi-dung').innerHTML =
        `Bạn có chắc muốn trả phòng cho <strong>${ntEscape(item.HoTen)}</strong> (Phòng ${ntEscape(item.SoPhong)})?
     Thao tác này sẽ kết thúc hợp đồng và đánh dấu phòng là trống.`
        + (coNguoiGhep
            ? `<br><br><span style="color:#ea580c;font-weight:600;">
                <i class="fas fa-exclamation-circle"></i>
                Phòng có người ở ghép: ${tenNguoiGhep}.
                Họ sẽ <u>vẫn còn trên bảng</u> và bạn có thể lập hợp đồng mới cho họ ngay sau đó.
               </span>`
            : '');

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
        'inp-id-khach-thue', 'inp-id-hop-dong', 'inp-id-user'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

    ['err-ho-ten', 'err-so-dien-thoai', 'err-username', 'err-password', 'err-ngay-vao-o', 'err-id-phong']
        .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });

    document.getElementById('nt-avatar-preview').innerHTML = '<i class="fas fa-user"></i>';
    document.getElementById('nt-room-preview').style.display = 'none';

    _ntKhoaToanBoModal(false);
}

/* ================================================================
   TAB HANDLING
================================================================ */
function ntChuyenCheDoPHong(mode, item) {
    const isThemMoi = mode === 'them';

    const pickerBox = document.getElementById('phong-display-box');
    if (pickerBox) {
        pickerBox.style.display = isThemMoi ? '' : 'none';
        pickerBox.style.pointerEvents = isThemMoi ? '' : 'none';
    }
    const inpPhong = document.getElementById('inp-id-phong');
    if (inpPhong) inpPhong.style.display = isThemMoi ? '' : 'none';
    // Banner thông báo
    const banner = document.getElementById('nt-phong-readonly-banner');
    if (banner) banner.style.display = isThemMoi ? 'none' : 'block';

    const selPhong = document.getElementById('inp-id-phong');
    const divPhongHienTai = document.getElementById('nt-phong-hien-tai');
    const hintPhong = document.getElementById('hint-phong');
    const reqPhong = document.getElementById('req-id-phong');
    const reqNgay = document.getElementById('req-ngay-vao-o');

    if (isThemMoi) {
        if (selPhong) selPhong.style.display = '';
        if (divPhongHienTai) divPhongHienTai.style.display = 'none';
        if (hintPhong) hintPhong.textContent = 'Chỉ hiện phòng đang trống';
        if (reqPhong) reqPhong.style.display = '';
        if (reqNgay) reqNgay.style.display = '';
    } else {
        if (selPhong) selPhong.style.display = 'none';
        if (divPhongHienTai) divPhongHienTai.style.display = 'block';
        if (hintPhong) hintPhong.textContent = 'Phòng hiện tại của người thuê';
        if (reqPhong) reqPhong.style.display = 'none';
        if (reqNgay) reqNgay.style.display = 'none';

        const tenPhong = document.getElementById('nt-phong-hien-tai-ten');
        if (tenPhong) tenPhong.textContent = item?.SoPhong
            ? `Phòng ${item.SoPhong}`
            : '(Chưa cập nhật phòng — reload trang)';

        const hiddenPhong = document.getElementById('inp-id-phong-sua');
        if (hiddenPhong) hiddenPhong.value = item?.IDPhong || '';

        const ngayVao = document.getElementById('inp-ngay-vao-o');
        if (ngayVao && item?.NgayVaoO)
            ngayVao.value = item.NgayVaoO.split('T')[0];

        const ngayKT = document.getElementById('inp-ngay-ket-thuc');
        if (ngayKT && item?.NgayKetThuc)
            ngayKT.value = item.NgayKetThuc.split('T')[0];

        const tienCoc = document.getElementById('inp-tien-coc');
        if (tienCoc) tienCoc.value = item?.TienCoc || '';

        const trangThaiHD = document.getElementById('hien-thi-trang-thai-hd');
        if (trangThaiHD) trangThaiHD.textContent =
            item?.TrangThai === 'dang-o' ? '✅ Đang hiệu lực' : '⛔ Đã kết thúc';

        if (!item?.SoPhong && item?.IDUser) {
            fetch(`/api/ChuTroQuanLyNguoiThue/ds-nguoi-thue`)
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        const found = data.danhSach.find(x => x.idUser === item.IDUser
                            && x.trangThaiHD === 'Đang hiệu lực');
                        if (found && tenPhong) {
                            tenPhong.textContent = `Phòng ${found.soPhong}`;
                        }
                    }
                }).catch(() => { });
        }

        document.getElementById('field-dien-dau-ky').style.display = 'none';
        document.getElementById('field-nuoc-dau-ky').style.display = 'none';
        document.getElementById('field-trang-thai-hd').style.display = '';
        document.getElementById('nt-room-preview').style.display = 'none';
        // ── KHÔNG gọi _ntKhoaTabPhong nữa, _ntKhoaToanBoModal xử lý rồi ──
    }
}
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
let _overlayCount = 0;
function ntMoOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('mo');
    _overlayCount++;
    document.body.style.overflow = 'hidden';
}

function ntDongOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('mo');
    _overlayCount = Math.max(0, _overlayCount - 1);
    if (_overlayCount === 0) {
        document.body.style.overflow = '';
    }
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
/* ============================================================
   ROOM PICKER — Biến trạng thái
============================================================ */
let _pickerPhongs = [];        // cache toàn bộ phòng từ API
let _pickerDaChon = null;      // { IDPhong, SoPhong, Tang, TrangThai, GiaPhongFix }

/* Mở picker */
async function ntMoPickerPhong() {
    const overlay = document.getElementById('nt-picker-overlay');
    if (overlay) overlay.classList.add('mo');
    const inp = document.getElementById('picker-search-inp');
    if (inp) inp.value = '';
    // KHÔNG set document.body.style.overflow ở đây

    if (_pickerPhongs.length === 0) {
        await _pickerTaiPhong();
    } else {
        ntPickerLoc();
    }
}

/* Đóng picker */
function ntDongPickerPhong(e) {
    if (e && e.target !== document.getElementById('nt-picker-overlay')) return;
    document.getElementById('nt-picker-overlay').classList.remove('mo');
}

/* Gọi API lấy danh sách phòng */
async function _pickerTaiPhong() {
    const loading = document.getElementById('picker-loading');
    const grid = document.getElementById('picker-grid');
    const empty = document.getElementById('picker-empty');

    loading.style.display = 'flex';
    grid.style.display = 'none';
    empty.style.display = 'none';

    try {
        const res = await fetch('/api/ChuTro/DanhSachPhong');
        const data = await res.json();
        _pickerPhongs = data;
        console.log('API response:', data[0]);
        ntPickerLoc();
    } catch (err) {
        loading.innerHTML = '<i class="fas fa-exclamation-triangle" style="color:var(--mau-do)"></i> Không tải được danh sách phòng';
    }
}

/* Lọc + render cards */
function ntPickerLoc() {
    const keyword = (document.getElementById('picker-search-inp').value || '').toLowerCase().trim();
    const ttFilter = document.getElementById('picker-filter-trang-thai').value;

    const filtered = _pickerPhongs.filter(p => {
        const matchTT = !ttFilter || p.trangThai === ttFilter;
        const matchKey = !keyword || (p.soPhong || '').toLowerCase().includes(keyword)
            || String(p.tang || '').includes(keyword);
        return matchTT && matchKey;
    });

    _pickerRender(filtered);
}

/* Render grid cards */
function _pickerRender(list) {
    const loading = document.getElementById('picker-loading');
    const grid = document.getElementById('picker-grid');
    const empty = document.getElementById('picker-empty');

    loading.style.display = 'none';

    if (list.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = list.map(p => {
        const isSelected = _pickerDaChon && _pickerDaChon.IDPhong === p.idPhong;
        const badgeClass = {
            'Trống': 'rp-badge-trong',
            'Đã thuê': 'rp-badge-datthue',
            'Đang sửa': 'rp-badge-suachua'
        }[p.trangThai] || 'rp-badge-trong';

        const disabled = p.trangThai !== 'Trống' ? 'disabled' : '';

        return `
        <div class="rp-card ${isSelected ? 'selected' : ''} ${disabled}"
             onclick="_pickerChonPhong(${p.idPhong}, '${p.soPhong}', ${p.khu}, '${p.trangThai}', ${p.giaPhongFix})">
            <div class="rp-check"><i class="fas fa-check"></i></div>
            <div class="rp-so-phong">P.${p.soPhong}</div>
            <div class="rp-tang">Khu ${p.khu}</div>
            <span class="rp-badge ${badgeClass}">${p.trangThai}</span>
            <div class="rp-gia">${_fmtTien(p.giaPhongFix)}/tháng</div>
        </div>`;
    }).join('');
}

/* Chọn phòng → cập nhật form */
function _pickerChonPhong(id, soPhong, khu, trangThai, gia) {
    _pickerDaChon = {
        IDPhong: id, SoPhong: soPhong, Khu: khu,
        TrangThai: trangThai, GiaPhongFix: gia
    };

    document.getElementById('inp-id-phong').value = id;
    document.getElementById('phong-display-text').textContent = `Phòng ${soPhong} — Khu ${khu}`;
    document.getElementById('phong-display-text').style.color = 'var(--mau-chu)';
    document.getElementById('err-id-phong').textContent = '';

    _pickerHienThiPreview(soPhong, khu, trangThai, gia);
    document.getElementById('nt-picker-overlay').classList.remove('mo');

    _pickerRender(_pickerPhongs.filter(p => {
        const ttFilter = document.getElementById('picker-filter-trang-thai').value;
        return !ttFilter || p.trangThai === ttFilter;
    }));
}

/* Hiện preview phòng đã chọn trong tab 3 */
function _pickerHienThiPreview(soPhong, khu, trangThai, gia) {
    const preview = document.getElementById('nt-room-preview');
    const body = document.getElementById('nt-rp-body');

    body.innerHTML = `
        <div><div class="nt-rp-key">Số phòng</div><div class="nt-rp-val">Phòng ${soPhong}</div></div>
        <div><div class="nt-rp-key">Khu</div><div class="nt-rp-val">Khu ${khu}</div></div>
        <div><div class="nt-rp-key">Trạng thái</div><div class="nt-rp-val">${trangThai}</div></div>
        <div><div class="nt-rp-key">Giá thuê</div><div class="nt-rp-val">${_fmtTien(gia)}/tháng</div></div>
    `;
    preview.style.display = 'block';
}
function ntLayDuLieuForm() {
    const get = id => (document.getElementById(id)?.value || '').trim();

    const duLieu = {
        // ── Tab 1: Thông tin cơ bản ──
        HoTen: get('inp-ho-ten'),
        SoDienThoai: get('inp-so-dien-thoai').replace(/\s/g, ''),
        Email: get('inp-email'),
        NgaySinh: get('inp-ngay-sinh') || null,
        GioiTinh: get('inp-gioi-tinh') || null,
        SoCCCD: get('inp-so-cccd'),
        NgayCapCCCD: get('inp-ngay-cap-cccd') || null,
        NoiCapCCCD: get('inp-noi-cap-cccd'),
        NgheNghiep: get('inp-nghe-nghiep'),
        LienHeKhan: get('inp-lien-he-khan'),
        SDTKhan: get('inp-sdt-khan'),

        // ── Tab 2: Cư trú & Tài khoản ──
        DiaChi: get('inp-dia-chi'),
        DiaChiThuongTru: get('inp-dia-chi'),
        TinhThanh: get('inp-tinh-thanh'),
        QueQuan: get('inp-que-quan'),
        GhiChu: get('inp-ghi-chu'),
        Username: get('inp-username'),
        Password: get('inp-password') || null,

        // ── Tab 3: Phòng & Hợp đồng ──
        NgayVaoO: get('inp-ngay-vao-o') || null,
        IDPhong: parseInt(get('inp-id-phong')) || null,
        TienCoc: parseFloat(get('inp-tien-coc')) || 0,
        NgayKetThuc: get('inp-ngay-ket-thuc') || null,
        DienDauKy: parseInt(get('inp-dien-dau-ky')) || 0,
        NuocDauKy: parseInt(get('inp-nuoc-dau-ky')) || 0,
        GhiChuHD: get('inp-ghi-chu-hd'),

        // ── Ảnh (base64 nếu có) ──
        AnhChanDung: (function () {
            const img = document.querySelector('#nt-avatar-preview img');
            return img ? img.src : null;
        })(),
    };

    return duLieu;
}
function ntValidateDuLieu(duLieu, mode) {
    let ok = true;

    // Helper
    const setErr = (id, msg) => {
        const el = document.getElementById(id);
        if (el) el.textContent = msg;
    };
    const clearErr = (...ids) => ids.forEach(id => setErr(id, ''));
    const goTab = tabId => ntChuyenTabById(tabId);

    // Reset tất cả lỗi
    clearErr(
        'err-ho-ten', 'err-so-dien-thoai', 'err-email',
        'err-so-cccd', 'err-username', 'err-password',
        'err-ngay-vao-o', 'err-id-phong'
    );

    // ══════════════════════════════════════════
    // TAB 1 — Thông tin cơ bản
    // ══════════════════════════════════════════

    // Họ tên: bắt buộc, chỉ chữ và khoảng trắng
    if (!duLieu.HoTen) {
        setErr('err-ho-ten', 'Họ tên không được để trống');
        goTab('tab-co-ban'); ok = false;
    } else if (!/^[\p{L}\s]+$/u.test(duLieu.HoTen)) {
        setErr('err-ho-ten', 'Họ tên không được chứa số hoặc ký tự đặc biệt');
        goTab('tab-co-ban'); ok = false;
    } else if (duLieu.HoTen.length < 2 || duLieu.HoTen.length > 100) {
        setErr('err-ho-ten', 'Họ tên phải từ 2 đến 100 ký tự');
        goTab('tab-co-ban'); ok = false;
    }

    // Số điện thoại: bắt buộc, 10 số, bắt đầu bằng 0
    if (!duLieu.SoDienThoai) {
        setErr('err-so-dien-thoai', 'Số điện thoại không được để trống');
        goTab('tab-co-ban'); ok = false;
    } else if (!/^0[0-9]{9}$/.test(duLieu.SoDienThoai)) {
        setErr('err-so-dien-thoai', 'Số điện thoại phải là 10 chữ số, bắt đầu bằng 0');
        goTab('tab-co-ban'); ok = false;
    }

    // Email: không bắt buộc nhưng nếu nhập phải đúng định dạng
    if (duLieu.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(duLieu.Email)) {
        setErr('err-email', 'Email không đúng định dạng');
        goTab('tab-co-ban'); ok = false;
    }

    // CCCD: không bắt buộc, nếu nhập phải là 9 hoặc 12 số
    if (duLieu.SoCCCD && !/^[0-9]{9}$|^[0-9]{12}$/.test(duLieu.SoCCCD)) {
        setErr('err-so-cccd', 'CCCD phải là 9 hoặc 12 chữ số');
        goTab('tab-co-ban'); ok = false;
    }

    // ══════════════════════════════════════════
    // TAB 2 — Tài khoản
    // ══════════════════════════════════════════

    if (!duLieu.Username) {
        setErr('err-username', 'Tên đăng nhập không được để trống');
        goTab('tab-cu-tru'); ok = false;
    } else if (!/^[a-zA-Z0-9_]{3,50}$/.test(duLieu.Username)) {
        setErr('err-username', 'Username chỉ gồm chữ, số, gạch dưới (3–50 ký tự)');
        goTab('tab-cu-tru'); ok = false;
    }

    // Password: bắt buộc khi thêm mới
    if (mode === 'them') {
        if (!duLieu.Password) {
            setErr('err-password', 'Mật khẩu không được để trống');
            goTab('tab-cu-tru'); ok = false;
        } else if (duLieu.Password.length < 6) {
            setErr('err-password', 'Mật khẩu tối thiểu 6 ký tự');
            goTab('tab-cu-tru'); ok = false;
        } else if (duLieu.Password.length > 100) {
            setErr('err-password', 'Mật khẩu không được quá 100 ký tự');
            goTab('tab-cu-tru'); ok = false;
        }
    }

    // ══════════════════════════════════════════
    // TAB 3 — Phòng & Hợp đồng (chỉ khi thêm mới)
    // ══════════════════════════════════════════
    if (mode === 'them') {

        // Ngày vào ở: bắt buộc, không được là tương lai quá 1 năm
        if (!duLieu.NgayVaoO) {
            setErr('err-ngay-vao-o', 'Vui lòng chọn ngày vào ở');
            goTab('tab-phong'); ok = false;
        } else {
            const ngayVao = new Date(duLieu.NgayVaoO);
            const maxNgay = new Date();
            maxNgay.setFullYear(maxNgay.getFullYear() + 1);
            if (ngayVao > maxNgay) {
                setErr('err-ngay-vao-o', 'Ngày vào ở không được quá 1 năm trong tương lai');
                goTab('tab-phong'); ok = false;
            }
        }

        // Phòng: bắt buộc
        if (!duLieu.IDPhong) {
            setErr('err-id-phong', 'Vui lòng chọn phòng');
            goTab('tab-phong'); ok = false;
        }

        // Ngày kết thúc: nếu có thì phải sau ngày vào ở
        if (duLieu.NgayKetThuc && duLieu.NgayVaoO) {
            if (new Date(duLieu.NgayKetThuc) <= new Date(duLieu.NgayVaoO)) {
                setErr('err-ngay-vao-o', 'Ngày hết hạn HĐ phải sau ngày vào ở');
                goTab('tab-phong'); ok = false;
            }
        }

        // Tiền cọc: không âm
        if (duLieu.TienCoc < 0) {
            goTab('tab-phong'); ok = false;
        }
    }

    return ok;
}
/* Format tiền */
function _fmtTien(val) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}
async function ntLuuNguoiThue() {
    const mode = document.getElementById('nt-modal-mode').value;
    const duLieu = ntLayDuLieuForm();

    if (!ntValidateDuLieu(duLieu, mode)) return;

    const btn = document.getElementById('nt-btn-submit');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    }

    try {

        /* ══════════════════════════════════════════════════════
           THÊM MỚI
        ══════════════════════════════════════════════════════ */
        if (mode === 'them') {
            const res = await fetch('/api/ChuTroThemNguoiThue/them-nguoi-thue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieu),
            });
            const result = await res.json();

            if (!res.ok) {
                hienToast(result.message || result.title || 'Lỗi không xác định', 'error');
                return;
            }

            hienToast(`Đã thêm người thuê "${duLieu.HoTen}" thành công!`, 'success');

            // Reset picker để phòng vừa chọn không còn trống
            _pickerPhongs = [];
            _pickerDaChon = null;
        }

        /* ══════════════════════════════════════════════════════
           CHỈNH SỬA
        ══════════════════════════════════════════════════════ */
        else if (mode === 'sua') {
            const idKhachThue = document.getElementById('inp-id-hop-dong')?.value
                || document.getElementById('inp-id-khach-thue').value;
            const idUser = document.getElementById('inp-id-user').value;
            const trangThai = document.getElementById('inp-trang-thai')?.value || 'dang-o';

            /* ── Chuyển sang RỜI ĐI → gọi API trả phòng ── */
            if (trangThai === 'da-roi') {
                const lyDo = (document.getElementById('inp-ghi-chu')?.value || '').trim();

                const res = await fetch(`/api/ChuTroQuanLyNguoiThue/tra-phong/${idUser}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ GhiChu: lyDo }),
                });
                const result = await res.json();

                if (!res.ok) {
                    hienToast(result.message || result.title || 'Lỗi trả phòng', 'error');
                    return;
                }
                hienToast(`Đã trả phòng cho "${duLieu.HoTen}" thành công!`, 'success');

                // Nếu có người ở ghép còn lại → đóng modal chính, mở modal tạo HĐ cho người ghép
                if (result.coNguoiGhep && result.nguoiGhepConLai?.length > 0) {
                    ntDongOverlay('nt-modal-overlay');
                    await ntTaiDuLieu();
                    ngGhepHD_moModalDanhSach(result.nguoiGhepConLai);
                    return; // Không chạy tiếp ntTaiDuLieu ở dưới (đã gọi rồi)
                }
            }

            /* ── Vẫn đang ở → cập nhật thông tin ── */
            else {
                // Chỉ gửi các field cho phép sửa, KHÔNG gửi IDPhong/Password/Roles
                const payload = {
                    HoTen: duLieu.HoTen,
                    SoDienThoai: duLieu.SoDienThoai,
                    Email: duLieu.Email || null,
                    NgaySinh: duLieu.NgaySinh || null,
                    GioiTinh: duLieu.GioiTinh || null,
                    SoCCCD: duLieu.SoCCCD,
                    NgayCapCCCD: duLieu.NgayCapCCCD || null,
                    NoiCapCCCD: duLieu.NoiCapCCCD,
                    NgheNghiep: duLieu.NgheNghiep,
                    LienHeKhan: duLieu.LienHeKhan,
                    SDTKhan: duLieu.SDTKhan,
                    DiaChi: duLieu.DiaChi,
                    TinhThanh: duLieu.TinhThanh,
                    QueQuan: duLieu.QueQuan,
                    GhiChu: duLieu.GhiChu,
                    Username: duLieu.Username,
                    AnhChanDung: duLieu.AnhChanDung || null,
                    // Hợp đồng
                    NgayKetThuc: duLieu.NgayKetThuc || null,
                    TienCoc: duLieu.TienCoc || 0,
                    GhiChuHD: duLieu.GhiChuHD,
                };

                const res = await fetch(`/api/ChuTroQuanLyNguoiThue/cap-nhat/${idKhachThue}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const result = await res.json();

                if (!res.ok) {
                    hienToast(result.message || result.title || 'Lỗi cập nhật', 'error');
                    return;
                }
                hienToast(`Đã cập nhật thông tin "${duLieu.HoTen}" thành công!`, 'success');
            }
        }

        // Đóng modal và tải lại danh sách
        ntDongOverlay('nt-modal-overlay');
        await ntTaiDuLieu();

    } catch (e) {
        hienToast('Lỗi kết nối máy chủ!', 'error');
        console.error('[ntLuuNguoiThue]', e);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = mode === 'them'
                ? '<i class="fas fa-check"></i> <span id="nt-btn-submit-label">Thêm người thuê</span>'
                : '<i class="fas fa-save"></i>  <span id="nt-btn-submit-label">Lưu thay đổi</span>';
        }
    }
}
(function () {
    'use strict';

    const _S = {
        buocHienTai: 1,
        phongDaChon: null,
        danhSachPhong: [],
        dangTai: false,
    };

    function _escape(s) {
        return String(s || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function _fmtTien(v) {
        return new Intl.NumberFormat('vi-VN').format(v || 0) + 'đ';
    }
    function _getChuCai(ten) {
        if (!ten) return '?';
        const parts = String(ten).trim().split(/\s+/);
        return (parts[parts.length - 1]?.[0] || '?').toUpperCase();
    }
    function _getEl(id) { return document.getElementById(id); }
    function _setErr(id, msg) { const el = _getEl(id); if (el) el.textContent = msg; }
    function _clearErrs() {
        ['og-err-phong', 'og-err-ho-ten', 'og-err-username',
            'og-err-password', 'og-err-sdt', 'og-err-email',
            'og-err-cccd', 'og-err-ngay-vao'].forEach(id => _setErr(id, ''));
    }

    function _capNhatBuoc(buoc) {
        _S.buocHienTai = buoc;
        [1, 2, 3].forEach(b => {
            const el = _getEl(`og-buoc-${b}`);
            if (el) el.style.display = b === buoc ? 'block' : 'none';
        });
        [1, 2, 3].forEach(b => {
            const dot = _getEl(`og-step-${b}-dot`);
            if (!dot) return;
            dot.classList.remove('active', 'done');
            if (b < buoc) dot.classList.add('done');
            if (b === buoc) dot.classList.add('active');
        });
        document.querySelectorAll('.og-step-line').forEach((line, i) => {
            line.classList.toggle('done', (i + 1) < buoc);
        });
        const labels = ['', 'Bước 1 / 3 — Chọn phòng',
            'Bước 2 / 3 — Thông tin tài khoản',
            'Bước 3 / 3 — Thông tin cá nhân'];
        const ft = _getEl('og-step-label-ft');
        if (ft) ft.textContent = labels[buoc] || '';
        const btnBack = _getEl('og-btn-back');
        const btnNext = _getEl('og-btn-next');
        const btnSubmit = _getEl('og-btn-submit');
        if (btnBack) btnBack.style.display = buoc > 1 ? '' : 'none';
        if (btnNext) btnNext.style.display = buoc < 3 ? '' : 'none';
        if (btnSubmit) btnSubmit.style.display = buoc === 3 ? '' : 'none';
    }

    /* ── Room card renderer ── */
    function _renderPickerGrid(list) {
        const loading = _getEl('og-picker-loading');
        const grid = _getEl('og-picker-grid');
        const empty = _getEl('og-picker-empty');

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

        grid.innerHTML = list.map(p => {
            const isSelected = _S.phongDaChon && _S.phongDaChon.idPhong === p.idPhong;
            const tenChu = p.hopDong?.tenChuPhong || '—';
            const soNguoi = p.hopDong?.soNguoiOHienTai ?? 0;

            return `
            <div class="rp-card ${isSelected ? 'selected' : ''}"
                 onclick="oGhep._chonPhong(${p.idPhong})">
              <div class="rp-check"><i class="fas fa-check"></i></div>
              <div class="rp-so-phong">P.${_escape(p.soPhong)}</div>
              <div class="rp-tang">Khu ${_escape(String(p.khu))}</div>
              <span class="rp-badge ${badgeCls[p.trangThai] || 'rp-badge-trong'}">
                ${_escape(p.trangThai)}
              </span>
              <div class="rp-gia">${_fmtTien(p.giaPhongFix)}/tháng</div>

              <!-- Tên chủ phòng (new) -->
              <div style="margin-top:6px;padding-top:6px;
                          border-top:1px solid var(--mau-vien);
                          font-size:11px;color:var(--mau-chu);
                          font-weight:700;white-space:nowrap;
                          overflow:hidden;text-overflow:ellipsis;"
                   title="${_escape(tenChu)}">
                <i class="fas fa-user" style="font-size:9px;
                   color:#0891b2;margin-right:3px;"></i>
                ${_escape(tenChu)}
              </div>

              ${soNguoi > 0 ? `
              <div style="font-size:10.5px;color:#0891b2;margin-top:3px;">
                <i class="fas fa-users" style="font-size:9px;"></i>
                ${soNguoi} người đang ở
              </div>` : ''}
            </div>`;
        }).join('');
    }

    /* ── Public API ── */
    const pub = {

        moModal() {
            _clearErrs();
            _S.buocHienTai = 1;
            _S.phongDaChon = null;
            this._resetForm();
            _capNhatBuoc(1);
            const overlay = _getEl('og-modal-overlay');
            if (overlay) overlay.classList.add('mo');
            document.body.style.overflow = 'hidden';
        },

        dongModal() {
            const overlay = _getEl('og-modal-overlay');
            if (overlay) overlay.classList.remove('mo');
            document.body.style.overflow = '';
        },

        dongNeuClick(e) {
            if (e && e.target === _getEl('og-modal-overlay')) this.dongModal();
        },

        /* Gọi API thật, lấy phòng đang thuê kèm tên chủ phòng */
        async moPickerPhong() {
            const overlay = _getEl('og-picker-overlay');
            if (overlay) overlay.classList.add('mo');

            _getEl('og-picker-search').value = '';
            _getEl('og-picker-filter-tt').value = 'Đã thuê';

            // Nếu đã có cache, chỉ lọc lại
            if (_S.danhSachPhong.length > 0) {
                this.locPicker();
                return;
            }

            // Hiện loading
            const loading = _getEl('og-picker-loading');
            const grid = _getEl('og-picker-grid');
            const empty = _getEl('og-picker-empty');
            if (loading) loading.style.display = 'flex';
            if (grid) grid.style.display = 'none';
            if (empty) empty.style.display = 'none';

            try {
                const res = await fetch('/api/ChuTroQuanLyNguoiThue/ds-phong-dang-thue');
                const data = await res.json();

                if (!data.success) throw new Error(data.message || 'Lỗi API');

                _S.danhSachPhong = data.danhSach;
                this.locPicker();
            } catch (err) {
                console.error('[oGhep] moPickerPhong:', err);
                if (loading) loading.innerHTML =
                    '<i class="fas fa-exclamation-triangle" style="color:var(--mau-do);margin-right:6px;"></i>' +
                    'Không tải được danh sách phòng';
                if (typeof hienToast === 'function')
                    hienToast('Lỗi tải danh sách phòng: ' + err.message, 'error');
            }
        },

        dongPicker() {
            const overlay = _getEl('og-picker-overlay');
            if (overlay) overlay.classList.remove('mo');
        },

        dongPickerNeuClick(e) {
            if (e && e.target === _getEl('og-picker-overlay')) this.dongPicker();
        },

        locPicker() {
            const keyword = (_getEl('og-picker-search')?.value || '').toLowerCase().trim();
            const tt = _getEl('og-picker-filter-tt')?.value || '';

            const filtered = _S.danhSachPhong.filter(p => {
                const matchTT = !tt || p.trangThai === tt;
                const matchKey = !keyword
                    || String(p.soPhong).toLowerCase().includes(keyword)
                    || String(p.khu).includes(keyword)
                    || (p.hopDong?.tenChuPhong || '').toLowerCase().includes(keyword);
                return matchTT && matchKey;
            });
            _renderPickerGrid(filtered);
        },

        _chonPhong(idPhong) {
            const phong = _S.danhSachPhong.find(p => p.idPhong === idPhong);
            if (!phong) return;

            _S.phongDaChon = phong;

            const inp = _getEl('og-inp-id-phong');
            if (inp) inp.value = idPhong;

            const tenChu = phong.hopDong?.tenChuPhong || '—';
            const txt = _getEl('og-phong-display-text');
            if (txt) {
                txt.textContent = `Phòng ${phong.soPhong} — Khu ${phong.khu}`;
                txt.style.color = 'var(--mau-chu)';
            }
            _setErr('og-err-phong', '');

            // Preview
            const preview = _getEl('og-phong-preview');
            const pgrid = _getEl('og-phong-preview-grid');
            if (preview && pgrid) {
                pgrid.innerHTML = [
                    { k: 'Số phòng', v: `Phòng ${phong.soPhong}` },
                    { k: 'Khu', v: `Khu ${phong.khu}` },
                    { k: 'Chủ phòng', v: tenChu },
                    { k: 'Giá thuê', v: `${_fmtTien(phong.giaPhongFix)}/tháng` },
                    { k: 'Đang ở', v: `${phong.hopDong?.soNguoiOHienTai ?? 0} người` },
                ].map(item => `
                    <div class="og-preview-item">
                      <div class="og-preview-key">${item.k}</div>
                      <div class="og-preview-val">${_escape(item.v)}</div>
                    </div>`).join('');
                preview.style.display = 'block';
            }

            // Occupants list
            const wrap = _getEl('og-occupants-wrap');
            const list = _getEl('og-occupants-list');
            const nguoiO = phong.hopDong?.nguoiO || [];
            if (wrap && list && nguoiO.length > 0) {
                list.innerHTML = nguoiO.map(n => `
                    <div class="og-occupant-row">
                      <div class="og-occupant-ava"
                           style="${n.isChinhChu
                        ? 'background:linear-gradient(135deg,var(--mau-chu-de),var(--mau-chu-de-sang));'
                        : ''}">
                        ${_getChuCai(n.hoTen)}
                      </div>
                      <div style="flex:1;min-width:0;">
                        <div class="og-occupant-name">
                          ${_escape(n.hoTen)}
                          ${n.isChinhChu
                        ? `<span style="font-size:9.5px;background:#fef3c7;color:#b45309;
                                             padding:1px 6px;border-radius:99px;font-weight:700;
                                             margin-left:5px;">Chủ phòng</span>`
                        : ''}
                        </div>
                        <div class="og-occupant-room">
                          ${_escape(n.soDienThoai || '—')}
                        </div>
                      </div>
                    </div>`).join('');
                wrap.style.display = 'block';
            } else {
                if (wrap) wrap.style.display = 'none';
            }

            // Re-render để cập nhật trạng thái selected
            this.locPicker();
            this.dongPicker();
        },

        _validateBuoc(buoc) {
            _clearErrs();
            let ok = true;
            if (buoc === 1) {
                if (!_getEl('og-inp-id-phong')?.value) {
                    _setErr('og-err-phong', 'Vui lòng chọn phòng');
                    ok = false;
                }
            }
            if (buoc === 2) {
                const hoTen = (_getEl('og-inp-ho-ten')?.value || '').trim();
                const uname = (_getEl('og-inp-username')?.value || '').trim();
                const pwd = (_getEl('og-inp-password')?.value || '').trim();
                const sdt = (_getEl('og-inp-sdt')?.value || '').replace(/\s/g, '');
                const email = (_getEl('og-inp-email')?.value || '').trim();
                if (!hoTen) { _setErr('og-err-ho-ten', 'Họ tên không được để trống'); ok = false; }
                if (!uname) { _setErr('og-err-username', 'Tên đăng nhập không được để trống'); ok = false; }
                else if (!/^[a-zA-Z0-9_]{3,50}$/.test(uname)) {
                    _setErr('og-err-username', 'Username chỉ gồm chữ, số, gạch dưới (3–50 ký tự)');
                    ok = false;
                }
                if (!pwd) { _setErr('og-err-password', 'Mật khẩu không được để trống'); ok = false; }
                else if (pwd.length < 6) { _setErr('og-err-password', 'Mật khẩu tối thiểu 6 ký tự'); ok = false; }
                if (!sdt) { _setErr('og-err-sdt', 'Số điện thoại không được để trống'); ok = false; }
                else if (!/^0[0-9]{9}$/.test(sdt)) {
                    _setErr('og-err-sdt', 'Số điện thoại phải 10 chữ số, bắt đầu bằng 0');
                    ok = false;
                }
                if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    _setErr('og-err-email', 'Email không đúng định dạng');
                    ok = false;
                }
            }
            if (buoc === 3) {
                const ngayVao = (_getEl('og-inp-ngay-vao')?.value || '').trim();
                const cccd = (_getEl('og-inp-cccd')?.value || '').trim();
                if (!ngayVao) { _setErr('og-err-ngay-vao', 'Vui lòng chọn ngày vào ở'); ok = false; }
                if (cccd && !/^[0-9]{9}$|^[0-9]{12}$/.test(cccd)) {
                    _setErr('og-err-cccd', 'CCCD phải là 9 hoặc 12 chữ số');
                    ok = false;
                }
            }
            return ok;
        },

        buocTiep() { if (!this._validateBuoc(_S.buocHienTai)) return; if (_S.buocHienTai < 3) _capNhatBuoc(_S.buocHienTai + 1); },
        buocTruoc() { if (_S.buocHienTai > 1) _capNhatBuoc(_S.buocHienTai - 1); },

        togglePw(inputId, btn) {
            const inp = _getEl(inputId);
            if (!inp) return;
            const hidden = inp.type === 'password';
            inp.type = hidden ? 'text' : 'password';
            const icon = btn.querySelector('i');
            if (icon) icon.className = hidden ? 'fas fa-eye-slash' : 'fas fa-eye';
        },

        async luuNguoiOGhep() {
            if (!this._validateBuoc(3)) return;
            const btn = _getEl('og-btn-submit');
            if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...'; }

            const payload = {
                IDPhong: parseInt(_getEl('og-inp-id-phong')?.value) || null,
                HoTen: (_getEl('og-inp-ho-ten')?.value || '').trim(),
                Username: (_getEl('og-inp-username')?.value || '').trim(),
                Passwords: (_getEl('og-inp-password')?.value || '').trim(),
                Phone: (_getEl('og-inp-sdt')?.value || '').replace(/\s/g, ''),
                Email: (_getEl('og-inp-email')?.value || '').trim() || null,
                Roles: 'Tenant',
                SoCCCD: (_getEl('og-inp-cccd')?.value || '').trim(),
                NgaySinh: _getEl('og-inp-ngay-sinh')?.value || null,
                GioiTinh: _getEl('og-inp-gioi-tinh')?.value || null,
                QueQuan: (_getEl('og-inp-que-quan')?.value || '').trim(),
                NgayVaoO: (() => {
    const val = _getEl('og-inp-ngay-vao')?.value;
    return val ? new Date(val).toISOString() : null;
})(),
                QuanHe: _getEl('og-inp-quan-he')?.value || null,
                GhiChu: (_getEl('og-inp-ghi-chu')?.value || '').trim(),
            };

            try {
                // DEBUG: log payload để kiểm tra field names gửi lên server
                console.log('payload:', JSON.stringify(payload));

                const response = await fetch('/api/ChuTroThemNguoiThue/them-nguoi-o-ghep', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (!response.ok) {
                    // Hiển thị lỗi thực từ server thay vì "Lỗi không xác định"
                    const errMsg = result.message
                        || result.title
                        || (result.errors ? JSON.stringify(result.errors) : null)
                        || 'Lỗi không xác định';
                    throw new Error(errMsg);
                }

                if (typeof hienToast === 'function')
                    hienToast(`Đã thêm người ở ghép "${payload.HoTen}" vào phòng ${_S.phongDaChon?.soPhong} thành công!`, 'success');

                this.dongModal();
                // Xóa cache để lần sau load lại
                _S.danhSachPhong = [];
                _S.phongDaChon = null;

                if (typeof ntTaiDuLieu === 'function') ntTaiDuLieu();

            } catch (e) {
                if (typeof hienToast === 'function') hienToast('Lỗi: ' + e.message, 'error');
                console.error('[oGhep] luuNguoiOGhep:', e);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-check"></i> Thêm người ở ghép';
                }
            }
        },

        _resetForm() {
            ['og-inp-id-phong', 'og-inp-ho-ten', 'og-inp-username', 'og-inp-password',
                'og-inp-sdt', 'og-inp-email', 'og-inp-cccd', 'og-inp-ngay-sinh',
                'og-inp-que-quan', 'og-inp-ngay-vao', 'og-inp-ghi-chu']
                .forEach(id => { const el = _getEl(id); if (el) el.value = ''; });
            ['og-inp-gioi-tinh', 'og-inp-quan-he']
                .forEach(id => { const el = _getEl(id); if (el) el.selectedIndex = 0; });

            const txt = _getEl('og-phong-display-text');
            if (txt) { txt.textContent = '-- Chọn phòng đang thuê --'; txt.style.color = 'var(--mau-chu-phu)'; }
            const preview = _getEl('og-phong-preview');
            if (preview) preview.style.display = 'none';
            const wrap = _getEl('og-occupants-wrap');
            if (wrap) wrap.style.display = 'none';
            const ngayVao = _getEl('og-inp-ngay-vao');
            if (ngayVao) ngayVao.value = new Date().toISOString().split('T')[0];
            _clearErrs();
            _S.phongDaChon = null;
        },
    };

    window.oGhep = pub;
})();
// ── XÓA người ở ghép ──────────────────────────────────────
function ngGhep_xacNhanXoa(idKhachO, hoTen) {
    if (!confirm(`Xác nhận gỡ "${hoTen}" khỏi phòng và khóa tài khoản?`)) return;

    fetch(`/api/ChuTroQuanLyNguoiThue/nguoi-ghep/roi-di/${idKhachO}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ghiChu: 'Gỡ bởi chủ trọ' })
    })
        .then(r => r.json())
        .then(d => {
            if (d.success) {
                hienToast('Đã gỡ người ở ghép thành công', 'success');
                ntTaiDuLieu();
            } else {
                hienToast(d.message || 'Lỗi không xác định', 'error');
            }
        })
        .catch(() => hienToast('Lỗi kết nối máy chủ', 'error'));
}
// ── MỞ MODAL tạo hợp đồng mới cho người ở ghép ───────────
function ngGhep_moModalHD(idKhachO, hoTen, idPhong, soPhong) {
    const modal = document.getElementById('ng-ghep-hd-modal');
    if (!modal) return;

    modal.dataset.idKhachO = idKhachO;
    modal.dataset.idPhong = idPhong;

    const elTen = document.getElementById('ng-ghep-hd-ten');
    const elPhong = document.getElementById('ng-ghep-hd-phong');
    const elNgay = document.getElementById('ng-ghep-hd-ngay-bat-dau');
    const elGia = document.getElementById('ng-ghep-hd-gia');

    if (elTen) elTen.textContent = hoTen;
    if (elPhong) elPhong.textContent = `Phòng ${soPhong}`;
    if (elNgay) elNgay.value = new Date().toISOString().slice(0, 10);

    // Reset các field còn lại về trống
    ['ng-ghep-hd-ngay-ket-thuc', 'ng-ghep-hd-tien-coc',
        'ng-ghep-hd-dien', 'ng-ghep-hd-nuoc', 'ng-ghep-hd-ghi-chu']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

    // Xóa giá trị ô giá (để trống, backend tự lấy từ phòng)
    if (elGia) elGia.value = '';

    document.getElementById('ng-ghep-hd-overlay').classList.add('mo');
    document.body.style.overflow = 'hidden';
}

function ngGhep_dongModalHD() {
    const overlay = document.getElementById('ng-ghep-hd-overlay');
    if (overlay) overlay.classList.remove('mo');
    document.body.style.overflow = '';
}

function ngGhep_luuHopDong() {
    const modal = document.getElementById('ng-ghep-hd-modal');
    if (!modal) return;

    const payload = {
        ngayBatDau: (document.getElementById('ng-ghep-hd-ngay-bat-dau')?.value || '').trim(),
        ngayKetThuc: (document.getElementById('ng-ghep-hd-ngay-ket-thuc')?.value || '').trim() || null,
        tienCoc: +document.getElementById('ng-ghep-hd-tien-coc')?.value || 0,
        giaThue: +document.getElementById('ng-ghep-hd-gia')?.value || 0,
        dienDauKy: +document.getElementById('ng-ghep-hd-dien')?.value || 0,
        nuocDauKy: +document.getElementById('ng-ghep-hd-nuoc')?.value || 0,
        ghiChu: (document.getElementById('ng-ghep-hd-ghi-chu')?.value || '').trim(),
    };

    // Validate tối thiểu
    if (!payload.ngayBatDau) {
        hienToast('Vui lòng chọn ngày bắt đầu', 'warning');
        return;
    }
    if (payload.ngayKetThuc && payload.ngayKetThuc <= payload.ngayBatDau) {
        hienToast('Ngày kết thúc phải sau ngày bắt đầu', 'warning');
        return;
    }

    const btn = document.querySelector('#ng-ghep-hd-modal .nt-btn-submit')
        || document.querySelector('[onclick="ngGhep_luuHopDong()"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...'; }

    fetch(`/api/ChuTroQuanLyNguoiThue/nguoi-ghep/tao-hop-dong/${modal.dataset.idKhachO}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
        .then(r => r.json())
        .then(d => {
            if (d.success) {
                hienToast('Đã tạo hợp đồng mới thành công', 'success');
                ngGhep_dongModalHD();
                ntTaiDuLieu();
            } else {
                hienToast(d.message || 'Lỗi không xác định', 'error');
            }
        })
        .catch(() => hienToast('Lỗi kết nối máy chủ', 'error'))
        .finally(() => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check"></i> Tạo hợp đồng';
            }
        });
}

/* ================================================================
   MODAL DANH SÁCH NGƯỜI Ở GHÉP CẦN HỢP ĐỒNG MỚI
   Hiển thị sau khi chủ phòng trả phòng sớm, có người ghép còn lại
================================================================ */

/**
 * Mở modal danh sách người ở ghép cần lập hợp đồng mới.
 * @param {Array} danhSach - Mảng trả về từ API sau khi tra-phong (nguoiGhepConLai)
 */
function ngGhepHD_moModalDanhSach(danhSach) {
    const overlay = document.getElementById('ng-ghep-ds-overlay');
    if (!overlay) return;

    // Lưu danh sách vào dataset để dùng lại
    overlay.dataset.danhSach = JSON.stringify(danhSach);

    const tbody = document.getElementById('ng-ghep-ds-tbody');
    if (tbody) {
        tbody.innerHTML = danhSach.map(ng => `
            <tr>
                <td style="padding:10px 12px;">
                    <div style="font-weight:700;font-size:13.5px;">${ntEscape(ng.hoTen || ng.HoTen || '—')}</div>
                    <div style="font-size:11.5px;color:var(--mau-chu-phu);">
                        <i class="fas fa-phone" style="font-size:10px;"></i>
                        ${ntEscape(ng.soDienThoai || ng.SoDienThoai || '—')}
                    </div>
                </td>
                <td style="padding:10px 12px;">
                    <span style="font-size:12.5px;padding:3px 10px;border-radius:20px;
                                 background:rgba(124,58,237,0.1);color:#7c3aed;font-weight:600;">
                        ${ntEscape(ng.quanHe || ng.QuanHe || 'Người ở ghép')}
                    </span>
                </td>
                <td style="padding:10px 12px;text-align:right;">
                    <button class="nt-btn-submit" style="padding:6px 14px;font-size:12.5px;"
                            onclick="ngGhepHD_moTaoHD(${ng.idKhachO || ng.IDKhachO}, '${ntEscape(ng.hoTen || ng.HoTen)}', ${ng.idPhong || ng.IDPhong}, '${ntEscape(ng.soPhong || ng.SoPhong)}')">
                        <i class="fas fa-file-contract"></i> Lập hợp đồng
                    </button>
                </td>
            </tr>
        `).join('');
    }

    overlay.classList.add('mo');
    document.body.style.overflow = 'hidden';
}

function ngGhepHD_dongModalDanhSach() {
    const overlay = document.getElementById('ng-ghep-ds-overlay');
    if (overlay) overlay.classList.remove('mo');
    document.body.style.overflow = '';
}

/**
 * Từ modal danh sách → mở modal tạo hợp đồng cho từng người ghép
 */
function ngGhepHD_moTaoHD(idKhachO, hoTen, idPhong, soPhong) {
    ngGhepHD_dongModalDanhSach();
    // Dùng lại modal tạo HĐ đã có
    ngGhep_moModalHD(idKhachO, hoTen, idPhong, soPhong);

    // Sau khi tạo HĐ xong, quay lại danh sách nếu vẫn còn người cần lập HĐ
    const overlay = document.getElementById('ng-ghep-hd-overlay');
    if (overlay) {
        overlay.dataset.afterSave = 'reopen-ds';
    }
}

// Patch ngGhep_luuHopDong để xử lý afterSave
const _ngGhep_luuHopDong_orig = window.ngGhep_luuHopDong || ngGhep_luuHopDong;
window.ngGhep_luuHopDong = function () {
    const modal = document.getElementById('ng-ghep-hd-modal');
    const overlay = document.getElementById('ng-ghep-hd-overlay');
    const afterSave = overlay?.dataset.afterSave;

    const payload = {
        ngayBatDau: (document.getElementById('ng-ghep-hd-ngay-bat-dau')?.value || '').trim(),
        ngayKetThuc: (document.getElementById('ng-ghep-hd-ngay-ket-thuc')?.value || '').trim() || null,
        tienCoc: +document.getElementById('ng-ghep-hd-tien-coc')?.value || 0,
        giaThue: +document.getElementById('ng-ghep-hd-gia')?.value || 0,
        dienDauKy: +document.getElementById('ng-ghep-hd-dien')?.value || 0,
        nuocDauKy: +document.getElementById('ng-ghep-hd-nuoc')?.value || 0,
        ghiChu: (document.getElementById('ng-ghep-hd-ghi-chu')?.value || '').trim(),
    };

    if (!payload.ngayBatDau) {
        hienToast('Vui lòng chọn ngày bắt đầu', 'warning');
        return;
    }
    if (payload.ngayKetThuc && payload.ngayKetThuc <= payload.ngayBatDau) {
        hienToast('Ngày kết thúc phải sau ngày bắt đầu', 'warning');
        return;
    }

    const btn = document.querySelector('#ng-ghep-hd-modal .nt-btn-submit')
        || document.querySelector('[onclick="ngGhep_luuHopDong()"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...'; }

    fetch(`/api/ChuTroQuanLyNguoiThue/nguoi-ghep/tao-hop-dong/${modal.dataset.idKhachO}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
        .then(r => r.json())
        .then(async d => {
            if (d.success) {
                hienToast('Đã tạo hợp đồng mới thành công', 'success');
                ngGhep_dongModalHD();
                if (overlay) delete overlay.dataset.afterSave;

                await ntTaiDuLieu();

                // Nếu còn người ghép chưa có HĐ → mở lại modal danh sách
                if (afterSave === 'reopen-ds') {
                    const dsOverlay = document.getElementById('ng-ghep-ds-overlay');
                    const dsCu = dsOverlay?.dataset.danhSach ? JSON.parse(dsOverlay.dataset.danhSach) : [];
                    const idVuaTao = parseInt(modal.dataset.idKhachO);
                    const dsConLai = dsCu.filter(ng =>
                        (ng.idKhachO || ng.IDKhachO) !== idVuaTao
                    );
                    if (dsConLai.length > 0) {
                        ngGhepHD_moModalDanhSach(dsConLai);
                    }
                }
            } else {
                hienToast(d.message || 'Lỗi không xác định', 'error');
            }
        })
        .catch(() => hienToast('Lỗi kết nối máy chủ', 'error'))
        .finally(() => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check"></i> Tạo hợp đồng';
            }
        });
};
/* ================================================================
   TRẢ PHÒNG V2 — Checkout modal with per-roommate selection
   Namespace: traPhongV2
================================================================ */
const traPhongV2 = (() => {
    'use strict';

    let _idUser = null;
    let _idHopDong = null;
    let _tenNguoiThue = '';
    let _soPhong = '';
    let _danhSachGhep = []; // Full roommate list loaded from API

    /* ── Open the checkout modal ── */
    async function moModal(idUser, idHopDong, tenNguoiThue, soPhong) {
        _idUser = idUser;
        _idHopDong = idHopDong;
        _tenNguoiThue = tenNguoiThue;
        _soPhong = soPhong;

        // Update modal header
        _setEl('tpv2-ten', tenNguoiThue);
        _setEl('tpv2-phong', soPhong);

        // Reset fields
        const ngay = document.getElementById('tpv2-ngay-thanh-ly');
        if (ngay) ngay.value = new Date().toISOString().split('T')[0];
        const lyDo = document.getElementById('tpv2-ly-do');
        if (lyDo) lyDo.value = '';

        // Load roommate list
        const listEl = document.getElementById('tpv2-roommate-list');
        if (listEl) listEl.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;color:var(--mau-chu-phu);font-size:13px;">
                <div class="nt-spinner"></div> Đang tải danh sách...
            </div>`;

        document.getElementById('tpv2-overlay')?.classList.add('mo');
        document.body.style.overflow = 'hidden';

        try {
            const res = await fetch(`/api/ChuTroQuanLyNguoiThue/nguoi-ghep-trong-phong/${idHopDong}`);
            const data = await res.json();
            _danhSachGhep = data.success ? data.danhSach : [];
            _renderRoommateList(_danhSachGhep);
        } catch (e) {
            if (listEl) listEl.innerHTML =
                `<p style="color:var(--mau-do);font-size:13px;">
                    <i class="fas fa-exclamation-triangle"></i> Không tải được danh sách người ở ghép
                </p>`;
        }
    }

    function _renderRoommateList(list) {
        const el = document.getElementById('tpv2-roommate-list');
        if (!el) return;

        if (!list.length) {
            el.innerHTML = `
                <div style="padding:12px 14px;background:var(--mau-xanh-nhat);border-radius:var(--radius-sm);
                            font-size:13px;color:var(--mau-xanh);display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-info-circle"></i>
                    Phòng này không có người ở ghép — chỉ cần xác nhận trả phòng.
                </div>`;
            return;
        }

        el.innerHTML = `
            <div style="font-size:12px;color:var(--mau-chu-phu);margin-bottom:10px;">
                <i class="fas fa-info-circle" style="color:#0891b2;"></i>
                Chọn những người <strong>rời đi cùng</strong> ${_escape(tenOrMain())}. Người <strong>không chọn</strong> sẽ ở lại và cần hợp đồng mới.
            </div>
            ${list.map(ng => `
            <label style="display:flex;align-items:center;gap:12px;padding:10px 12px;
                           background:var(--mau-nen);border-radius:var(--radius-sm);
                           border:1.5px solid var(--mau-vien);cursor:pointer;margin-bottom:8px;
                           transition:border-color 0.15s;" class="tpv2-roommate-row"
                   data-id="${ng.idUser}">
                <input type="checkbox" value="${ng.idUser}"
                       class="tpv2-check"
                       style="width:16px;height:16px;accent-color:var(--mau-do);flex-shrink:0;"
                       onchange="traPhongV2._onCheckChange(this)" />
                <div style="width:36px;height:36px;border-radius:50%;flex-shrink:0;
                            background:linear-gradient(135deg,#7c3aed,#9333ea);
                            display:flex;align-items:center;justify-content:center;
                            color:#fff;font-size:13px;font-weight:800;">
                    ${ntLayChuCai(ng.hoTen)}
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:700;font-size:13px;">${_escape(ng.hoTen)}</div>
                    <div style="font-size:11.5px;color:var(--mau-chu-phu);">
                        ${_escape(ng.soDienThoai || '—')}
                        ${ng.quanHe ? ` · ${_escape(ng.quanHe)}` : ''}
                    </div>
                </div>
                <span class="tpv2-status-badge" style="font-size:11px;padding:3px 9px;border-radius:99px;
                      font-weight:700;background:rgba(5,150,105,0.1);color:#059669;
                      border:1px solid rgba(5,150,105,0.2);white-space:nowrap;flex-shrink:0;">
                    Ở lại
                </span>
            </label>`).join('')}`;
    }

    function _onCheckChange(checkbox) {
        const row = checkbox.closest('.tpv2-roommate-row');
        const badge = row?.querySelector('.tpv2-status-badge');
        if (!badge) return;
        if (checkbox.checked) {
            row.style.borderColor = 'var(--mau-do)';
            badge.style.background = 'rgba(229,62,62,0.1)';
            badge.style.color = 'var(--mau-do)';
            badge.style.borderColor = 'rgba(229,62,62,0.2)';
            badge.textContent = 'Rời đi';
        } else {
            row.style.borderColor = 'var(--mau-vien)';
            badge.style.background = 'rgba(5,150,105,0.1)';
            badge.style.color = '#059669';
            badge.style.borderColor = 'rgba(5,150,105,0.2)';
            badge.textContent = 'Ở lại';
        }
    }

    async function xacNhan() {
        const btn = document.getElementById('tpv2-btn-xac-nhan');
        const ngayThanhLy = document.getElementById('tpv2-ngay-thanh-ly')?.value || null;
        const lyDo = document.getElementById('tpv2-ly-do')?.value?.trim() || null;

        // Collect checked (leaving) user IDs
        const idUserRoiDi = [...document.querySelectorAll('.tpv2-check:checked')]
            .map(cb => parseInt(cb.value));

        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...'; }

        try {
            const res = await fetch(`/api/ChuTroQuanLyNguoiThue/tra-phong-v2/${_idUser}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ngayThanhLy, lyDo, idUserRoiDi }),
            });
            const result = await res.json();

            if (!res.ok) {
                hienToast(result.message || 'Lỗi xử lý', 'error');
                return;
            }

            hienToast(`Đã thanh lý hợp đồng của "${_tenNguoiThue}" thành công!`, 'success');
            dongModal();

            await ntTaiDuLieu(); // Refresh main table

            // If some roommates are staying → show successor modal
            if (result.coNguoiOLai && result.nguoiOLai?.length > 0) {
                // Small delay so the toast is readable
                setTimeout(() => {
                    nguoiOLai_moModal(result.nguoiOLai, _idHopDong);
                }, 600);
            }
        } catch (e) {
            hienToast('Lỗi kết nối máy chủ', 'error');
            console.error('[traPhongV2.xacNhan]', e);
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Xác nhận thanh lý'; }
        }
    }

    function dongModal(e) {
        if (e && e.target !== document.getElementById('tpv2-overlay')) return;
        document.getElementById('tpv2-overlay')?.classList.remove('mo');
        document.body.style.overflow = '';
    }

    function tenOrMain() { return _tenNguoiThue || 'chủ phòng'; }
    function _escape(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function _setEl(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

    return { moModal, xacNhan, dongModal, _onCheckChange };
})();

window.traPhongV2 = traPhongV2;

/* ================================================================
   NGƯỜI Ở LẠI — Modal to handle tenants who stay after checkout
================================================================ */
function nguoiOLai_moModal(danhSach, idHopDongCu) {
    const overlay = document.getElementById('nguoi-o-lai-overlay');
    if (!overlay) return;
    overlay.dataset.danhSach = JSON.stringify(danhSach);
    overlay.dataset.idHopDongCu = idHopDongCu;

    const tbody = document.getElementById('nguoi-o-lai-tbody');
    if (tbody) {
        tbody.innerHTML = danhSach.map(ng => `
            <tr>
                <td style="padding:10px 12px;">
                    <div style="font-weight:700;font-size:13.5px;">${_escape2(ng.hoTen || ng.HoTen || '—')}</div>
                    <div style="font-size:11.5px;color:var(--mau-chu-phu);">
                        ${_escape2(ng.soDienThoai || ng.SoDienThoai || '—')}
                    </div>
                </td>
                <td style="padding:10px 12px;">
                    <span style="font-size:12.5px;padding:3px 10px;border-radius:20px;
                                 background:rgba(124,58,237,0.1);color:#7c3aed;font-weight:600;">
                        ${_escape2(ng.quanHe || ng.QuanHe || 'Người ở ghép')}
                    </span>
                </td>
                <td style="padding:10px 12px;text-align:right;display:flex;gap:6px;justify-content:flex-end;align-items:center;">
                    <button class="nt-btn-submit"
                            style="padding:6px 14px;font-size:12.5px;
                                   background:linear-gradient(135deg,#059669,#34d399);
                                   box-shadow:0 4px 12px rgba(5,150,105,0.25);"
                            onclick="ngGhep_moModalHD(${ng.idKhachO || ng.IDKhachO},'${_escape2(ng.hoTen || ng.HoTen)}',${ng.idPhong || ng.IDPhong},'${_escape2(ng.soPhong || ng.SoPhong)}')">
                        <i class="fas fa-file-contract"></i> Lập HĐ mới
                    </button>
                    <button class="nt-act"
                            title="Thêm người có sẵn vào hợp đồng này"
                            style="background:rgba(5,150,105,0.1);color:#059669;width:32px;height:32px;"
                            onclick="themNguoiCoSan.moModal(${ng.idKhachO || ng.IDKhachO}, ${ng.idPhong || ng.IDPhong}, '${_escape2(ng.soPhong || ng.SoPhong)}')">
                        <i class="fas fa-user-check"></i>
                    </button>
                </td>
            </tr>`).join('');
    }

    overlay.classList.add('mo');
    document.body.style.overflow = 'hidden';
}

function nguoiOLai_dongModal(e) {
    if (e && e.target !== document.getElementById('nguoi-o-lai-overlay')) return;
    document.getElementById('nguoi-o-lai-overlay')?.classList.remove('mo');
    document.body.style.overflow = '';
}

window.nguoiOLai_moModal = nguoiOLai_moModal;
window.nguoiOLai_dongModal = nguoiOLai_dongModal;

function _escape2(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ================================================================
   THÊM NGƯỜI THUÊ CÓ SẴN — Add existing tenant to a contract
   Used inside the "Thêm người ở ghép" modal (new Tab 0)
================================================================ */
const themNguoiCoSan = (() => {
    'use strict';

    let _idHopDong = null;
    let _searchTimeout = null;
    let _ketQuaTimKiem = [];

    function moModal(idHopDong, idPhong, soPhong) {
        _idHopDong = idHopDong;
        _ketQuaTimKiem = [];
        _setVal('tncs-search', '');
        _setVal('tncs-quan-he', '');
        _setVal('tncs-ghi-chu', '');
        _setVal('tncs-ngay-vao', new Date().toISOString().split('T')[0]);
        document.getElementById('tncs-results')?.style && (document.getElementById('tncs-results').innerHTML = '');
        document.getElementById('tncs-selected-preview')?.style && (document.getElementById('tncs-selected-preview').style.display = 'none');

        const overlay = document.getElementById('tncs-overlay');
        if (overlay) {
            overlay.dataset.idPhong = idPhong;
            overlay.dataset.soPhong = soPhong;
            overlay.classList.add('mo');
        }
        document.body.style.overflow = 'hidden';

        const inp = document.getElementById('tncs-search');
        if (inp) setTimeout(() => inp.focus(), 150);
    }

    function dongModal(e) {
        if (e && e.target !== document.getElementById('tncs-overlay')) return;
        document.getElementById('tncs-overlay')?.classList.remove('mo');
        document.body.style.overflow = '';
    }

    function timKiem() {
        clearTimeout(_searchTimeout);
        _searchTimeout = setTimeout(_thucHienTimKiem, 300);
    }

    async function _thucHienTimKiem() {
        const q = (document.getElementById('tncs-search')?.value || '').trim();
        const idPhong = document.getElementById('tncs-overlay')?.dataset.idPhong || '';
        const resultsEl = document.getElementById('tncs-results');

        if (!resultsEl) return;
        if (q.length < 2) { resultsEl.innerHTML = ''; return; }

        resultsEl.innerHTML = `<div style="padding:10px;color:var(--mau-chu-phu);font-size:13px;display:flex;gap:8px;">
            <div class="nt-spinner" style="width:16px;height:16px;border-width:2px;"></div> Đang tìm...
        </div>`;

        try {
            const url = `/api/ChuTroQuanLyNguoiThue/tim-nguoi-thue?q=${encodeURIComponent(q)}&idPhong=${idPhong}`;
            const res = await fetch(url);
            const data = await res.json();
            _ketQuaTimKiem = data.success ? data.danhSach : [];
            _renderKetQua(_ketQuaTimKiem);
        } catch (e) {
            resultsEl.innerHTML = `<div style="padding:10px;color:var(--mau-do);font-size:13px;">Lỗi tìm kiếm</div>`;
        }
    }

    function _renderKetQua(list) {
        const el = document.getElementById('tncs-results');
        if (!el) return;

        if (!list.length) {
            el.innerHTML = `<div style="padding:12px;text-align:center;color:var(--mau-chu-phu);font-size:13px;">
                <i class="fas fa-search" style="margin-right:6px;"></i> Không tìm thấy người thuê nào
            </div>`;
            return;
        }

        el.innerHTML = list.map(a => `
            <div style="display:flex;align-items:center;gap:10px;padding:9px 12px;
                        cursor:pointer;border-bottom:1px solid var(--mau-vien);transition:background 0.12s;"
                 onmouseover="this.style.background='var(--mau-nen)'"
                 onmouseout="this.style.background=''"
                 onclick="themNguoiCoSan._chon(${a.idUser})">
                <div style="width:36px;height:36px;border-radius:50%;flex-shrink:0;
                            background:linear-gradient(135deg,#06b6d4,#0891b2);
                            display:flex;align-items:center;justify-content:center;
                            color:#fff;font-size:13px;font-weight:800;">
                    ${ntLayChuCai(a.fullName)}
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${_esc(a.fullName)}
                        ${!a.isActive ? `<span style="font-size:10px;background:#f3f4f6;color:#9ca3af;
                                               padding:1px 6px;border-radius:99px;margin-left:5px;">
                            Đã khóa</span>` : ''}
                    </div>
                    <div style="font-size:11.5px;color:var(--mau-chu-phu);">
                        ${_esc(a.phone || '—')}
                        ${a.email ? ` · ${_esc(a.email)}` : ''}
                        ${a.khachThue?.soCCCD ? ` · CCCD: ${_esc(a.khachThue.soCCCD)}` : ''}
                    </div>
                </div>
                <i class="fas fa-plus-circle" style="color:#0891b2;font-size:16px;flex-shrink:0;"></i>
            </div>`).join('');
    }

    function _chon(idUser) {
        const nguoi = _ketQuaTimKiem.find(x => x.idUser === idUser);
        if (!nguoi) return;

        // Show selected preview
        const preview = document.getElementById('tncs-selected-preview');
        if (preview) {
            preview.style.display = 'flex';
            preview.innerHTML = `
                <div style="width:42px;height:42px;border-radius:50%;flex-shrink:0;
                            background:linear-gradient(135deg,#059669,#34d399);
                            display:flex;align-items:center;justify-content:center;
                            color:#fff;font-size:15px;font-weight:800;">
                    ${ntLayChuCai(nguoi.fullName)}
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:700;font-size:13.5px;">${_esc(nguoi.fullName)}</div>
                    <div style="font-size:12px;color:var(--mau-chu-phu);">
                        ${_esc(nguoi.phone || '—')}
                        ${nguoi.khachThue?.soCCCD ? ` · ${_esc(nguoi.khachThue.soCCCD)}` : ''}
                    </div>
                </div>
                <button onclick="themNguoiCoSan._boChon()"
                        style="background:none;border:none;cursor:pointer;color:var(--mau-chu-phu);font-size:13px;padding:4px;">
                    <i class="fas fa-times"></i>
                </button>`;
            preview.dataset.idUser = idUser;
        }

        // Clear search results
        document.getElementById('tncs-results').innerHTML = '';
        document.getElementById('tncs-search').value = nguoi.fullName;
    }

    function _boChon() {
        const preview = document.getElementById('tncs-selected-preview');
        if (preview) { preview.style.display = 'none'; preview.dataset.idUser = ''; }
        document.getElementById('tncs-search').value = '';
        document.getElementById('tncs-results').innerHTML = '';
    }

    async function luu() {
        const preview = document.getElementById('tncs-selected-preview');
        const idUser = parseInt(preview?.dataset.idUser || '0');
        if (!idUser) {
            hienToast('Vui lòng chọn người thuê từ danh sách tìm kiếm', 'warning');
            return;
        }

        const btn = document.getElementById('tncs-btn-luu');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang thêm...'; }

        const payload = {
            idUser,
            quanHe: document.getElementById('tncs-quan-he')?.value?.trim() || 'Người ở ghép',
            ngayVao: document.getElementById('tncs-ngay-vao')?.value || null,
            ghiChu: document.getElementById('tncs-ghi-chu')?.value?.trim() || null,
        };

        try {
            const res = await fetch(`/api/ChuTroQuanLyNguoiThue/them-nguoi-co-san/${_idHopDong}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await res.json();

            if (!res.ok) {
                hienToast(result.message || 'Lỗi thêm người thuê', 'error');
                return;
            }

            hienToast(result.message || 'Thêm thành công!', 'success');
            dongModal();
            await ntTaiDuLieu();
        } catch (e) {
            hienToast('Lỗi kết nối máy chủ', 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Thêm vào phòng'; }
        }
    }

    function _esc(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function _setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v; }

    return { moModal, dongModal, timKiem, _chon, _boChon, luu };
})();

window.themNguoiCoSan = themNguoiCoSan;

// Expose
window.ngGhepHD_moModalDanhSach = ngGhepHD_moModalDanhSach;
window.ngGhepHD_dongModalDanhSach = ngGhepHD_dongModalDanhSach;
window.ngGhepHD_moTaoHD = ngGhepHD_moTaoHD;