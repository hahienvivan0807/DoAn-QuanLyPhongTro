// ===== HÀM PHÊ DUYỆT =====
// ⚙️ BACKEND: POST /api/hop-dong/{id}/duyet
function pheDuyet(maHD, loai) {
    hienThongBao(`Đã phê duyệt ${loai === 'xoa' ? 'xóa' : 'gia hạn'} hợp đồng ${maHD}!`, 'thanh-cong');
}
// ⚙️ BACKEND: POST /api/hop-dong/{id}/tu-choi
function tuChoi(maHD) {
    hienThongBao(`Đã từ chối yêu cầu hợp đồng ${maHD}.`, 'canh-bao');
}
// ⚙️ BACKEND: POST /api/sua-chua/{id}/duyet
function pheDuyetSuaChua(maSC) {
    hienThongBao(`Đã phê duyệt yêu cầu sửa chữa ${maSC}!`, 'thanh-cong');
}
function tuChoiSuaChua(maSC) {
    hienThongBao(`Đã từ chối yêu cầu sửa chữa ${maSC}.`, 'canh-bao');
}
function pheDuyetTatCa() {
    hienThongBao('Đã phê duyệt tất cả yêu cầu sửa chữa lớn!', 'thanh-cong');
    setTimeout(() => dongModal('modal-phe-duyet-sua-chua'), 1000);
}

// Sửa thông tin quản lý
// ⚙️ BACKEND: GET /api/quan-ly/{id} rồi mở modal prefill
function suaQuanLy(maQL) {
    hienThongBao('Đang mở form chỉnh sửa quản lý ' + maQL + '...', 'info');
    setTimeout(() => moModal('modal-tai-khoan-quan-ly'), 400);
}