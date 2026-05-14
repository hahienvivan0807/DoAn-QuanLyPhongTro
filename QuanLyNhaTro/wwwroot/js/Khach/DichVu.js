/* =============================================
   DichVu.js — Logic thanh toán dịch vụ
   Flow:
     - Giặt sấy : quản lý báo giá → nút "Thanh toán" xuất hiện
     - Bình nước: giá cố định (tinhTienNuoc) → sau khi giao → nút "Thanh toán"
     - Có thể thanh toán riêng lẻ hoặc gộp 2 dịch vụ
     - Modal: hiện QR quản lý + upload ảnh bill → gửi API → chờ xác nhận
============================================= */

/* --- Header date --- */
(function () {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const n = new Date();
    const el = document.getElementById('headerDate');
    if (el) el.textContent = `${days[n.getDay()]}, ${String(n.getDate()).padStart(2, '0')}/${String(n.getMonth() + 1).padStart(2, '0')}/${n.getFullYear()}`;
})();

function dongMoSidebar() { document.getElementById('thanh-sidebar').classList.toggle('an-sidebar'); }

/* =============================================
   TRẠNG THÁI ĐƠN HÀNG
   ──────────────────────────────────────────
   Flow giặt sấy:
     Chờ xử lý → (quản lý nhận đồ, báo giá) → Đang xử lý + TongTien > 0
     → polling bắt → hiện nút Thanh toán

   Flow bình nước:
     Chờ xử lý → (quản lý giao hàng) → Đang xử lý
     → polling bắt → hiện nút Xác nhận nhận hàng + Thanh toán
============================================= */
let gsDaDat = false;
let gsDaCoGia = false;      // quản lý đã xác nhận + báo giá GS
let gsTienThanhToan = 0;
let gsDonId = null;

let nuocDaDat = false;
let nuocDaGiao = false;     // quản lý đã giao nước
let nuocDaXacNhan = false;  // khách xác nhận đã nhận
let nuocTienThanhToan = 0;
let nuocDonId = null;

/* =============================================
   POLLING — kiểm tra trạng thái đơn từ server
============================================= */
let pollingTimer = null;

function batDauPolling() {
    if (pollingTimer) return;
    pollingTimer = setInterval(async () => {
        try {
            const res = await fetch('/KhachThue/TienIch?handler=TrangThai', { credentials: 'include' });
            if (!res.ok) return;
            const data = await res.json();

            // ── Giặt sấy ──
            if (data.giatSay) {
                const don = data.giatSay;
                gsDonId = don.id;
                const gsCanPay = (don.trangThai === 'Chờ thanh toán')
                    || (don.trangThai === 'Đang xử lý' && don.tongTien > 0);
                if (gsCanPay && !gsDaCoGia) {
                    gsTienThanhToan = don.tongTien;
                    _quanLyGuiGiaGS(don.tongTien);
                }
            } else if (gsDaDat) {
                // Đơn đã biến mất (Thành công / Đã hủy) → reset card
                resetCardGS();
            }

            // ── Bình nước ──
            if (data.nuocBinh) {
                const don = data.nuocBinh;
                nuocDonId = don.id;
                nuocTienThanhToan = don.tongTien;
                if (don.trangThai === 'Chờ thanh toán' && !nuocDaXacNhan) {
                    nuocDaGiao = true; nuocDaXacNhan = true;
                    document.getElementById('nuoc-confirm').classList.remove('hien');
                    document.getElementById('nuoc-btn-thanh-toan').style.display = 'flex';
                    capNhatBuocNuoc(4);
                    capNhatBadgeNuoc('active', 'Đã nhận – Cần thanh toán');
                    capNhatTTBar();
                } else if (don.trangThai === 'Đang xử lý' && !nuocDaGiao) {
                    _quanLyDaGiaoNuoc();
                }
            } else if (nuocDaDat) {
                // Đơn đã biến mất → reset card
                resetCardNuoc();
            }

            // Dừng polling nếu không còn đơn nào đang chờ phản hồi
            const conDangCho = (gsDaDat && !gsDaCoGia) || (nuocDaDat && !nuocDaGiao);
            if (!conDangCho) {
                clearInterval(pollingTimer);
                pollingTimer = null;
            }
        } catch (e) { /* bỏ qua lỗi mạng */ }
    }, 8000);
}

/* =============================================
   KHỞI PHỤC TRẠNG THÁI KHI TẢI TRANG
   Gọi ngay khi load — không cần đợi polling 8 giây
============================================= */
async function khoiPhucTrangThaiTuServer() {
    try {
        const res = await fetch('/KhachThue/TienIch?handler=TrangThai', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();

        if (data.giatSay) {
            const don = data.giatSay;
            gsDonId = don.id;
            gsDaDat = true;

            const gsCanPay = (don.trangThai === 'Chờ thanh toán')
                || (don.trangThai === 'Đang xử lý' && don.tongTien > 0);
            if (gsCanPay) {
                gsTienThanhToan = don.tongTien;
                document.getElementById('gs-desc').style.display = 'none';
                document.getElementById('gs-btn-open').style.display = 'none';
                document.getElementById('gs-form').classList.add('hien');
                document.getElementById('gs-btn-group').style.display = 'none';
                _quanLyGuiGiaGS(don.tongTien);
            } else if (don.trangThai === 'Chờ xử lý') {
                document.getElementById('gs-desc').style.display = 'none';
                document.getElementById('gs-btn-open').style.display = 'none';
                document.getElementById('gs-form').classList.add('hien');
                document.getElementById('gs-btn-group').style.display = 'none';
                document.getElementById('gs-waiting').classList.add('hien');
                capNhatBadgeGS('pending', 'Chờ xử lý');
                batDauPolling();
            }
        } else {
            // Không có đơn nào đang hoạt động → reset card về trạng thái ban đầu
            resetCardGS();
        }

        if (data.nuocBinh) {
            const don = data.nuocBinh;
            nuocDonId = don.id;
            nuocDaDat = true;
            nuocTienThanhToan = don.tongTien;

            document.getElementById('nuoc-desc').style.display = 'none';
            document.getElementById('nuoc-btn-open').style.display = 'none';
            document.getElementById('nuoc-form').classList.add('hien');
            document.getElementById('nuoc-btn-group').style.display = 'none';
            document.getElementById('nuoc-track').style.display = 'block';

            if (don.trangThai === 'Chờ thanh toán') {
                nuocDaGiao = true; nuocDaXacNhan = true;
                capNhatBuocNuoc(4);
                document.getElementById('nuoc-tong-tien').textContent =
                    don.tongTien.toLocaleString('vi-VN') + ' đ';
                document.getElementById('nuoc-btn-thanh-toan').style.display = 'flex';
                capNhatBadgeNuoc('active', 'Đã nhận – Cần thanh toán');
            } else if (don.trangThai === 'Đang xử lý') {
                nuocDaGiao = true;
                _quanLyDaGiaoNuoc();
            } else {
                capNhatBuocNuoc(1);
                capNhatBadgeNuoc('pending', 'Đang giao');
                batDauPolling();
            }
            capNhatTTBar();
        } else {
            // Không có đơn nước → reset card
            resetCardNuoc();
        }
    } catch (e) { /* bỏ qua */ }
}

// Gọi ngay khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', khoiPhucTrangThaiTuServer);

/* =============================================
   RESET CARD VỀ TRẠNG THÁI BAN ĐẦU
   Gọi khi server trả null (đơn đã Thành công / Đã hủy)
============================================= */
function resetCardGS() {
    gsDaDat = false; gsDaCoGia = false;
    gsTienThanhToan = 0; gsDonId = null;

    document.getElementById('gs-desc').style.display = '';
    document.getElementById('gs-btn-open').style.display = '';
    document.getElementById('gs-form').classList.remove('hien');
    document.getElementById('gs-waiting').classList.remove('hien');
    document.getElementById('gs-price-box').classList.remove('hien');
    document.getElementById('gs-btn-thanh-toan').style.display = 'none';
    document.getElementById('gs-btn-group').style.display = 'flex';
    capNhatBadgeGS('none', 'Chưa đặt');
    capNhatTTBar();
}

function resetCardNuoc() {
    nuocDaDat = false; nuocDaGiao = false; nuocDaXacNhan = false;
    nuocTienThanhToan = 0; nuocDonId = null;

    document.getElementById('nuoc-desc').style.display = '';
    document.getElementById('nuoc-btn-open').style.display = '';
    document.getElementById('nuoc-form').classList.remove('hien');
    document.getElementById('nuoc-track').style.display = 'none';
    document.getElementById('nuoc-confirm').classList.remove('hien');
    document.getElementById('nuoc-btn-thanh-toan').style.display = 'none';
    document.getElementById('nuoc-btn-group').style.display = 'flex';
    capNhatBadgeNuoc('none', 'Chưa đặt');
    capNhatTTBar();
}

/* =============================================
   CSRF TOKEN HELPER (Razor Pages AntiForgery)
============================================= */
function layTokenCSRF() {
    const el = document.querySelector('input[name="__RequestVerificationToken"]');
    return el ? el.value : '';
}

/* =============================================
   HELPER — đọc JSON an toàn từ Response
   Nếu server trả HTML (ví dụ trang login / lỗi 401/302),
   ném lỗi rõ ràng thay vì crash "Unexpected token '<'"
============================================= */
async function safeJson(res) {
    const ct = res.headers.get('Content-Type') || '';
    if (!ct.includes('application/json')) {
        const text = await res.text();
        // Nếu là trang HTML → có thể do session hết hạn, CSRF sai, hoặc redirect login
        if (text.trim().startsWith('<')) {
            throw new Error('Phiên đăng nhập đã hết hạn hoặc token bảo mật không hợp lệ. Vui lòng tải lại trang.');
        }
        throw new Error(text || `Lỗi HTTP ${res.status}`);
    }
    return res.json();
}

/* =============================================
   FORM GIẶT SẤY
============================================= */
function moFormGS() {
    document.getElementById('gs-desc').style.display = 'none';
    document.getElementById('gs-btn-open').style.display = 'none';
    document.getElementById('gs-form').classList.add('hien');
}
function dongFormGS() {
    document.getElementById('gs-desc').style.display = '';
    document.getElementById('gs-btn-open').style.display = '';
    document.getElementById('gs-form').classList.remove('hien');
}

async function guiDonGS() {
    const loai = document.getElementById('gs-loai').value;
    const ghiChu = document.getElementById('gs-ghi-chu')?.value || '';

    if (!loai) { alert('Vui lòng chọn loại dịch vụ!'); return; }

    // Ẩn nút, hiện chờ
    document.getElementById('gs-btn-group').style.display = 'none';
    document.getElementById('gs-waiting').classList.add('hien');
    capNhatBadgeGS('pending', 'Chờ nhận đồ');
    gsDaDat = true;

    try {
        const res = await fetch('/KhachThue/TienIch?handler=GiatSay', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'RequestVerificationToken': layTokenCSRF() },
            body: JSON.stringify({ loaiDV: loai, ghiChu })
        });
        if (!res.ok) {
            const ct = res.headers.get('Content-Type') || '';
            const body = await res.text();
            if (body.trim().startsWith('<') || res.status === 401 || res.redirected) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng tải lại trang.');
            }
            throw new Error(body || `Lỗi HTTP ${res.status}`);
        }
        const data = await safeJson(res);
        gsDonId = data.id;

        // Bắt đầu polling chờ quản lý báo giá
        batDauPolling();
    } catch (err) {
        alert('Gửi đơn thất bại: ' + err.message);
        // Rollback UI
        gsDaDat = false;
        document.getElementById('gs-btn-group').style.display = '';
        document.getElementById('gs-waiting').classList.remove('hien');
        capNhatBadgeGS('none', 'Chưa đặt');
    }
}

/* Gọi khi polling phát hiện quản lý đã báo giá */
function _quanLyGuiGiaGS(gia) {
    gsTienThanhToan = gia;
    gsDaCoGia = true;
    document.getElementById('gs-gia-tien').textContent = gia.toLocaleString('vi-VN') + ' đ';
    document.getElementById('gs-waiting').classList.remove('hien');
    document.getElementById('gs-price-box').classList.add('hien');
    // Hiện nút Thanh toán Giặt sấy
    document.getElementById('gs-btn-thanh-toan').style.display = 'flex';
    capNhatBadgeGS('active', 'Cần thanh toán');
    capNhatTTBar();
}

function capNhatBadgeGS(loai, text) {
    const b = document.getElementById('gs-badge');
    b.className = 'dv-status-badge dsb-' + loai;
    b.innerHTML = `<span class="dsb-dot"></span>${text}`;
}

/* =============================================
   FORM BÌNH NƯỚC
============================================= */
function moFormNuoc() {
    document.getElementById('nuoc-desc').style.display = 'none';
    document.getElementById('nuoc-btn-open').style.display = 'none';
    document.getElementById('nuoc-form').classList.add('hien');
    tinhTienNuoc(); // tính ngay khi mở
}
function dongFormNuoc() {
    document.getElementById('nuoc-desc').style.display = '';
    document.getElementById('nuoc-btn-open').style.display = '';
    document.getElementById('nuoc-form').classList.remove('hien');
}

function tinhTienNuoc() {
    const sl = parseInt(document.getElementById('nuoc-so-luong').value) || 1;
    const tvo = parseInt(document.getElementById('nuoc-tra-vo').value) || 0;
    // Giá cố định: 15,000đ/bình, trả vỏ giảm 5,000đ/bình
    const tien = sl * 15000 - (tvo ? sl * 5000 : 0);
    nuocTienThanhToan = tien;
    document.getElementById('nuoc-du-tinh').textContent = tien.toLocaleString('vi-VN') + ' đ';
    document.getElementById('nuoc-tong-tien').textContent = tien.toLocaleString('vi-VN') + ' đ';
}

async function guiDonNuoc() {
    const sl = parseInt(document.getElementById('nuoc-so-luong').value);
    const tvo = parseInt(document.getElementById('nuoc-tra-vo').value) || 0;
    const ghiChu = document.getElementById('nuoc-ghi-chu')?.value || '';

    if (!sl || sl < 1) { alert('Vui lòng nhập số lượng bình!'); return; }
    tinhTienNuoc();

    document.getElementById('nuoc-btn-group').style.display = 'none';
    document.getElementById('nuoc-track').style.display = 'block';
    capNhatBadgeNuoc('pending', 'Đang giao');
    nuocDaDat = true;
    capNhatBuocNuoc(1);

    try {
        const res = await fetch('/KhachThue/TienIch?handler=NuocBinh', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'RequestVerificationToken': layTokenCSRF() },
            body: JSON.stringify({ soLuong: sl, traVo: tvo === 1, ghiChu, tongTien: nuocTienThanhToan })
        });
        if (!res.ok) {
            const ct = res.headers.get('Content-Type') || '';
            const body = await res.text();
            if (body.trim().startsWith('<') || res.status === 401 || res.redirected) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng tải lại trang.');
            }
            throw new Error(body || `Lỗi HTTP ${res.status}`);
        }
        const data = await safeJson(res);
        nuocDonId = data.id;

        // Bắt đầu polling chờ quản lý cập nhật trạng thái giao
        batDauPolling();
    } catch (err) {
        alert('Gửi đơn thất bại: ' + err.message);
        nuocDaDat = false;
        document.getElementById('nuoc-btn-group').style.display = '';
        document.getElementById('nuoc-track').style.display = 'none';
        capNhatBadgeNuoc('none', 'Chưa đặt');
    }
}

function capNhatBuocNuoc(buoc) {
    const pct = { 1: 0, 2: 33, 3: 66, 4: 100 };
    document.getElementById('dt-progress').style.width = pct[buoc] + '%';
    for (let i = 1; i <= 4; i++) {
        const el = document.getElementById('dt-step-' + i);
        el.classList.remove('done', 'active');
        if (i < buoc) el.classList.add('done');
        else if (i === buoc) el.classList.add('active');
    }
}

/* Gọi khi polling phát hiện quản lý đã giao (TrangThai_DV = "Đang xử lý") */
function _quanLyDaGiaoNuoc() {
    nuocDaGiao = true;
    capNhatBuocNuoc(4);
    capNhatBadgeNuoc('active', 'Đã giao – Cần xác nhận');

    // Hiện box xác nhận nhận hàng (có nút "Xác nhận đã nhận")
    document.getElementById('nuoc-confirm').classList.add('hien');
    // Cập nhật số tiền trong box xác nhận
    document.getElementById('nuoc-tong-tien').textContent =
        nuocTienThanhToan.toLocaleString('vi-VN') + ' đ';

    // Chưa hiện nút Thanh toán ngay — chờ khách bấm "Xác nhận đã nhận"
    capNhatTTBar();
}

async function xacNhanNhanNuoc() {
    if (!nuocDonId) { alert('Không tìm thấy mã đơn!'); return; }

    try {
        const res = await fetch('/KhachThue/TienIch?handler=XacNhanNhanHang', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': layTokenCSRF()
            },
            body: JSON.stringify({ donId: nuocDonId })
        });
        if (!res.ok) throw new Error(await res.text());
    } catch (e) {
        console.warn('Ghi nhận nhận hàng thất bại:', e.message);
        // Vẫn cho phép tiếp tục UI dù lỗi mạng nhất thời
    }

    nuocDaXacNhan = true;
    document.getElementById('nuoc-confirm').classList.remove('hien');
    document.getElementById('nuoc-btn-thanh-toan').style.display = 'flex';
    capNhatBadgeNuoc('active', 'Đã nhận – Cần thanh toán');
    capNhatTTBar();
}

function capNhatBadgeNuoc(loai, text) {
    const b = document.getElementById('nuoc-badge');
    b.className = 'dv-status-badge dsb-' + loai;
    b.innerHTML = `<span class="dsb-dot"></span>${text}`;
}

/* =============================================
   THANH TOÁN BAR (hiện khi có >=1 dịch vụ cần TT)
============================================= */
function capNhatTTBar() {
    const hasGS = gsDaCoGia;
    const hasNuoc = nuocDaGiao && nuocDaXacNhan;  // chỉ sau khi khách xác nhận đã nhận
    const bar = document.getElementById('tt-bar');

    if (!hasGS && !hasNuoc) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';

    const icon = document.getElementById('tt-bar-icon');
    const label = document.getElementById('tt-bar-label');
    const breakdown = document.getElementById('tt-bar-breakdown');
    const totalEl = document.getElementById('tt-bar-total');

    if (hasGS && hasNuoc) {
        const tong = gsTienThanhToan + nuocTienThanhToan;
        icon.className = 'tt-bar-icon gop';
        icon.innerHTML = '<i class="fas fa-layer-group"></i>';
        label.textContent = 'Thanh toán gộp 2 dịch vụ';
        breakdown.innerHTML =
            `<i class="fas fa-tshirt" style="color:#7c3aed;margin-right:3px;"></i>Giặt Sấy ${gsTienThanhToan.toLocaleString('vi-VN')}đ`
            + `&nbsp;+&nbsp;<i class="fas fa-tint" style="color:#0891b2;margin-right:3px;"></i>Bình Nước ${nuocTienThanhToan.toLocaleString('vi-VN')}đ`;
        totalEl.textContent = tong.toLocaleString('vi-VN') + ' đ';
    } else if (hasGS) {
        icon.className = 'tt-bar-icon';
        icon.innerHTML = '<i class="fas fa-tshirt"></i>';
        label.textContent = 'Thanh toán Giặt Sấy';
        breakdown.textContent = 'Chuyển khoản & gửi xác nhận';
        totalEl.textContent = gsTienThanhToan.toLocaleString('vi-VN') + ' đ';
    } else {
        icon.className = 'tt-bar-icon nuoc';
        icon.innerHTML = '<i class="fas fa-tint"></i>';
        label.textContent = 'Thanh toán Bình Nước';
        breakdown.textContent = 'Chuyển khoản & gửi xác nhận';
        totalEl.textContent = nuocTienThanhToan.toLocaleString('vi-VN') + ' đ';
    }
}

/* =============================================
   MỞ MODAL THANH TOÁN
   - Từ nút riêng trong card: chỉ dịch vụ đó
   - Từ tt-bar: gộp nếu cả 2 cần TT
============================================= */
function moThanhToanGS() { _moModal('gs'); }
function moThanhToanNuoc() { _moModal('nuoc'); }
function moThanhToanTongHop() {
    const hasGS = gsDaCoGia;
    const hasNuoc = nuocDaGiao && nuocDaXacNhan;
    if (hasGS && hasNuoc) _moModal('gop');
    else if (hasGS) _moModal('gs');
    else _moModal('nuoc');
}

function _moModal(loai) {
    // 1. Xác định tiền + nội dung CK
    let tong = 0, ndCK = '', title = '', sub = '', iconClass = '', accentClass = '';
    const soPhongRaw = (document.getElementById('modal-nd-ck')?.dataset.phong || 'P?');

    if (loai === 'gs') {
        tong = gsTienThanhToan;
        ndCK = soPhongRaw + ' GIAT SAY';
        title = 'Thanh toán Giặt Sấy';
        sub = 'Chuyển khoản & gửi ảnh xác nhận';
        iconClass = 'modal-icon-badge tim';
        accentClass = 'modal-accent tim';
        document.getElementById('modal-icon-badge').innerHTML = '<i class="fas fa-tshirt"></i>';
    } else if (loai === 'nuoc') {
        tong = nuocTienThanhToan;
        ndCK = soPhongRaw + ' BINH NUOC';
        title = 'Thanh toán Bình Nước';
        sub = 'Chuyển khoản & gửi ảnh xác nhận';
        iconClass = 'modal-icon-badge cyan';
        accentClass = 'modal-accent cyan';
        document.getElementById('modal-icon-badge').innerHTML = '<i class="fas fa-tint"></i>';
    } else {
        tong = gsTienThanhToan + nuocTienThanhToan;
        ndCK = soPhongRaw + ' GIAT SAY NUOC';
        title = 'Thanh toán gộp 2 dịch vụ';
        sub = 'Giặt Sấy + Bình Nước';
        iconClass = 'modal-icon-badge gop';
        accentClass = 'modal-accent gop';
        document.getElementById('modal-icon-badge').innerHTML = '<i class="fas fa-layer-group"></i>';
    }

    // 2. Ghi loại đang thanh toán để guiXacNhan biết
    document.getElementById('modal-overlay').dataset.loaiTT = loai;

    // 3. Cập nhật UI văn bản
    document.getElementById('modal-accent').className = accentClass;
    document.getElementById('modal-icon-badge').className = iconClass;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-sub').textContent = sub;
    document.getElementById('modal-tong-tien').textContent = tong.toLocaleString('vi-VN') + ' đ';
    document.getElementById('modal-nd-ck').textContent = ndCK;

    // 4. XỬ LÝ HIỂN THỊ ẢNH QR (Phần quan trọng nhất)
    const qrImg = document.getElementById('modal-qr-img');
    const qrFallback = document.getElementById('qr-fallback-box');

    if (qrImg) {
        // Kiểm tra xem src có hợp lệ không (không rỗng và không phải chuỗi rỗng từ Razor)
        const currentSrc = qrImg.getAttribute('src');
        if (currentSrc && currentSrc !== "" && currentSrc !== "/images/qr/") {
            qrImg.style.display = 'block';
            if (qrFallback) qrFallback.style.display = 'none';
        } else {
            qrImg.style.display = 'none';
            if (qrFallback) qrFallback.style.display = 'flex';
        }
    }

    // 5. Danh sách chi tiết (chỉ khi gộp)
    const dvList = document.getElementById('modal-dv-list');
    if (loai === 'gop') {
        dvList.style.display = 'flex';
        document.getElementById('modal-gs-price').textContent = gsTienThanhToan.toLocaleString('vi-VN') + ' đ';
        document.getElementById('modal-nuoc-price').textContent = nuocTienThanhToan.toLocaleString('vi-VN') + ' đ';
    } else {
        dvList.style.display = 'none';
    }

    // 6. Reset upload & mở modal
    upReset();
    document.getElementById('modal-pay-body').style.display = '';
    document.getElementById('modal-success').classList.remove('hien');
    document.getElementById('modal-overlay').classList.add('hien');
    document.body.style.overflow = 'hidden';
}

function dongModal() {
    document.getElementById('modal-overlay').classList.remove('hien');
    document.body.style.overflow = '';
}
function dongModalNeuNgoai(e) { if (e.target.id === 'modal-overlay') dongModal(); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') dongModal(); });

/* =============================================
   UPLOAD BILL
============================================= */
let selectedFile = null;
function upFileChosen(input) { upXuLy(input.files && input.files[0]); }
function upDragOver(e) { e.preventDefault(); document.getElementById('modal-upload-zone').classList.add('drag-over'); }
function upDragLeave() { document.getElementById('modal-upload-zone').classList.remove('drag-over'); }
function upDrop(e) {
    e.preventDefault();
    document.getElementById('modal-upload-zone').classList.remove('drag-over');
    upXuLy(e.dataTransfer.files && e.dataTransfer.files[0]);
}
function upXuLy(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Vui lòng chọn file ảnh!'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('File quá lớn! Tối đa 10MB.'); return; }
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('modal-preview-img').src = e.target.result;
        document.getElementById('modal-fname').textContent = file.name;
        document.getElementById('modal-upload-prompt').style.display = 'none';
        document.getElementById('modal-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
    document.getElementById('modal-btn-gui').classList.add('active');
}
function upXoaAnh(e) { e.stopPropagation(); upReset(); }
function upReset() {
    selectedFile = null;
    const inp = document.getElementById('modal-file-input');
    if (inp) inp.value = '';
    document.getElementById('modal-preview').style.display = 'none';
    document.getElementById('modal-upload-prompt').style.display = '';
    document.getElementById('modal-preview-img').src = '';
    document.getElementById('modal-fname').textContent = '';
    document.getElementById('modal-btn-gui').classList.remove('active');
}

/* =============================================
   GỬI XÁC NHẬN THANH TOÁN → API
============================================= */
async function guiXacNhan() {
    if (!selectedFile) { alert('Vui lòng upload ảnh bill chuyển khoản!'); return; }

    const btn = document.getElementById('modal-btn-gui');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
    btn.classList.remove('active');

    const loai = document.getElementById('modal-overlay').dataset.loaiTT;

    // Xây FormData để upload ảnh + thông tin đơn
    const fd = new FormData();
    fd.append('anhBill', selectedFile);
    fd.append('loaiTT', loai);
    if (loai === 'gs' || loai === 'gop') fd.append('gsDonId', gsDonId ?? '');
    if (loai === 'nuoc' || loai === 'gop') fd.append('nuocDonId', nuocDonId ?? '');

    try {
        const res = await fetch('/KhachThue/TienIch?handler=XacNhanThanhToan', {
            method: 'POST',
            credentials: 'include',
            headers: { 'RequestVerificationToken': layTokenCSRF() },
            body: fd   // không set Content-Type, browser tự thêm boundary
        });
        if (!res.ok) {
            const body = await res.text();
            if (body.trim().startsWith('<') || res.status === 401 || res.redirected) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng tải lại trang.');
            }
            throw new Error(body || `Lỗi HTTP ${res.status}`);
        }

        // Thành công → cập nhật UI
        document.getElementById('modal-pay-body').style.display = 'none';
        document.getElementById('modal-success').classList.add('hien');

        // Reset trạng thái các dịch vụ đã thanh toán
        if (loai === 'gs' || loai === 'gop') {
            gsDaDat = gsDaCoGia = false;
            gsTienThanhToan = 0; gsDonId = null;
            capNhatBadgeGS('none', 'Đã thanh toán – chờ xác nhận');
            document.getElementById('gs-btn-thanh-toan').style.display = 'none';
            document.getElementById('gs-price-box').classList.remove('hien');
        }
        if (loai === 'nuoc' || loai === 'gop') {
            nuocDaDat = nuocDaGiao = nuocDaXacNhan = false;
            nuocTienThanhToan = 0; nuocDonId = null;
            capNhatBadgeNuoc('none', 'Đã thanh toán – chờ xác nhận');
            document.getElementById('nuoc-btn-thanh-toan').style.display = 'none';
            document.getElementById('nuoc-confirm').classList.remove('hien');
        }
        capNhatTTBar();

    } catch (err) {
        alert('Gửi thất bại! Vui lòng thử lại.\n' + err.message);
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi xác nhận thanh toán';
        btn.classList.add('active');
    }
}

/* =============================================
   COPY CLIPBOARD
============================================= */
function saoChep(id) {
    const el = document.getElementById(id);
    if (!el) return;
    navigator.clipboard.writeText(el.textContent.trim()).then(() => {
        const btn = el.nextElementSibling || el.parentElement.querySelector('.copy-btn');
        if (btn) {
            const o = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check" style="color:#059669"></i>';
            setTimeout(() => btn.innerHTML = o, 1400);
        }
    });
}
/* =============================================
   TienIch.js — UI helper cho card Điện Nước
   (Logic thanh toán dịch vụ nằm trong DichVu.js)
============================================= */

const GIA_DIEN_KWH = 3500;
const GIA_NUOC_M3 = 12000;

function formatVND(n) {
    if (n === null || n === undefined || isNaN(n) || n < 0) return '— đ';
    return n.toLocaleString('vi-VN') + ' đ';
}

/* Mở / đóng form điện nước */
function moFormDN() {
    document.getElementById('dn-desc').style.display = 'none';
    document.getElementById('dn-btn-open').style.display = 'none';
    document.getElementById('dn-form').classList.add('hien');
    document.getElementById('dn-badge').className = 'dv-status-badge dsb-pending';
    document.getElementById('dn-badge').innerHTML = '<span class="dsb-dot"></span>Đang nhập';
}
function dongFormDN() {
    document.getElementById('dn-desc').style.display = '';
    document.getElementById('dn-btn-open').style.display = '';
    document.getElementById('dn-form').classList.remove('hien');
    document.getElementById('dn-badge').className = 'dv-status-badge dsb-none';
    document.getElementById('dn-badge').innerHTML = '<span class="dsb-dot"></span>Chưa gửi';
    dnResetPreview('dien');
    dnResetPreview('nuoc');
    document.getElementById('dn-dien-moi').value = '';
    document.getElementById('dn-nuoc-moi').value = '';
    tinhTienDienNuoc();
}

/* Tính tiền theo chỉ số */
function tinhTienDienNuoc() {
    const dienCu = parseFloat(document.getElementById('dn-dien-cu').value) || 0;
    const dienMoi = parseFloat(document.getElementById('dn-dien-moi').value) || null;
    const nuocCu = parseFloat(document.getElementById('dn-nuoc-cu').value) || 0;
    const nuocMoi = parseFloat(document.getElementById('dn-nuoc-moi').value) || null;

    let dienKWh = null, dienTien = null;
    let nuocM3 = null, nuocTien = null;

    if (dienMoi !== null && dienMoi >= dienCu) {
        dienKWh = dienMoi - dienCu;
        dienTien = dienKWh * GIA_DIEN_KWH;
    }
    if (nuocMoi !== null && nuocMoi >= nuocCu) {
        nuocM3 = nuocMoi - nuocCu;
        nuocTien = nuocM3 * GIA_NUOC_M3;
    }

    document.getElementById('dn-dien-so-kwh').textContent = dienKWh !== null ? dienKWh + ' kWh' : '— kWh';
    document.getElementById('dn-dien-tien').textContent = formatVND(dienTien);
    document.getElementById('dn-nuoc-so-m3').textContent = nuocM3 !== null ? nuocM3 + ' m³' : '— m³';
    document.getElementById('dn-nuoc-tien').textContent = formatVND(nuocTien);

    document.getElementById('dn-sum-dien').textContent = formatVND(dienTien);
    document.getElementById('dn-sum-nuoc').textContent = formatVND(nuocTien);

    const tong = (dienTien || 0) + (nuocTien || 0);
    document.getElementById('dn-sum-tong').textContent =
        (dienTien !== null || nuocTien !== null) ? formatVND(tong) : '— đ';
}

/* Upload ảnh đồng hồ */
function dnFileChosen(input, loai) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('dn-' + loai + '-preview-img').src = e.target.result;
        document.getElementById('dn-' + loai + '-upload-prompt').style.display = 'none';
        document.getElementById('dn-' + loai + '-preview').style.display = 'block';
        document.getElementById('dn-' + loai + '-fname').textContent = file.name;
    };
    reader.readAsDataURL(file);
}
function dnXoaAnh(event, loai) { event.stopPropagation(); dnResetPreview(loai); }
function dnResetPreview(loai) {
    const inp = document.getElementById('dn-' + loai + '-file');
    if (inp) inp.value = '';
    const img = document.getElementById('dn-' + loai + '-preview-img');
    if (img) img.src = '';
    const prom = document.getElementById('dn-' + loai + '-upload-prompt');
    if (prom) prom.style.display = '';
    const prev = document.getElementById('dn-' + loai + '-preview');
    if (prev) prev.style.display = 'none';
    const fn = document.getElementById('dn-' + loai + '-fname');
    if (fn) fn.textContent = '';
}
function dnDragOver(event, loai) {
    event.preventDefault();
    document.getElementById('dn-' + loai + '-upload-zone').classList.add('drag-over');
}
function dnDragLeave(event, loai) {
    document.getElementById('dn-' + loai + '-upload-zone').classList.remove('drag-over');
}
function dnDrop(event, loai) {
    event.preventDefault();
    document.getElementById('dn-' + loai + '-upload-zone').classList.remove('drag-over');
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        dnFileChosen({ files: event.dataTransfer.files }, loai);
    }
}

/* Gửi đơn điện nước lên API */
async function guiDonDienNuoc() {
    const dienMoi = document.getElementById('dn-dien-moi').value;
    const nuocMoi = document.getElementById('dn-nuoc-moi').value;
    const dienFile = document.getElementById('dn-dien-file').files[0];
    const nuocFile = document.getElementById('dn-nuoc-file').files[0];

    if (!dienMoi && !nuocMoi) {
        alert('Vui lòng nhập ít nhất một chỉ số điện hoặc nước.'); return;
    }
    if (dienMoi && !dienFile) {
        alert('Vui lòng đính kèm ảnh đồng hồ điện để xác minh.'); return;
    }
    if (nuocMoi && !nuocFile) {
        alert('Vui lòng đính kèm ảnh đồng hồ nước để xác minh.'); return;
    }

    const btnGui = document.getElementById('dn-btn-gui');
    btnGui.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
    btnGui.disabled = true;

    const fd = new FormData();
    if (dienMoi) { fd.append('dienMoi', dienMoi); fd.append('anhDien', dienFile); }
    if (nuocMoi) { fd.append('nuocMoi', nuocMoi); fd.append('anhNuoc', nuocFile); }

    // 1. Lấy Token chống giả mạo — dùng hàm chung từ DichVu.js (layTokenCSRF)
    //    hoặc tự lấy nếu hàm chưa có. Tránh crash khi querySelector trả null.
    const tokenEl = document.querySelector('input[name="__RequestVerificationToken"]');
    const token = tokenEl ? tokenEl.value : '';

    if (!token) {
        alert('Không lấy được token bảo mật. Vui lòng tải lại trang.');
        btnGui.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi chỉ số điện & nước';
        btnGui.disabled = false;
        return;
    }

    try {
        // 2. Dùng full path thay vì URL tương đối '?handler=DienNuoc'
        //    để đảm bảo đúng endpoint bất kể base URL, giống các hàm trong DichVu.js
        const res = await fetch('/KhachThue/TienIch?handler=DienNuoc', {
            method: 'POST',
            credentials: 'include',          // 3. Gửi cookie session để server xác thực
            headers: {
                'RequestVerificationToken': token
            },
            body: fd
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Lỗi hệ thống');
        }

        // --- Xử lý thành công (giữ nguyên logic cũ của bạn) ---
        document.getElementById('dn-badge').className = 'dv-status-badge dsb-active';
        document.getElementById('dn-badge').innerHTML = '<span class="dsb-dot"></span>Đã gửi';
        document.getElementById('dn-btn-group').style.display = 'none';

        const wb = document.createElement('div');
        wb.className = 'waiting-box hien';
        wb.style.cssText = 'background:#d1fae5;border-color:#6ee7b7;padding:10px;border-radius:8px;display:flex;gap:10px;align-items:center;margin-bottom:15px;';
        wb.innerHTML = `<i class="fas fa-check-circle" style="color:#059669;font-size:20px;"></i>
            <div class="wb-text">
              Chỉ số đã được gửi! Quản lý sẽ <strong>xác nhận và tính tiền</strong> trong vòng 24 giờ.
            </div>`;
        document.getElementById('dn-btn-group').insertAdjacentElement('beforebegin', wb);

    } catch (err) {
        alert('Gửi thất bại: ' + err.message);
        btnGui.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi chỉ số điện & nước';
        btnGui.disabled = false;
    }
}

