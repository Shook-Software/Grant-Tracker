using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrantTracker.Migrations
{
    public partial class Initial_Creation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "GTkr");

            migrationBuilder.CreateTable(
                name: "Activity",
                schema: "GTkr",
                columns: table => new
                {
                    ActivityGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Abbreviation = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, comment: "Abbreviation of the label for use in frontend dropdowns."),
                    Label = table.Column<string>(type: "nvarchar(75)", maxLength: 75, nullable: false, comment: "Short textual description of the activity type for use in frontend dropdowns."),
                    Description = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true, comment: "Extended description of the activity for future use and ensuring the activity is well explained in the event it's label is unhelpful.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Activity", x => x.ActivityGuid);
                },
                comment: "Lookup table for session activity types.");

            migrationBuilder.CreateTable(
                name: "AuditLog",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<byte>(type: "tinyint", nullable: false, comment: ""),
                    TableName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false, comment: ""),
                    Values = table.Column<string>(type: "text", nullable: false, comment: ""),
                    ChangeDateTime = table.Column<DateTime>(type: "datetime", nullable: false, comment: ""),
                    User = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, comment: "")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLog", x => x.Guid);
                },
                comment: "Change log for the database.");

            migrationBuilder.CreateTable(
                name: "FundingSource",
                schema: "GTkr",
                columns: table => new
                {
                    FundingGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Abbreviation = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true, comment: "Abbreviation of the label for use in frontend dropdowns."),
                    Label = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, comment: "Short textual description of the funding source for use in frontend dropdowns."),
                    Description = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true, comment: "Extended description of the source for future use and ensuring the source is well explained in the event it's label is unhelpful.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundingSource", x => x.FundingGuid);
                },
                comment: "Lookup table for session funding sources.");

            migrationBuilder.CreateTable(
                name: "InstructorStatus",
                schema: "GTkr",
                columns: table => new
                {
                    StatusGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Abbreviation = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true, comment: "Abbreviation of the label for use in frontend dropdowns."),
                    Label = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, comment: "Short textual description of the objective for use in frontend dropdowns."),
                    Description = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true, comment: "Extended description of the objective for future use and ensuring the objective is well explained in the event it's label is unhelpful.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstructorStatus", x => x.StatusGuid);
                },
                comment: "");

            migrationBuilder.CreateTable(
                name: "LookupDefinition",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Name = table.Column<string>(type: "nvarchar(75)", maxLength: 75, nullable: false, comment: "Name of the definition."),
                    Description = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true, comment: "Useful description of what is being defined.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LookupDefinition", x => x.Guid);
                },
                comment: "Lookup table for persistent attributes.");

            migrationBuilder.CreateTable(
                name: "Objective",
                schema: "GTkr",
                columns: table => new
                {
                    ObjectiveGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Abbreviation = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true, comment: "Abbreviation of the label for use in frontend dropdowns."),
                    Label = table.Column<string>(type: "nvarchar(75)", maxLength: 75, nullable: false, comment: "Short textual description of the objective for use in frontend dropdowns."),
                    Description = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true, comment: "Extended description of the objective for future use and ensuring the objective is well explained in the event it's label is unhelpful.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Objective", x => x.ObjectiveGuid);
                },
                comment: "Lookup table for session objectives.");

            migrationBuilder.CreateTable(
                name: "Organization",
                schema: "GTkr",
                columns: table => new
                {
                    OrganizationGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organization", x => x.OrganizationGuid);
                },
                comment: "Organizations such as sites, a group of administrators, etc.");

            migrationBuilder.CreateTable(
                name: "OrganizationType",
                schema: "GTkr",
                columns: table => new
                {
                    OrganizationGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Abbreviation = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true, comment: "Abbreviation of the label for use in frontend dropdowns."),
                    Label = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, comment: "Short textual description of the funding source for use in frontend dropdowns."),
                    Description = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true, comment: "Extended description of the type for future use and ensuring the type is well explained in the event it's label is unhelpful.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationType", x => x.OrganizationGuid);
                },
                comment: "Lookup table for session organization types.");

            migrationBuilder.CreateTable(
                name: "Partnership",
                schema: "GTkr",
                columns: table => new
                {
                    PartnershipGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Abbreviation = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true, comment: "Abbreviation of the label for use in frontend dropdowns."),
                    Label = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, comment: "Short textual description of the partnership type for use in frontend dropdowns."),
                    Description = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true, comment: "Extended description of the partnership for future use and ensuring the partnership is well explained in the event it's label is unhelpful.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partnership", x => x.PartnershipGuid);
                },
                comment: "Lookup table for session partnership types.");

            migrationBuilder.CreateTable(
                name: "Person",
                schema: "GTkr",
                columns: table => new
                {
                    PersonGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, comment: "The given, legal first name for a person."),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false, comment: "The given, legal last name(s) for a person."),
                    PersonType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BadgeNumber = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true, comment: "Some rare exceptions may not have a badge number, as free input must be allowed. Not required, but supply a badge number when possible."),
                    MatricNumber = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Person", x => x.PersonGuid);
                },
                comment: "Basic information that is ubiquitous to all people stored for use in the Grant Tracker.");

            migrationBuilder.CreateTable(
                name: "SessionType",
                schema: "GTkr",
                columns: table => new
                {
                    SessionTypeGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Abbreviation = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true, comment: "Abbreviation of the label for use in frontend dropdowns."),
                    Label = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, comment: "Short textual description of the type for use in frontend dropdowns."),
                    Description = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true, comment: "Extended description of the type for future use and ensuring the type is well explained in the event it's label is unhelpful.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionType", x => x.SessionTypeGuid);
                },
                comment: "Lookup table for session types.");

            migrationBuilder.CreateTable(
                name: "Year",
                schema: "GTkr",
                columns: table => new
                {
                    YearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SchoolYear = table.Column<short>(type: "smallint", nullable: false),
                    Quarter = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "date", nullable: false),
                    EndDate = table.Column<DateTime>(type: "date", nullable: false),
                    IsCurrentSchoolYear = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Year", x => x.YearGuid);
                    table.CheckConstraint("CK_StartDate_Before_EndDate", "[StartDate] < [EndDate]");
                },
                comment: "A school year split into quarters.");

            migrationBuilder.CreateTable(
                name: "LookupValue",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    DefinitionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Value = table.Column<string>(type: "varchar(25)", maxLength: 25, nullable: false, comment: "Name of the value."),
                    Description = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true, comment: "Useful description of the value.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LookupValue", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_LookupValue_LookupDefinition_DefinitionGuid",
                        column: x => x.DefinitionGuid,
                        principalSchema: "GTkr",
                        principalTable: "LookupDefinition",
                        principalColumn: "Guid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Lookup table for persistent attributes' values and their meaning.");

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

            migrationBuilder.CreateTable(
                name: "OrganizationYear",
                schema: "GTkr",
                columns: table => new
                {
                    OrganizationYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    YearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationYear", x => x.OrganizationYearGuid);
                    table.ForeignKey(
                        name: "FK_OrganizationYear_Organization_OrganizationGuid",
                        column: x => x.OrganizationGuid,
                        principalSchema: "GTkr",
                        principalTable: "Organization",
                        principalColumn: "OrganizationGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrganizationYear_Year_YearGuid",
                        column: x => x.YearGuid,
                        principalSchema: "GTkr",
                        principalTable: "Year",
                        principalColumn: "YearGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "An organization during a given school year.");

            migrationBuilder.CreateTable(
                name: "InstructorSchoolYear",
                schema: "GTkr",
                columns: table => new
                {
                    InstructorSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstructorGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StatusGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstructorSchoolYear", x => x.InstructorSchoolYearGuid);
                    table.ForeignKey(
                        name: "FK_InstructorSchoolYear_InstructorStatus_StatusGuid",
                        column: x => x.StatusGuid,
                        principalSchema: "GTkr",
                        principalTable: "InstructorStatus",
                        principalColumn: "StatusGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InstructorSchoolYear_OrganizationYear_OrganizationYearGuid",
                        column: x => x.OrganizationYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "OrganizationYear",
                        principalColumn: "OrganizationYearGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InstructorSchoolYear_Person_InstructorGuid",
                        column: x => x.InstructorGuid,
                        principalSchema: "GTkr",
                        principalTable: "Person",
                        principalColumn: "PersonGuid",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "An instructor at a school during a given school year.");

            migrationBuilder.CreateTable(
                name: "Session",
                schema: "GTkr",
                columns: table => new
                {
                    SessionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, comment: ""),
                    SessionTypeGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActivityGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ObjectiveGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FundingSourceGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationTypeGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartnershipTypeGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false, comment: "Name of the session, set by a responsible party."),
                    FirstSession = table.Column<DateTime>(type: "date", nullable: false, comment: "Date of the first session."),
                    LastSession = table.Column<DateTime>(type: "date", nullable: false, comment: "Date of the first session."),
                    Recurring = table.Column<bool>(type: "bit", nullable: false, comment: "")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Session", x => x.SessionGuid);
                    table.ForeignKey(
                        name: "FK_Session_Activity_ActivityGuid",
                        column: x => x.ActivityGuid,
                        principalSchema: "GTkr",
                        principalTable: "Activity",
                        principalColumn: "ActivityGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Session_FundingSource_FundingSourceGuid",
                        column: x => x.FundingSourceGuid,
                        principalSchema: "GTkr",
                        principalTable: "FundingSource",
                        principalColumn: "FundingGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Session_Objective_ObjectiveGuid",
                        column: x => x.ObjectiveGuid,
                        principalSchema: "GTkr",
                        principalTable: "Objective",
                        principalColumn: "ObjectiveGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Session_OrganizationType_OrganizationTypeGuid",
                        column: x => x.OrganizationTypeGuid,
                        principalSchema: "GTkr",
                        principalTable: "OrganizationType",
                        principalColumn: "OrganizationGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Session_OrganizationYear_OrganizationYearGuid",
                        column: x => x.OrganizationYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "OrganizationYear",
                        principalColumn: "OrganizationYearGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Session_Partnership_PartnershipTypeGuid",
                        column: x => x.PartnershipTypeGuid,
                        principalSchema: "GTkr",
                        principalTable: "Partnership",
                        principalColumn: "PartnershipGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Session_SessionType_SessionTypeGuid",
                        column: x => x.SessionTypeGuid,
                        principalSchema: "GTkr",
                        principalTable: "SessionType",
                        principalColumn: "SessionTypeGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Base table for sessions in the database. Contains the universal attributes any session contains.");

            migrationBuilder.CreateTable(
                name: "StudentSchoolYear",
                schema: "GTkr",
                columns: table => new
                {
                    StudentSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Grade = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentSchoolYear", x => x.StudentSchoolYearGuid);
                    table.ForeignKey(
                        name: "FK_StudentSchoolYear_OrganizationYear_OrganizationYearGuid",
                        column: x => x.OrganizationYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "OrganizationYear",
                        principalColumn: "OrganizationYearGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentSchoolYear_Person_StudentGuid",
                        column: x => x.StudentGuid,
                        principalSchema: "GTkr",
                        principalTable: "Person",
                        principalColumn: "PersonGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "A student at a school during a given school year.");

            migrationBuilder.CreateTable(
                name: "ExceptionLog",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstructorSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InnerMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StackTrace = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TargetSite = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateTime = table.Column<DateTime>(type: "datetime2", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "Identity",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Claim = table.Column<byte>(type: "tinyint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Identity", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_Identity_InstructorSchoolYear_Guid",
                        column: x => x.Guid,
                        principalSchema: "GTkr",
                        principalTable: "InstructorSchoolYear",
                        principalColumn: "InstructorSchoolYearGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "User authentication for assignment of authorization claims. Only display this information to top-level users. Never send it to the front-end otherwise.");

            migrationBuilder.CreateTable(
                name: "FamilyAttendance",
                schema: "GTkr",
                columns: table => new
                {
                    AttendanceGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FamilyMemberGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MinutesAttended = table.Column<short>(type: "smallint", nullable: false, comment: "Total number of minutes attended by a family member for the instance of a session."),
                    InstanceDate = table.Column<DateTime>(type: "date", nullable: false, comment: "Specific date that the session took place on.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyAttendance", x => x.AttendanceGuid);
                    table.ForeignKey(
                        name: "FK_FamilyAttendance_Person_FamilyMemberGuid",
                        column: x => x.FamilyMemberGuid,
                        principalSchema: "GTkr",
                        principalTable: "Person",
                        principalColumn: "PersonGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FamilyAttendance_Session_SessionGuid",
                        column: x => x.SessionGuid,
                        principalSchema: "GTkr",
                        principalTable: "Session",
                        principalColumn: "SessionGuid",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "Audit log for family attendance, contains any change that updates family hours.");

            migrationBuilder.CreateTable(
                name: "InstructorAttendance",
                schema: "GTkr",
                columns: table => new
                {
                    InstructorAttendanceGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstructorSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MinutesAttended = table.Column<short>(type: "smallint", nullable: false, comment: "Total number of minutes attended by an instructor for the instance of a session."),
                    InstanceDate = table.Column<DateTime>(type: "date", nullable: false, comment: "Specific date that the session took place on.")
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
                name: "InstructorRegistration",
                schema: "GTkr",
                columns: table => new
                {
                    SessionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstructorSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstructorRegistration", x => new { x.SessionGuid, x.InstructorSchoolYearGuid });
                    table.ForeignKey(
                        name: "FK_InstructorRegistration_InstructorSchoolYear_InstructorSchoolYearGuid",
                        column: x => x.InstructorSchoolYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "InstructorSchoolYear",
                        principalColumn: "InstructorSchoolYearGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InstructorRegistration_Session_SessionGuid",
                        column: x => x.SessionGuid,
                        principalSchema: "GTkr",
                        principalTable: "Session",
                        principalColumn: "SessionGuid",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "");

            migrationBuilder.CreateTable(
                name: "SessionDaySchedule",
                schema: "GTkr",
                columns: table => new
                {
                    SessionDayGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    SessionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DayOfWeek = table.Column<byte>(type: "tinyint", nullable: false, comment: "Enumerated representation for day of the week, Sunday = 1, Monday = 2, ..., Saturday = 7. Handled by EfCore ValueConverters automatically.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionDaySchedule", x => x.SessionDayGuid);
                    table.ForeignKey(
                        name: "FK_SessionDaySchedule_Session_SessionGuid",
                        column: x => x.SessionGuid,
                        principalSchema: "GTkr",
                        principalTable: "Session",
                        principalColumn: "SessionGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "");

            migrationBuilder.CreateTable(
                name: "SessionGrade",
                schema: "GTkr",
                columns: table => new
                {
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    SessionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GradeGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionGrade", x => x.Guid);
                    table.ForeignKey(
                        name: "FK_SessionGrade_LookupValue_GradeGuid",
                        column: x => x.GradeGuid,
                        principalSchema: "GTkr",
                        principalTable: "LookupValue",
                        principalColumn: "Guid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SessionGrade_Session_SessionGuid",
                        column: x => x.SessionGuid,
                        principalSchema: "GTkr",
                        principalTable: "Session",
                        principalColumn: "SessionGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Each row designates one of the allowable grade levels for a session.");

            migrationBuilder.CreateTable(
                name: "StudentAttendance",
                schema: "GTkr",
                columns: table => new
                {
                    StudentAttendanceGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MinutesAttended = table.Column<short>(type: "smallint", nullable: false, comment: "Total number of minutes attended by a student for the instance of a session."),
                    InstanceDate = table.Column<DateTime>(type: "date", nullable: false, comment: "Specific date that the session took place on.")
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
                name: "SessionTimeSchedule",
                schema: "GTkr",
                columns: table => new
                {
                    SessionTimeGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    SessionDayGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false, comment: "Time of day the session starts, Arizona time."),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false, comment: "Time of day the session ends, Arizona time.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionTimeSchedule", x => x.SessionTimeGuid);
                    table.ForeignKey(
                        name: "FK_SessionTimeSchedule_SessionDaySchedule_SessionDayGuid",
                        column: x => x.SessionDayGuid,
                        principalSchema: "GTkr",
                        principalTable: "SessionDaySchedule",
                        principalColumn: "SessionDayGuid",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "");

            migrationBuilder.CreateTable(
                name: "StudentRegistration",
                schema: "GTkr",
                columns: table => new
                {
                    StudentSchoolYearGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DayScheduleGuid = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentRegistration", x => new { x.StudentSchoolYearGuid, x.DayScheduleGuid });
                    table.ForeignKey(
                        name: "FK_StudentRegistration_SessionDaySchedule_DayScheduleGuid",
                        column: x => x.DayScheduleGuid,
                        principalSchema: "GTkr",
                        principalTable: "SessionDaySchedule",
                        principalColumn: "SessionDayGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentRegistration_StudentSchoolYear_StudentSchoolYearGuid",
                        column: x => x.StudentSchoolYearGuid,
                        principalSchema: "GTkr",
                        principalTable: "StudentSchoolYear",
                        principalColumn: "StudentSchoolYearGuid",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "Contains student registrees for a session, so that students can be added and expected for filling out their attendance record.");

            migrationBuilder.CreateIndex(
                name: "IX_Activity_Abbreviation",
                schema: "GTkr",
                table: "Activity",
                column: "Abbreviation",
                unique: true,
                filter: "[Abbreviation] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Activity_Label",
                schema: "GTkr",
                table: "Activity",
                column: "Label",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExceptionLog_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "ExceptionLog",
                column: "InstructorSchoolYearGuid");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyAttendance_FamilyMemberGuid_SessionGuid_InstanceDate",
                schema: "GTkr",
                table: "FamilyAttendance",
                columns: new[] { "FamilyMemberGuid", "SessionGuid", "InstanceDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FamilyAttendance_SessionGuid",
                schema: "GTkr",
                table: "FamilyAttendance",
                column: "SessionGuid");

            migrationBuilder.CreateIndex(
                name: "IX_FundingSource_Abbreviation",
                schema: "GTkr",
                table: "FundingSource",
                column: "Abbreviation",
                unique: true,
                filter: "[Abbreviation] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_FundingSource_Label",
                schema: "GTkr",
                table: "FundingSource",
                column: "Label",
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
                name: "IX_InstructorRegistration_InstructorSchoolYearGuid",
                schema: "GTkr",
                table: "InstructorRegistration",
                column: "InstructorSchoolYearGuid");

            migrationBuilder.CreateIndex(
                name: "IX_InstructorSchoolYear_InstructorGuid_OrganizationYearGuid",
                schema: "GTkr",
                table: "InstructorSchoolYear",
                columns: new[] { "InstructorGuid", "OrganizationYearGuid" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InstructorSchoolYear_OrganizationYearGuid",
                schema: "GTkr",
                table: "InstructorSchoolYear",
                column: "OrganizationYearGuid");

            migrationBuilder.CreateIndex(
                name: "IX_InstructorSchoolYear_StatusGuid",
                schema: "GTkr",
                table: "InstructorSchoolYear",
                column: "StatusGuid");

            migrationBuilder.CreateIndex(
                name: "IX_InstructorStatus_Abbreviation",
                schema: "GTkr",
                table: "InstructorStatus",
                column: "Abbreviation",
                unique: true,
                filter: "[Abbreviation] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_InstructorStatus_Label",
                schema: "GTkr",
                table: "InstructorStatus",
                column: "Label",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LookupDefinition_Name",
                schema: "GTkr",
                table: "LookupDefinition",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LookupValue_DefinitionGuid",
                schema: "GTkr",
                table: "LookupValue",
                column: "DefinitionGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Objective_Abbreviation",
                schema: "GTkr",
                table: "Objective",
                column: "Abbreviation",
                unique: true,
                filter: "[Abbreviation] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Objective_Label",
                schema: "GTkr",
                table: "Objective",
                column: "Label",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Organization_Name",
                schema: "GTkr",
                table: "Organization",
                column: "Name",
                unique: true,
                filter: "[Name] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationType_Abbreviation",
                schema: "GTkr",
                table: "OrganizationType",
                column: "Abbreviation",
                unique: true,
                filter: "[Abbreviation] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationType_Label",
                schema: "GTkr",
                table: "OrganizationType",
                column: "Label",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationYear_OrganizationGuid_YearGuid",
                schema: "GTkr",
                table: "OrganizationYear",
                columns: new[] { "OrganizationGuid", "YearGuid" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationYear_YearGuid",
                schema: "GTkr",
                table: "OrganizationYear",
                column: "YearGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Partnership_Abbreviation",
                schema: "GTkr",
                table: "Partnership",
                column: "Abbreviation",
                unique: true,
                filter: "[Abbreviation] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Partnership_Label",
                schema: "GTkr",
                table: "Partnership",
                column: "Label",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Session_ActivityGuid",
                schema: "GTkr",
                table: "Session",
                column: "ActivityGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Session_FundingSourceGuid",
                schema: "GTkr",
                table: "Session",
                column: "FundingSourceGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Session_ObjectiveGuid",
                schema: "GTkr",
                table: "Session",
                column: "ObjectiveGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Session_OrganizationTypeGuid",
                schema: "GTkr",
                table: "Session",
                column: "OrganizationTypeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Session_OrganizationYearGuid",
                schema: "GTkr",
                table: "Session",
                column: "OrganizationYearGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Session_PartnershipTypeGuid",
                schema: "GTkr",
                table: "Session",
                column: "PartnershipTypeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Session_SessionTypeGuid",
                schema: "GTkr",
                table: "Session",
                column: "SessionTypeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_SessionDaySchedule_SessionGuid",
                schema: "GTkr",
                table: "SessionDaySchedule",
                column: "SessionGuid");

            migrationBuilder.CreateIndex(
                name: "IX_SessionGrade_GradeGuid",
                schema: "GTkr",
                table: "SessionGrade",
                column: "GradeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_SessionGrade_SessionGuid_GradeGuid",
                schema: "GTkr",
                table: "SessionGrade",
                columns: new[] { "SessionGuid", "GradeGuid" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SessionTimeSchedule_SessionDayGuid",
                schema: "GTkr",
                table: "SessionTimeSchedule",
                column: "SessionDayGuid");

            migrationBuilder.CreateIndex(
                name: "IX_SessionType_Abbreviation",
                schema: "GTkr",
                table: "SessionType",
                column: "Abbreviation",
                unique: true,
                filter: "[Abbreviation] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_SessionType_Label",
                schema: "GTkr",
                table: "SessionType",
                column: "Label",
                unique: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_StudentRegistration_DayScheduleGuid",
                schema: "GTkr",
                table: "StudentRegistration",
                column: "DayScheduleGuid");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSchoolYear_OrganizationYearGuid",
                schema: "GTkr",
                table: "StudentSchoolYear",
                column: "OrganizationYearGuid");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSchoolYear_StudentGuid",
                schema: "GTkr",
                table: "StudentSchoolYear",
                column: "StudentGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Year_SchoolYear_Quarter",
                schema: "GTkr",
                table: "Year",
                columns: new[] { "SchoolYear", "Quarter" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Year_YearGuid_IsCurrentSchoolYear",
                schema: "GTkr",
                table: "Year",
                columns: new[] { "YearGuid", "IsCurrentSchoolYear" },
                unique: true,
                filter: "[IsCurrentSchoolYear] = 1");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLog",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "ExceptionLog",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "FamilyAttendance",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "Identity",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "InstructorAttendance",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "InstructorRegistration",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "SessionGrade",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "SessionTimeSchedule",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "StudentAttendance",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "StudentFamily",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "StudentRegistration",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "InstructorSchoolYear",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "LookupValue",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "SessionDaySchedule",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "StudentSchoolYear",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "InstructorStatus",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "LookupDefinition",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "Session",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "Person",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "Activity",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "FundingSource",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "Objective",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "OrganizationType",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "OrganizationYear",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "Partnership",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "SessionType",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "Organization",
                schema: "GTkr");

            migrationBuilder.DropTable(
                name: "Year",
                schema: "GTkr");
        }
    }
}
