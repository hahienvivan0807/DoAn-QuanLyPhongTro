// ============================================================
// File: wwwroot/js/ThongKe/thongke.js
// Đặt vào: QuanLyNhaTro/wwwroot/js/ThongKe/thongke.js
// ============================================================

'use strict';

// ── State ─────────────────────────────────────────────────
const TK = {
    period: 'thangnay',
    nam: new Date().getFullYear(),
    tuNgay: null,
    denNgay: null,
    charts: {},
    data: null,
    loading: false,
};

// ── Khởi tạo khi DOM sẵn sàng ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    khoiTaoBoDanhSachNam();
    khoiTaoBoDLoc();
    taiDuLieuDashboard();
    capNhatNgayGioTK();
});

// ── Tạo dropdown năm ──────────────────────────────────────
function khoiTaoBoDanhSachNam() {
    const sel = document.getElementById('tk-select-nam');
    if (!sel) return;
    const namHienTai = new Date().getFullYear();
    for (let y = namHienTai; y >= namHienTai - 4; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        if (y === namHienTai) opt.selected = true;
        sel.appendChild(opt);
    }
    sel.addEventListener('change', () => {
        TK.nam = parseInt(sel.value);
        taiBieuDoBieuDo(TK.nam);
    });
}

// ── Bộ lọc thời gian ──────────────────────────────────────
function khoiTaoBoDLoc() {
    document.querySelectorAll('.tk-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const p = btn.dataset.period;
            if (p === 'custom') {
                toggleCustomDate(true);
                return;
            }
            toggleCustomDate(false);
            chonPeriod(p);
            TK.tuNgay = null;
            TK.denNgay = null;
            taiDuLieuDashboard();
        });
    });

    const btnApDung = document.getElementById('tk-custom-apply');
    if (btnApDung) {
        btnApDung.addEventListener('click', () => {
            const tu = document.getElementById('tk-tu-ngay')?.value;
            const den = document.getElementById('tk-den-ngay')?.value;
            if (!tu || !den) { alert('Vui lòng chọn đủ ngày bắt đầu và kết thúc'); return; }
            TK.period = 'custom';
            TK.tuNgay = tu;
            TK.denNgay = den;
            chonPeriod('custom');
            taiDuLieuDashboard();
        });
    }
}

function chonPeriod(p) {
    TK.period = p;
    document.querySelectorAll('.tk-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.period === p);
    });
}

function toggleCustomDate(show) {
    const box = document.getElementById('tk-custom-date');
    if (box) box.style.display = show ? 'flex' : 'none';
}

// ── Tải toàn bộ dữ liệu dashboard ────────────────────────
async function taiDuLieuDashboard() {
    if (TK.loading) return;
    TK.loading = true;
    hienSkeleton(true);

    try {
        let url = `/api/thongke/dashboard?period=${TK.period}&nam=${TK.nam}`;
        if (TK.tuNgay) url += `&tuNgay=${TK.tuNgay}`;
        if (TK.denNgay) url += `&denNgay=${TK.denNgay}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        TK.data = await res.json();

        renderCardsTongQuan(TK.data.tongQuan);
        renderBieuDoBieuDo(TK.data.doanhThuTheoThang, TK.data.tongQuan);
        renderBieuDoDonut(TK.data.trangThaiPhong);
        renderTopPhong(TK.data.topPhong);
        renderHoatDongGanDay(TK.data.hoatDongGanDay);
        renderThongKeDonDV(TK.data.thongKeDonDV);
        renderHoaDonCanChuY(TK.data.hoaDonCanChuY);

    } catch (err) {
        console.error('Lỗi tải dashboard:', err);
        hienLoi('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
        TK.loading = false;
        hienSkeleton(false);
    }
}

// Tải lại riêng biểu đồ khi đổi năm
async function taiBieuDoBieuDo(nam) {
    try {
        const res = await fetch(`/api/thongke/doanhthu?nam=${nam}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderBieuDoBieuDo(data, TK.data?.tongQuan);
    } catch (err) {
        console.error('Lỗi tải biểu đồ:', err);
    }
}

// ── Render Cards Tổng Quan ────────────────────────────────
function renderCardsTongQuan(tq) {
    if (!tq) return;

    setEl('tk-tong-phong', tq.tongSoPhong);
    setEl('tk-dang-thue', tq.phongDangThue);
    setEl('tk-con-trong', tq.phongConTrong);
    setEl('tk-dang-sua', tq.phongDangSua);
    setEl('tk-ti-le', tq.tiLeLapDay + '%');
    setEl('tk-nguoi-thue', tq.tongNguoiThue);

    setEl('tk-doanhthu-thang', formatTien(tq.doanhThuThangNay));
    setEl('tk-doanhthu-nam', formatTien(tq.doanhThuNamNay));

    setEl('tk-hd-chua-dong', tq.hoaDonChuaDong);
    setEl('tk-hd-sap-han', tq.hoaDonSapDenHan);
    setEl('tk-hd-qua-han', tq.hoaDonQuaHan);

    setEl('tk-dv-cho-xl', tq.donDVChoXuLy);
    setEl('tk-dv-khan-cap', tq.donDVKhanCap);

    // Tăng trưởng doanh thu
    const elTT = document.getElementById('tk-tang-truong');
    if (elTT) {
        const val = tq.tangTruongDoanhThu;
        const sign = val >= 0 ? '↑ +' : '↓ ';
        elTT.textContent = `${sign}${val}% so tháng trước`;
        elTT.className = 'ty-le-thay-doi ' + (val >= 0 ? 'tang' : 'giam');
    }

    // Tỷ lệ lấp đầy badge
    const elLap = document.getElementById('tk-lapday-badge');
    if (elLap) {
        const tl = tq.tiLeLapDay;
        elLap.textContent = `${tl}% lấp đầy`;
        elLap.className = 'ty-le-thay-doi ' + (tl >= 80 ? 'tang' : 'giam');
    }
}

// ── Biểu đồ Line – Doanh thu theo tháng ──────────────────
function renderBieuDoBieuDo(data, tq) {
    const ctx = document.getElementById('tk-chart-doanhthu');
    if (!ctx) return;

    const labels = (data || []).map(d => `T${d.thang}`);
    const phong = (data || []).map(d => d.tongTienPhong / 1_000_000);
    const dien = (data || []).map(d => d.tongTienDien / 1_000_000);
    const nuoc = (data || []).map(d => d.tongTienNuoc / 1_000_000);
    const dichVu = (data || []).map(d => d.tongTienDV / 1_000_000);
    const tong = (data || []).map(d => d.tongCong / 1_000_000);

    if (TK.charts.doanhThu) {
        TK.charts.doanhThu.data.labels = labels;
        TK.charts.doanhThu.data.datasets[0].data = tong;
        TK.charts.doanhThu.data.datasets[1].data = phong;
        TK.charts.doanhThu.data.datasets[2].data = dien;
        TK.charts.doanhThu.data.datasets[3].data = nuoc;
        TK.charts.doanhThu.data.datasets[4].data = dichVu;
        TK.charts.doanhThu.update('active');
        return;
    }

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(26,86,219,0.22)');
    gradient.addColorStop(1, 'rgba(26,86,219,0.0)');

    TK.charts.doanhThu = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Tổng cộng',
                    data: tong,
                    type: 'line',
                    borderColor: '#1a56db',
                    backgroundColor: gradient,
                    borderWidth: 2.5,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#1a56db',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y',
                    order: 0,
                },
                {
                    label: 'Tiền phòng',
                    data: phong,
                    backgroundColor: 'rgba(26,86,219,0.75)',
                    borderRadius: 5,
                    yAxisID: 'y',
                    order: 1,
                },
                {
                    label: 'Điện',
                    data: dien,
                    backgroundColor: 'rgba(245,158,11,0.75)',
                    borderRadius: 5,
                    yAxisID: 'y',
                    order: 1,
                },
                {
                    label: 'Nước',
                    data: nuoc,
                    backgroundColor: 'rgba(16,185,129,0.75)',
                    borderRadius: 5,
                    yAxisID: 'y',
                    order: 1,
                },
                {
                    label: 'Dịch vụ',
                    data: dichVu,
                    backgroundColor: 'rgba(139,92,246,0.75)',
                    borderRadius: 5,
                    yAxisID: 'y',
                    order: 1,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { font: { size: 11 }, boxWidth: 12, padding: 12 }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#94a3b8',
                    bodyColor: '#fff',
                    padding: 12,
                    borderRadius: 10,
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.raw.toFixed(2)}M đ`
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                },
                y: {
                    stacked: false,
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { size: 11 }, callback: v => v + 'M' },
                    beginAtZero: true
                }
            }
        }
    });
}

// ── Biểu đồ Donut – Trạng thái phòng ─────────────────────
function renderBieuDoDonut(data) {
    const ctx = document.getElementById('tk-chart-donut');
    if (!ctx || !data || !data.length) return;

    const mauMap = {
        'Đã thuê': '#1a56db',
        'Trống': '#10b981',
        'Đang sửa': '#f59e0b',
    };

    const labels = data.map(d => d.trangThai);
    const values = data.map(d => d.soLuong);
    const colors = data.map(d => mauMap[d.trangThai] || '#94a3b8');

    if (TK.charts.donut) {
        TK.charts.donut.data.labels = labels;
        TK.charts.donut.data.datasets[0].data = values;
        TK.charts.donut.update();
        return;
    }

    TK.charts.donut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 3,
                borderColor: '#fff',
                hoverOffset: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 12 }, padding: 16, boxWidth: 14 }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.label}: ${ctx.raw} phòng (${data[ctx.dataIndex]?.phanTram}%)`
                    }
                }
            }
        }
    });
}

// ── Biểu đồ Bar ngang – Đơn dịch vụ theo loại ────────────
function renderThongKeDonDV(data) {
    const ctx = document.getElementById('tk-chart-dondv');
    if (!ctx || !data || !data.length) return;

    const labels = data.map(d => d.loaiDV);
    const daXuLy = data.map(d => d.daXuLy);
    const choXuLy = data.map(d => d.choXuLy);
    const khanCap = data.map(d => d.khanCap);

    if (TK.charts.donDV) {
        TK.charts.donDV.data.labels = labels;
        TK.charts.donDV.data.datasets[0].data = daXuLy;
        TK.charts.donDV.data.datasets[1].data = choXuLy;
        TK.charts.donDV.data.datasets[2].data = khanCap;
        TK.charts.donDV.update();
        return;
    }

    TK.charts.donDV = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Đã xử lý', data: daXuLy, backgroundColor: '#10b981', borderRadius: 4 },
                { label: 'Chờ xử lý', data: choXuLy, backgroundColor: '#f59e0b', borderRadius: 4 },
                { label: 'Khẩn cấp', data: khanCap, backgroundColor: '#ef4444', borderRadius: 4 },
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } },
                tooltip: { backgroundColor: '#1e293b', bodyColor: '#fff', padding: 10, borderRadius: 8 }
            },
            scales: {
                x: { stacked: false, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
                y: { grid: { display: false }, ticks: { font: { size: 11 } } }
            }
        }
    });
}

// ── Top phòng doanh thu ───────────────────────────────────
function renderTopPhong(data) {
    const container = document.getElementById('tk-top-phong');
    if (!container) return;

    if (!data || !data.length) {
        container.innerHTML = '<div class="tk-empty"><i class="fas fa-inbox"></i><p>Không có dữ liệu</p></div>';
        return;
    }

    const maxDT = Math.max(...data.map(d => d.tongDoanhThu), 1);

    container.innerHTML = data.map((p, i) => {
        const phanTram = Math.round(p.tongDoanhThu / maxDT * 100);
        const mauBadge = p.trangThai === 'Đã thuê' ? 'dang-thue' : (p.trangThai === 'Trống' ? 'trong' : 'bao-tri');
        return `
        <div class="tk-top-row" onclick="window.location.href='/Manager/ChiTietPhong?soPhong=${p.soPhong}'">
            <div class="tk-top-rank">#${i + 1}</div>
            <div class="tk-top-info">
                <div class="tk-top-ten">Phòng ${p.soPhong} <span class="trang-thai-phong ${mauBadge}" style="font-size:10px">${p.trangThai}</span></div>
                <div class="tk-top-bar-wrap">
                    <div class="tk-top-bar" style="width:${phanTram}%"></div>
                </div>
            </div>
            <div class="tk-top-dt">
                <div>${formatTien(p.tongDoanhThu)}</div>
                <div style="font-size:10px;color:var(--mau-chu-phu)">${p.soHoaDon} hóa đơn</div>
            </div>
        </div>`;
    }).join('');
}

// ── Hoạt động gần đây ─────────────────────────────────────
function renderHoatDongGanDay(data) {
    const container = document.getElementById('tk-hoat-dong');
    if (!container) return;

    if (!data || !data.length) {
        container.innerHTML = '<div class="tk-empty"><i class="fas fa-history"></i><p>Chưa có hoạt động</p></div>';
        return;
    }

    container.innerHTML = data.slice(0, 10).map(item => {
        const mauDot = item.mauTrangThai === 'xanh' ? 'xanh' : (item.mauTrangThai === 'do' ? 'do' : 'vang');
        return `
        <div class="muc-thong-bao">
            <div class="dot-trang-thai ${mauDot}"></div>
            <div class="noi-dung-thong-bao">
                <div class="tieu-de-thong-bao"><i class="${item.icon}" style="margin-right:5px;opacity:.7;font-size:11px"></i>${item.tieuDe}</div>
                <div class="mo-ta-thong-bao">${item.moTa}</div>
            </div>
            <div class="thoi-gian">${item.thoiGianHienThi}</div>
        </div>`;
    }).join('');
}

// ── Hóa đơn cần chú ý ────────────────────────────────────
function renderHoaDonCanChuY(data) {
    const tbody = document.getElementById('tk-hoadon-tbody');
    if (!tbody) return;

    if (!data || !data.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--mau-chu-phu)"><i class="fas fa-check-circle" style="color:#10b981;margin-right:6px"></i>Không có hóa đơn cần chú ý</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(hd => {
        const isQuaHan = hd.soNgayConLai < 0;
        const isSapHan = hd.soNgayConLai >= 0 && hd.soNgayConLai <= 3;
        const cssClass = hd.trangThai_TT === 'Quá hạn' || isQuaHan
            ? 'chua-thanh-toan' : (isSapHan ? 'sap-den-han' : 'da-thanh-toan');
        const ngayHienThi = hd.soNgayConLai < 0
            ? `Quá ${Math.abs(hd.soNgayConLai)} ngày`
            : (hd.soNgayConLai === 0 ? 'Hôm nay' : `Còn ${hd.soNgayConLai} ngày`);

        return `<tr>
            <td><strong>P.${hd.soPhong}</strong></td>
            <td>${hd.tenNguoiThue}</td>
            <td style="font-weight:700;color:var(--mau-chu-de)">${formatTien(hd.tongCong)}</td>
            <td>${new Date(hd.hanDong).toLocaleDateString('vi-VN')}</td>
            <td><span class="trang-thai-thanh-toan ${cssClass}">${hd.trangThai_TT}</span></td>
            <td style="font-size:11px;font-weight:600;color:${hd.soNgayConLai < 0 ? '#dc2626' : '#d97706'}">${ngayHienThi}</td>
        </tr>`;
    }).join('');
}

// ── Tiện ích ──────────────────────────────────────────────
function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? '—';
}

function formatTien(amount) {
    if (!amount) return '0 đ';
    if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(2) + ' tỷ';
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + 'M đ';
    if (amount >= 1_000) return (amount / 1_000).toFixed(0) + 'K đ';
    return amount.toLocaleString('vi-VN') + ' đ';
}

function hienSkeleton(show) {
    document.querySelectorAll('.tk-skeleton').forEach(el => {
        el.style.display = show ? 'block' : 'none';
    });
    document.querySelectorAll('.tk-content').forEach(el => {
        el.style.opacity = show ? '0.4' : '1';
        el.style.transition = 'opacity .3s';
    });
}

function hienLoi(msg) {
    const el = document.getElementById('tk-error-bar');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'flex';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
}

function capNhatNgayGioTK() {
    const ngay = new Date();
    const tuan = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const el = document.getElementById('tk-ngay-gio');
    if (el) el.textContent = `${tuan[ngay.getDay()]}, ${ngay.getDate()} tháng ${ngay.getMonth() + 1} năm ${ngay.getFullYear()}`;
}

// Export cho inline onclick
window.taiDuLieuDashboard = taiDuLieuDashboard;