using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class AddFamilyEngagementCategoryToSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FamilyEngagementCategoryGuid",
                schema: "GTkr",
                table: "Session",
                type: "uniqueidentifier",
                nullable: true,
                comment: "Required when SessionType is Parent or Family; null otherwise.");

            migrationBuilder.CreateIndex(
                name: "IX_Session_FamilyEngagementCategoryGuid",
                schema: "GTkr",
                table: "Session",
                column: "FamilyEngagementCategoryGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Session_FamilyEngagementCategory_FamilyEngagementCategoryGuid",
                schema: "GTkr",
                table: "Session",
                column: "FamilyEngagementCategoryGuid",
                principalSchema: "GTkr",
                principalTable: "FamilyEngagementCategory",
                principalColumn: "FamilyEngagementCategoryGuid");

            migrationBuilder.InsertData(
                schema: "GTkr",
                table: "FamilyEngagementCategory",
                columns: new[] { "Abbreviation", "Label", "Description", "DisplayOrder" },
                values: new object[,]
                {
                    { "Fam Lit",    "Family Literacy",                          "Linked to Student Learning - Educational Related",                                    (short)0 },
                    { "Adult Ed",   "Adult Education",                          "Basic Skills, Parenting Skills and Job and Career Development",                       (short)1 },
                    { "Advisory",   "Advisory Roles",                           "Input, Decision Making and School Partnership Opportunities",                         (short)2 },
                    { "Volunteer",  "Volunteering",                             "",                                                                                    (short)3 },
                    { "Expand Hrs", "Expanded Library or Other Facility Hours", "",                                                                                    (short)4 },
                    { "Connect",    "Connecting Community Resources",           "",                                                                                    (short)5 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM [GTkr].[FamilyEngagementCategory] WHERE Label IN ('Family Literacy','Adult Education','Advisory Roles','Volunteering','Expanded Library or Other Facility Hours','Connecting Community Resources');");

            migrationBuilder.DropForeignKey(
                name: "FK_Session_FamilyEngagementCategory_FamilyEngagementCategoryGuid",
                schema: "GTkr",
                table: "Session");

            migrationBuilder.DropIndex(
                name: "IX_Session_FamilyEngagementCategoryGuid",
                schema: "GTkr",
                table: "Session");

            migrationBuilder.DropColumn(
                name: "FamilyEngagementCategoryGuid",
                schema: "GTkr",
                table: "Session");
        }
    }
}
