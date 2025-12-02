using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Appsilon.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailAndPasswordToEmployee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "employees",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "employees",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "employees");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "employees");
        }
    }
}
