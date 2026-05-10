function luuCauHinhGia() {
    hienThongBao('Đã cập nhật bảng giá thuê mặc định!', 'thanh-cong');
    dongModal('modal-cau-hinh-gia');
}

// Lưu cấu hình dịch vụ
// ⚙️ BACKEND: PUT /api/cau-hinh/dich-vu
function luuCauHinhDichVu() {
    hienThongBao('Đã cập nhật chi phí dịch vụ!', 'thanh-cong');
    dongModal('modal-chi-phi-dich-vu');
}

// Lưu quy định đặt cọc
// ⚙️ BACKEND: PUT /api/cau-hinh/dat-coc
function luuQuyDinhDatCoc() {
    hienThongBao('Đã cập nhật quy định đặt cọc!', 'thanh-cong');
    dongModal('modal-dat-coc');
}
// Xuất báo cáo PDF
// ⚙️ BACKEND: GET /api/bao-cao/xuat-pdf?thang=5&nam=2025
function xuatBaoCao() {
    hienThongBao('Đang tạo file PDF báo cáo tháng 5/2025...', 'info');
    setTimeout(() => dongModal('modal-bao-cao-chi-tiet'), 1200);
}
