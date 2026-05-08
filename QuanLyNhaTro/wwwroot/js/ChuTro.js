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
            
            hienThongBao(data.message);
        } else {
            hienThongBao(data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}