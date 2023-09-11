using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    public partial class AttendanceUpdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FamilyAttendance_Person_FamilyMemberGuid",
                schema: "GTkr",
                table: "FamilyAttendance");

            migrationBuilder.DropForeignKey(
                name: "FK_FamilyAttendance_Session_SessionGuid",
                schema: "GTkr",
                table: "FamilyAttendance");

            migrationBuilder.DropTable(
                name: "InstructorAttendance",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "StudentAttendance",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "StudentFamily",
                schema: "GTkr");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FamilyAttendance",
                schema: "GTkr",
                table: "FamilyAttendance");

            migrationBuilder.DropIndex(
                name: "IX_FamilyAttendance_FamilyMemberGuid_SessionGuid_InstanceDate",
                schema: "GTkr",
                table: "FamilyAttendance");

            migrationBuilder.DropColumn(
                name: "AttendanceGuid",
                schema: "GTkr",
                table: "FamilyAttendance");

            migrationBuilder.DropColumn(
                name: "InstanceDate",
                schema: "GTkr",
                table: "FamilyAttendance");

            migrationBuilder.DropColumn(
                name: "MinutesAttended",
                schema: "GTkr",
                table: "FamilyAttendance");

            migrationBuilder.RenameColumn(
                name: "SessionGuid",
                schema: "GTkr",
                table: "FamilyAttendance",
                newName: "StudentAttendanceRecordGuid");

            migrationBuilder.RenameColumn(
                name: "FamilyMemberGuid",
                schema: "GTkr",
                table: "FamilyAttendance",
                newName: "Guid");

            migrationBuilder.RenameIndex(
                name: "IX_FamilyAttendance_SessionGuid",
                schema: "GTkr",
                table: "FamilyAttendance",
                newName: "IX_FamilyAttendance_StudentAttendanceRecordGuid");

            migrationBuilder.AlterTable(
                name: "FamilyAttendance",
                schema: "GTkr",
                comment: "Log for family attendance, tied to studentAttendanceRecords,",
                oldComment: "Audit log for family attendance, contains any change that updates family hours.");

            migrationBuilder.AddColumn<byte>(
                name: "FamilyMember",
                schema: "GTkr",
                table: "FamilyAttendance",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_FamilyAttendance",
                schema: "GTkr",
                table: "FamilyAttendance",
                column: "Guid");

            migrationBuilder.CreateTable(
                name: "AttendanceRecord",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstanceDate = table.Column<DateTime>(type: "date", nullable: false, comment: "Specific date that the session took place on. Only one record is allowed per diem.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceRecord", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_AttendanceRecord_Session_SessionGuid",
                        column: x => x.SessionGuid,
                        principalSchema: "GTkr",
                        principalTable: "Session",
                        principalColumn: "SessionGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Base record for attendance on a given date.");

            migrationBuilder.CreateTable(
                name: "InstructorAttendanceRecord",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstructorSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AttendanceRecordGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstructorAttendanceRecord", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_InstructorAttendanceRecord_AttendanceRecord_AttendanceRecordGuid",
                        column: x => x.AttendanceRecordGuid,
                        principalSchema: "GTkr",
                        principalTable: "AttendanceRecord",
                        principalColumn: "Guid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InstructorAttendanceRecord_InstructorSchoolYear_InstructorSchoolYearGuid",
                        column: x => x.InstructorSchoolYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "InstructorSchoolYear",
                        principalColumn: "InstructorSchoolYearGuid",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "Records for instructor attendance, stemming from a base attendance record for an instance date.");

            migrationBuilder.CreateTable(
                name: "StudentAttendanceRecord",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AttendanceRecordGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentAttendanceRecord", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_StudentAttendanceRecord_AttendanceRecord_AttendanceRecordGuid",
                        column: x => x.AttendanceRecordGuid,
                        principalSchema: "GTkr",
                        principalTable: "AttendanceRecord",
                        principalColumn: "Guid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentAttendanceRecord_StudentSchoolYear_StudentSchoolYearGuid",
                        column: x => x.StudentSchoolYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "StudentSchoolYear",
                        principalColumn: "StudentSchoolYearGuid",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "Records for student attendance, stemming from a base attendance record for an instance date. Only one can exist per base record.");

            migrationBuilder.CreateTable(
                name: "InstructorAttendanceTimeRecord",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstructorAttendanceRecordGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntryTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    ExitTime = table.Column<TimeSpan>(type: "time", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstructorAttendanceTimeRecord", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_InstructorAttendanceTimeRecord_InstructorAttendanceRecord_InstructorAttendanceRecordGuid",
                        column: x => x.InstructorAttendanceRecordGuid,
                        principalSchema: "GTkr",
                        principalTable: "InstructorAttendanceRecord",
                        principalColumn: "Guid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Records for instructor attendance, with the start and end times. Multiple can exist for a single day.");

            migrationBuilder.CreateTable(
                name: "StudentAttendanceTimeRecord",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentAttendanceRecordGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntryTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    ExitTime = table.Column<TimeSpan>(type: "time", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentAttendanceTimeRecord", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_StudentAttendanceTimeRecord_StudentAttendanceRecord_StudentAttendanceRecordGuid",
                        column: x => x.StudentAttendanceRecordGuid,
                        principalSchema: "GTkr",
                        principalTable: "StudentAttendanceRecord",
                        principalColumn: "Guid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Records for student attendance, with the start and end times. Multiple can exist for a single day.");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecord_SessionGuid_InstanceDate",
                schema: "GTkr",
                table: "AttendanceRecord",
                columns: new[] { "SessionGuid", "InstanceDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InstructorAttendanceRecord_AttendanceRecordGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord",
                column: "AttendanceRecordGuid");

            migrationBuilder.CreateIndex(
                name: "IX_InstructorAttendanceRecord_InstructorSchoolYearGuid_AttendanceRecordGuid",
                schema: "GTkr",
                table: "InstructorAttendanceRecord",
                columns: new[] { "InstructorSchoolYearGuid", "AttendanceRecordGuid" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InstructorAttendanceTimeRecord_InstructorAttendanceRecordGuid",
                schema: "GTkr",
                table: "InstructorAttendanceTimeRecord",
                column: "InstructorAttendanceRecordGuid");

            migrationBuilder.CreateIndex(
                name: "IX_StudentAttendanceRecord_AttendanceRecordGuid",
                schema: "GTkr",
                table: "StudentAttendanceRecord",
                column: "AttendanceRecordGuid");

            migrationBuilder.CreateIndex(
                name: "IX_StudentAttendanceRecord_StudentSchoolYearGuid_AttendanceRecordGuid",
                schema: "GTkr",
                table: "StudentAttendanceRecord",
                columns: new[] { "StudentSchoolYearGuid", "AttendanceRecordGuid" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentAttendanceTimeRecord_StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "StudentAttendanceTimeRecord",
                column: "StudentAttendanceRecordGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_FamilyAttendance_StudentAttendanceRecord_StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendance",
                column: "StudentAttendanceRecordGuid",
                principalSchema: "GTkr",
                principalTable: "StudentAttendanceRecord",
                principalColumn: "Guid",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FamilyAttendance_StudentAttendanceRecord_StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendance");

            migrationBuilder.DropTable(
                name: "InstructorAttendanceTimeRecord",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "StudentAttendanceTimeRecord",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "InstructorAttendanceRecord",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "StudentAttendanceRecord",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "AttendanceRecord",
                schema: "GTkr");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FamilyAttendance",
                schema: "GTkr",
                table: "FamilyAttendance");

            migrationBuilder.DropColumn(
                name: "FamilyMember",
                schema: "GTkr",
                table: "FamilyAttendance");

            migrationBuilder.RenameColumn(
                name: "StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendance",
                newName: "SessionGuid");

            migrationBuilder.RenameColumn(
                name: "Guid",
                schema: "GTkr",
                table: "FamilyAttendance",
                newName: "FamilyMemberGuid");

            migrationBuilder.RenameIndex(
                name: "IX_FamilyAttendance_StudentAttendanceRecordGuid",
                schema: "GTkr",
                table: "FamilyAttendance",
                newName: "IX_FamilyAttendance_SessionGuid");

            migrationBuilder.AlterTable(
                name: "FamilyAttendance",
                schema: "GTkr",
                comment: "Audit log for family attendance, contains any change that updates family hours.",
                oldComment: "Log for family attendance, tied to studentAttendanceRecords,");

            migrationBuilder.AddColumn<Guid>(
                name: "AttendanceGuid",
                schema: "GTkr",
                table: "FamilyAttendance",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "InstanceDate",
                schema: "GTkr",
                table: "FamilyAttendance",
                type: "date",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                comment: "Specific date that the session took place on.");

            migrationBuilder.AddColumn<short>(
                name: "MinutesAttended",
                schema: "GTkr",
                table: "FamilyAttendance",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0,
                comment: "Total number of minutes attended by a family member for the instance of a session.");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FamilyAttendance",
                schema: "GTkr",
                table: "FamilyAttendance",
                column: "AttendanceGuid");

            migrationBuilder.CreateTable(
                name: "InstructorAttendance",
                schema: "GTkr",
                columns: table => new
                {
                    InstructorAttendanceGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstructorSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstanceDate = table.Column<DateTime>(type: "date", nullable: false, comment: "Specific date that the session took place on."),
                    MinutesAttended = table.Column<short>(type: "smallint", nullable: false, comment: "Total number of minutes attended by an instructor for the instance of a session.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstructorAttendance", x => x.InstructorAttendanceGuid);
                    table.ForeignKey(
                        name: "FK_InstructorAttendance_InstructorSchoolYear_InstructorSchoolYearGuid",
                        column: x => x.InstructorSchoolYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "InstructorSchoolYear",
                        principalColumn: "InstructorSchoolYearGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InstructorAttendance_Session_SessionGuid",
                        column: x => x.SessionGuid,
                        principalSchema: "GTkr",
                        principalTable: "Session",
                        principalColumn: "SessionGuid",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "Audit log for instructor attendance, contains any change that updates instructor hours.");

            migrationBuilder.CreateTable(
                name: "StudentAttendance",
                schema: "GTkr",
                columns: table => new
                {
                    StudentAttendanceGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstanceDate = table.Column<DateTime>(type: "date", nullable: false, comment: "Specific date that the session took place on."),
                    MinutesAttended = table.Column<short>(type: "smallint", nullable: false, comment: "Total number of minutes attended by a student for the instance of a session.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentAttendance", x => x.StudentAttendanceGuid);
                    table.ForeignKey(
                        name: "FK_StudentAttendance_Session_SessionGuid",
                        column: x => x.SessionGuid,
                        principalSchema: "GTkr",
                        principalTable: "Session",
                        principalColumn: "SessionGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentAttendance_StudentSchoolYear_StudentSchoolYearGuid",
                        column: x => x.StudentSchoolYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "StudentSchoolYear",
                        principalColumn: "StudentSchoolYearGuid",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "Audit log for student attendance, contains any change that updates student hours.");

            migrationBuilder.CreateTable(
                name: "StudentFamily",
                schema: "GTkr",
                columns: table => new
                {
                    StudentGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FamilyMemberGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Relation = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, comment: "A short textual descriptor of how a student and family member are related. Father, Mother, brother, cousin, etc.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentFamily", x => new { x.StudentGuid, x.FamilyMemberGuid });
                    table.ForeignKey(
                        name: "FK_StudentFamily_Person_FamilyMemberGuid",
                        column: x => x.FamilyMemberGuid,
                        principalSchema: "GTkr",
                        principalTable: "Person",
                        principalColumn: "PersonGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentFamily_Person_StudentGuid",
                        column: x => x.StudentGuid,
                        principalSchema: "GTkr",
                        principalTable: "Person",
                        principalColumn: "PersonGuid",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "A many to many table that relates students and family members.");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyAttendance_FamilyMemberGuid_SessionGuid_InstanceDate",
                schema: "GTkr",
                table: "FamilyAttendance",
                columns: new[] { "FamilyMemberGuid", "SessionGuid", "InstanceDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InstructorAttendance_InstructorSchoolYearGuid_SessionGuid_InstanceDate",
                schema: "GTkr",
                table: "InstructorAttendance",
                columns: new[] { "InstructorSchoolYearGuid", "SessionGuid", "InstanceDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InstructorAttendance_SessionGuid",
                schema: "GTkr",
                table: "InstructorAttendance",
                column: "SessionGuid");

            migrationBuilder.CreateIndex(
                name: "IX_StudentAttendance_SessionGuid",
                schema: "GTkr",
                table: "StudentAttendance",
                column: "SessionGuid");

            migrationBuilder.CreateIndex(
                name: "IX_StudentAttendance_StudentSchoolYearGuid_SessionGuid_InstanceDate",
                schema: "GTkr",
                table: "StudentAttendance",
                columns: new[] { "StudentSchoolYearGuid", "SessionGuid", "InstanceDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentFamily_FamilyMemberGuid",
                schema: "GTkr",
                table: "StudentFamily",
                column: "FamilyMemberGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_FamilyAttendance_Person_FamilyMemberGuid",
                schema: "GTkr",
                table: "FamilyAttendance",
                column: "FamilyMemberGuid",
                principalSchema: "GTkr",
                principalTable: "Person",
                principalColumn: "PersonGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FamilyAttendance_Session_SessionGuid",
                schema: "GTkr",
                table: "FamilyAttendance",
                column: "SessionGuid",
                principalSchema: "GTkr",
                principalTable: "Session",
                principalColumn: "SessionGuid",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
