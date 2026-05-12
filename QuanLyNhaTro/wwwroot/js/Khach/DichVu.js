/* --- Header date --- */
(function () {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const n = new Date();
    const el = document.getElementById('headerDate');
    if (el) el.textContent = `${days[n.getDay()]}, ${String(n.getDate()).padStart(2, '0')}/${String(n.getMonth() + 1).padStart(2, '0')}/${n.getFullYear()}`;
    // Set ngày tối thiểu cho form giặt sấy = ngày mai
    const tomorrow = new Date(n); tomorrow.setDate(n.getDate() + 1);
    const d = document.getElementById('gs-ngay-nhan');
    if (d) d.min = tomorrow.toISOString().split('T')[0];
})();

function dongMoSidebar() { document.getElementById('thanh-sidebar').classList.toggle('an-sidebar'); }

/* =============================================
   TRẠNG THÁI ĐƠN HÀNG
============================================= */
let gsDaDat = false;  // giặt sấy đã đặt chưa
let nuocDaDat = false;  // nước đã đặt chưa
let gsDaCoGia = false;  // quản lý đã gửi giá giặt sấy
let nuocDaGiao = false;  // quản lý đã giao nước
let nuocDaXacNhan = false;
let gsTienThanhToan = 0;
let nuocTienThanhToan = 0;

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
function guiDonGS() {
    const loai = document.getElementById('gs-loai').value;
    const khungGio = document.getElementById('gs-khung-gio').value;
    const ngayNhan = document.getElementById('gs-ngay-nhan').value;
    if (!loai) { alert('Vui lòng chọn loại dịch vụ!'); return; }
    if (!khungGio) { alert('Vui lòng chọn khung giờ nhận đồ!'); return; }
    if (!ngayNhan) { alert('Vui lòng chọn ngày nhận lại đồ!'); return; }

    gsDaDat = true;
    capNhatBadgeGS('pending', 'Chờ nhận đồ');
    document.getElementById('gs-btn-group').style.display = 'none';
    document.getElementById('gs-waiting').classList.add('hien');

    /* TODO: gửi đơn lên API:
       await fetch('/api/DichVu/GiatSay', { method:'POST',
         body: JSON.stringify({ phongId: Model.PhongId, loai, khungGio, ngayNhan }),
         headers: {'Content-Type':'application/json'} });
    */

    // Demo: sau 3 giây giả lập quản lý gửi giá
    setTimeout(quanLyGuiGiaGS, 3000);
}

function quanLyGuiGiaGS() {
    /* TODO: nhận giá từ SignalR / polling:
       const price = await fetch('/api/DichVu/GiatSay/Price?phongId=...').then(r=>r.json());
    */
    const giaDemo = 45000;
    gsTienThanhToan = giaDemo;
    document.getElementById('gs-gia-tien').textContent = giaDemo.toLocaleString('vi-VN') + ' đ';
    document.getElementById('gs-waiting').classList.remove('hien');
    document.getElementById('gs-price-box').classList.add('hien');
    capNhatBadgeGS('active', 'Cần thanh toán');
    gsDaCoGia = true;
    capNhatTTBar();
}

function capNhatBadgeGS(loai, text) {
    const b = document.getElementById('gs-badge');
    b.className = 'dv-status-badge dsb-' + loai;
    b.innerHTML = `<span class="dsb-dot"></span>${text}`;
}

/* =============================================
   FORM NƯỚC
============================================= */
function moFormNuoc() {
    document.getElementById('nuoc-desc').style.display = 'none';
    document.getElementById('nuoc-btn-open').style.display = 'none';
    document.getElementById('nuoc-form').classList.add('hien');
}
function dongFormNuoc() {
    document.getElementById('nuoc-desc').style.display = '';
    document.getElementById('nuoc-btn-open').style.display = '';
    document.getElementById('nuoc-form').classList.remove('hien');
}
function tinhTienNuoc() {
    const sl = parseInt(document.getElementById('nuoc-so-luong').value) || 1;
    const tvo = parseInt(document.getElementById('nuoc-tra-vo').value) || 0;
    const tien = sl * 10000 - (tvo ? sl * 5000 : 0);
    nuocTienThanhToan = tien;
    document.getElementById('nuoc-du-tinh').textContent = tien.toLocaleString('vi-VN') + ' đ';
    document.getElementById('nuoc-tong-tien').textContent = tien.toLocaleString('vi-VN') + ' đ';
}
function guiDonNuoc() {
    const sl = parseInt(document.getElementById('nuoc-so-luong').value);
    if (!sl || sl < 1) { alert('Vui lòng nhập số lượng bình!'); return; }
    tinhTienNuoc();

    nuocDaDat = true;
    capNhatBadgeNuoc('pending', 'Đang giao');
    document.getElementById('nuoc-btn-group').style.display = 'none';
    document.getElementById('nuoc-track').style.display = 'block';

    /* TODO: gửi đặt hàng lên API */

    // Demo: simulate delivery steps
    capNhatBuocNuoc(1); // đã đặt
    setTimeout(() => capNhatBuocNuoc(2), 2000);
    setTimeout(() => capNhatBuocNuoc(3), 4000);
    setTimeout(() => { capNhatBuocNuoc(4); quanLyDaGiaoNuoc(); }, 6000);
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
function quanLyDaGiaoNuoc() {
    nuocDaGiao = true;
    capNhatBadgeNuoc('active', 'Chờ xác nhận');
    document.getElementById('nuoc-confirm').classList.add('hien');
    capNhatTTBar();
}
function xacNhanNhanNuoc() {
    nuocDaXacNhan = true;
    capNhatTTBar();
    /* TODO: gửi xác nhận lên API */
}

function capNhatBadgeNuoc(loai, text) {
    const b = document.getElementById('nuoc-badge');
    b.className = 'dv-status-badge dsb-' + loai;
    b.innerHTML = `<span class="dsb-dot"></span>${text}`;
}

/* =============================================
   MỞ MODAL THANH TOÁN — LOGIC THỐNG NHẤT
   - 1 dịch vụ → thanh toán riêng dịch vụ đó
   - 2 dịch vụ → thanh toán gộp
============================================= */

/* Cập nhật thanh TT dưới lưới dịch vụ */
function capNhatTTBar() {
    const hasGS = gsDaCoGia;
    const hasNuoc = nuocDaGiao && !nuocDaXacNhan;
    const bar = document.getElementById('tt-bar');

    if (!hasGS && !hasNuoc) {
        bar.style.display = 'none';
        return;
    }
    bar.style.display = 'flex';

    const icon = document.getElementById('tt-bar-icon');
    const label = document.getElementById('tt-bar-label');
    const breakdown = document.getElementById('tt-bar-breakdown');
    const totalEl = document.getElementById('tt-bar-total');

    if (hasGS && hasNuoc) {
        // Gộp 2 dịch vụ
        const tong = gsTienThanhToan + nuocTienThanhToan;
        icon.className = 'tt-bar-icon gop';
        icon.innerHTML = '<i class="fas fa-layer-group"></i>';
        label.textContent = 'Thanh toán gộp 2 dịch vụ';
        breakdown.innerHTML =
            `<i class="fas fa-tshirt" style="color:#7c3aed;margin-right:3px;"></i>Giặt Sấy ${gsTienThanhToan.toLocaleString('vi-VN')}đ` +
            `&nbsp;&nbsp;+&nbsp;&nbsp;<i class="fas fa-tint" style="color:#0891b2;margin-right:3px;"></i>Bình Nước ${nuocTienThanhToan.toLocaleString('vi-VN')}đ`;
        totalEl.textContent = tong.toLocaleString('vi-VN') + ' đ';
    } else if (hasGS) {
        icon.className = 'tt-bar-icon';
        icon.innerHTML = '<i class="fas fa-tshirt"></i>';
        label.textContent = 'Thanh toán Giặt Sấy';
        breakdown.textContent = 'Chuyển khoản & gửi xác nhận';
        totalEl.textContent = gsTienThanhToan.toLocaleString('vi-VN') + ' đ';
    } else {
        icon.className = 'tt-bar-icon';
        icon.style.background = 'linear-gradient(135deg,#0891b2,#22d3ee)';
        icon.innerHTML = '<i class="fas fa-tint"></i>';
        label.textContent = 'Thanh toán Bình Nước';
        breakdown.textContent = 'Chuyển khoản & gửi xác nhận';
        totalEl.textContent = nuocTienThanhToan.toLocaleString('vi-VN') + ' đ';
    }
}

function moThanhToanTongHop() {
    const hasGS = gsDaCoGia;
    const hasNuoc = nuocDaGiao && !nuocDaXacNhan;

    if (hasGS && hasNuoc) {
        moModalChung();
    } else if (hasGS) {
        moModalRieng('gs');
    } else {
        moModalRieng('nuoc');
    }
}

function moModalRieng(dv) {
    const isGS = dv === 'gs';
    const tien = isGS ? gsTienThanhToan : nuocTienThanhToan;

    document.getElementById('modal-accent').className = 'modal-accent xanh-la';
    document.getElementById('modal-icon-badge').className = 'modal-icon-badge xanh-la';
    document.getElementById('modal-icon-badge').innerHTML = isGS
        ? '<i class="fas fa-tshirt"></i>' : '<i class="fas fa-tint"></i>';
    document.getElementById('modal-title').textContent = isGS ? 'Thanh toán Giặt Sấy' : 'Thanh toán Bình Nước';
    document.getElementById('modal-sub').textContent = 'Chuyển khoản & gửi xác nhận';
    document.getElementById('modal-tong-tien').textContent = tien.toLocaleString('vi-VN') + ' đ';
    document.getElementById('modal-dv-list').style.display = 'none';
    document.getElementById('modal-nd-ck').textContent = isGS ? 'P201 GIAT SAY' : 'P201 BINH NUOC';

    hienModal();
}

function moModalChung() {
    const tong = gsTienThanhToan + nuocTienThanhToan;
    document.getElementById('modal-accent').className = 'modal-accent chung';
    document.getElementById('modal-icon-badge').className = 'modal-icon-badge chung';
    document.getElementById('modal-icon-badge').innerHTML = '<i class="fas fa-layer-group"></i>';
    document.getElementById('modal-title').textContent = 'Thanh toán gộp 2 dịch vụ';
    document.getElementById('modal-sub').textContent = 'Giặt Sấy + Bình Nước';
    document.getElementById('modal-tong-tien').textContent = tong.toLocaleString('vi-VN') + ' đ';

    const dvList = document.getElementById('modal-dv-list');
    dvList.style.display = 'flex';
    document.getElementById('modal-gs-price').textContent = gsTienThanhToan.toLocaleString('vi-VN') + ' đ';
    document.getElementById('modal-nuoc-price').textContent = nuocTienThanhToan.toLocaleString('vi-VN') + ' đ';
    document.getElementById('modal-nd-ck').textContent = 'P201 GIAT SAY + NUOC';

    hienModal();
}

function hienModal() {
    // Reset upload
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
function dongModalNeuNgoai(e) {
    if (e.target.id === 'modal-overlay') dongModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') dongModal(); });

/* =============================================
   UPLOAD BILL
============================================= */
let selectedFile = null;
function upFileChosen(input) { upXuLy(input.files && input.files[0]); }
function upDragOver(e) { e.preventDefault(); document.getElementById('modal-upload-zone').classList.add('drag-over'); }
function upDragLeave() { document.getElementById('modal-upload-zone').classList.remove('drag-over'); }
function upDrop(e) {
    e.preventDefault(); document.getElementById('modal-upload-zone').classList.remove('drag-over');
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
function upXoaAnh(e) {
    e.stopPropagation();
    upReset();
}
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
   GỬI XÁC NHẬN THANH TOÁN
============================================= */
async function guiXacNhan() {
    const btn = document.getElementById('modal-btn-gui');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
    btn.classList.remove('active');
    try {
        // TODO: thay bằng fetch thật
        await new Promise(r => setTimeout(r, 1800));
        document.getElementById('modal-pay-body').style.display = 'none';
        document.getElementById('modal-success').classList.add('hien');
        // Reset trạng thái sau thanh toán
        gsDaCoGia = false; nuocDaGiao = false; nuocDaXacNhan = false;
        capNhatBadgeGS('none', 'Chưa đặt');
        capNhatBadgeNuoc('none', 'Chưa đặt');
        capNhatTTBar();
    } catch (err) {
        alert('Gửi thất bại! Vui lòng thử lại. (' + err.message + ')');
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
        if (btn) { const o = btn.innerHTML; btn.innerHTML = '<i class="fas fa-check" style="color:#059669"></i>'; setTimeout(() => btn.innerHTML = o, 1400); }
    });
}