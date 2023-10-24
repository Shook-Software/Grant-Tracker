using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class BlackoutDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrganizationBlackoutDate",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationBlackoutDate", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_OrganizationBlackoutDate_Organization_OrganizationGuid",
                        column: x => x.OrganizationGuid,
                        principalSchema: "GTkr",
                        principalTable: "Organization",
                        principalColumn: "OrganizationGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "A date where no attendance is expected to be entered, removing it from attendance lists, attendance check report, and possibly other functionalities.");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationBlackoutDate_OrganizationGuid_Date",
                schema: "GTkr",
                table: "OrganizationBlackoutDate",
                columns: new[] { "OrganizationGuid", "Date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrganizationBlackoutDate",
                schema: "GTkr");
        }
    }
}
