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
        public string Passwords { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Roles { get; set; }
        public string QR_Link { get; set; }
        public DateTime CreatedAt { get; set; }

    }
    public class QuanLyKhuNhaTro : DbContext
    {
        public QuanLyKhuNhaTro(DbContextOptions<QuanLyKhuNhaTro> options) : base(options) { }
        public DbSet <ACCOUNT> ACCOUNT { get; set; }
    }
}
