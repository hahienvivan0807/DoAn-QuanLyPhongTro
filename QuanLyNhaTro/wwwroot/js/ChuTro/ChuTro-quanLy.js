async function ThemUser() {
    const Username = document.getElementById("username-moi").value;
    const Password = document.getElementById("password-moi").value;
    const Fullname = document.getElementById("fullname-moi").value;
    const Phone = document.getElementById("phone-moi").value;
    const Role = document.getElementById("role-moi").value;

    const dulieu = {
        Username: Username,
        Passwords: Password,
        FullName: Fullname,
        Phone: Phone,
        Roles: Role
    };
    try {
        let respone = await fetch('/api/ChuTro/tao-tai-khoan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dulieu)
        });
        let data = await respone.json();
        if (respone.ok) {
            taiDanhSachQuanLy();
            hienThongBao(data.message);
        } else {
            hienThongBao(data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
// ============================================================
//  DANH SÁCH QUẢN LÝ – render vào #danh-sach-quan-ly-container
// ============================================================

const GRADIENT_POOL = [
    'linear-gradient(135deg,#7c3aed,#a78bfa)',
    'linear-gradient(135deg,#b8720a,#e8971c)',
    'linear-gradient(135deg,#059669,#34d399)',
    'linear-gradient(135deg,#1a56db,#60a5fa)',
    'linear-gradient(135deg,#e11d48,#f87171)',
    'linear-gradient(135deg,#0891b2,#22d3ee)'
];

async function taiDanhSachQuanLy() {
    const container = document.getElementById('danh-sach-quan-ly-container');
    if (!container) return;

    // --- Loading skeleton ---
    container.innerHTML = `
    <div style="text-align:center;padding:24px 0;color:var(--mau-chu-phu);">
      <i class="fas fa-spinner fa-spin" style="font-size:20px;margin-bottom:8px;display:block;opacity:0.5;"></i>
      <span style="font-size:12px;">Đang tải...</span>
    </div>`;

    try {
        // Đổi URL nếu dùng Controller: '/api/admin/quan-ly'
        const res = await fetch('/api/ChuTro/danh-sach-quan-ly', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        renderDanhSachQuanLy(data, container);
    } catch (err) {
        container.innerHTML = `
      <div style="text-align:center;padding:20px;color:#dc2626;font-size:12px;">
        <i class="fas fa-exclamation-circle" style="display:block;font-size:22px;margin-bottom:6px;"></i>
        Không thể tải danh sách quản lý.
      </div>`;
        console.error('[QuanLy]', err);
    }
}

function renderDanhSachQuanLy(ds, container) {
    if (!ds || ds.length === 0) {
        container.innerHTML = `
      <div style="text-align:center;padding:24px;color:var(--mau-chu-phu);font-size:12px;">
        <i class="fas fa-user-slash" style="font-size:24px;opacity:0.35;display:block;margin-bottom:8px;"></i>
        Chưa có quản lý nào.
      </div>`;
        return;
    }

    container.innerHTML = ds.map((ql, idx) => {
        const bg = GRADIENT_POOL[idx % GRADIENT_POOL.length];
        const chu = (ql.fullName || ql.username || '?').trim().split(' ').pop()[0].toUpperCase();

        return `
      <div class="dong-quan-ly">
        <div class="anh-quan-ly" style="background:${bg};">${chu}</div>
        <div class="thong-tin-quan-ly">
          <div class="ten-quan-ly">${ql.fullName}</div>
          <div class="quyen-quan-ly">${ql.phone} · @${ql.username}</div>
        </div>
        <span class="the-quyen day-du">Quản lý</span>
        <div class="nhom-nut-quan-ly">
          <button class="nut-sua-ql" title="Chỉnh sửa" onclick="suaQuanLy(${ql.idUser})">
            <i class="fas fa-pen"></i>
          </button>
          <button class="nut-xoa-ql" title="Xóa" onclick="xoaQuanLy(${ql.idUser}, '${ql.fullName.replace(/'/g, "\\'")}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>`;
    }).join('');
}

// Stub – nối vào logic thực của bạn
function suaQuanLy(id) { console.log('Sửa quản lý ID:', id); }
function xoaQuanLy(id, ten) {
    if (confirm(`Xóa tài khoản quản lý "${ten}"?`)) {
        fetch(`?handler=XoaQuanLy&id=${id}`, { method: 'POST', headers: { 'RequestVerificationToken': document.querySelector('[name=__RequestVerificationToken]')?.value || '' } })
            .then(r => r.ok ? taiDanhSachQuanLy() : alert('Xóa thất bại'))
            .catch(() => alert('Lỗi kết nối'));
    }
}

// ---- Modal helper (dùng lại modal có sẵn) ----
async function moModalDanhSachQuanLy() {
    moModal('modal-danh-sach-quan-ly');

    const container = document.getElementById('ds-quan-ly-trong-modal');
    const soLuongEl = document.getElementById('so-luong-quan-ly');

    // Hiện loading
    container.innerHTML = `
        <div style="text-align:center;padding:32px;color:var(--mau-chu-phu);">
            <i class="fas fa-spinner fa-spin" style="font-size:24px;margin-bottom:8px;display:block;"></i>
            Đang tải danh sách...
        </div>`;

    try {
        const res = await fetch('/api/ChuTro/danh-sach-quan-ly', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        // Cập nhật số lượng
        if (soLuongEl) {
            soLuongEl.innerHTML = `Đang hiển thị <strong>${data.length}</strong> quản lý`;
        }

        // Render vào modal
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:24px;color:var(--mau-chu-phu);font-size:12px;">
                    <i class="fas fa-user-slash" style="font-size:24px;opacity:0.35;display:block;margin-bottom:8px;"></i>
                    Chưa có quản lý nào.
                </div>`;
            return;
        }

        container.innerHTML = data.map((ql, idx) => {
            const bg = GRADIENT_POOL[idx % GRADIENT_POOL.length];
            const chu = (ql.fullName || ql.username || '?').trim().split(' ').pop()[0].toUpperCase();
            return `
                <div class="dong-quan-ly">
                    <div class="anh-quan-ly" style="background:${bg};">${chu}</div>
                    <div class="thong-tin-quan-ly">
                        <div class="ten-quan-ly">${ql.fullName}</div>
                        <div class="quyen-quan-ly">${ql.phone} · @${ql.username}</div>
                    </div>
                    <span class="the-quyen day-du">Quản lý</span>
                    <div class="nhom-nut-quan-ly">
                        <button class="nut-sua-ql" title="Chỉnh sửa" onclick="suaQuanLy(${ql.idUser})">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="nut-xoa-ql" title="Xóa" onclick="xoaQuanLy(${ql.idUser}, '${ql.fullName.replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
        }).join('');

    } catch (err) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:#dc2626;font-size:12px;">
                <i class="fas fa-exclamation-circle" style="display:block;font-size:22px;margin-bottom:6px;"></i>
                Không thể tải danh sách quản lý.
            </div>`;
        console.error('[QuanLy Modal]', err);
    }
}

// ---- Tự động render khi trang load -----
document.addEventListener('DOMContentLoaded', taiDanhSachQuanLy);