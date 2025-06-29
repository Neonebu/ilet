using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ilet.server.Migrations
{
    /// <inheritdoc />
    public partial class AddIsWorldVisibleColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "isworldvisible",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isworldvisible",
                table: "users");
        }
    }
}
