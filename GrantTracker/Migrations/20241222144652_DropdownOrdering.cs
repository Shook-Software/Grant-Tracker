using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class DropdownOrdering : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<short>(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "SessionType",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0);

            migrationBuilder.AddColumn<short>(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "Partnership",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0);

            migrationBuilder.AddColumn<short>(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "OrganizationType",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0);

            migrationBuilder.AddColumn<DateTime>(
                name: "Created",
                schema: "GTkr",
                table: "OrganizationAttendanceGoal",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "Updated",
                schema: "GTkr",
                table: "OrganizationAttendanceGoal",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<short>(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "Objective",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0);

            migrationBuilder.AddColumn<short>(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "InstructorStatus",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0);

            migrationBuilder.AddColumn<short>(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "FundingSource",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0);

            migrationBuilder.AddColumn<short>(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "Activity",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "SessionType");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "Partnership");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "OrganizationType");

            migrationBuilder.DropColumn(
                name: "Created",
                schema: "GTkr",
                table: "OrganizationAttendanceGoal");

            migrationBuilder.DropColumn(
                name: "Updated",
                schema: "GTkr",
                table: "OrganizationAttendanceGoal");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "Objective");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "InstructorStatus");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "FundingSource");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                schema: "GTkr",
                table: "Activity");
        }
    }
}
