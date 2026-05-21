using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace QuanLyNhaTro.Pages.Admin
{
    [Authorize(Roles = "Admin")]
    public class DichVuThongBaoModel : PageModel
    {
        public void OnGet()
        {
        }
    }
}
