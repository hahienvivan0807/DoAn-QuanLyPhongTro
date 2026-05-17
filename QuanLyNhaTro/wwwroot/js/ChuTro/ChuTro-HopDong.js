async function fetchContracts() {
    showTableLoading();
    try {
        const resp = await fetch(`/api/HopDong/danh-sach-hop-dong`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        // HopDongController trả về flat object đã đúng shape:
        // { contractId, contractCode, tenantName, tenantPhone, tenantEmail,
        //   roomName, roomId, tenantId, startDate, endDate,
        //   monthlyRent, deposit, note, status }
        const data = await resp.json();

        // Dùng thẳng – không cần normalize thêm
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
    // Xóa option cũ (trừ "Tất cả phòng")
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
// API BASE – Endpoint thực tế khớp với HopDongController
// ================================================================
const API_BASE = '/api/HopDong';

// ================================================================
// STATE
// ================================================================
let allContracts = [];   // toàn bộ data sau khi fetch
let filtered = [];   // sau filter/search
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
});

// ================================================================
// API – LẤY DANH SÁCH HỢP ĐỒNG
// Endpoint trả về JSON array:
// [{ contractId, contractCode, tenantName, tenantPhone, roomName,
//    startDate, endDate, monthlyRent, status, note, ... }, ...]
// ================================================================

// ================================================================
// API – LẤY CHI TIẾT HỢP ĐỒNG
// Ưu tiên lấy từ allContracts (đã normalize sẵn).
// Nếu không tìm thấy (trường hợp hiếm), thử gọi API thực tế.
// ================================================================
async function fetchContractDetail(id) {
    // 1. Tìm trong cache local trước – không cần network
    const local = allContracts.find(c => String(c.contractId) === String(id));
    if (local) return local;

    // 2. Fallback: gọi API thực nếu cache chưa có
    try {
        const resp = await fetch(`/api/HopDong/chi-tiet/${id}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        // API trả về đúng shape rồi, dùng thẳng
        return await resp.json();
    } catch (err) {
        showToast('Không thể tải chi tiết hợp đồng', 'error');
        return null;
    }
}

// ================================================================
// API – TẠO HỢP ĐỒNG MỚI
// POST /api/contracts
// ================================================================
async function createContract(formData) {
    const resp = await fetch(`/api/HopDong/them-hop-dong`, {
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
// PUT /api/contracts/{id}
// ================================================================
async function updateContract(id, formData) {
    const resp = await fetch(`/api/HopDong/cap-nhat/${id}`, {
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
// DELETE /api/contracts/{id}
// ================================================================
async function deleteContract(id) {
    const resp = await fetch(`/api/HopDong/xoa/${id}`, {
        method: 'DELETE',
        headers: { 'RequestVerificationToken': getAntiForgeryToken() }
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
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

    // ──────────────────────────────────────────────────
    // Dữ liệu từ API – mỗi {{Field}} ánh xạ sang c.field
    // ──────────────────────────────────────────────────
    document.getElementById('modalBody').innerHTML = `
            <p class="modal-section-title">Thông tin Hợp đồng</p>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Mã hợp đồng</label>
                    <div class="val"><!-- {{ContractCode}} --> ${esc(c.contractCode)}</div>
                </div>
                <div class="detail-item">
                    <label>Trạng thái</label>
                    <div class="val">${statusBadge(c.status)}</div>
                </div>
                <div class="detail-item">
                    <label>Ngày bắt đầu</label>
                    <div class="val"><!-- {{StartDate}} --> ${formatDate(c.startDate)}</div>
                </div>
                <div class="detail-item">
                    <label>Ngày kết thúc</label>
                    <div class="val"><!-- {{EndDate}} --> ${formatDate(c.endDate)}</div>
                </div>
            </div>

            <p class="modal-section-title">Thông tin Khách thuê</p>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Họ và tên</label>
                    <div class="val"><!-- {{TenantName}} --> ${esc(c.tenantName)}</div>
                </div>
                <div class="detail-item">
                    <label>Số điện thoại</label>
                    <div class="val"><!-- {{TenantPhone}} --> ${esc(c.tenantPhone || '—')}</div>
                </div>
                <div class="detail-item">
                    <label>CCCD / CMND</label>
                    <div class="val"><!-- {{TenantIdCard}} --> ${esc(c.tenantIdCard || '—')}</div>
                </div>
                <div class="detail-item">
                    <label>Email</label>
                    <div class="val"><!-- {{TenantEmail}} --> ${esc(c.tenantEmail || '—')}</div>
                </div>
            </div>

            <p class="modal-section-title">Thông tin Phòng & Tài chính</p>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Phòng</label>
                    <div class="val"><!-- {{RoomName}} --> ${esc(c.roomName)}</div>
                </div>
                <div class="detail-item">
                    <label>Tiền thuê / tháng</label>
                    <div class="val highlight"><!-- {{MonthlyRent}} --> ${formatMoney(c.monthlyRent)}</div>
                </div>
                <div class="detail-item">
                    <label>Tiền đặt cọc</label>
                    <div class="val"><!-- {{Deposit}} --> ${formatMoney(c.deposit)}</div>
                </div>
                <div class="detail-item">
                    <label>Chu kỳ thanh toán</label>
                    <div class="val"><!-- {{PaymentCycle}} --> ${esc(c.paymentCycle || 'Hàng tháng')}</div>
                </div>
            </div>

            ${c.note ? `
            <p class="modal-section-title">Ghi chú</p>
            <div style="background:var(--gray-soft);border-radius:var(--radius-sm);padding:12px 14px;font-size:13.5px;color:var(--text-mid)">
                <!-- {{Note}} --> ${esc(c.note)}
            </div>` : ''}
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

// Form template – dùng cho cả thêm & sửa
function renderContractForm(c) {
    const v = (field, def = '') => c ? (c[field] ?? def) : def;
    const inputStyle = `style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13.5px;outline:none;box-sizing:border-box;font-family:var(--font)"`;
    const labelStyle = `style="display:block;font-size:12px;color:var(--text-light);margin-bottom:4px;font-weight:600"`;

    return `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <!-- {{TenantId}} – Gắn với người thuê trong DB -->
            <div style="grid-column:1/-1">
                <label ${labelStyle}>Khách thuê *</label>
                <input id="f_tenantId" placeholder="Tìm khách thuê..." value="${esc(v('tenantName'))}" ${inputStyle}
                    data-id="${v('tenantId')}" />
                <!-- TODO: Gắn autocomplete từ /api/tenants/search -->
            </div>

            <!-- {{RoomId}} -->
            <div>
                <label ${labelStyle}>Phòng *</label>
                <input id="f_roomId" placeholder="Chọn phòng..." value="${esc(v('roomName'))}" ${inputStyle}
                    data-id="${v('roomId')}" />
            </div>

            <!-- {{ContractCode}} -->
            <div>
                <label ${labelStyle}>Mã hợp đồng</label>
                <input id="f_contractCode" value="${esc(v('contractCode'))}" placeholder="Tự sinh nếu để trống" ${inputStyle} />
            </div>

            <!-- {{StartDate}} -->
            <div>
                <label ${labelStyle}>Ngày bắt đầu *</label>
                <input id="f_startDate" type="date" value="${v('startDate', '').slice(0, 10)}" ${inputStyle} />
            </div>

            <!-- {{EndDate}} -->
            <div>
                <label ${labelStyle}>Ngày kết thúc *</label>
                <input id="f_endDate" type="date" value="${v('endDate', '').slice(0, 10)}" ${inputStyle} />
            </div>

            <!-- {{MonthlyRent}} -->
            <div>
                <label ${labelStyle}>Tiền thuê / tháng (VNĐ) *</label>
                <input id="f_monthlyRent" type="number" value="${v('monthlyRent', 0)}" ${inputStyle} min="0" step="100000" />
            </div>

            <!-- {{Deposit}} -->
            <div>
                <label ${labelStyle}>Tiền đặt cọc (VNĐ)</label>
                <input id="f_deposit" type="number" value="${v('deposit', 0)}" ${inputStyle} min="0" step="100000" />
            </div>

            <!-- {{Status}} -->
            <div>
                <label ${labelStyle}>Trạng thái</label>
                <select id="f_status" ${inputStyle} style="padding:9px 12px;width:100%;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13.5px;background:#fff;box-sizing:border-box">
                    <option value="active"   ${v('status') === 'active' ? 'selected' : ''}>✅ Đang hiệu lực</option>
                    <option value="expiring" ${v('status') === 'expiring' ? 'selected' : ''}>⏳ Sắp hết hạn</option>
                    <option value="expired"  ${v('status') === 'expired' ? 'selected' : ''}>🔴 Đã hết hạn</option>
                    <option value="settled"  ${v('status') === 'settled' ? 'selected' : ''}>⚪ Đã thanh lý</option>
                </select>
            </div>

            <!-- {{Note}} -->
            <div style="grid-column:1/-1">
                <label ${labelStyle}>Ghi chú</label>
                <textarea id="f_note" rows="3" placeholder="Điều khoản đặc biệt, ghi chú thêm..." ${inputStyle}
                    style="resize:vertical;width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13.5px;outline:none;box-sizing:border-box;font-family:var(--font)"
                >${esc(v('note'))}</textarea>
            </div>
        </div>
        `;
}

async function submitContractForm(id) {
    const payload = {
        tenantId: document.getElementById('f_tenantId')?.dataset.id,
        roomId: document.getElementById('f_roomId')?.dataset.id,
        contractCode: document.getElementById('f_contractCode')?.value,
        startDate: document.getElementById('f_startDate')?.value,
        endDate: document.getElementById('f_endDate')?.value,
        monthlyRent: parseFloat(document.getElementById('f_monthlyRent')?.value || 0),
        deposit: parseFloat(document.getElementById('f_deposit')?.value || 0),
        status: document.getElementById('f_status')?.value,
        note: document.getElementById('f_note')?.value,
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
        fetchContracts(); // refresh list
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
function openModal() { document.getElementById('contractModal').classList.add('open'); }
function closeModal() { document.getElementById('contractModal').classList.remove('open'); }

// Close on overlay click
document.getElementById('contractModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});
document.getElementById('confirmOverlay').addEventListener('click', function (e) {
    if (e.target === this) closeConfirm();
});

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

