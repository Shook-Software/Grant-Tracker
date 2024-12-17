using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class AttendanceGoals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrganizationAttendanceGoal",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    OrganizationGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartDate = table.Column<DateTime>(type: "date", nullable: false),
                    EndDate = table.Column<DateTime>(type: "date", nullable: false),
                    RegularAttendeeCountThreshold = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationAttendanceGoal", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_OrganizationAttendanceGoal_Organization_OrganizationGuid",
                        column: x => x.OrganizationGuid,
                        principalSchema: "GTkr",
                        principalTable: "Organization",
                        principalColumn: "OrganizationGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Attendance goals for the given date range.");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationAttendanceGoal_OrganizationGuid",
                schema: "GTkr",
                table: "OrganizationAttendanceGoal",
                column: "OrganizationGuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrganizationAttendanceGoal",
                schema: "GTkr");
        }
    }
}
