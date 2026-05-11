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
async function loadDanhSachNguoiThue() {
    try {
        const res = await fetch('/api/NguoiThue/DanhSach');
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