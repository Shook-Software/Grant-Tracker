using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class FamilyAttendanceRework : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FamilyAttendance",
                schema: "GTkr");

            migrationBuilder.CreateTable(
                name: "FamilyAttendanceRecord",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AttendanceRecordGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FamilyMember = table.Column<byte>(type: "tinyint", nullable: false),
                    StudentAttendanceRecordGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyAttendanceRecord", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_FamilyAttendanceRecord_AttendanceRecord_AttendanceRecordGuid",
                        column: x => x.AttendanceRecordGuid,
                        principalSchema: "GTkr",
                        principalTable: "AttendanceRecord",
                        principalColumn: "Guid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyAttendanceRecord_StudentAttendanceRecord_StudentAttendanceRecordGuid",
                        column: x => x.StudentAttendanceRecordGuid,
                        principalSchema: "GTkr",
                        principalTable: "StudentAttendanceRecord",
                        principalColumn: "Guid");
                    table.ForeignKey(
                        name: "FK_FamilyAttendanceRecord_StudentSchoolYear_StudentSchoolYearGuid",
                        column: x => x.StudentSchoolYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "StudentSchoolYear",
                        principalColumn: "StudentSchoolYearGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Log for family attendance, tied to the base attendance record and a student school year.");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyAttendanceRecord_AttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendanceRecord",
                column: "AttendanceRecordGuid");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyAttendanceRecord_StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendanceRecord",
                column: "StudentAttendanceRecordGuid");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyAttendanceRecord_StudentSchoolYearGuid",
                schema: "GTkr",
                table: "FamilyAttendanceRecord",
                column: "StudentSchoolYearGuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FamilyAttendanceRecord",
                schema: "GTkr");

            migrationBuilder.CreateTable(
                name: "FamilyAttendance",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentAttendanceRecordGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FamilyMember = table.Column<byte>(type: "tinyint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyAttendance", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_FamilyAttendance_StudentAttendanceRecord_StudentAttendanceRecordGuid",
                        column: x => x.StudentAttendanceRecordGuid,
                        principalSchema: "GTkr",
                        principalTable: "StudentAttendanceRecord",
                        principalColumn: "Guid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Log for family attendance, tied to studentAttendanceRecords,");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyAttendance_StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendance",
                column: "StudentAttendanceRecordGuid");
        }
    }
}
