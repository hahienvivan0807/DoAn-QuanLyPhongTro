let _dvmaDangChon = null;
let _dvmaDsCache = [];

// Mở popup + fetch từ API
async function dvMaMoPopup() {
    const overlay = document.getElementById('dvma-overlay');
    overlay.style.display = 'flex';
    document.getElementById('dvma-search').value = '';
    _dvmaDangChon = null;
    document.getElementById('dvma-btn-ok').disabled = true;
    document.getElementById('dvma-btn-ok').style.opacity = '.5';

    if (_dvmaDsCache.length === 0) {
        document.getElementById('dvma-list').innerHTML =
            '<div style="text-align:center;padding:24px;color:#94a3b8;">' +
            '<i class="fas fa-spinner fa-spin" style="font-size:22px;display:block;margin-bottom:8px;"></i>' +
            'Đang tải...</div>';

        try {
            const res = await fetch('/api/ChuTroDichVu/danh-sach-dich-vu');
            const data = await res.json();
            _dvmaDsCache = data;          // ← lưu vào cache
            dvMaRender(_dvmaDsCache);     // ← render lên list
        } catch {
            document.getElementById('dvma-list').innerHTML =
                '<div style="text-align:center;padding:24px;color:#ef4444;">Lỗi tải dữ liệu!</div>';
            return;
        }
    } else {
        dvMaRender(_dvmaDsCache);
    }

    document.getElementById('dvma-search').focus();
}

function dvMaDongPopup() {
    document.getElementById('dvma-overlay').style.display = 'none';
}

function dvMaLoc(q) {
    const txt = q.toLowerCase().trim();
    const ket = txt === ''
        ? _dvmaDsCache
        : _dvmaDsCache.filter(d =>
            d.maDichVu.toLowerCase().includes(txt) ||
            d.tenDichVu.toLowerCase().includes(txt));
    dvMaRender(ket);
}

function dvMaRender(ds) {
    document.getElementById('dvma-count').textContent = ds.length;
    const el = document.getElementById('dvma-list');
    if (ds.length === 0) {
        el.innerHTML = '<div style="text-align:center;padding:24px;color:#94a3b8;">' +
            '<i class="fas fa-search" style="font-size:24px;display:block;margin-bottom:8px;"></i>' +
            'Không tìm thấy.</div>';
        return;
    }
    el.innerHTML = ds.map(d => `
        <div onclick="dvMaChon('${d.maDichVu}',this)"
             style="display:flex;align-items:center;gap:12px;padding:10px 12px;
                    border-radius:8px;cursor:pointer;border:1px solid transparent;
                    transition:background .12s;background:${_dvmaDangChon === d.maDichVu ? '#e0f7fa' : 'none'};
                    border-color:${_dvmaDangChon === d.maDichVu ? 'var(--page-accent)' : 'transparent'}">
            <div style="flex:1;">
                <div style="font-size:13px;font-weight:700;color:var(--page-accent);">${d.maDichVu}</div>
                <div style="font-size:11px;color:var(--mau-chu-phu);margin-top:1px;">${d.tenDichVu}</div>
            </div>
            <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;
                         background:#e0f7fa;color:#0c4a6e;white-space:nowrap;">
                ${Number(d.donGia).toLocaleString('vi-VN')} đ / ${d.donVi}
            </span>
        </div>
    `).join('');
}

function dvMaChon(ma, el) {
    _dvmaDangChon = ma;
    // Re-render để cập nhật highlight
    dvMaRender(_dvmaDsCache.filter(d =>
        document.getElementById('dvma-search').value === '' ? true :
            d.maDichVu.toLowerCase().includes(document.getElementById('dvma-search').value.toLowerCase()) ||
            d.tenDichVu.toLowerCase().includes(document.getElementById('dvma-search').value.toLowerCase())
    ));
    const btn = document.getElementById('dvma-btn-ok');
    btn.disabled = false;
    btn.style.opacity = '1';
}

function dvMaXacNhan() {
    if (!_dvmaDangChon) return;
    const dv = _dvmaDsCache.find(d => d.maDichVu === _dvmaDangChon);
    if (!dv) return;

    // Điền vào form
    document.getElementById('dv-ma').value = dv.maDichVu;
    document.getElementById('dv-ten').value = dv.tenDichVu;
    document.getElementById('dv-gia').value = dv.donGia;
    document.getElementById('dv-donvi').value = dv.donVi;

    // Đổi label nút submit sang "Cập nhật"
    const lbl = document.getElementById('chg-btn-label');
    if (lbl) lbl.textContent = 'Cập nhật dịch vụ';

    dvMaDongPopup();
}
async function luuDichVu() {
    const ma = document.getElementById('dv-ma').value.trim();
    const ten = document.getElementById('dv-ten').value.trim();
    const gia = document.getElementById('dv-gia').value.trim();
    const donvi = document.getElementById('dv-donvi').value.trim();

    if (!ma || !ten || !gia || !donvi) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    const btn = document.getElementById('chg-btn-submit');
    const label = document.getElementById('chg-btn-label');
    btn.disabled = true;
    label.textContent = 'Đang lưu...';

    try {
        const res = await fetch('/api/ChuTroDichVu/cap-nhat-dich-vu', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                maDichVu: ma,
                tenDichVu: ten,
                donGia: parseFloat(gia),
                donVi: donvi
            })
        });

        const result = await res.json();

        if (!res.ok) {
            showToast('fail', result.message, 'Vui lòng thử lại!');
            return;
        }

        _dvmaDsCache = [];

        // Reset form
        document.getElementById('dv-ma').value = '';
        document.getElementById('dv-ten').value = '';
        document.getElementById('dv-gia').value = '';
        document.getElementById('dv-donvi').value = '';
        label.textContent = 'Lưu dịch vụ';

        showToast('success', 'Cập nhật thành công', 'Dịch vụ đã được cập nhật thành công!');

    } catch {
        showToast('fail', 'Lỗi kết nối', 'Vui lòng thử lại!');
    } finally {
        btn.disabled = false;
    }
}
async function chgLoadDichVu() {
    const el = document.getElementById('chg-dv-list');
    el.innerHTML = '<div class="chg-loading"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';

    try {
        const res = await fetch('/api/ChuTroDichVu/danh-sach-dich-vu');
        const data = await res.json();

        if (data.length === 0) {
            el.innerHTML = '<div class="chg-loading">Chưa có dịch vụ nào.</div>';
            return;
        }

        // Cập nhật số lượng trên banner
        const bsSoDv = document.getElementById('bs-so-dv');
        if (bsSoDv) bsSoDv.textContent = data.length;

        el.innerHTML = `
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                    <tr style="background:var(--page-accent-pale);border-bottom:2px solid var(--page-accent-border);">
                        <th style="padding:10px 14px;text-align:left;font-weight:800;color:var(--page-accent);font-size:11px;text-transform:uppercase;letter-spacing:1px;">Mã DV</th>
                        <th style="padding:10px 14px;text-align:left;font-weight:800;color:var(--page-accent);font-size:11px;text-transform:uppercase;letter-spacing:1px;">Tên dịch vụ</th>
                        <th style="padding:10px 14px;text-align:right;font-weight:800;color:var(--page-accent);font-size:11px;text-transform:uppercase;letter-spacing:1px;">Đơn giá</th>
                        <th style="padding:10px 14px;text-align:center;font-weight:800;color:var(--page-accent);font-size:11px;text-transform:uppercase;letter-spacing:1px;">Đơn vị</th>
                        <th style="padding:10px 14px;text-align:center;font-weight:800;color:var(--page-accent);font-size:11px;text-transform:uppercase;letter-spacing:1px;">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((d, i) => `
                        <tr style="border-bottom:1px solid var(--mau-vien);transition:background .12s;"
                            onmouseover="this.style.background='var(--page-accent-pale)'"
                            onmouseout="this.style.background='${i % 2 === 0 ? '#fff' : '#fafbff'}'">
                            <td style="padding:10px 14px;">
                                <span style="font-size:12px;font-weight:700;padding:3px 10px;border-radius:99px;
                                             background:#e0f7fa;color:#0c4a6e;">
                                    ${d.maDichVu}
                                </span>
                            </td>
                            <td style="padding:10px 14px;font-weight:600;color:var(--mau-chu);">${d.tenDichVu}</td>
                            <td style="padding:10px 14px;text-align:right;font-weight:700;color:var(--mau-chu);">
                                ${Number(d.donGia).toLocaleString('vi-VN')} đ
                            </td>
                            <td style="padding:10px 14px;text-align:center;color:var(--mau-chu-phu);">${d.donVi}</td>
                            <td style="padding:10px 14px;text-align:center;">
                                <button onclick="chgChonDeSua('${d.maDichVu}','${d.tenDichVu}',${d.donGia},'${d.donVi}')"
                                        style="padding:5px 12px;border:1.5px solid var(--page-accent);background:none;
                                               color:var(--page-accent);border-radius:6px;font-size:11px;font-weight:700;
                                               cursor:pointer;font-family:inherit;transition:all .15s;"
                                        onmouseover="this.style.background='var(--page-accent)';this.style.color='#fff'"
                                        onmouseout="this.style.background='none';this.style.color='var(--page-accent)'">
                                    <i class="fas fa-edit"></i> Sửa
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch {
        el.innerHTML = '<div class="chg-loading" style="color:#ef4444;"><i class="fas fa-exclamation-circle"></i> Lỗi tải dữ liệu!</div>';
    }
}

// Khi bấm nút Sửa → điền thẳng vào form
function chgChonDeSua(ma, ten, gia, donvi) {
    document.getElementById('dv-ma').value = ma;
    document.getElementById('dv-ten').value = ten;
    document.getElementById('dv-gia').value = gia;
    document.getElementById('dv-donvi').value = donvi;

    const lbl = document.getElementById('chg-btn-label');
    if (lbl) lbl.textContent = 'Cập nhật dịch vụ';

    // Scroll lên form
    document.getElementById('chg-dv-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Tự động load khi trang mở
document.addEventListener('DOMContentLoaded', chgLoadDichVu);