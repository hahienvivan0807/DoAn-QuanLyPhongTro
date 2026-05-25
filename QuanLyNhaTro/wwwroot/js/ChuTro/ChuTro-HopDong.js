// ================================================================
// API BASE – Endpoint thực tế khớp với HopDongController
// ================================================================
const API_BASE = '/api/HopDong';

// ================================================================
// STATE
// ================================================================
let allContracts = [];   // toàn bộ data sau khi fetch
let filtered = [];       // sau filter/search
let currentPage = 1;
const PAGE_SIZE = 10;
let sortKey = 'startDate';
let sortAsc = false;
let currentView = 'table';
let deleteTarget = null;
let toastTimer;

// ================================================================
// INIT
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    fetchContracts();

    // Đóng modal khi click overlay
    document.getElementById('contractModal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
    document.getElementById('confirmOverlay').addEventListener('click', function (e) {
        if (e.target === this) closeConfirm();
    });
});

// ================================================================
// API – LẤY DANH SÁCH HỢP ĐỒNG
// ================================================================
async function fetchContracts() {
    showTableLoading();
    try {
        const resp = await fetch(`${API_BASE}/danh-sach-hop-dong`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        allContracts = data;

        handleSearch();
        updateStats(allContracts);
        populateRoomFilter(allContracts);

    } catch (err) {
        console.error('fetchContracts error:', err);
        showTableError('Không thể tải dữ liệu. Vui lòng thử lại.');
    }
}

function populateRoomFilter(contracts) {
    const roomSel = document.getElementById('roomFilter');
    while (roomSel.options.length > 1) roomSel.remove(1);

    [...new Set(contracts.map(c => c.roomName))]
        .filter(r => r && r !== '—')
        .sort()
        .forEach(r => {
            const opt = document.createElement('option');
            opt.value = r; opt.textContent = r;
            roomSel.appendChild(opt);
        });
}

// ================================================================
// API – LẤY CHI TIẾT HỢP ĐỒNG
// FIX: Luôn gọi API để lấy đủ dữ liệu chi tiết
// (tenantIdCard, soKhachGhep, dichVu, ngayThanhLy, ...)
// ================================================================
async function fetchContractDetail(id) {
    try {
        const resp = await fetch(`${API_BASE}/chi-tiet/${id}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.json();
    } catch (err) {
        showToast('Không thể tải chi tiết hợp đồng', 'error');
        return null;
    }
}

// ================================================================
// API – TẠO HỢP ĐỒNG MỚI
// ================================================================
async function createContract(formData) {
    const resp = await fetch(`${API_BASE}/them-hop-dong`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': getAntiForgeryToken()
        },
        body: JSON.stringify(formData)
    });
    if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi tạo hợp đồng');
    }
    return await resp.json();
}

// ================================================================
// API – CẬP NHẬT HỢP ĐỒNG
// ================================================================
async function updateContract(id, formData) {
    const resp = await fetch(`${API_BASE}/cap-nhat/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': getAntiForgeryToken()
        },
        body: JSON.stringify(formData)
    });
    if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi cập nhật hợp đồng');
    }
    return await resp.json();
}

// ================================================================
// API – XÓA HỢP ĐỒNG
// FIX: endpoint khớp với Controller (cần thêm DELETE xoa/{id} ở C#)
// ================================================================
async function deleteContract(id) {
    const resp = await fetch(`${API_BASE}/xoa/${id}`, {
        method: 'DELETE',
        headers: { 'RequestVerificationToken': getAntiForgeryToken() }
    });
    if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${resp.status}`);
    }
    return true;
}

// ================================================================
// SEARCH & FILTER
// ================================================================
function handleSearch() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const room = document.getElementById('roomFilter').value;

    filtered = allContracts.filter(c => {
        const matchQ = !q ||
            (c.contractCode || '').toLowerCase().includes(q) ||
            (c.tenantName || '').toLowerCase().includes(q) ||
            (c.roomName || '').toLowerCase().includes(q);
        const matchStatus = !status || c.status === status;
        const matchRoom = !room || c.roomName === room;
        return matchQ && matchStatus && matchRoom;
    });

    document.getElementById('filter-count').textContent = filtered.length;
    currentPage = 1;
    sortAndRender();
}

// ================================================================
// SORT
// ================================================================
function sortTable(key) {
    if (sortKey === key) sortAsc = !sortAsc;
    else { sortKey = key; sortAsc = true; }
    sortAndRender();
}

function sortAndRender() {
    const sorted = [...filtered].sort((a, b) => {
        let va = a[sortKey] ?? '', vb = b[sortKey] ?? '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    renderPage(sorted);
}

// ================================================================
// RENDER
// ================================================================
function renderPage(data) {
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const page = data.slice(start, start + PAGE_SIZE);

    document.getElementById('pageInfo').textContent =
        `Trang ${currentPage} / ${totalPages} (${total} hợp đồng)`;

    if (currentView === 'table') renderTable(page);
    else renderGrid(page);

    renderPagination(total, totalPages);
}

function renderTable(page) {
    const tbody = document.getElementById('contractTableBody');
    if (!page.length) {
        tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📭</div><p>Không tìm thấy hợp đồng nào</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = page.map(c => `
        <tr>
            <td><a class="contract-id" onclick="openDetailModal('${c.contractId}')">${esc(c.contractCode)}</a></td>
            <td>
                <div class="tenant-info">
                    <div class="avatar">${(c.tenantName || '?')[0].toUpperCase()}</div>
                    <div>
                        <div class="tenant-name">${esc(c.tenantName)}</div>
                        <div class="tenant-phone">${esc(c.tenantPhone || '')}</div>
                    </div>
                </div>
            </td>
            <td><span class="room-badge">${esc(c.roomName)}</span></td>
            <td class="date-cell">${formatDate(c.startDate)}</td>
            <td class="date-cell">
                ${formatDate(c.endDate)}
                ${daysLeft(c.endDate, c.status)}
            </td>
            <td class="date-cell">${formatMoney(c.monthlyRent)}</td>
            <td>${statusBadge(c.status)}</td>
            <td>
                <div class="action-btns" style="justify-content:center">
                    <button class="btn-icon btn-view" title="Xem chi tiết" onclick="openDetailModal('${c.contractId}')">👁</button>
                    <button class="btn-icon btn-edit" title="Chỉnh sửa"  onclick="openEditModal('${c.contractId}')">✏️</button>
                    <button class="btn-icon btn-del"  title="Xóa"        onclick="confirmDelete('${c.contractId}','${esc(c.contractCode)}')">🗑</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderGrid(page) {
    const grid = document.getElementById('gridView');
    if (!page.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📭</div><p>Không tìm thấy hợp đồng nào</p></div>`;
        return;
    }
    grid.innerHTML = page.map(c => `
        <div class="contract-card" onclick="openDetailModal('${c.contractId}')">
            <div class="cc-top">
                <span class="cc-id">${esc(c.contractCode)}</span>
                ${statusBadge(c.status)}
            </div>
            <div class="cc-tenant">${esc(c.tenantName)}</div>
            <div class="cc-phone">${esc(c.tenantPhone || '')}</div>
            <hr class="cc-divider"/>
            <div class="cc-row"><span class="label">Phòng</span><span class="value">${esc(c.roomName)}</span></div>
            <div class="cc-row"><span class="label">Bắt đầu</span><span class="value">${formatDate(c.startDate)}</span></div>
            <div class="cc-row"><span class="label">Kết thúc</span><span class="value">${formatDate(c.endDate)}</span></div>
            <div class="cc-row"><span class="label">Tiền thuê</span><span class="value" style="color:var(--primary)">${formatMoney(c.monthlyRent)}</span></div>
            <div class="cc-actions" onclick="event.stopPropagation()">
                <button class="cc-btn cc-btn-edit" onclick="openEditModal('${c.contractId}')">✏️ Sửa</button>
                <button class="cc-btn cc-btn-del"  onclick="confirmDelete('${c.contractId}','${esc(c.contractCode)}')">🗑 Xóa</button>
            </div>
        </div>
    `).join('');
}

function renderPagination(total, totalPages) {
    const container = document.getElementById('pageBtns');
    let html = `<button class="page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
        if (totalPages > 7 && Math.abs(i - currentPage) > 2 && i !== 1 && i !== totalPages) {
            if (i === 2 || i === totalPages - 1) html += `<button class="page-btn" disabled>…</button>`;
            continue;
        }
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;
    container.innerHTML = html;
}

function goPage(p) {
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    if (p < 1 || p > totalPages) return;
    currentPage = p;
    sortAndRender();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================================================================
// STATS
// ================================================================
function updateStats(data) {
    document.getElementById('stat-total').textContent = data.length;
    document.getElementById('stat-active').textContent = data.filter(c => c.status === 'active').length;
    document.getElementById('stat-expiring').textContent = data.filter(c => c.status === 'expiring').length;
    document.getElementById('stat-settled').textContent = data.filter(c => c.status === 'settled' || c.status === 'expired').length;
}

// ================================================================
// VIEW SWITCH
// ================================================================
function switchView(v) {
    currentView = v;
    document.getElementById('tableView').style.display = v === 'table' ? '' : 'none';
    document.getElementById('gridView').classList.toggle('active', v === 'grid');
    document.getElementById('btnTable').classList.toggle('active', v === 'table');
    document.getElementById('btnGrid').classList.toggle('active', v === 'grid');
    sortAndRender();
}

// ================================================================
// MODALS
// ================================================================
async function openDetailModal(id) {
    document.getElementById('modalTitle').textContent = 'Chi tiết Hợp đồng';
    document.getElementById('modalBody').innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Đang tải...</p></div>';
    document.getElementById('modalFoot').innerHTML = '';
    openModal();

    const c = await fetchContractDetail(id);
    if (!c) { closeModal(); return; }

    // FIX: Hiển thị đầy đủ dữ liệu từ API chi tiết
    document.getElementById('modalBody').innerHTML = `
        <p class="modal-section-title">Thông tin Hợp đồng</p>
        <div class="detail-grid">
            <div class="detail-item">
                <label>Mã hợp đồng</label>
                <div class="val">${esc(c.contractCode)}</div>
            </div>
            <div class="detail-item">
                <label>Trạng thái</label>
                <div class="val">${statusBadge(c.status)}</div>
            </div>
            <div class="detail-item">
                <label>Ngày bắt đầu</label>
                <div class="val">${formatDate(c.startDate)}</div>
            </div>
            <div class="detail-item">
                <label>Ngày kết thúc</label>
                <div class="val">${formatDate(c.endDate)} ${daysLeft(c.endDate, c.status)}</div>
            </div>
        </div>

        <p class="modal-section-title">Thông tin Khách thuê</p>
        <div class="detail-grid">
            <div class="detail-item">
                <label>Họ và tên</label>
                <div class="val">${esc(c.tenantName)}</div>
            </div>
            <div class="detail-item">
                <label>Số điện thoại</label>
                <div class="val">${esc(c.tenantPhone || '—')}</div>
            </div>
            <div class="detail-item">
                <label>CCCD / CMND</label>
                <div class="val">${esc(c.tenantIdCard || '—')}</div>
            </div>
            <div class="detail-item">
                <label>Email</label>
                <div class="val">${esc(c.tenantEmail || '—')}</div>
            </div>
        </div>

        <p class="modal-section-title">Thông tin Phòng & Tài chính</p>
        <div class="detail-grid">
            <div class="detail-item">
                <label>Phòng</label>
                <div class="val">${esc(c.roomName)}</div>
            </div>
            <div class="detail-item">
                <label>Tiền thuê / tháng</label>
                <div class="val highlight">${formatMoney(c.monthlyRent)}</div>
            </div>
            <div class="detail-item">
                <label>Tiền đặt cọc</label>
                <div class="val">${formatMoney(c.deposit)}</div>
            </div>
            <div class="detail-item">
                <label>Chu kỳ thanh toán</label>
                <div class="val">${esc(c.paymentCycle || 'Hàng tháng')}</div>
            </div>
            <div class="detail-item">
                <label>Số người ở ghép</label>
                <div class="val">${c.soKhachGhep ?? 0} người</div>
            </div>
        </div>

        ${c.dichVu && c.dichVu.length > 0 ? `
        <p class="modal-section-title">Dịch vụ đang sử dụng</p>
        <div style="overflow-x:auto;margin-bottom:22px">
            <table style="width:100%;border-collapse:collapse;font-size:13px">
                <thead>
                    <tr style="background:var(--gray-soft);border-bottom:1.5px solid var(--border)">
                        <th style="padding:8px 12px;text-align:left;font-weight:700;color:var(--text-mid)">Dịch vụ</th>
                        <th style="padding:8px 12px;text-align:right;font-weight:700;color:var(--text-mid)">Đơn giá</th>
                        <th style="padding:8px 12px;text-align:center;font-weight:700;color:var(--text-mid)">SL</th>
                        <th style="padding:8px 12px;text-align:right;font-weight:700;color:var(--text-mid)">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${c.dichVu.map(dv => `
                        <tr style="border-bottom:1px solid var(--border)">
                            <td style="padding:9px 12px">${esc(dv.tenDichVu)}</td>
                            <td style="padding:9px 12px;text-align:right">${formatMoney(dv.donGiaChot)} / ${esc(dv.donVi || '')}</td>
                            <td style="padding:9px 12px;text-align:center">${dv.soLuong}</td>
                            <td style="padding:9px 12px;text-align:right;font-weight:600;color:var(--primary)">${formatMoney(dv.tongTien)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${c.note ? `
        <p class="modal-section-title">Ghi chú</p>
        <div style="background:var(--gray-soft);border-radius:var(--radius-sm);padding:12px 14px;font-size:13.5px;color:var(--text-mid);margin-bottom:22px">
            ${esc(c.note)}
        </div>` : ''}

        ${c.status === 'settled' && (c.ngayThanhLy || c.lyDoKetThuc) ? `
        <p class="modal-section-title">Thông tin thanh lý</p>
        <div class="detail-grid">
            <div class="detail-item">
                <label>Ngày thanh lý</label>
                <div class="val">${formatDate(c.ngayThanhLy) || '—'}</div>
            </div>
            <div class="detail-item">
                <label>Tiền cọc hoàn trả</label>
                <div class="val">${formatMoney(c.tienCocHoanTra)}</div>
            </div>
            <div class="detail-item" style="grid-column:1/-1">
                <label>Lý do kết thúc</label>
                <div class="val">${esc(c.lyDoKetThuc || '—')}</div>
            </div>
        </div>
        ` : ''}
    `;

    document.getElementById('modalFoot').innerHTML = `
        <button class="btn-danger"       onclick="confirmDelete('${c.contractId}','${esc(c.contractCode)}');closeModal()">🗑 Xóa</button>
        <button class="btn-secondary"    onclick="closeModal()">Đóng</button>
        <button class="btn-primary-gold" onclick="openEditModal('${c.contractId}')">✏️ Chỉnh sửa</button>
    `;
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = '➕ Thêm Hợp đồng mới';
    document.getElementById('modalBody').innerHTML = renderContractForm(null);
    document.getElementById('modalFoot').innerHTML = `
        <button class="btn-secondary"    onclick="closeModal()">Hủy</button>
        <button class="btn-primary-gold" onclick="submitContractForm(null)">💾 Lưu hợp đồng</button>
    `;
    openModal();
}

async function openEditModal(id) {
    document.getElementById('modalTitle').textContent = '✏️ Chỉnh sửa Hợp đồng';
    document.getElementById('modalBody').innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Đang tải...</p></div>';
    document.getElementById('modalFoot').innerHTML = '';
    openModal();

    const c = await fetchContractDetail(id);
    if (!c) { closeModal(); return; }

    document.getElementById('modalBody').innerHTML = renderContractForm(c);
    document.getElementById('modalFoot').innerHTML = `
        <button class="btn-secondary"    onclick="closeModal()">Hủy</button>
        <button class="btn-primary-gold" onclick="submitContractForm('${c.contractId}')">💾 Cập nhật</button>
    `;
}

// ================================================================
// FORM TEMPLATE – dùng cho cả thêm & sửa
// FIX: Bỏ field "Trạng thái" vì server tự tính, không nhận từ form
// FIX: Thay input text bằng <select> cho Khách thuê & Phòng
// ================================================================
function renderContractForm(c) {
    const v = (field, def = '') => c ? (c[field] ?? def) : def;
    const inputStyle = `style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13.5px;outline:none;box-sizing:border-box;font-family:var(--font)"`;
    const labelStyle = `style="display:block;font-size:12px;color:var(--text-light);margin-bottom:4px;font-weight:600"`;

    return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">

        <!-- Khách thuê – autocomplete / select -->
        <div style="grid-column:1/-1">
            <label ${labelStyle}>Khách thuê *</label>
            <div style="position:relative">
                <input id="f_tenantSearch"
                    placeholder="Nhập tên hoặc SĐT để tìm khách thuê..."
                    value="${esc(v('tenantName'))}"
                    ${inputStyle}
                    autocomplete="off"
                    oninput="searchTenant(this.value)" />
                <input type="hidden" id="f_tenantId" value="${v('tenantId')}" />
                <div id="tenantDropdown" style="display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);z-index:999;max-height:200px;overflow-y:auto;box-shadow:var(--shadow-md)"></div>
            </div>
        </div>

        <!-- Phòng – select từ API -->
        <div>
            <label ${labelStyle}>Phòng *</label>
            <select id="f_roomId" ${inputStyle} style="padding:9px 12px;width:100%;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13.5px;background:#fff;box-sizing:border-box"
                onchange="onRoomChange(this)">
                <option value="">-- Chọn phòng --</option>
            </select>
        </div>

        <!-- Mã hợp đồng (chỉ đọc khi sửa) -->
        <div>
            <label ${labelStyle}>Mã hợp đồng</label>
            <input id="f_contractCode" value="${esc(v('contractCode'))}"
                placeholder="Tự sinh nếu để trống"
                ${c ? 'readonly style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13.5px;outline:none;box-sizing:border-box;font-family:var(--font);background:var(--gray-soft);color:var(--text-light)"' : inputStyle} />
        </div>

        <!-- Ngày bắt đầu -->
        <div>
            <label ${labelStyle}>Ngày bắt đầu *</label>
            <input id="f_startDate" type="date" value="${v('startDate', '').slice(0, 10)}" ${inputStyle} />
        </div>

        <!-- Ngày kết thúc -->
        <div>
            <label ${labelStyle}>Ngày kết thúc</label>
            <input id="f_endDate" type="date" value="${v('endDate', '').slice(0, 10)}" ${inputStyle} />
        </div>

        <!-- Tiền thuê / tháng -->
        <div>
            <label ${labelStyle}>Tiền thuê / tháng (VNĐ) *</label>
            <input id="f_monthlyRent" type="number" value="${v('monthlyRent', 0)}" ${inputStyle} min="0" step="100000" />
        </div>

        <!-- Tiền đặt cọc -->
        <div>
            <label ${labelStyle}>Tiền đặt cọc (VNĐ)</label>
            <input id="f_deposit" type="number" value="${v('deposit', 0)}" ${inputStyle} min="0" step="100000" />
        </div>

        <!-- Ghi chú -->
        <div style="grid-column:1/-1">
            <label ${labelStyle}>Ghi chú</label>
            <textarea id="f_note" rows="3" placeholder="Điều khoản đặc biệt, ghi chú thêm..." ${inputStyle}
                style="resize:vertical;width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13.5px;outline:none;box-sizing:border-box;font-family:var(--font)"
            >${esc(v('note'))}</textarea>
        </div>
    </div>
    `;
}

// Gọi sau khi renderContractForm để load danh sách phòng
document.addEventListener('DOMContentLoaded', () => {
    // sẽ gọi loadRoomOptions() khi modal mở
});

async function loadRoomOptions(selectedRoomId) {
    try {
        const sel = document.getElementById('f_roomId');
        if (!sel) return;
        const resp = await fetch('/api/Phong/danh-sach-phong-trong');
        if (!resp.ok) return;
        const rooms = await resp.json();
        rooms.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id || r.roomId || r.idPhong;
            opt.textContent = r.soPhong || r.roomName || r.name;
            if (String(opt.value) === String(selectedRoomId)) opt.selected = true;
            sel.appendChild(opt);
        });
        // Nếu đang sửa, thêm option phòng hiện tại nếu chưa có trong danh sách trống
        if (selectedRoomId && !rooms.find(r => String(r.id || r.roomId || r.idPhong) === String(selectedRoomId))) {
            const c = allContracts.find(x => String(x.roomId) === String(selectedRoomId));
            if (c) {
                const opt = document.createElement('option');
                opt.value = selectedRoomId;
                opt.textContent = c.roomName + ' (đang dùng)';
                opt.selected = true;
                sel.appendChild(opt);
            }
        }
    } catch (e) {
        console.warn('loadRoomOptions error:', e);
    }
}

function onRoomChange(sel) {
    // Có thể tự động điền giá phòng nếu cần
}

// Autocomplete tìm khách thuê
let tenantSearchTimer;
async function searchTenant(q) {
    clearTimeout(tenantSearchTimer);
    const dropdown = document.getElementById('tenantDropdown');
    if (!q || q.length < 2) { dropdown.style.display = 'none'; return; }

    tenantSearchTimer = setTimeout(async () => {
        try {
            const resp = await fetch(`/api/KhachThue/tim-kiem?q=${encodeURIComponent(q)}`);
            if (!resp.ok) return;
            const list = await resp.json();
            if (!list.length) { dropdown.style.display = 'none'; return; }

            dropdown.innerHTML = list.map(t => `
                <div onclick="selectTenant(${t.id || t.idUser},'${esc(t.fullName || t.hoTen)}','${esc(t.phone || t.soDienThoai || '')}')"
                    style="padding:9px 14px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--border)"
                    onmouseover="this.style.background='var(--gray-soft)'"
                    onmouseout="this.style.background=''">
                    <strong>${esc(t.fullName || t.hoTen)}</strong>
                    <span style="color:var(--text-light);font-size:11.5px;margin-left:8px">${esc(t.phone || t.soDienThoai || '')}</span>
                </div>
            `).join('');
            dropdown.style.display = 'block';
        } catch (e) {
            console.warn('searchTenant error:', e);
        }
    }, 300);
}

function selectTenant(id, name, phone) {
    document.getElementById('f_tenantSearch').value = name;
    document.getElementById('f_tenantId').value = id;
    document.getElementById('tenantDropdown').style.display = 'none';
}

// ================================================================
// SUBMIT FORM
// FIX: Bỏ field "status" – server tự tính dựa vào ngày
// FIX: Lấy tenantId từ hidden input, roomId từ <select>
// ================================================================
async function submitContractForm(id) {
    const tenantId = document.getElementById('f_tenantId')?.value;
    const roomId = document.getElementById('f_roomId')?.value;
    const startDate = document.getElementById('f_startDate')?.value;
    const monthlyRent = parseFloat(document.getElementById('f_monthlyRent')?.value || 0);

    // Validate phía client
    if (!tenantId) { showToast('❌ Vui lòng chọn khách thuê', 'error'); return; }
    if (!roomId) { showToast('❌ Vui lòng chọn phòng', 'error'); return; }
    if (!startDate) { showToast('❌ Vui lòng nhập ngày bắt đầu', 'error'); return; }
    if (monthlyRent <= 0) { showToast('❌ Tiền thuê phải lớn hơn 0', 'error'); return; }

    const payload = {
        tenantId: parseInt(tenantId),
        roomId: parseInt(roomId),
        startDate,
        endDate: document.getElementById('f_endDate')?.value || null,
        monthlyRent,
        deposit: parseFloat(document.getElementById('f_deposit')?.value || 0),
        note: document.getElementById('f_note')?.value || '',
    };

    try {
        if (id) {
            await updateContract(id, payload);
            showToast('✅ Cập nhật hợp đồng thành công!', 'success');
        } else {
            await createContract(payload);
            showToast('✅ Tạo hợp đồng thành công!', 'success');
        }
        closeModal();
        fetchContracts();
    } catch (err) {
        showToast('❌ ' + err.message, 'error');
    }
}

// ================================================================
// DELETE
// ================================================================
function confirmDelete(id, code) {
    deleteTarget = id;
    document.getElementById('confirmMsg').innerHTML =
        `Bạn có chắc muốn xóa hợp đồng <strong>${esc(code)}</strong>?<br>Hành động này không thể hoàn tác.`;
    document.getElementById('confirmOkBtn').onclick = async () => {
        try {
            await deleteContract(id);
            showToast('✅ Đã xóa hợp đồng!', 'success');
            closeConfirm();
            fetchContracts();
        } catch (err) {
            showToast('❌ Xóa thất bại: ' + err.message, 'error');
            closeConfirm();
        }
    };
    document.getElementById('confirmOverlay').classList.add('open');
}

function closeConfirm() {
    document.getElementById('confirmOverlay').classList.remove('open');
    deleteTarget = null;
}

// ================================================================
// MODAL HELPERS
// ================================================================
function openModal() {
    document.getElementById('contractModal').classList.add('open');
    // Load room options sau khi form đã render
    setTimeout(() => {
        const sel = document.getElementById('f_roomId');
        if (sel && sel.options.length <= 1) {
            const hiddenTenantId = document.getElementById('f_tenantId')?.value;
            const currentRoomId = allContracts.find(c => String(c.tenantId) === String(hiddenTenantId))?.roomId;
            loadRoomOptions(currentRoomId || sel.dataset?.selectedId);
        }
    }, 50);
}
function closeModal() { document.getElementById('contractModal').classList.remove('open'); }

// ================================================================
// LOADING / ERROR STATES
// ================================================================
function showTableLoading() {
    document.getElementById('contractTableBody').innerHTML =
        `<tr><td colspan="8"><div class="loading-state"><div class="spinner"></div><p>Đang tải dữ liệu...</p></div></td></tr>`;
    document.getElementById('gridView').innerHTML =
        `<div class="loading-state" style="grid-column:1/-1"><div class="spinner"></div><p>Đang tải...</p></div>`;
}

function showTableError(msg) {
    document.getElementById('contractTableBody').innerHTML =
        `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${msg}</p><button class="btn-add" onclick="fetchContracts()" style="margin-top:12px">Thử lại</button></div></td></tr>`;
}

// ================================================================
// TOAST
// ================================================================
function showToast(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'show ' + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = ''; }, 3200);
}

// ================================================================
// UTILITIES
// ================================================================
function esc(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(d) {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatMoney(n) {
    if (n == null || n === '') return '—';
    return Number(n).toLocaleString('vi-VN') + ' ₫';
}

function daysLeft(endDate, status) {
    if (status === 'settled' || status === 'expired') return '';
    if (!endDate) return '';
    const diff = Math.ceil((new Date(endDate) - new Date()) / 864e5);
    if (diff < 0) return `<small style="color:var(--red)">Đã quá hạn</small>`;
    if (diff <= 30) return `<small style="color:#f57c00">Còn ${diff} ngày</small>`;
    return '';
}

function statusBadge(s) {
    const map = {
        active: ['badge-active', 'Đang hiệu lực'],
        expiring: ['badge-expiring', 'Sắp hết hạn'],
        expired: ['badge-expired', 'Đã hết hạn'],
        settled: ['badge-settled', 'Đã thanh lý'],
    };
    const [cls, label] = map[s] || ['badge-settled', s || 'Không rõ'];
    return `<span class="status-badge ${cls}">${label}</span>`;
}

function getAntiForgeryToken() {
    return document.querySelector('input[name="__RequestVerificationToken"]')?.value ?? '';
}
