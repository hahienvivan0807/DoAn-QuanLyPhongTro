let curFilter = "all";
let curSearch = "";
let roomsData = [];
async function HienThiThongKe() {
    try {
        const response = await fetch('/api/ChuTro/TyLeLap');

        if (!response.ok) throw new Error('Lỗi khi gọi API');

        const data = await response.json();
        // Card tổng số phòng (.mau-xanh)
        const theTongSoPhong = document.querySelector('.card-thong-ke.mau-xanh .con-so');
        const theTyLe = document.querySelector('.card-thong-ke.mau-xanh .ty-le-thay-doi');

        if (theTongSoPhong) theTongSoPhong.textContent = data.tongSoPhong;
        if (theTyLe) theTyLe.textContent = `↑ ${data.tyLeLapDay}% lấp đầy`;

        // Card phòng đang thuê (.mau-xanh-la)
        const theSoPhongThue = document.querySelector('.card-thong-ke.mau-xanh-la .con-so');
        const theTyLePhongThue = document.querySelector('.card-thong-ke.mau-xanh-la .ty-le-thay-doi');

        if (theSoPhongThue) theSoPhongThue.textContent = data.phongThue;

        
        const thePhongtrong = document.querySelector('.card-thong-ke.mau-cam .con-so')
        const theBaoTri = document.querySelector('.card-thong-ke.mau-cam .ty-le-thay-doi');

        console.log(data.PhongTrong)
        if (thePhongtrong) thePhongtrong.textContent = data.phongTrong;
        if (theBaoTri) theBaoTri.textContent = `⚠️ ${data.phongBaoTri} đang bảo trì`;

    } catch (error) {
        console.error("Đã xảy ra lỗi:", error);
    }
}
async function HienThiDanhSachPhong() {
    try {
        const response = await fetch('/api/QuanLy/DanhSachPhong');
        if (!response.ok) throw new Error('Lỗi API');

        const data = await response.json();
        const container = document.querySelector('.danh-sach-phong');

        // Xóa phòng cũ (giữ lại nút ở cuối)
        container.querySelectorAll('.muc-phong').forEach(el => el.remove());

        // Hàm map trạng thái → CSS class
        function layClass(trangThai) {
            if (trangThai === 'Trống') return 'trong';
            if (trangThai === 'Đã thuê') return 'dang-thue';
            if (trangThai === 'Đang sửa') return 'bao-tri';
            return '';
        }

        // Hàm map trạng thái → text hiển thị
        function layText(trangThai) {
            if (trangThai === 'Trống') return 'Còn trống';
            if (trangThai === 'Đã thuê') return 'Đang thuê';
            if (trangThai === 'Đang sửa') return 'Bảo trì';
            return trangThai;
        }

        // Hàm format giá tiền
        function formatGia(gia) {
            return (gia / 1000000).toFixed(1) + 'M/th';
        }

        // Render từng phòng, chèn trước nút
        const nut = container.querySelector('button');
        data.forEach(phong => {
            const div = document.createElement('div');
            div.className = 'muc-phong';
            div.onclick = () => xemChiTietPhongCuThe(phong.soPhong);
            div.innerHTML = `
                <div>
                    <div class="ten-phong">Phòng ${phong.soPhong}</div>
                    <div class="loai-phong">Tầng ${phong.tang} • ${phong.dienTich ?? '?'}m²</div>
                </div>
                <div style="text-align:right;">
                    <div class="gia-phong">${formatGia(phong.giaPhong)}</div>
                    <span class="trang-thai-phong ${layClass(phong.trangThai)}">
                        ${layText(phong.trangThai)}
                    </span>
                </div>
            `;
            container.insertBefore(div, nut);
        });

    } catch (error) {
        console.error('Lỗi tải danh sách phòng:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    HienThiThongKe();
    HienThiDanhSachPhong(); // ✅ Gọi thêm hàm này
});
document.addEventListener('DOMContentLoaded', () => {
    HienThiThongKe(); 
});
//Danh sách phòng/////////////////////////////////////////////////////

function dongModalPhong(event) {
    if (event.target.id === 'overlay-danh-sach-phong') {
        document.getElementById('overlay-danh-sach-phong').style.display = 'none';
        showList();
    }
}
function badgeClass(s) { if (s === "Trống") return "badge-trong"; if (s === "Đã thuê") return "badge-thue"; return "badge-sua"; }
function fmtPrice(p) { return (p / 1000000).toFixed(1) + "M/th"; }
function initials(name) { const p = name.trim().split(" "); return (p[p.length - 1][0] || "?").toUpperCase(); }

async function xemTatCaPhong() {
    const overlay = document.getElementById('overlay-danh-sach-phong');
    overlay.style.display = 'flex';

    // Nếu chưa có data thì fetch, có rồi thì dùng lại
    if (roomsData.length === 0) {
        await loadRoomsFromAPI();
    }
    renderGrid();
}
async function loadRoomsFromAPI() {
    try {
        const response = await fetch('/api/QuanLy/DanhSachPhong');
        if (!response.ok) throw new Error('Lỗi API');
        const data = await response.json();
        console.log("API data[0]:", data[0]);
        // Map dữ liệu API → format rooms
        roomsData = data.map(p => ({
            id: p.idPhong,
            num: p.soPhong,
            floor: p.tang,
            area: p.dienTich ?? 0,
            price: p.giaPhong,
            status: p.trangThai,
            tenNguoiThue: p.tenNguoiThue ?? null,
            tenant: null,
            invoices: [],
            incidents: []
        }));
    } catch (error) {
        console.error('Lỗi tải phòng:', error);
        roomsData = [];
    }
}

function renderGrid() {
    const q = curSearch.toLowerCase();
    const filtered = roomsData.filter(r => {
        const matchF = curFilter === "all" || r.status === curFilter;
        const matchS = r.num.includes(q) || (r.tenant && r.tenant.name.toLowerCase().includes(q));
        return matchF && matchS;
    });

    const g = document.getElementById("roomGrid");
    document.getElementById("sTrong").textContent = roomsData.filter(r => r.status === "Trống").length;
    document.getElementById("sThue").textContent = roomsData.filter(r => r.status === "Đã thuê").length;
    document.getElementById("sSua").textContent = roomsData.filter(r => r.status === "Đang sửa").length;
    document.getElementById("sCount").textContent = "Hiển thị " + filtered.length + "/" + roomsData.length + " phòng";

    if (!filtered.length) {
        g.innerHTML = '<div class="empty"><i class="fas fa-search"></i>Không tìm thấy phòng phù hợp</div>';
        return;
    }

    g.innerHTML = filtered.map(r => {
        const statusClass = r.status === 'Trống' ? 'trong'
            : r.status === 'Đã thuê' ? 'da-thue'
                : 'dang-sua';
        return `
        <div class="room-card ${statusClass}" data-id="${r.id}" role="button" tabindex="0">
            <div class="floor">Tầng ${r.floor}</div>
            <div class="num">Phòng ${r.num}</div>
            <div class="area">${r.area}m²</div>
            <div class="price">${fmtPrice(r.price)}</div>
            ${r.tenNguoiThue
                    ? `<div style="font-size:11px;color:var(--mau-chu-phu);margin-top:4px;
                                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        <i class="fas fa-user" style="font-size:10px"></i> ${r.tenNguoiThue}
                    </div>`
                    : ''}
            <span class="badge ${badgeClass(r.status)}">${r.status}</span>
        </div>`;
    }).join("");

    g.querySelectorAll(".room-card").forEach(card => {
        card.addEventListener("click", () => openDetail(card.dataset.id));
    });
}

async function openDetail(id) {
    // Tìm phòng cơ bản từ cache
    const r = roomsData.find(x => x.id == id); // dùng == thay == để tránh lỗi kiểu
    if (!r) return;

    // Hiển thị detail view ngay với data cơ bản (loading state)
    document.getElementById("detailTitle").textContent = "Phòng " + r.num;
    const db = document.getElementById("detailBadge");
    db.textContent = r.status;
    db.className = "badge " + badgeClass(r.status);

    // Reset tabs về info
    document.querySelectorAll(".dtab").forEach(t => t.classList.remove("on"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("on"));
    document.querySelector(".dtab[data-tab='info']").classList.add("on");
    document.getElementById("tabInfo").classList.add("on");

    // Chuyển sang detail view
    document.getElementById("listView").style.display = "none";
    const dv = document.getElementById("detailView");
    dv.style.display = "flex";
    dv.classList.add("show");

    // Hiện loading
    document.getElementById("tabInfo").innerHTML = `
        <div style="text-align:center;padding:32px;color:var(--mau-chu-phu);">
            <i class="fas fa-spinner fa-spin" style="font-size:24px;margin-bottom:8px;display:block"></i>
            Đang tải thông tin...
        </div>`;
    document.getElementById("tabTenant").innerHTML = "";
    document.getElementById("tabHistory").innerHTML = "";

    try {
        // Gọi API chi tiết phòng
        const res = await fetch(`/api/QuanLy/ChiTietPhong/${id}`);
        if (!res.ok) throw new Error('Lỗi API');
        const p = await res.json();
        console.log(p);

        // ===== TAB THÔNG TIN CHUNG =====
        document.getElementById("tabInfo").innerHTML = `
        <div class="info-grid">
            <div class="info-cell"><div class="lbl">Số phòng</div><div class="val">Phòng ${p.soPhong}</div></div>
            <div class="info-cell"><div class="lbl">Tầng</div><div class="val">Tầng ${p.tang}</div></div>
            <div class="info-cell"><div class="lbl">Diện tích</div><div class="val">${p.dienTich ?? 0} m²</div></div>
            <div class="info-cell"><div class="lbl">Giá thuê</div><div class="val" style="color:#1d4ed8">${(p.giaPhong ?? 0).toLocaleString("vi-VN")}đ/th</div></div>
            <div class="info-cell"><div class="lbl">Giá điện</div><div class="val">${p.giaDien ? p.giaDien.toLocaleString("vi-VN") + "đ/kWh" : "3,500đ/kWh"}</div></div>
            <div class="info-cell"><div class="lbl">Giá nước</div><div class="val">${p.giaNuoc ? p.giaNuoc.toLocaleString("vi-VN") + "đ/m³" : "20,000đ/m³"}</div></div>
            <div class="info-cell"><div class="lbl">Wifi</div><div class="val">${p.phiWifi ? p.phiWifi.toLocaleString("vi-VN") + "đ/th" : "50,000đ/th"}</div></div>
            <div class="info-cell"><div class="lbl">Trạng thái</div><div class="val"><span class="badge ${badgeClass(p.trangThai)}">${p.trangThai}</span></div></div>
        </div>`;

        // ===== TAB NGƯỜI THUÊ =====
        const nt = p.nguoiThue;
        document.getElementById("tabTenant").innerHTML = nt ? `
        <div class="tenant-card">
            <div class="avatar">${initials(nt.hoTen)}</div>
            <div>
                <div class="name">${nt.hoTen}</div>
                <div class="sub"><i class="fas fa-phone" style="font-size:11px"></i> ${nt.soDienThoai}</div>
            </div>
        </div>
        <div class="info-grid" style="margin-top:10px">
            <div class="info-cell"><div class="lbl">Ngày bắt đầu</div><div class="val">${nt.ngayBatDau ?? "—"}</div></div>
            <div class="info-cell"><div class="lbl">Ngày kết thúc</div><div class="val">${nt.ngayKetThuc ?? "—"}</div></div>
            <div class="info-cell"><div class="lbl">Tiền đặt cọc</div><div class="val">${nt.tienDatCoc ? nt.tienDatCoc.toLocaleString("vi-VN") + "đ" : "—"}</div></div>
            <div class="info-cell"><div class="lbl">Hợp đồng</div><div class="val" style="color:#15803d">Đang hiệu lực</div></div>
        </div>` :
            '<div class="no-tenant"><i class="fas fa-user-slash" style="font-size:28px;display:block;margin-bottom:8px"></i>Phòng chưa có người thuê</div>';

        // ===== TAB LỊCH SỬ =====
        const hoaDons = p.hoaDons ?? [];
        const suCos = p.suCos ?? [];

        // Hóa đơn — field từ API: thang, tongTien, trangThai
        const invHtml = hoaDons.length ? hoaDons.map(inv => `
            <div class="invoice-row">
                <div><div class="month">Hóa đơn ${inv.thang}</div></div>
                <div style="text-align:right">
                    <div class="amt">${inv.tongTien.toLocaleString("vi-VN")}đ</div>
                    <div style="font-size:10px;margin-top:2px;color:${inv.trangThai === "Đã hoàn thành" ? "#15803d" :
                            inv.trangThai === "Chưa đóng" ? "#dc2626" :
                                inv.trangThai === "Quá hạn" ? "#dc2626" : "#d97706"
                        }">${inv.trangThai}</div>
                </div>
            </div>`).join("") : "<div class='no-tenant'>Chưa có hóa đơn</div>";

        // Sự cố — field từ API: moTa, ngay, trangThai
        const incHtml = suCos.length ? suCos.map(inc => `
            <div class="invoice-row">
                <div>
                    <div class="month" style="font-size:12px">${inc.moTa ?? "—"}</div>
                    <div style="font-size:10px;color:var(--mau-chu-phu)">${inc.ngay}</div>
                </div>
                <div style="font-size:10px;color:#c2410c">${inc.trangThai}</div>
            </div>`).join("") : 
            "<div style='font-size:12px;color:var(--mau-chu-phu);padding:8px 0'>Không có sự cố nào</div>";

        document.getElementById("tabHistory").innerHTML = `
        <div style="font-size:11px;font-weight:700;color:var(--mau-chu-phu);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">Hóa đơn gần đây</div>
        ${invHtml}
        <div style="font-size:11px;font-weight:700;color:var(--mau-chu-phu);margin:14px 0 8px;text-transform:uppercase;letter-spacing:.5px">Sự cố đã báo cáo</div>
        ${incHtml}`;

    } catch (err) {
        console.error('Lỗi tải chi tiết phòng:', err);
        document.getElementById("tabInfo").innerHTML = `
        <div style="text-align:center;padding:32px;color:#dc2626;">
            <i class="fas fa-exclamation-circle" style="font-size:24px;margin-bottom:8px;display:block"></i>
            Không thể tải thông tin phòng
        </div>`;
    }
    //////////////////Chỗ chưa sửa////////////////////////
} function mgrToggleMenu() {
    const dd = document.getElementById('mgrDropdown');
    const ch = document.getElementById('mgrChevron');
    const open = dd.classList.toggle('show');
    ch.style.transform = open ? 'rotate(180deg)' : '';
}

document.addEventListener('click', function (e) {
    const wrap = document.getElementById('mgrHeaderWrap');
    if (wrap && !wrap.contains(e.target)) {
        document.getElementById('mgrDropdown')?.classList.remove('show');
        const ch = document.getElementById('mgrChevron');
        if (ch) ch.style.transform = '';
    }
});

function mgrMoDoiMatKhau() {
    mgrToggleMenu();
    moModal('modal-doi-mat-khau'); // nối vào modal khi làm BE
}

function mgrXacNhanDangXuat() {
    mgrToggleMenu();
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        window.location.href = '/logout'; // đổi route khi làm BE
    }
}

// Load email vào dropdown (nếu có API profile riêng cho Manager)
async function mgrLoadEmail() {
    try {
        const res = await fetch('/api/Manager/Profile'); // đổi route theo BE
        const data = await res.json();
        const el = document.getElementById('mgr-dd-email');
        if (el) el.textContent = data.email ?? 'Chưa cập nhật';
    } catch { }
}
document.addEventListener('DOMContentLoaded', mgrLoadEmail);

function showList() {
    document.getElementById("listView").style.display = "";
    const dv = document.getElementById("detailView");
    dv.style.display = "none"; dv.classList.remove("show");
}



document.addEventListener("click", e => {
    const pill = e.target.closest(".pill");
    if (!pill) return;

    curFilter = pill.dataset.filter;

    document.querySelectorAll(".pill").forEach(x => { x.className = "pill"; });
    if (curFilter === "all") pill.classList.add("active-all");
    else if (curFilter === "Trống") pill.classList.add("active-trong");
    else if (curFilter === "Đã thuê") pill.classList.add("active-thue");
    else pill.classList.add("active-sua");

    renderGrid();
});

document.addEventListener("input", e => {
    if (e.target.id === "searchInput") {
        curSearch = e.target.value;
        renderGrid();
    }
});

document.querySelectorAll(".dtab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".dtab").forEach(t => t.classList.remove("on"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("on"));
        tab.classList.add("on");
        document.getElementById("tab" + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)).classList.add("on");
    });
});