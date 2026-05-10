function hienThongBao(noiDung, loai = 'info') {
    const mauNen = { 'thanh-cong': '#059669', 'loi': '#dc2626', 'canh-bao': '#d97706', 'info': '#1d4ed8' };
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed; bottom:28px; right:28px; z-index:99999;
      background:${mauNen[loai]}; color:#fff; padding:14px 20px;
      border-radius:12px; font-size:13px; font-weight:700;
      box-shadow:0 8px 32px rgba(0,0,0,0.2); max-width:320px;
      animation: truot-len 0.3s ease; font-family:'Be Vietnam Pro',sans-serif;
    `;
    toast.textContent = noiDung;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)'; toast.style.transition = 'all 0.3s'; }, 2700);
    setTimeout(() => toast.remove(), 3100);
}
// ===== HÀM ĐIỀU HƯỚNG MENU SIDEBAR =====
function chuyenMenu(tenTrang, phanTu) {
    document.querySelectorAll('.muc-menu').forEach(m => m.classList.remove('dang-chon'));
    if (phanTu) phanTu.classList.add('dang-chon');
    // ⚙️ BACKEND: Map tên trang → Razor Page route
    const bangDuongDan = {
        'trang-chu': '/ChuTro',
        'quan-ly-phong': '/ChiTietPhong',
        'nguoi-thue': '/QuanLyNguoiThue',
        'hop-dong': '/HopDong',
        'hoa-don': '/HoaDon',
        'sua-chua': '/SuCoBaoTri',
        'bao-cao': '/BaoCao',
        'cai-dat': '/CaiDat',
    };
    const url = bangDuongDan[tenTrang];
    if (url) window.location.href = url;
    else console.log('Chưa có trang:', tenTrang);
}
// ===== MỞ / ĐÓNG MODAL =====
function moModal(idModal) {
    document.getElementById(idModal).classList.add('hien');
    document.body.style.overflow = 'hidden';
}
function dongModal(idModal) {
    document.getElementById(idModal).classList.remove('hien');
    document.body.style.overflow = '';
}
function dongModalNhapNgoai(event, idModal) {
    if (event.target.id === idModal) dongModal(idModal);
}
// ===== ĐÓng/MỞ SIDEBAR =====
function dongMoSidebar() {
    document.getElementById('thanh-sidebar').classList.toggle('an');
}

// ===== HÀM LƯU CÁC MODAL =====

// Lưu tài khoản quản lý mới
// ⚙️ BACKEND: POST /api/quan-ly
function luuTaiKhoanQuanLy() {
    const ten = document.getElementById('ten-quan-ly-moi').value;
    const email = document.getElementById('email-quan-ly-moi').value;
    if (!ten || !email) { hienThongBao('Vui lòng điền đầy đủ họ tên và email!', 'loi'); return; }
    hienThongBao(`Đã tạo tài khoản cho "${ten}" thành công!`, 'thanh-cong');
    dongModal('modal-tai-khoan-quan-ly');
}