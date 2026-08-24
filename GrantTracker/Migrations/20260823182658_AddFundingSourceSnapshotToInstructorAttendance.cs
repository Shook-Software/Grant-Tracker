using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class AddFundingSourceSnapshotToInstructorAttendance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FundingSourceGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord",
                type: "uniqueidentifier",
                nullable: true,
                comment: "Snapshot of the instructor's registration funding source at the time attendance was taken, so session edits do not retroactively alter attendance records.");

            migrationBuilder.CreateIndex(
                name: "IX_InstructorAttendanceRecord_FundingSourceGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord",
                column: "FundingSourceGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorAttendanceRecord_FundingSource_FundingSourceGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord",
                column: "FundingSourceGuid",
                principalSchema: "GTkr",
                principalTable: "FundingSource",
                principalColumn: "FundingGuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InstructorAttendanceRecord_FundingSource_FundingSourceGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord");

            migrationBuilder.DropIndex(
                name: "IX_InstructorAttendanceRecord_FundingSourceGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord");

            migrationBuilder.DropColumn(
                name: "FundingSourceGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord");
        }
    }
}
