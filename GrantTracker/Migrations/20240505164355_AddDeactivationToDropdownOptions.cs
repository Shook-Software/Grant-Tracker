using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class AddDeactivationToDropdownOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FamilyAttendanceRecord_StudentAttendanceRecord_StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendanceRecord");

            migrationBuilder.DropIndex(
                name: "IX_FamilyAttendanceRecord_StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendanceRecord");

            migrationBuilder.DropColumn(
                name: "StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendanceRecord");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "SessionType",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "Partnership",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "OrganizationType",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "Objective",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "InstructorStatus",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "FundingSource",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "Activity",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "SessionType");

            migrationBuilder.DropColumn(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "Partnership");

            migrationBuilder.DropColumn(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "OrganizationType");

            migrationBuilder.DropColumn(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "Objective");

            migrationBuilder.DropColumn(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "InstructorStatus");

            migrationBuilder.DropColumn(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "FundingSource");

            migrationBuilder.DropColumn(
                name: "DeactivatedAt",
                schema: "GTkr",
                table: "Activity");

            migrationBuilder.AddColumn<Guid>(
                name: "StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendanceRecord",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FamilyAttendanceRecord_StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendanceRecord",
                column: "StudentAttendanceRecordGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_FamilyAttendanceRecord_StudentAttendanceRecord_StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendanceRecord",
                column: "StudentAttendanceRecordGuid",
                principalSchema: "GTkr",
                principalTable: "StudentAttendanceRecord",
                principalColumn: "Guid");
        }
    }
}
