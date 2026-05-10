function hienThongBao(message) {

    const hopThongBao = document.getElementById("hop-thong-bao");
    const textThongBao = document.getElementById("text-thong-bao");

    textThongBao.innerText = message;

    hopThongBao.classList.add("hien");

    setTimeout(() => {
        hopThongBao.classList.remove("hien");
    }, 3000);
}
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
//Hàm gọi hiển thị danh sách quản lý trong database //

// =============================================
// DANH SÁCH & CHI TIẾT QUẢN LÝ
// =============================================

// Màu avatar xoay vòng
const dsMauAvatar = [
    'linear-gradient(135deg,#1a56db,#60a5fa)',
    'linear-gradient(135deg,#059669,#34d399)',
    'linear-gradient(135deg,#7c3aed,#a78bfa)',
    'linear-gradient(135deg,#c9810a,#f5a623)',
    'linear-gradient(135deg,#dc2626,#f87171)',
    'linear-gradient(135deg,#0891b2,#22d3ee)',
];

// Lưu danh sách gốc để lọc
let dsQuanLyGoc = [];

// Mở modal danh sách và gọi API
async function moModalDanhSachQuanLy() {
    moModal('modal-danh-sach-quan-ly');
    document.getElementById('input-tim-quan-ly').value = '';
    await taiDanhSachQuanLy();
}

// Gọi API lấy danh sách
async function taiDanhSachQuanLy() {
    try {
        const response = await fetch('/api/ChuTro/danh-sach-quan-ly');
        const data = await response.json();
        dsQuanLyGoc = data;
        renderDanhSachQuanLy(data);
        renderDanhSachTrenDashboard(data); // ← thêm dòng này
    } catch (err) {
        // giữ nguyên phần catch cũ
        document.getElementById('ds-quan-ly-trong-modal').innerHTML =
            `<div style="text-align:center;padding:32px;color:#dc2626;">
        <i class="fas fa-exclamation-circle" style="font-size:24px;margin-bottom:8px;display:block;"></i>
        Không thể tải dữ liệu. Vui lòng thử lại.
      </div>`;
    }
}

// Render danh sách quản lý ra HTML
function renderDanhSachQuanLy(danhSach) {
    const container = document.getElementById('ds-quan-ly-trong-modal');
    const soLuong = document.getElementById('so-luong-quan-ly');

    soLuong.textContent = `Tổng cộng: ${danhSach.length} quản lý`;

    if (!danhSach.length) {
        container.innerHTML =
            `<div style="text-align:center;padding:40px;color:var(--mau-chu-phu);">
        <i class="fas fa-user-slash" style="font-size:32px;margin-bottom:10px;display:block;opacity:0.35;"></i>
        Chưa có quản lý nào trong hệ thống.
      </div>`;
        return;
    }

    container.innerHTML = danhSach.map((ql, viTri) => {
        const kyTu = (ql.fullName || ql.username || '?').trim().charAt(0).toUpperCase();
        const mauNen = dsMauAvatar[viTri % dsMauAvatar.length];
        // Lấy chữ cái đầu mỗi từ trong họ tên (tối đa 2 chữ)
        const kyTuAvatar = (ql.fullName || '')
            .split(' ').filter(Boolean)
            .map(w => w[0].toUpperCase())
            .slice(-2).join('') || kyTu;

        return `
      <div onclick="xemChiTietQuanLy(${ql.iDUser})"
        style="display:flex;align-items:center;gap:12px;padding:12px 14px;
               background:var(--mau-trang);border:1px solid var(--mau-vien);
               border-radius:12px;cursor:pointer;transition:all 0.2s;
               position:relative;overflow:hidden;"
        onmouseover="this.style.borderColor='#7c3aed';this.style.background='#faf5ff';this.style.transform='translateX(3px)'"
        onmouseout="this.style.borderColor='var(--mau-vien)';this.style.background='var(--mau-trang)';this.style.transform='none'">

        <!-- Vệt màu trái -->
        <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:${mauNen};border-radius:12px 0 0 12px;"></div>

        <!-- Avatar -->
        <div style="width:42px;height:42px;border-radius:12px;background:${mauNen};
                    display:flex;align-items:center;justify-content:center;
                    color:#fff;font-size:14px;font-weight:800;flex-shrink:0;margin-left:6px;">
          ${kyTuAvatar}
        </div>

        <!-- Thông tin -->
        <div style="flex:1;min-width:0;">
          <div style="font-size:13.5px;font-weight:700;color:var(--mau-chu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${ql.fullName || 'Chưa cập nhật'}
          </div>
          <div style="font-size:11.5px;color:var(--mau-chu-phu);margin-top:2px;">
            @${ql.username} · ${ql.phone || 'Chưa có SĐT'}
          </div>
        </div>

        <!-- Badge vai trò -->
        <span style="background:#f5f3ff;color:#7c3aed;font-size:10px;font-weight:700;
                     padding:3px 10px;border-radius:20px;white-space:nowrap;flex-shrink:0;
                     border:1px solid rgba(124,58,237,0.2);">
          Quản lý
        </span>

        <!-- Mũi tên -->
        <i class="fas fa-chevron-right" style="color:var(--mau-chu-phu);font-size:11px;flex-shrink:0;"></i>
      </div>
    `;
    }).join('');
}

// Lọc danh sách theo từ khóa
function locDanhSachQuanLy(tuKhoa) {
    const tuKhoaLower = tuKhoa.toLowerCase().trim();
    if (!tuKhoaLower) {
        renderDanhSachQuanLy(dsQuanLyGoc);
        return;
    }
    const ketQua = dsQuanLyGoc.filter(ql =>
        (ql.fullName || '').toLowerCase().includes(tuKhoaLower) ||
        (ql.username || '').toLowerCase().includes(tuKhoaLower) ||
        (ql.phone || '').includes(tuKhoaLower)
    );
    renderDanhSachQuanLy(ketQua);
}

// Mở modal chi tiết 1 quản lý
function xemChiTietQuanLy(idUser) {
    const ql = dsQuanLyGoc.find(q => q.iDUser === idUser);
    if (!ql) return;

    const viTri = dsQuanLyGoc.indexOf(ql);
    const mauNen = dsMauAvatar[viTri % dsMauAvatar.length];
    const kyTuAvatar = (ql.fullName || '')
        .split(' ').filter(Boolean)
        .map(w => w[0].toUpperCase())
        .slice(-2).join('') || '?';

    // CCCD và NgaySinh gán cứng – sau này thêm cột DB vào thay
    const cccdGanCung = '079 301 234 567';
    const ngaySinhGanCung = '15/08/1995';

    document.getElementById('noi-dung-chi-tiet-quan-ly').innerHTML = `
    <!-- Header avatar -->
    <div style="display:flex;flex-direction:column;align-items:center;padding:20px 0 24px;
                background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:14px;margin-bottom:20px;">
      <div style="width:72px;height:72px;border-radius:20px;background:${mauNen};
                  display:flex;align-items:center;justify-content:center;
                  color:#fff;font-size:24px;font-weight:900;
                  box-shadow:0 8px 24px rgba(124,58,237,0.3);margin-bottom:12px;">
        ${kyTuAvatar}
      </div>
      <div style="font-size:16px;font-weight:800;color:var(--mau-chu);">${ql.fullName || 'Chưa cập nhật'}</div>
      <span style="background:#7c3aed;color:#fff;font-size:10px;font-weight:700;
                   padding:3px 12px;border-radius:20px;margin-top:6px;">
        <i class="fas fa-user-shield" style="margin-right:4px;"></i>Quản lý
      </span>
    </div>

    <!-- Thông tin chi tiết -->
    <div style="display:flex;flex-direction:column;gap:1px;background:var(--mau-vien);border-radius:12px;overflow:hidden;margin-bottom:20px;">

      <!-- Username -->
      <div style="display:flex;align-items:center;gap:12px;padding:13px 16px;background:var(--mau-trang);">
        <div style="width:34px;height:34px;border-radius:9px;background:#f5f3ff;
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fas fa-at" style="color:#7c3aed;font-size:13px;"></i>
        </div>
        <div>
          <div style="font-size:10.5px;color:var(--mau-chu-phu);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Username</div>
          <div style="font-size:13.5px;font-weight:700;color:var(--mau-chu);margin-top:2px;">@${ql.username}</div>
        </div>
      </div>

      <!-- Họ tên đầy đủ -->
      <div style="display:flex;align-items:center;gap:12px;padding:13px 16px;background:var(--mau-trang);">
        <div style="width:34px;height:34px;border-radius:9px;background:#f0fdf4;
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fas fa-user" style="color:#059669;font-size:13px;"></i>
        </div>
        <div>
          <div style="font-size:10.5px;color:var(--mau-chu-phu);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Họ và tên</div>
          <div style="font-size:13.5px;font-weight:700;color:var(--mau-chu);margin-top:2px;">${ql.fullName || 'Chưa cập nhật'}</div>
        </div>
      </div>

      <!-- Vai trò -->
      <div style="display:flex;align-items:center;gap:12px;padding:13px 16px;background:var(--mau-trang);">
        <div style="width:34px;height:34px;border-radius:9px;background:#fff8ee;
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fas fa-id-badge" style="color:#c9810a;font-size:13px;"></i>
        </div>
        <div>
          <div style="font-size:10.5px;color:var(--mau-chu-phu);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Vai trò</div>
          <div style="font-size:13.5px;font-weight:700;color:var(--mau-chu);margin-top:2px;">${ql.roles || 'QuanLy'}</div>
        </div>
      </div>

      <!-- SĐT -->
      <div style="display:flex;align-items:center;gap:12px;padding:13px 16px;background:var(--mau-trang);">
        <div style="width:34px;height:34px;border-radius:9px;background:#eff6ff;
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fas fa-phone" style="color:#1a56db;font-size:13px;"></i>
        </div>
        <div>
          <div style="font-size:10.5px;color:var(--mau-chu-phu);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Số điện thoại</div>
          <div style="font-size:13.5px;font-weight:700;color:var(--mau-chu);margin-top:2px;">${ql.phone || 'Chưa cập nhật'}</div>
        </div>
      </div>

      <!-- CCCD – gán cứng, thêm cột DB sau -->
      <div style="display:flex;align-items:center;gap:12px;padding:13px 16px;background:var(--mau-trang);">
        <div style="width:34px;height:34px;border-radius:9px;background:#fff1f2;
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fas fa-id-card" style="color:#e11d48;font-size:13px;"></i>
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:10.5px;color:var(--mau-chu-phu);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">CCCD / CMND</span>
            <span style="font-size:9px;background:#fef3c7;color:#d97706;padding:1px 6px;border-radius:20px;font-weight:700;">Sắp có</span>
          </div>
          <div style="font-size:13.5px;font-weight:700;color:#9ca3af;margin-top:2px;">${cccdGanCung}</div>
        </div>
      </div>

      <!-- Ngày sinh – gán cứng, thêm cột DB sau -->
      <div style="display:flex;align-items:center;gap:12px;padding:13px 16px;background:var(--mau-trang);">
        <div style="width:34px;height:34px;border-radius:9px;background:#ecfeff;
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fas fa-birthday-cake" style="color:#0891b2;font-size:13px;"></i>
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:10.5px;color:var(--mau-chu-phu);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Ngày sinh</span>
            <span style="font-size:9px;background:#fef3c7;color:#d97706;padding:1px 6px;border-radius:20px;font-weight:700;">Sắp có</span>
          </div>
          <div style="font-size:13.5px;font-weight:700;color:#9ca3af;margin-top:2px;">${ngaySinhGanCung}</div>
        </div>
      </div>

      <!-- Ngày tạo tài khoản -->
      <div style="display:flex;align-items:center;gap:12px;padding:13px 16px;background:var(--mau-trang);">
        <div style="width:34px;height:34px;border-radius:9px;background:var(--mau-nen);
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fas fa-calendar-alt" style="color:var(--mau-chu-phu);font-size:13px;"></i>
        </div>
        <div>
          <div style="font-size:10.5px;color:var(--mau-chu-phu);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Ngày tạo tài khoản</div>
          <div style="font-size:13.5px;font-weight:700;color:var(--mau-chu);margin-top:2px;">
            ${ql.createdAt ? new Date(ql.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}
          </div>
        </div>
      </div>

    </div>

    <!-- Nút hành động -->
    <div style="display:flex;gap:8px;">
      <button onclick="suaQuanLy(${ql.iDUser})"
        style="flex:1;background:var(--mau-chu-de-nhat);color:#92400e;border:1px solid rgba(201,129,10,0.3);
               border-radius:10px;padding:10px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;
               display:flex;align-items:center;justify-content:center;gap:7px;transition:all 0.2s;"
        onmouseover="this.style.background='#fde68a'" onmouseout="this.style.background='var(--mau-chu-de-nhat)'">
        <i class="fas fa-edit"></i> Chỉnh sửa
      </button>
      <button onclick="xacNhanXoaQuanLy(${ql.iDUser})"
        style="flex:1;background:#fee2e2;color:#991b1b;border:1px solid rgba(220,38,38,0.2);
               border-radius:10px;padding:10px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;
               display:flex;align-items:center;justify-content:center;gap:7px;transition:all 0.2s;"
        onmouseover="this.style.background='#fca5a5'" onmouseout="this.style.background='#fee2e2'">
        <i class="fas fa-trash"></i> Xóa tài khoản
      </button>
    </div>
  `;

    moModal('modal-chi-tiet-quan-ly');
}
function renderDanhSachTrenDashboard(danhSach) {
    const container = document.getElementById('danh-sach-quan-ly-container');
    if (!container) return;

    if (!danhSach || danhSach.length === 0) {
        container.innerHTML = '<p style="font-size:12px;color:var(--mau-chu-phu);padding:10px 0;">Chưa có quản lý nào.</p>';
        return;
    }

    container.innerHTML = danhSach.map((ql, viTri) => {
        const mauNen = dsMauAvatar[viTri % dsMauAvatar.length];
        const kyTuDau = (ql.fullName || '?').trim().split(' ').filter(Boolean)
            .map(w => w[0].toUpperCase()).slice(-2).join('');

        return `
            <div class="dong-quan-ly" onclick="moModalDanhSachQuanLy()" style="cursor:pointer;">
                <div class="anh-quan-ly" style="background:${mauNen};">${kyTuDau}</div>
                <div class="thong-tin-quan-ly">
                    <div class="ten-quan-ly">${ql.fullName}</div>
                    <div class="quyen-quan-ly">${ql.username} · ${ql.phone}</div>
                    <span class="the-quyen gioi-han">Quản lý</span>
                </div>
                <div class="nhom-nut-quan-ly">
                    <button class="nut-sua-ql" onclick="event.stopPropagation();suaQuanLy(${ql.iDUser})" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="nut-xoa-ql" onclick="event.stopPropagation();xacNhanXoaQuanLy(${ql.iDUser})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}
document.addEventListener('DOMContentLoaded', taiDanhSachQuanLy);
