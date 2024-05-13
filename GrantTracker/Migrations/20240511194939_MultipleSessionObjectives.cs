using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    /// <inheritdoc />
    public partial class MultipleSessionObjectives : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Session_Objective_ObjectiveGuid",
                schema: "GTkr",
                table: "Session");

            migrationBuilder.DropIndex(
                name: "IX_Session_ObjectiveGuid",
                schema: "GTkr",
                table: "Session");

            migrationBuilder.DropColumn(
                name: "ObjectiveGuid",
                schema: "GTkr",
                table: "Session");

            migrationBuilder.AlterTable(
                name: "Objective",
                schema: "GTkr",
                comment: "Lookup table for session objective option definitions.",
                oldComment: "Lookup table for session objectives.");

            migrationBuilder.CreateTable(
                name: "SessionObjective",
                schema: "GTkr",
                columns: table => new
                {
                    SessionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ObjectiveGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionObjective", x => new { x.SessionGuid, x.ObjectiveGuid });
                    table.ForeignKey(
                        name: "FK_SessionObjective_Objective_ObjectiveGuid",
                        column: x => x.ObjectiveGuid,
                        principalSchema: "GTkr",
                        principalTable: "Objective",
                        principalColumn: "ObjectiveGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SessionObjective_Session_SessionGuid",
                        column: x => x.SessionGuid,
                        principalSchema: "GTkr",
                        principalTable: "Session",
                        principalColumn: "SessionGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Many to many mapping for session objectives.");

            migrationBuilder.CreateIndex(
                name: "IX_SessionObjective_ObjectiveGuid",
                schema: "GTkr",
                table: "SessionObjective",
                column: "ObjectiveGuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SessionObjective",
                schema: "GTkr");

            migrationBuilder.AlterTable(
                name: "Objective",
                schema: "GTkr",
                comment: "Lookup table for session objectives.",
                oldComment: "Lookup table for session objective option definitions.");

            migrationBuilder.AddColumn<Guid>(
                name: "ObjectiveGuid",
                schema: "GTkr",
                table: "Session",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Session_ObjectiveGuid",
                schema: "GTkr",
                table: "Session",
                column: "ObjectiveGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Session_Objective_ObjectiveGuid",
                schema: "GTkr",
                table: "Session",
                column: "ObjectiveGuid",
                principalSchema: "GTkr",
                principalTable: "Objective",
                principalColumn: "ObjectiveGuid",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
