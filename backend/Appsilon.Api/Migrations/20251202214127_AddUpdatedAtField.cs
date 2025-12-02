using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Appsilon.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUpdatedAtField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "employees",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "employees");
        }
    }
}
