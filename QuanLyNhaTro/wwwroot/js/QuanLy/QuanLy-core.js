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

document.addEventListener('DOMContentLoaded', () => {
    HienThiThongKe(); 
});