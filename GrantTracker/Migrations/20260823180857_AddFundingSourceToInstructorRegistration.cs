using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class AddFundingSourceToInstructorRegistration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FundingSourceGuid",
                schema: "GTkr",
                table: "InstructorRegistration",
                type: "uniqueidentifier",
                nullable: true,
                comment: "Funding source paying for this instructor's involvement in the session.");

            migrationBuilder.CreateIndex(
                name: "IX_InstructorRegistration_FundingSourceGuid",
                schema: "GTkr",
                table: "InstructorRegistration",
                column: "FundingSourceGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorRegistration_FundingSource_FundingSourceGuid",
                schema: "GTkr",
                table: "InstructorRegistration",
                column: "FundingSourceGuid",
                principalSchema: "GTkr",
                principalTable: "FundingSource",
                principalColumn: "FundingGuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InstructorRegistration_FundingSource_FundingSourceGuid",
                schema: "GTkr",
                table: "InstructorRegistration");

            migrationBuilder.DropIndex(
                name: "IX_InstructorRegistration_FundingSourceGuid",
                schema: "GTkr",
                table: "InstructorRegistration");

            migrationBuilder.DropColumn(
                name: "FundingSourceGuid",
                schema: "GTkr",
                table: "InstructorRegistration");
        }
    }
}
