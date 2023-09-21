using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    public partial class CascadeAndSubstitute : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecord_Session_SessionGuid",
                schema: "GTkr",
                table: "AttendanceRecord");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorAttendanceRecord_AttendanceRecord_AttendanceRecordGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorAttendanceRecord_InstructorSchoolYear_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorRegistration_InstructorSchoolYear_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorRegistration");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorRegistration_Session_SessionGuid",
                schema: "GTkr",
                table: "InstructorRegistration");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorSchoolYear_OrganizationYear_OrganizationYearGuid",
                schema: "GTkr",
                table: "InstructorSchoolYear");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAttendanceRecord_AttendanceRecord_AttendanceRecordGuid",
                schema: "GTkr",
                table: "StudentAttendanceRecord");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAttendanceRecord_StudentSchoolYear_StudentSchoolYearGuid",
                schema: "GTkr",
                table: "StudentAttendanceRecord");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentRegistration_StudentSchoolYear_StudentSchoolYearGuid",
                schema: "GTkr",
                table: "StudentRegistration");

            migrationBuilder.AddColumn<bool>(
                name: "IsSubstitute",
                schema: "GTkr",
                table: "InstructorAttendanceRecord",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecord_Session_SessionGuid",
                schema: "GTkr",
                table: "AttendanceRecord",
                column: "SessionGuid",
                principalSchema: "GTkr",
                principalTable: "Session",
                principalColumn: "SessionGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorAttendanceRecord_AttendanceRecord_AttendanceRecordGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord",
                column: "AttendanceRecordGuid",
                principalSchema: "GTkr",
                principalTable: "AttendanceRecord",
                principalColumn: "Guid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorAttendanceRecord_InstructorSchoolYear_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord",
                column: "InstructorSchoolYearGuid",
                principalSchema: "GTkr",
                principalTable: "InstructorSchoolYear",
                principalColumn: "InstructorSchoolYearGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorRegistration_InstructorSchoolYear_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorRegistration",
                column: "InstructorSchoolYearGuid",
                principalSchema: "GTkr",
                principalTable: "InstructorSchoolYear",
                principalColumn: "InstructorSchoolYearGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorRegistration_Session_SessionGuid",
                schema: "GTkr",
                table: "InstructorRegistration",
                column: "SessionGuid",
                principalSchema: "GTkr",
                principalTable: "Session",
                principalColumn: "SessionGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorSchoolYear_OrganizationYear_OrganizationYearGuid",
                schema: "GTkr",
                table: "InstructorSchoolYear",
                column: "OrganizationYearGuid",
                principalSchema: "GTkr",
                principalTable: "OrganizationYear",
                principalColumn: "OrganizationYearGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAttendanceRecord_AttendanceRecord_AttendanceRecordGuid",
                schema: "GTkr",
                table: "StudentAttendanceRecord",
                column: "AttendanceRecordGuid",
                principalSchema: "GTkr",
                principalTable: "AttendanceRecord",
                principalColumn: "Guid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAttendanceRecord_StudentSchoolYear_StudentSchoolYearGuid",
                schema: "GTkr",
                table: "StudentAttendanceRecord",
                column: "StudentSchoolYearGuid",
                principalSchema: "GTkr",
                principalTable: "StudentSchoolYear",
                principalColumn: "StudentSchoolYearGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentRegistration_StudentSchoolYear_StudentSchoolYearGuid",
                schema: "GTkr",
                table: "StudentRegistration",
                column: "StudentSchoolYearGuid",
                principalSchema: "GTkr",
                principalTable: "StudentSchoolYear",
                principalColumn: "StudentSchoolYearGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecord_Session_SessionGuid",
                schema: "GTkr",
                table: "AttendanceRecord");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorAttendanceRecord_AttendanceRecord_AttendanceRecordGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorAttendanceRecord_InstructorSchoolYear_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorRegistration_InstructorSchoolYear_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorRegistration");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorRegistration_Session_SessionGuid",
                schema: "GTkr",
                table: "InstructorRegistration");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorSchoolYear_OrganizationYear_OrganizationYearGuid",
                schema: "GTkr",
                table: "InstructorSchoolYear");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAttendanceRecord_AttendanceRecord_AttendanceRecordGuid",
                schema: "GTkr",
                table: "StudentAttendanceRecord");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAttendanceRecord_StudentSchoolYear_StudentSchoolYearGuid",
                schema: "GTkr",
                table: "StudentAttendanceRecord");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentRegistration_StudentSchoolYear_StudentSchoolYearGuid",
                schema: "GTkr",
                table: "StudentRegistration");

            migrationBuilder.DropColumn(
                name: "IsSubstitute",
                schema: "GTkr",
                table: "InstructorAttendanceRecord");

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecord_Session_SessionGuid",
                schema: "GTkr",
                table: "AttendanceRecord",
                column: "SessionGuid",
                principalSchema: "GTkr",
                principalTable: "Session",
                principalColumn: "SessionGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorAttendanceRecord_AttendanceRecord_AttendanceRecordGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord",
                column: "AttendanceRecordGuid",
                principalSchema: "GTkr",
                principalTable: "AttendanceRecord",
                principalColumn: "Guid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorAttendanceRecord_InstructorSchoolYear_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord",
                column: "InstructorSchoolYearGuid",
                principalSchema: "GTkr",
                principalTable: "InstructorSchoolYear",
                principalColumn: "InstructorSchoolYearGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorRegistration_InstructorSchoolYear_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorRegistration",
                column: "InstructorSchoolYearGuid",
                principalSchema: "GTkr",
                principalTable: "InstructorSchoolYear",
                principalColumn: "InstructorSchoolYearGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorRegistration_Session_SessionGuid",
                schema: "GTkr",
                table: "InstructorRegistration",
                column: "SessionGuid",
                principalSchema: "GTkr",
                principalTable: "Session",
                principalColumn: "SessionGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorSchoolYear_OrganizationYear_OrganizationYearGuid",
                schema: "GTkr",
                table: "InstructorSchoolYear",
                column: "OrganizationYearGuid",
                principalSchema: "GTkr",
                principalTable: "OrganizationYear",
                principalColumn: "OrganizationYearGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAttendanceRecord_AttendanceRecord_AttendanceRecordGuid",
                schema: "GTkr",
                table: "StudentAttendanceRecord",
                column: "AttendanceRecordGuid",
                principalSchema: "GTkr",
                principalTable: "AttendanceRecord",
                principalColumn: "Guid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAttendanceRecord_StudentSchoolYear_StudentSchoolYearGuid",
                schema: "GTkr",
                table: "StudentAttendanceRecord",
                column: "StudentSchoolYearGuid",
                principalSchema: "GTkr",
                principalTable: "StudentSchoolYear",
                principalColumn: "StudentSchoolYearGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentRegistration_StudentSchoolYear_StudentSchoolYearGuid",
                schema: "GTkr",
                table: "StudentRegistration",
                column: "StudentSchoolYearGuid",
                principalSchema: "GTkr",
                principalTable: "StudentSchoolYear",
                principalColumn: "StudentSchoolYearGuid",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
