using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace QuanLyNhaTro.Pages.KhachThue
{
    [Authorize(Roles = "Tenant")]
    public class KhachThueModel : PageModel
    {
        public void OnGet()
        {
        }
    }
}
