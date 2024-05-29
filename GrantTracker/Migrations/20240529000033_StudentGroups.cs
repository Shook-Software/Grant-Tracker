using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class StudentGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExceptionLog",
                schema: "GTkr");

            migrationBuilder.DropIndex(
                name: "IX_Organization_Name",
                schema: "GTkr",
                table: "Organization");

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

            migrationBuilder.CreateTable(
                name: "StudentGroup",
                schema: "GTkr",
                columns: table => new
                {
                    GroupGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrganizationYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentGroup", x => x.GroupGuid);
                    table.ForeignKey(
                        name: "FK_StudentGroup_OrganizationYear_OrganizationYearGuid",
                        column: x => x.OrganizationYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "OrganizationYear",
                        principalColumn: "OrganizationYearGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Groupings of students to attach to instructors or extended for use elsewhere.");

            migrationBuilder.CreateTable(
                name: "InstructorSchoolYearStudentGroupMap",
                schema: "GTkr",
                columns: table => new
                {
                    InstructorSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentGroupGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstructorSchoolYearStudentGroupMap", x => new { x.InstructorSchoolYearGuid, x.StudentGroupGuid });
                    table.ForeignKey(
                        name: "FK_InstructorSchoolYearStudentGroupMap_InstructorSchoolYear_InstructorSchoolYearGuid",
                        column: x => x.InstructorSchoolYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "InstructorSchoolYear",
                        principalColumn: "InstructorSchoolYearGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InstructorSchoolYearStudentGroupMap_StudentGroup_StudentGroupGuid",
                        column: x => x.StudentGroupGuid,
                        principalSchema: "GTkr",
                        principalTable: "StudentGroup",
                        principalColumn: "GroupGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Maps student groups to an instructor school year.");

            migrationBuilder.CreateTable(
                name: "StudentGroupItem",
                schema: "GTkr",
                columns: table => new
                {
                    GroupGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentGroupItem", x => new { x.GroupGuid, x.StudentSchoolYearGuid });
                    table.ForeignKey(
                        name: "FK_StudentGroupItem_StudentGroup_GroupGuid",
                        column: x => x.GroupGuid,
                        principalSchema: "GTkr",
                        principalTable: "StudentGroup",
                        principalColumn: "GroupGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentGroupItem_StudentSchoolYear_StudentSchoolYearGuid",
                        column: x => x.StudentSchoolYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "StudentSchoolYear",
                        principalColumn: "StudentSchoolYearGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Represents a single student school year belonging to a grouping of students.");

            migrationBuilder.CreateIndex(
                name: "IX_Organization_Name",
                schema: "GTkr",
                table: "Organization",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InstructorSchoolYearStudentGroupMap_StudentGroupGuid",
                schema: "GTkr",
                table: "InstructorSchoolYearStudentGroupMap",
                column: "StudentGroupGuid");

            migrationBuilder.CreateIndex(
                name: "IX_StudentGroup_OrganizationYearGuid",
                schema: "GTkr",
                table: "StudentGroup",
                column: "OrganizationYearGuid");

            migrationBuilder.CreateIndex(
                name: "IX_StudentGroupItem_StudentSchoolYearGuid",
                schema: "GTkr",
                table: "StudentGroupItem",
                column: "StudentSchoolYearGuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InstructorSchoolYearStudentGroupMap",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "StudentGroupItem",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "StudentGroup",
                schema: "GTkr");

            migrationBuilder.DropIndex(
                name: "IX_Organization_Name",
                schema: "GTkr",
                table: "Organization");

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
                name: "ExceptionLog",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstructorSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InnerMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StackTrace = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TargetSite = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExceptionLog", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_ExceptionLog_InstructorSchoolYear_InstructorSchoolYearGuid",
                        column: x => x.InstructorSchoolYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "InstructorSchoolYear",
                        principalColumn: "InstructorSchoolYearGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Log to view exceptions in production. The next programmer may have access to the production site and database, but I do not.");

            migrationBuilder.CreateIndex(
                name: "IX_Organization_Name",
                schema: "GTkr",
                table: "Organization",
                column: "Name",
                unique: true,
                filter: "[Name] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ExceptionLog_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "ExceptionLog",
                column: "InstructorSchoolYearGuid");
        }
    }
}
