using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace QuanLyNhaTro.Pages.Admin
{
    [Authorize(Roles = "Admin")]
    public class QuanLyNguoiThueModel : PageModel
    {
        public void OnGet()
        {
        }
    }
}
