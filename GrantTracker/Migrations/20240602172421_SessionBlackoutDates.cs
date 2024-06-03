using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class SessionBlackoutDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InstructorSchoolYearStudentGroupMap_InstructorSchoolYear_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorSchoolYearStudentGroupMap");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorSchoolYearStudentGroupMap_StudentGroup_StudentGroupGuid",
                schema: "GTkr",
                table: "InstructorSchoolYearStudentGroupMap");

            migrationBuilder.DropIndex(
                name: "IX_Organization_Name",
                schema: "GTkr",
                table: "Organization");

            migrationBuilder.AlterColumn<string>(
                name: "DisplayName",
                schema: "GTkr",
                table: "StudentGroup",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "GTkr",
                table: "Organization",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.CreateTable(
                name: "SessionBlackoutDates",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionBlackoutDates", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_SessionBlackoutDates_Session_SessionGuid",
                        column: x => x.SessionGuid,
                        principalSchema: "GTkr",
                        principalTable: "Session",
                        principalColumn: "SessionGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "A date where no attendance is expected to be entered, removing it from attendance lists, attendance check report, and possibly other functionalities.");

            migrationBuilder.CreateIndex(
                name: "IX_Organization_Name",
                schema: "GTkr",
                table: "Organization",
                column: "Name",
                unique: true,
                filter: "[Name] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_SessionBlackoutDates_SessionGuid_Date",
                schema: "GTkr",
                table: "SessionBlackoutDates",
                columns: new[] { "SessionGuid", "Date" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorSchoolYearStudentGroupMap_InstructorSchoolYear_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorSchoolYearStudentGroupMap",
                column: "InstructorSchoolYearGuid",
                principalSchema: "GTkr",
                principalTable: "InstructorSchoolYear",
                principalColumn: "InstructorSchoolYearGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorSchoolYearStudentGroupMap_StudentGroup_StudentGroupGuid",
                schema: "GTkr",
                table: "InstructorSchoolYearStudentGroupMap",
                column: "StudentGroupGuid",
                principalSchema: "GTkr",
                principalTable: "StudentGroup",
                principalColumn: "GroupGuid",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InstructorSchoolYearStudentGroupMap_InstructorSchoolYear_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorSchoolYearStudentGroupMap");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorSchoolYearStudentGroupMap_StudentGroup_StudentGroupGuid",
                schema: "GTkr",
                table: "InstructorSchoolYearStudentGroupMap");

            migrationBuilder.DropTable(
                name: "SessionBlackoutDates",
                schema: "GTkr");

            migrationBuilder.DropIndex(
                name: "IX_Organization_Name",
                schema: "GTkr",
                table: "Organization");

            migrationBuilder.AlterColumn<string>(
                name: "DisplayName",
                schema: "GTkr",
                table: "StudentGroup",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "GTkr",
                table: "Organization",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Organization_Name",
                schema: "GTkr",
                table: "Organization",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorSchoolYearStudentGroupMap_InstructorSchoolYear_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorSchoolYearStudentGroupMap",
                column: "InstructorSchoolYearGuid",
                principalSchema: "GTkr",
                principalTable: "InstructorSchoolYear",
                principalColumn: "InstructorSchoolYearGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorSchoolYearStudentGroupMap_StudentGroup_StudentGroupGuid",
                schema: "GTkr",
                table: "InstructorSchoolYearStudentGroupMap",
                column: "StudentGroupGuid",
                principalSchema: "GTkr",
                principalTable: "StudentGroup",
                principalColumn: "GroupGuid",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
