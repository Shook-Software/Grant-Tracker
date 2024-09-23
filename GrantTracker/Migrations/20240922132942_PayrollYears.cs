using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class PayrollYears : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PayrollYear",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayrollYear", x => x.Guid);
                },
                comment: "Base table payroll years.");

            migrationBuilder.CreateTable(
                name: "PayrollPeriod",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PayrollYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Period = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "date", nullable: false),
                    EndDate = table.Column<DateTime>(type: "date", nullable: false),
                    AdjustmentDeadline = table.Column<DateTime>(type: "date", nullable: true),
                    PortalChangeStartDate = table.Column<DateTime>(type: "date", nullable: true),
                    PortalChangeEndDate = table.Column<DateTime>(type: "date", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayrollPeriod", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_PayrollPeriod_PayrollYear_PayrollYearGuid",
                        column: x => x.PayrollYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "PayrollYear",
                        principalColumn: "Guid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "A payroll period of two weeks that belongs to a single payroll year.");

            migrationBuilder.CreateTable(
                name: "PayrollYearGrantTrackerYearMap",
                schema: "GTkr",
                columns: table => new
                {
                    GrantTrackerYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PayrollYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayrollYearGrantTrackerYearMap", x => new { x.GrantTrackerYearGuid, x.PayrollYearGuid });
                    table.ForeignKey(
                        name: "FK_PayrollYearGrantTrackerYearMap_PayrollYear_PayrollYearGuid",
                        column: x => x.PayrollYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "PayrollYear",
                        principalColumn: "Guid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PayrollYearGrantTrackerYearMap_Year_GrantTrackerYearGuid",
                        column: x => x.GrantTrackerYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "Year",
                        principalColumn: "YearGuid",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "Maps payroll years to grant tracker years.");

            migrationBuilder.CreateIndex(
                name: "IX_PayrollPeriod_PayrollYearGuid",
                schema: "GTkr",
                table: "PayrollPeriod",
                column: "PayrollYearGuid");

            migrationBuilder.CreateIndex(
                name: "IX_PayrollYearGrantTrackerYearMap_PayrollYearGuid",
                schema: "GTkr",
                table: "PayrollYearGrantTrackerYearMap",
                column: "PayrollYearGuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PayrollPeriod",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "PayrollYearGrantTrackerYearMap",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "PayrollYear",
                schema: "GTkr");
        }
    }
}
