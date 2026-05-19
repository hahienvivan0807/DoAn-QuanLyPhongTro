    function showToast(title, message = '', type = 'info', duration = 3500) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const icons = {
            success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#639922" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" class="ring-svg"/><polyline points="9 12 11 14 15 10" class="check-path"/></svg>`,
            fail: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" class="ring-svg"/><line x1="9" y1="9" x2="15" y2="15" class="x-path"/><line x1="15" y1="9" x2="9" y2="15" class="x-path"/></svg>`,
            warn: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF9F27" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
            info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#378ADD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon-wrap">${icons[type] || icons.info}</div>
            <div class="toast-body">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-msg">${message}</div>` : ''}
            </div>
            <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
            <div class="toast-progress" style="animation-duration:${duration}ms;"></div>
        `;
        container.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('show'));
        });

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    // Alias legacy
    function hienThongBao(noiDung, loai = 'info') {
        const map = { 'thanh-cong': 'success', 'loi': 'fail', 'canh-bao': 'warn', 'info': 'info' };
        showToast(noiDung, '', map[loai] || 'info');
    }


    /* ============================================================
       MODAL HELPERS
    ============================================================ */

    function moModal(idModal) {
        const el = document.getElementById(idModal);
        if (!el) return;
        el.classList.add('hien');
        document.body.style.overflow = 'hidden';
    }

    function dongModal(idModal) {
        const el = document.getElementById(idModal);
        if (!el) return;
        el.classList.remove('hien');
        document.body.style.overflow = '';
    }

    function dongModalNhapNgoai(event, idModal) {
        if (event.target.id === idModal) dongModal(idModal);
    }


    /* ============================================================
       MODAL 1 – CẤU HÌNH GIÁ THUÊ
       #modal-cau-hinh-gia-v2
    ============================================================ */

    /** Mở modal và khởi tạo dữ liệu */
    function moModalCauHinhGia() {
        moModal('modal-cau-hinh-gia-v2');
        chgSwitch('dv');       // reset về tab dịch vụ
        chgTaiDanhSachDV();    // load danh sách dịch vụ từ API
        chgTaiDanhSachPhong(); // load danh sách phòng cho room-picker
    }

    /** Đóng modal cấu hình giá */
    function chgDong() { dongModal('modal-cau-hinh-gia-v2'); }

    /** Đóng khi click ra ngoài */
    function chgDongNgoai(event) {
        if (event.target.id === 'modal-cau-hinh-gia-v2') chgDong();
    }

    /** Chuyển tab: 'dv' | 'phong' */
    function chgSwitch(tab) {
        document.querySelectorAll('#modal-cau-hinh-gia-v2 .chg-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#modal-cau-hinh-gia-v2 .chg-panel').forEach(p => p.classList.remove('show'));

        document.getElementById(`chg-tab-${tab}`).classList.add('active');
        document.getElementById(`chg-panel-${tab}`).classList.add('show');

        const label = document.getElementById('chg-btn-label');
        if (label) {
            label.textContent = tab === 'dv' ? 'Lưu cấu hình dịch vụ' : 'Lưu thông tin phòng';
        }
    }

    /* ── Tab Dịch Vụ ── */

    /** Biến lưu ID dịch vụ đang sửa (null = thêm mới) */
    let _chgDvId = null;

    /**
     * Tải danh sách dịch vụ từ API.
     * ⚙️ BACKEND: GET /api/ConfigGia
     * Response: [{ id, maDV, tenDV, donGia, donViTinh }, ...]
     */
    async function chgTaiDanhSachDV() {
        const container = document.getElementById('chg-dv-list');
        if (!container) return;
        container.innerHTML = '<div class="chg-loading"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';

        try {
            const res = await fetch('/api/ConfigGia');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            chgRenderDanhSachDV(data);
        } catch (err) {
            console.error('[chgTaiDanhSachDV]', err);
            container.innerHTML = '<div class="chg-loading" style="color:#dc2626;"><i class="fas fa-exclamation-circle"></i> Không tải được dữ liệu. Kiểm tra kết nối API.</div>';
        }
    }

    /**
     * Render danh sách dịch vụ vào DOM.
     * @param {Array} data
     */
    function chgRenderDanhSachDV(data) {
        const container = document.getElementById('chg-dv-list');
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<div class="chg-loading">Chưa có dịch vụ nào. Hãy thêm dịch vụ đầu tiên.</div>';
            return;
        }

        const iconMap = { 'kWh': 'fa-bolt', 'm3': 'fa-tint', 'phong/thang': 'fa-wifi', 'xe/thang': 'fa-motorcycle', 'thang': 'fa-box' };

        container.innerHTML = data.map(dv => `
            <div class="dv-row" id="dv-row-${dv.id}">
                <div class="dv-icon">
                    <i class="fas ${iconMap[dv.donViTinh] || 'fa-cog'}"></i>
                </div>
                <div class="dv-info">
                    <div class="dv-ten">${dv.tenDV} <span style="font-size:10px;color:#6b7a99;font-weight:600;margin-left:4px;">[${dv.maDV}]</span></div>
                    <div class="dv-gia">${Number(dv.donGia).toLocaleString('vi-VN')} đ / ${dv.donViTinh}</div>
                </div>
                <div class="dv-actions">
                    <button class="dv-btn edit" onclick="chgSuaDV(${dv.id})" title="Sửa">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="dv-btn del" onclick="chgXoaDV(${dv.id}, '${dv.tenDV}')" title="Xoá">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /** Điền dữ liệu dịch vụ vào form để sửa */
    async function chgSuaDV(id) {
        try {
            // ⚙️ BACKEND: GET /api/ConfigGia/{id}
            const res = await fetch(`/api/ConfigGia/${id}`);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const dv = await res.json();

            document.getElementById('dv-ma').value = dv.maDV;
            document.getElementById('dv-ten').value = dv.tenDV;
            document.getElementById('dv-gia').value = dv.donGia;
            document.getElementById('dv-donvi').value = dv.donViTinh;
            _chgDvId = id;

            showToast('Đã tải dữ liệu', `Đang sửa dịch vụ: ${dv.tenDV}`, 'info');
            document.getElementById('dv-ma').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (err) {
            console.error('[chgSuaDV]', err);
            showToast('Lỗi', 'Không tải được dữ liệu dịch vụ.', 'fail');
        }
    }

    /**
     * Xoá dịch vụ.
     * ⚙️ BACKEND: DELETE /api/ConfigGia/{id}
     */
    async function chgXoaDV(id, tenDV) {
        if (!confirm(`Xoá dịch vụ "${tenDV}"? Hành động này không thể hoàn tác.`)) return;
        try {
            const res = await fetch(`/api/ConfigGia/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            showToast('Đã xoá', `Dịch vụ "${tenDV}" đã được xoá.`, 'success');
            await chgTaiDanhSachDV();
        } catch (err) {
            console.error('[chgXoaDV]', err);
            showToast('Lỗi', 'Không thể xoá dịch vụ này.', 'fail');
        }
    }

    /** Thêm dịch vụ mới (validate form trước) */
    function chgThemDichVu() {
        const ma = document.getElementById('dv-ma').value.trim();
        const ten = document.getElementById('dv-ten').value.trim();
        const gia = parseFloat(document.getElementById('dv-gia').value);
        const donvi = document.getElementById('dv-donvi').value;

        if (!ma) { showToast('Thiếu thông tin', 'Vui lòng nhập mã dịch vụ.', 'warn'); return; }
        if (!ten) { showToast('Thiếu thông tin', 'Vui lòng nhập tên dịch vụ.', 'warn'); return; }
        if (!gia || gia < 0) { showToast('Thiếu thông tin', 'Đơn giá không hợp lệ.', 'warn'); return; }
        if (!donvi) { showToast('Thiếu thông tin', 'Vui lòng chọn đơn vị tính.', 'warn'); return; }

        _chgDvSave({ maDV: ma, tenDV: ten, donGia: gia, donViTinh: donvi });
    }

    /**
     * Lưu dịch vụ (thêm mới hoặc cập nhật).
     * ⚙️ BACKEND:
     *   Thêm mới: POST /api/ConfigGia   body: { maDV, tenDV, donGia, donViTinh }
     *   Cập nhật: PUT  /api/ConfigGia/{id} body: { maDV, tenDV, donGia, donViTinh }
     */
    async function _chgDvSave(payload) {
        const isEdit = _chgDvId !== null;
        const url = isEdit ? `/api/ConfigGia/${_chgDvId}` : '/api/ConfigGia';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);

            showToast('Thành công', isEdit ? 'Đã cập nhật dịch vụ.' : 'Đã thêm dịch vụ mới.', 'success');
            _chgDvId = null;
            // Reset form
            ['dv-ma', 'dv-ten', 'dv-gia'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            document.getElementById('dv-donvi').value = '';
            await chgTaiDanhSachDV();
        } catch (err) {
            console.error('[_chgDvSave]', err);
            showToast('Lỗi', 'Không thể lưu dịch vụ. Kiểm tra kết nối API.', 'fail');
        }
    }

    /* ── Tab Phòng – Room Picker ── */

    let _chgPhongData = [];
    let _chgPhongFilter = 'all';
    let _chgPhongId = null;

    /**
     * Tải danh sách phòng cho room-picker.
     * ⚙️ BACKEND: GET /api/Phong
     * Response: [{ id, soPhong, tang, trangThai, dienTich, giaPhongFix, moTa }, ...]
     */
    async function chgTaiDanhSachPhong() {
        try {
            const res = await fetch('/api/Phong');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            _chgPhongData = await res.json();
            chgRenderRooms();
        } catch (err) {
            console.error('[chgTaiDanhSachPhong]', err);
        }
    }

    function toggleRoomChg() {
        const panel = document.getElementById('chgRoomPanel');
        const btn = document.getElementById('chgRoomBtn');
        const isOpen = panel.classList.toggle('open');
        btn.classList.toggle('open-state', isOpen);
    }

    function chgSetFilter(filter, el) {
        _chgPhongFilter = filter;
        document.querySelectorAll('#modal-cau-hinh-gia-v2 .rfc').forEach(b => b.classList.remove('ra'));
        el.classList.add('ra');
        chgRenderRooms();
    }

    function chgRenderRooms() {
        const list = document.getElementById('chgRpList');
        if (!list) return;
        const q = (document.getElementById('chg-rp-q')?.value || '').toLowerCase();
        const items = _chgPhongData.filter(p => {
            const matchFilter = _chgPhongFilter === 'all' || p.trangThai === _chgPhongFilter;
            const matchQ = !q || p.soPhong.toLowerCase().includes(q) || String(p.tang).includes(q);
            return matchFilter && matchQ;
        });

        if (items.length === 0) {
            list.innerHTML = '<div style="text-align:center;padding:20px;color:#6b7a99;font-size:12px;">Không tìm thấy phòng phù hợp</div>';
            return;
        }

        const badgeMap = { 'Trống': 'b-empty', 'Đã thuê': 'b-rented', 'Đang sửa': 'b-repair' };
        list.innerHTML = items.map(p => `
            <div class="rpc-row ${p.id === _chgPhongId ? 'sel' : ''}" onclick="chgChonPhong(${p.id})">
                <div>
                    <div class="rpc-num">Phòng ${p.soPhong}</div>
                    <div class="rpc-sub">Tầng ${p.tang} · ${p.dienTich}m²</div>
                </div>
                <span class="bdg ${badgeMap[p.trangThai] || ''}">${p.trangThai}</span>
            </div>
        `).join('');
    }

    /** Chọn phòng → điền vào form */
    function chgChonPhong(id) {
        const phong = _chgPhongData.find(p => p.id === id);
        if (!phong) return;

        _chgPhongId = id;

        // Cập nhật button text
        const btn = document.getElementById('chgRoomBtn');
        if (btn) { btn.textContent = `Phòng ${phong.soPhong} – Tầng ${phong.tang}`; btn.classList.add('picked'); }

        // Đóng panel
        document.getElementById('chgRoomPanel')?.classList.remove('open');
        btn?.classList.remove('open-state');

        // Điền form và unlock
        const fields = document.getElementById('chg-phong-fields');
        const hint = document.getElementById('chg-phong-hint');

        document.getElementById('phong-so').value = phong.soPhong;
        document.getElementById('phong-tang').value = phong.tang;
        document.getElementById('phong-trang-thai').value = phong.trangThai;
        document.getElementById('phong-dien-tich').value = phong.dienTich;
        document.getElementById('phong-gia-fix').value = phong.giaPhongFix || '';
        document.getElementById('phong-mo-ta').value = phong.moTa || '';

        // Enable all inputs
        fields.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
        fields.classList.remove('locked');
        fields.classList.add('unlocked');
        if (hint) hint.style.display = 'none';

        chgRenderRooms();
    }

    /**
     * Submit modal – lưu dịch vụ HOẶC phòng tuỳ tab đang active.
     */
    async function chgSubmit() {
        const tabDv = document.getElementById('chg-tab-dv');
        const isTabDV = tabDv && tabDv.classList.contains('active');

        if (isTabDV) {
            // Lưu dịch vụ
            chgThemDichVu();
        } else {
            // Lưu thông tin phòng
            if (!_chgPhongId) { showToast('Chưa chọn phòng', 'Vui lòng chọn phòng cần chỉnh sửa.', 'warn'); return; }
            const payload = {
                soPhong: document.getElementById('phong-so').value.trim(),
                tang: parseInt(document.getElementById('phong-tang').value),
                trangThai: document.getElementById('phong-trang-thai').value,
                dienTich: parseFloat(document.getElementById('phong-dien-tich').value),
                giaPhongFix: parseFloat(document.getElementById('phong-gia-fix').value) || null,
                moTa: document.getElementById('phong-mo-ta').value.trim(),
            };
            if (!payload.soPhong || isNaN(payload.tang) || isNaN(payload.dienTich)) {
                showToast('Thiếu thông tin', 'Vui lòng điền đủ các trường bắt buộc.', 'warn');
                return;
            }
            // ⚙️ BACKEND: PUT /api/Phong/{id}
            try {
                const res = await fetch(`/api/Phong/${_chgPhongId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                showToast('Đã lưu', `Phòng ${payload.soPhong} đã được cập nhật.`, 'success');
                // Reset
                _chgPhongId = null;
                document.getElementById('chgRoomBtn').textContent = 'Nhấn để chọn phòng cần chỉnh sửa...';
                document.getElementById('chgRoomBtn').classList.remove('picked');
                const fields = document.getElementById('chg-phong-fields');
                fields.querySelectorAll('input, select, textarea').forEach(el => { el.disabled = true; el.value = ''; });
                fields.classList.add('locked');
                fields.classList.remove('unlocked');
                document.getElementById('chg-phong-hint').style.display = '';
                await chgTaiDanhSachPhong();
            } catch (err) {
                console.error('[chgSubmit phong]', err);
                showToast('Lỗi', 'Không thể lưu thông tin phòng.', 'fail');
            }
        }
    }

    // Đóng room picker khi click ra ngoài
    document.addEventListener('click', function (e) {
        const wrap = document.getElementById('chgRoomWrap');
        if (wrap && !wrap.contains(e.target)) {
            document.getElementById('chgRoomPanel')?.classList.remove('open');
            document.getElementById('chgRoomBtn')?.classList.remove('open-state');
        }
    });


    /* ============================================================
       MODAL 2 – DỊCH VỤ THÔNG BÁO
       #modal-chi-phi-dich-vu
    ============================================================ */

    /**
     * Mở modal thông báo, load danh sách phòng và người thuê vào select.
     */
    async function moModalThongBao() {
        // Reset form
        document.getElementById('tb-tieu-de').value = '';
        document.getElementById('tb-noi-dung').value = '';
        document.getElementById('tb-loai-nguoi-nhan').value = 'all';
        tbChuyenLoaiNguoiNhan('all');
        tbCapNhatMucDo('thong-tin');
        document.getElementById('tb-muc-do').value = 'thong-tin';

        // Set ngày gửi = bây giờ
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const el = document.getElementById('tb-ngay-gui');
        if (el) el.value = now.toISOString().slice(0, 16);

        moModal('modal-chi-phi-dich-vu');
        await _tbLoadPhong();
        await _tbLoadNguoiThue();
    }

    /**
     * Load danh sách phòng vào select.
     * ⚙️ BACKEND: GET /api/Phong?trangThai=Đã thuê
     * Response: [{ id, soPhong }, ...]
     */
    async function _tbLoadPhong() {
        const sel = document.getElementById('tb-phong-id');
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Đang tải... --</option>';
        try {
            const res = await fetch('/api/Phong?trangThai=Đã thuê');
            if (!res.ok) throw new Error();
            const data = await res.json();
            sel.innerHTML = '<option value="">-- Chọn phòng --</option>' +
                data.map(p => `<option value="${p.id}">Phòng ${p.soPhong}</option>`).join('');
        } catch {
            sel.innerHTML = '<option value="">-- Lỗi tải phòng --</option>';
        }
    }

    /**
     * Load danh sách người thuê vào select.
     * ⚙️ BACKEND: GET /api/NguoiThue
     * Response: [{ id, hoTen }, ...]
     */
    async function _tbLoadNguoiThue() {
        const sel = document.getElementById('tb-user-id');
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Đang tải... --</option>';
        try {
            const res = await fetch('/api/NguoiThue');
            if (!res.ok) throw new Error();
            const data = await res.json();
            sel.innerHTML = '<option value="">-- Chọn người thuê --</option>' +
                data.map(u => `<option value="${u.id}">${u.hoTen}</option>`).join('');
        } catch {
            sel.innerHTML = '<option value="">-- Lỗi tải người thuê --</option>';
        }
    }

    /** Xử lý thay đổi loại người nhận */
    function tbChuyenLoaiNguoiNhan(loai) {
        const phongDiv = document.getElementById('tb-chon-phong');
        const nguoiDiv = document.getElementById('tb-chon-nguoi');
        const previewDiv = document.getElementById('tb-preview-nguoi-nhan');
        const previewTxt = document.getElementById('tb-preview-text');

        phongDiv.style.display = loai === 'phong' ? 'block' : 'none';
        nguoiDiv.style.display = loai === 'nguoi' ? 'block' : 'none';
        previewDiv.style.display = 'block';

        const map = {
            all: 'Sẽ gửi đến <strong>tất cả người thuê</strong> trong hệ thống.',
            phong: 'Sẽ gửi đến <strong>người thuê của phòng</strong> được chọn bên trên.',
            nguoi: 'Sẽ gửi đến <strong>người thuê cụ thể</strong> được chọn bên trên.',
        };
        if (previewTxt) previewTxt.innerHTML = map[loai] || '';
    }

    /** Cập nhật badge mức độ */
    function tbCapNhatMucDo(value) {
        const badge = document.getElementById('tb-badge-muc-do');
        if (!badge) return;
        badge.className = 'tb-badge';
        const map = {
            'thong-tin': { cls: 'muc-thong-tin', txt: '🔵 Thông tin thông thường' },
            'canh-bao': { cls: 'muc-canh-bao', txt: '🟡 Thông báo quan trọng' },
            'khan-cap': { cls: 'muc-khan-cap', txt: '🔴 Thông báo khẩn cấp' },
        };
        const cfg = map[value] || map['thong-tin'];
        badge.classList.add(cfg.cls);
        badge.textContent = cfg.txt;
    }

    /**
     * Gửi thông báo.
     * ⚙️ BACKEND: POST /api/ThongBao
     * Body: { tieuDe, noiDung, loaiNguoiNhan, phongId?, userId?, mucDo, ngayGui }
     */
    async function guiThongBao() {
        const tieuDe = document.getElementById('tb-tieu-de').value.trim();
        const noiDung = document.getElementById('tb-noi-dung').value.trim();
        const loai = document.getElementById('tb-loai-nguoi-nhan').value;
        const mucDo = document.getElementById('tb-muc-do').value;
        const ngayGui = document.getElementById('tb-ngay-gui').value;

        if (!tieuDe) { showToast('Thiếu thông tin', 'Vui lòng nhập tiêu đề thông báo.', 'warn'); return; }
        if (!noiDung) { showToast('Thiếu thông tin', 'Vui lòng nhập nội dung thông báo.', 'warn'); return; }
        if (!ngayGui) { showToast('Thiếu thông tin', 'Vui lòng chọn ngày gửi.', 'warn'); return; }

        const payload = { tieuDe, noiDung, loaiNguoiNhan: loai, mucDo, ngayGui };

        if (loai === 'phong') {
            const phongId = document.getElementById('tb-phong-id').value;
            if (!phongId) { showToast('Thiếu thông tin', 'Vui lòng chọn phòng nhận thông báo.', 'warn'); return; }
            payload.phongId = phongId;
        }
        if (loai === 'nguoi') {
            const userId = document.getElementById('tb-user-id').value;
            if (!userId) { showToast('Thiếu thông tin', 'Vui lòng chọn người thuê nhận thông báo.', 'warn'); return; }
            payload.userId = userId;
        }

        // Disable nút gửi
        const btn = document.getElementById('tb-btn-gui');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...'; }

        try {
            const res = await fetch('/api/ThongBao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);

            showToast('Gửi thành công', `Thông báo "${tieuDe}" đã được gửi.`, 'success');
            dongModal('modal-chi-phi-dich-vu');
        } catch (err) {
            console.error('[guiThongBao]', err);
            showToast('Lỗi gửi thông báo', 'Kiểm tra kết nối API và thử lại.', 'fail');
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi thông báo'; }
        }
    }


    /* ============================================================
       MODAL 3 – QUY ĐỊNH ĐẶT CỌC
       #modal-dat-coc
    ============================================================ */

    /** Xử lý chuyển loại đặt cọc (theo tháng / cố định) */
    function datCocChuyenLoai(value) {
        const nhomCoDinh = document.getElementById('nhom-so-tien-co-dinh');
        const nhomPreview = document.getElementById('nhom-preview-coc');
        const previewTxt = document.getElementById('dc-preview-text');

        if (value === 'co-dinh') {
            if (nhomCoDinh) nhomCoDinh.style.display = 'block';
            if (nhomPreview) nhomPreview.style.display = 'none';
        } else {
            if (nhomCoDinh) nhomCoDinh.style.display = 'none';
            if (nhomPreview) nhomPreview.style.display = 'block';
            if (previewTxt) previewTxt.textContent = `= ${value} tháng tiền thuê phòng`;
        }
    }

    /**
     * Lưu quy định đặt cọc.
     * ⚙️ BACKEND: POST /api/QuyDinhDatCoc
     * Body: {
     *   soThangDatCoc, soTienCoDinh?,
     *   thoiHanHoanCoc, baoTruocNgay,
     *   kauTruNoTien, kauTruHuHong, kauTruKhongBao, kauTruViPham,
     *   ghiChu
     * }
     */
    async function luuQuyDinhDatCoc() {
        const soThang = document.getElementById('so-thang-dat-coc').value;
        const thoiHan = document.getElementById('thoi-han-hoan-coc').value;
        const baoTruoc = parseInt(document.getElementById('bao-truoc-ngay').value);
        const ghiChu = document.getElementById('ghi-chu-dat-coc').value.trim();

        if (isNaN(baoTruoc) || baoTruoc < 7 || baoTruoc > 90) {
            showToast('Giá trị không hợp lệ', 'Số ngày báo trước phải từ 7 đến 90 ngày.', 'warn');
            return;
        }

        const payload = {
            soThangDatCoc: soThang,
            thoiHanHoanCoc: thoiHan,
            baoTruocNgay: baoTruoc,
            kauTruNoTien: document.getElementById('kt-no-tien')?.checked ?? false,
            kauTruHuHong: document.getElementById('kt-hu-hong')?.checked ?? false,
            kauTruKhongBao: document.getElementById('kt-khong-bao')?.checked ?? false,
            kauTruViPham: document.getElementById('kt-vi-pham')?.checked ?? false,
            ghiChu,
        };

        if (soThang === 'co-dinh') {
            const soTien = parseFloat(document.getElementById('so-tien-co-dinh-coc').value);
            if (!soTien || soTien <= 0) {
                showToast('Thiếu thông tin', 'Vui lòng nhập số tiền đặt cọc cố định.', 'warn');
                return;
            }
            payload.soTienCoDinh = soTien;
        }

        try {
            // ⚙️ BACKEND: POST /api/QuyDinhDatCoc
            const res = await fetch('/api/QuyDinhDatCoc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);

            showToast('Đã lưu', 'Quy định đặt cọc đã được cập nhật thành công.', 'success');
            dongModal('modal-dat-coc');
        } catch (err) {
            console.error('[luuQuyDinhDatCoc]', err);
            showToast('Lỗi lưu dữ liệu', 'Kiểm tra kết nối API và thử lại.', 'fail');
        }
    }


    /* ============================================================
       INIT – chạy khi DOM sẵn sàng
    ============================================================ */
    document.addEventListener('DOMContentLoaded', () => {

        // Thiết lập ngày gửi mặc định = ngay bây giờ
        const tbNgay = document.getElementById('tb-ngay-gui');
        if (tbNgay) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            tbNgay.value = now.toISOString().slice(0, 16);
        }

        // Preview mức cọc mặc định
        const soThang = document.getElementById('so-thang-dat-coc');
        if (soThang) datCocChuyenLoai(soThang.value);

        // Hiện preview người nhận mặc định
        const tbLoai = document.getElementById('tb-loai-nguoi-nhan');
        if (tbLoai) tbChuyenLoaiNguoiNhan(tbLoai.value);

        console.log('[modals.js] Đã khởi tạo 3 modal: Cấu hình giá, Thông báo, Đặt cọc.');
    });