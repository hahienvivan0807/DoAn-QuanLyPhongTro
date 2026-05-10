// ===== BIỂU ĐỒ DOANH THU & CHI PHÍ (Chart.js) =====
// ⚙️ BACKEND: Thay duLieuThu, duLieuChi bằng dữ liệu thật từ API
document.addEventListener('DOMContentLoaded', function () {

    const canvas = document.getElementById('bieu-do-chu-tro');
    if (!canvas) return;

    const duLieuThu = [45, 42, 53, 49, 58.5, 65.5, 0, 0, 0, 0, 0, 0];
    const duLieuChi = [18, 16, 20, 17, 21.3, 22, 0, 0, 0, 0, 0, 0];

    const ctxChuTro = canvas.getContext('2d');
    const grdThu = ctxChuTro.createLinearGradient(0, 0, 0, 200);
    grdThu.addColorStop(0, 'rgba(201,129,10,0.25)');
    grdThu.addColorStop(1, 'rgba(201,129,10,0.0)');

    new Chart(ctxChuTro, {
        type: 'line',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
            datasets: [
                {
                    label: 'Doanh thu',
                    data: duLieuThu,
                    borderColor: '#c9810a',
                    backgroundColor: grdThu,
                    borderWidth: 2.5,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#c9810a',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Chi phí',
                    data: duLieuChi,
                    borderColor: '#ef4444',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#ef4444',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: false,
                    tension: 0.4,
                    borderDash: [5, 4],
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { font: { size: 11, family: 'Be Vietnam Pro' }, boxWidth: 12, padding: 16 }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#94a3b8', bodyColor: '#fff',
                    padding: 10, borderRadius: 8,
                    callbacks: { label: c => ` ${c.raw} triệu đồng` }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                y: {
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { size: 11 }, callback: v => v + 'M' },
                    beginAtZero: true
                }
            }
        }
    });
});
