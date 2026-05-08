using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
namespace QuanLyNhaTro.Models
{
    public class ACCOUNT
    {
        [Key] public string IDUser { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Roles { get; set; }
        public string QR_Link { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
