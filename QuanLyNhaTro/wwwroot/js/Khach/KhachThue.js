function ktToggleMenu() {
    const dd = document.getElementById('ktDropdown');
    const ch = document.getElementById('ktChevron');
    const open = dd.classList.toggle('show');
    ch.style.transform = open ? 'rotate(180deg)' : '';
}

document.addEventListener('click', function (e) {
    const wrap = document.getElementById('ktHeaderWrap');
    if (wrap && !wrap.contains(e.target)) {
        document.getElementById('ktDropdown')?.classList.remove('show');
        const ch = document.getElementById('ktChevron');
        if (ch) ch.style.transform = '';
    }
});

function ktMoDoiMatKhau() {
    ktToggleMenu();
    moModal('modal-doi-mat-khau'); // nối vào modal khi làm BE
}

function ktXacNhanDangXuat() {
    ktToggleMenu();
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        window.location.href = '/logout'; // đổi route khi làm BE
    }
}