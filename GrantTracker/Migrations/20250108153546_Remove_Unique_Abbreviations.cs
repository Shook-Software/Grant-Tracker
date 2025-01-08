using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class Remove_Unique_Abbreviations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SessionType_Abbreviation",
                schema: "GTkr",
                table: "SessionType");

            migrationBuilder.DropIndex(
                name: "IX_SessionType_DisplayOrder",
                schema: "GTkr",
                table: "SessionType");

            migrationBuilder.DropIndex(
                name: "IX_Partnership_DisplayOrder",
                schema: "GTkr",
                table: "Partnership");

            migrationBuilder.DropIndex(
                name: "IX_OrganizationType_DisplayOrder",
                schema: "GTkr",
                table: "OrganizationType");

            migrationBuilder.DropIndex(
                name: "IX_Objective_DisplayOrder",
                schema: "GTkr",
                table: "Objective");

            migrationBuilder.DropIndex(
                name: "IX_InstructorStatus_Abbreviation",
                schema: "GTkr",
                table: "InstructorStatus");

            migrationBuilder.DropIndex(
                name: "IX_InstructorStatus_DisplayOrder",
                schema: "GTkr",
                table: "InstructorStatus");

            migrationBuilder.DropIndex(
                name: "IX_FundingSource_DisplayOrder",
                schema: "GTkr",
                table: "FundingSource");

            migrationBuilder.DropIndex(
                name: "IX_Activity_Abbreviation",
                schema: "GTkr",
                table: "Activity");

            migrationBuilder.DropIndex(
                name: "IX_Activity_DisplayOrder",
                schema: "GTkr",
                table: "Activity");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_SessionType_Abbreviation",
                schema: "GTkr",
                table: "SessionType",
                column: "Abbreviation",
                unique: true,
                filter: "[Abbreviation] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_SessionType_DisplayOrder",
                schema: "GTkr",
                table: "SessionType",
                column: "DisplayOrder",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Partnership_DisplayOrder",
                schema: "GTkr",
                table: "Partnership",
                column: "DisplayOrder",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationType_DisplayOrder",
                schema: "GTkr",
                table: "OrganizationType",
                column: "DisplayOrder",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Objective_DisplayOrder",
                schema: "GTkr",
                table: "Objective",
                column: "DisplayOrder",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InstructorStatus_Abbreviation",
                schema: "GTkr",
                table: "InstructorStatus",
                column: "Abbreviation",
                unique: true,
                filter: "[Abbreviation] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_InstructorStatus_DisplayOrder",
                schema: "GTkr",
                table: "InstructorStatus",
                column: "DisplayOrder",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FundingSource_DisplayOrder",
                schema: "GTkr",
                table: "FundingSource",
                column: "DisplayOrder",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Activity_Abbreviation",
                schema: "GTkr",
                table: "Activity",
                column: "Abbreviation",
                unique: true,
                filter: "[Abbreviation] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Activity_DisplayOrder",
                schema: "GTkr",
                table: "Activity",
                column: "DisplayOrder",
                unique: true);
        }
    }
}
