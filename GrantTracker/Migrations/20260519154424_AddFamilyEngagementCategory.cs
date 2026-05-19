using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class AddFamilyEngagementCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FamilyEngagementCategory",
                schema: "GTkr",
                columns: table => new
                {
                    FamilyEngagementCategoryGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Abbreviation = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true, comment: "Abbreviation of the label for use in frontend dropdowns."),
                    Label = table.Column<string>(type: "nvarchar(75)", maxLength: 75, nullable: false, comment: "Short textual description of the family engagement category for use in frontend dropdowns."),
                    Description = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true, comment: "Extended description of the family engagement category for future use and ensuring the category is well explained in the event its label is unhelpful."),
                    DeactivatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DisplayOrder = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyEngagementCategory", x => x.FamilyEngagementCategoryGuid);
                },
                comment: "Lookup table for family engagement category options.");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyEngagementCategory_Label",
                schema: "GTkr",
                table: "FamilyEngagementCategory",
                column: "Label",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FamilyEngagementCategory",
                schema: "GTkr");
        }
    }
}
