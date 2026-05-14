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