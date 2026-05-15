using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyNhaTro.Migrations
{
    /// <inheritdoc />
    public partial class Add_DuocCongVaoTro_Column : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "TienNoDV",
                table: "HDTHANG",
                type: "decimal(15,2)",
                nullable: true,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(15,2)",
                oldDefaultValue: 0m);

            migrationBuilder.AlterColumn<decimal>(
                name: "TienDV",
                table: "HDTHANG",
                type: "decimal(15,2)",
                nullable: true,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(15,2)",
                oldDefaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "DuocCongVaoTro",
                table: "HDTHANG",
                type: "bit",
                nullable: true,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DaCoNhacNo",
                table: "HDTHANG",
                type: "bit",
                nullable: true,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "TienNoDV",
                table: "HDTHANG",
                type: "decimal(15,2)",
                nullable: false,
                defaultValue: 0m, 
                oldClrType: typeof(decimal),
                oldType: "decimal(15,2)",
                oldNullable: true,
                oldDefaultValue: 0m);

            migrationBuilder.AlterColumn<decimal>(
                name: "TienDV",
                table: "HDTHANG",
                type: "decimal(15,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(15,2)",
                oldNullable: true,
                oldDefaultValue: 0m);

            migrationBuilder.DropColumn(
                name: "DuocCongVaoTro",
                table: "HDTHANG");

            migrationBuilder.DropColumn(
                name: "DaCoNhacNo",
                table: "HDTHANG");
        }
    }
}
