using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyNhaTro.Migrations
{
    /// <inheritdoc />
    public partial class InitialBaseline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CONFIG_GIA");

            migrationBuilder.DropTable(
                name: "DONDV");

            migrationBuilder.DropTable(
                name: "HDTHANG");

            migrationBuilder.DropTable(
                name: "HOPDONG");

            migrationBuilder.DropTable(
                name: "KHACH_THUE");

            migrationBuilder.DropTable(
                name: "PHONG_MANAGER");

            migrationBuilder.DropTable(
                name: "REFRESH_TOKEN");

            migrationBuilder.DropTable(
                name: "THONGBAO");

            migrationBuilder.DropTable(
                name: "THONGKE_DOANHTHU_THANG");

            migrationBuilder.DropTable(
                name: "THONGKE_TONG");

            migrationBuilder.DropTable(
                name: "DIENNUOC");

            migrationBuilder.DropTable(
                name: "ACCOUNT");

            migrationBuilder.DropTable(
                name: "PHONG");
        }
    }
}
