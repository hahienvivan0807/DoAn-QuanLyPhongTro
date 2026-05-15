/* ============================================================
   PSC FILTER – Lọc danh sách yêu cầu sửa chữa
   File: psc-filter.js
   
   Dán vào cuối ChuTro-core.js hoặc include riêng trước </body>
   
   Không phụ thuộc thư viện nào, không sửa hàm JS hiện tại.
   Các hàm: pheDuyetSuaChua(), tuChoiSuaChua(), pheDuyetTatCa()
   hoàn toàn giữ nguyên, chỉ thêm bộ lọc.
============================================================ */

/* ── STATE ── */
let _pscCurrentChip = 'all';   // chip filter đang chọn
let _pscCurrentQuery = '';       // text search hiện tại

/* ============================================================
   pscSetChip(mucDo, btnEl)
   Gọi từ onclick của .psc-chip
   mucDo: 'all' | 'Khẩn cấp' | 'Trung bình' | 'Thấp'
============================================================ */
function pscSetChip(mucDo, btnEl) {
    _pscCurrentChip = mucDo;

    /* active class cho chip đang chọn */
    document.querySelectorAll('#modal-phe-duyet-sua-chua .psc-chip')
        .forEach(function (b) { b.classList.remove('psc-chip--active'); });
    if (btnEl) btnEl.classList.add('psc-chip--active');

    _pscApplyFilter();
}

/* ============================================================
   pscFilter(query)
   Gọi từ oninput của input search
============================================================ */
function pscFilter(query) {
    _pscCurrentQuery = (query || '').trim().toLowerCase();
    _pscApplyFilter();
}

/* ============================================================
   _pscApplyFilter()   (private)
   Duyệt tất cả .psc-item, ẩn/hiện theo chip + query.
   Cập nhật số đếm #psc-result-count và empty state.
============================================================ */
function _pscApplyFilter() {
    var items = document.querySelectorAll('#psc-list .psc-item');
    var empty = document.getElementById('psc-empty');
    var counter = document.getElementById('psc-result-count');
    var visible = 0;

    items.forEach(function (item) {
        var mucDo = (item.dataset.mucDo || '').trim();

        /* lọc theo chip */
        var matchChip = (_pscCurrentChip === 'all') || (mucDo === _pscCurrentChip);

        /* lọc theo search: so với toàn bộ text trong card */
        var matchQuery = true;
        if (_pscCurrentQuery !== '') {
            var text = item.textContent.toLowerCase();
            matchQuery = text.indexOf(_pscCurrentQuery) !== -1;
        }

        var show = matchChip && matchQuery;
        item.style.display = show ? '' : 'none';

        /* animation nhẹ khi hiện lại */
        if (show) {
            item.style.opacity = '0';
            item.style.transform = 'translateY(6px)';
            /* setTimeout nhỏ để CSS transition kịp chạy */
            (function (el) {
                setTimeout(function () {
                    el.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 10);
            })(item);
            visible++;
        } else {
            item.style.transition = '';
            item.style.opacity = '1';
            item.style.transform = '';
        }
    });

    /* cập nhật counter */
    if (counter) counter.textContent = visible;

    /* empty state */
    if (empty) empty.style.display = (visible === 0) ? 'flex' : 'none';
}

/* ============================================================
   pscRenderList(data)
   Gọi sau khi fetch() trả về mảng DONDV
   
   Mẫu data mỗi item (map từ bảng DONDV + JOIN):
   {
     id:       "SC-201",          // IDDonDV (dùng làm key cho pheDuyetSuaChua)
     phong:    "Phòng 201",       // SoPhong (từ JOIN PHONG)
     loaiDV:   "Hư hỏng",        // LoaiDV
     mucDo:    "Khẩn cấp",       // MucDo
     tieuDe:   "Thay hệ thống điện", // NoiDung (dòng đầu hoặc parse)
     moTa:     "Mô tả chi tiết...", // NoiDung
     nguoiBaoCao: "Nguyễn Thị Lan", // FullName (từ JOIN ACCOUNT)
     thoiGian: "2 ngày trước",   // tính từ NgayTao
     chiPhi:   "5,500,000 đ",    // TongTien (format)
   }
============================================================ */
function pscRenderList(data) {
    var list = document.getElementById('psc-list');
    if (!list) return;

    /* xoá các item tĩnh (preview), giữ lại #psc-empty */
    var empty = document.getElementById('psc-empty');
    list.querySelectorAll('.psc-item').forEach(function (el) { el.remove(); });

    /* render từng item */
    (data || []).forEach(function (d) {
        var itemClass = 'psc-item';
        var badgeClass = 'psc-badge';
        if (d.mucDo === 'Khẩn cấp') { itemClass += ' psc-item--urgent'; badgeClass += ' psc-badge--urgent'; }
        else if (d.mucDo === 'Trung bình') { itemClass += ' psc-item--medium'; badgeClass += ' psc-badge--medium'; }
        else { itemClass += ' psc-item--low'; badgeClass += ' psc-badge--low'; }

        var html = '<div class="' + itemClass + '" data-id="' + _esc(d.id) + '" data-muc-do="' + _esc(d.mucDo) + '">'

            /* header */
            + '<div class="psc-item-header">'
            + '<div class="psc-item-meta">'
            + '<span class="psc-room-tag">'
            + '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
            + _esc(d.phong)
            + '</span>'
            + '<span class="psc-type-tag">' + _esc(d.loaiDV) + '</span>'
            + '</div>'
            + '<span class="' + badgeClass + '">' + _esc(d.mucDo) + '</span>'
            + '</div>'

            /* tiêu đề */
            + '<div class="psc-item-title">' + _esc(d.tieuDe) + '</div>'

            /* mô tả */
            + '<div class="psc-item-body">' + _esc(d.moTa) + '</div>'

            /* footer */
            + '<div class="psc-item-footer">'
            + '<div class="psc-item-info-row">'
            + '<span class="psc-info-chip psc-info-chip--person">'
            + '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
            + _esc(d.nguoiBaoCao)
            + '</span>'
            + '<span class="psc-info-chip psc-info-chip--time">'
            + '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
            + _esc(d.thoiGian)
            + '</span>'
            + '<span class="psc-cost-chip">'
            + '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
            + _esc(d.chiPhi)
            + '</span>'
            + '</div>'

            /* action buttons */
            + '<div class="psc-item-actions">'
            + '<button class="psc-btn psc-btn--approve" onclick="pheDuyetSuaChua(\'' + _esc(d.id) + '\')">'
            + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
            + 'Phê duyệt'
            + '</button>'
            + '<button class="psc-btn psc-btn--reject" onclick="tuChoiSuaChua(\'' + _esc(d.id) + '\')">'
            + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
            + 'Từ chối'
            + '</button>'
            + '<button class="psc-btn psc-btn--view" onclick="xemAnhHoSo(\'' + _esc(d.id) + '\')">'
            + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
            + 'Xem ảnh / hồ sơ'
            + '</button>'
            + '</div>'
            + '</div>'

            + '</div>'; /* /psc-item */

        /* inject trước #psc-empty */
        if (empty) {
            empty.insertAdjacentHTML('beforebegin', html);
        } else {
            list.insertAdjacentHTML('beforeend', html);
        }
    });

    /* cập nhật stats bar */
    _pscUpdateStats(data);

    /* reset filter về trạng thái ban đầu */
    _pscCurrentChip = 'all';
    _pscCurrentQuery = '';
    if (document.getElementById('psc-search-input'))
        document.getElementById('psc-search-input').value = '';
    document.querySelectorAll('#modal-phe-duyet-sua-chua .psc-chip')
        .forEach(function (b) { b.classList.remove('psc-chip--active'); });
    var chipAll = document.getElementById('psc-chip-all');
    if (chipAll) chipAll.classList.add('psc-chip--active');

    _pscApplyFilter();
}

/* ============================================================
   _pscUpdateStats(data)   (private)
   Cập nhật stats bar + sub title từ mảng data
============================================================ */
function _pscUpdateStats(data) {
    var arr = data || [];

    var khan = arr.filter(function (d) { return d.mucDo === 'Khẩn cấp'; }).length;
    var trung = arr.filter(function (d) { return d.mucDo === 'Trung bình'; }).length;
    var thap = arr.filter(function (d) { return d.mucDo === 'Thấp'; }).length;

    /* tổng chi phí ước tính (TongTien) */
    var tongChiPhi = arr.reduce(function (sum, d) {
        /* d.chiPhiRaw là số (VD: 5500000), d.chiPhi là chuỗi đã format */
        return sum + (d.chiPhiRaw || 0);
    }, 0);

    _pscSetEl('psc-count-khan-cap', khan);
    _pscSetEl('psc-count-trung-binh', trung);
    _pscSetEl('psc-count-thap', thap);
    _pscSetEl('psc-budget-total', _pscFormatMoney(tongChiPhi));
    _pscSetEl('psc-sub-count', arr.length + ' yêu cầu đang chờ duyệt');
    _pscSetEl('psc-result-count', arr.length);
}

/* ── UTILS ── */
function _pscSetEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* escape HTML để tránh XSS khi render dữ liệu từ server */
function _esc(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function _pscFormatMoney(num) {
    if (!num) return '0 đ';
    return num.toLocaleString('vi-VN') + ' đ';
}

/* ============================================================
   pscRelativeTime(dateStr)
   Chuyển NgayTao → "2 ngày trước", "1 tuần trước"...
   Dùng khi map dữ liệu fetch() sang d.thoiGian
============================================================ */
function pscRelativeTime(dateStr) {
    var now = new Date();
    var then = new Date(dateStr);
    var diff = Math.floor((now - then) / 1000); /* seconds */

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
    if (diff < 604800) return Math.floor(diff / 86400) + ' ngày trước';
    if (diff < 2592000) return Math.floor(diff / 604800) + ' tuần trước';
    return Math.floor(diff / 2592000) + ' tháng trước';
}

async function moModalPheDouyetSuaChua() {
    // Hiện modal trước, loading state
    moModal('modal-phe-duyet-sua-chua');

    // Reset về loading
    ['psc-count-khan-cap', 'psc-count-trung-binh', 'psc-count-thap', 'psc-budget-total']
        .forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.textContent = '—';
        });

    var listEl = document.getElementById('psc-list');
    // Xóa item cũ (nếu còn), giữ #psc-empty
    if (listEl) {
        listEl.querySelectorAll('.psc-item').forEach(function (el) { el.remove(); });
    }

    var subCount = document.getElementById('psc-sub-count');
    if (subCount) subCount.textContent = 'Đang tải...';

    try {
        // Chỉ lấy đơn cần duyệt: Chờ xử lý + MucDo != Thấp (hoặc bỏ filter nếu muốn tất cả)
        var res = await fetch('/api/ChuTroSuaChua/danh-sach?trangThai=Ch%E1%BB%9D%20x%E1%BB%AD%20l%C3%BD');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var json = await res.json();

        // Map từ DONDV model → format pscRenderList() cần
        // Theo đúng schema: IDDonDV, SoPhong (join), LoaiDV, MucDo, NoiDung, FullName (join), NgayTao, TongTien
        var data = (json || []).map(function (d) {
            return {
                id: String(d.idDonDV || d.IDDonDV),
                phong: 'Phòng ' + (d.soPhong || d.SoPhong || '?'),
                loaiDV: d.loaiDV || d.LoaiDV || '',
                mucDo: d.mucDo || d.MucDo || 'Trung bình',
                tieuDe: _pscTieuDe(d.noiDung || d.NoiDung, d.loaiDV || d.LoaiDV),
                moTa: d.noiDung || d.NoiDung || '',
                nguoiBaoCao: d.fullName || d.FullName || 'Ẩn danh',
                thoiGian: pscRelativeTime(d.ngayTao || d.NgayTao),
                chiPhi: _pscFormatMoney(d.tongTien || d.TongTien || 0),
                chiPhiRaw: parseFloat(d.tongTien || d.TongTien || 0),
            };
        });

        pscRenderList(data);

    } catch (e) {
        console.error('[PSC] Lỗi tải danh sách sửa chữa:', e);
        var subEl = document.getElementById('psc-sub-count');
        if (subEl) subEl.textContent = 'Lỗi tải dữ liệu';
        // Hiện empty state
        var empty = document.getElementById('psc-empty');
        if (empty) empty.style.display = 'flex';
    }
}

// Helper: lấy dòng đầu NoiDung làm tiêu đề, fallback về LoaiDV
function _pscTieuDe(noiDung, loaiDV) {
    if (!noiDung) return loaiDV || 'Yêu cầu sửa chữa';
    var firstLine = String(noiDung).split('\n')[0].trim();
    return firstLine || loaiDV || 'Yêu cầu sửa chữa';
}
// SỬA: pheDuyetSuaChua — thêm gọi API
async function pheDuyetSuaChua(id) {
    try {
        var res = await fetch('/api/ChuTroSuaChua/phe-duyet/' + id, { method: 'POST' });
        if (!res.ok) throw new Error('HTTP ' + res.status);

        // Xóa item khỏi danh sách UI
        var item = document.querySelector('#psc-list .psc-item[data-id="' + id + '"]');
        if (item) item.remove();

        // Cập nhật lại counter + stats
        _pscApplyFilter();

        showToast('success', 'Đã phê duyệt', 'Yêu cầu sửa chữa đã được duyệt.');
    } catch (e) {
        showToast('fail', 'Lỗi', 'Không thể phê duyệt. Thử lại sau.');
    }
}

// SỬA: tuChoiSuaChua — thêm gọi API
async function tuChoiSuaChua(id) {
    try {
        var res = await fetch('/api/ChuTroSuaChua/tu-choi/' + id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lyDo: 'Chủ trọ từ chối' })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);

        var item = document.querySelector('#psc-list .psc-item[data-id="' + id + '"]');
        if (item) item.remove();

        _pscApplyFilter();

        showToast('warn', 'Đã từ chối', 'Yêu cầu sửa chữa đã bị từ chối.');
    } catch (e) {
        showToast('fail', 'Lỗi', 'Không thể từ chối. Thử lại sau.');
    }
}

// SỬA: pheDuyetTatCa — thêm gọi API
async function pheDuyetTatCa() {
    try {
        var res = await fetch('/api/ChuTroSuaChua/phe-duyet-tat-ca', { method: 'POST' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var json = await res.json();

        // Xóa toàn bộ item, giữ empty state
        document.querySelectorAll('#psc-list .psc-item').forEach(function (el) { el.remove(); });
        _pscApplyFilter();

        showToast('success', 'Duyệt tất cả', 'Đã phê duyệt ' + json.soLuong + ' yêu cầu.');
    } catch (e) {
        showToast('fail', 'Lỗi', 'Không thể duyệt tất cả. Thử lại sau.');
    }
}