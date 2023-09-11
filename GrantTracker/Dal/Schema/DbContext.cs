using Microsoft.EntityFrameworkCore;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Models.Views.Reporting;

namespace GrantTracker.Dal.Schema
{
	public class GrantTrackerContext : DbContext
	{
		public GrantTrackerContext(DbContextOptions<GrantTrackerContext> options) : base(options)
		{ }

		protected override void ConfigureConventions(ModelConfigurationBuilder builder)
		{
			//SQL Server is unable to handle DateOnly to date, TimeOnly to time, and visa versa.
			//These converters allow for the models and the database to have the most appropriate datatypes.
			builder.Properties<DateOnly>()
				.HaveConversion<DateOnlyConverter>()
				.HaveColumnType("date");

			builder.Properties<TimeOnly>()
				.HaveConversion<TimeOnlyConverter>()
				.HaveColumnType("time");

			builder.Properties<DayOfWeek>()
				.HaveConversion<DayOfWeekEnumConverter>()
				.HaveColumnType("tinyint");

			builder.Properties<FamilyMember>()
				.HaveConversion<FamilyMemberConverter>()
				.HaveColumnType("tinyint");
		}

		public DbSet<AuditLog> DbAuditLog { get; set; }
		public DbSet<Session> Sessions { get; set; }
		public DbSet<SessionType> SessionTypes { get; set; }
		public DbSet<Activity> Activities { get; set; }
		public DbSet<FundingSource> FundingSources { get; set; }
		public DbSet<Objective> Objectives { get; set; }
		public DbSet<Person> Persons { get; set; }
		public DbSet<Identity> UserIdentities { get; set; }
		public DbSet<Instructor> Instructors { get; set; }
		public DbSet<InstructorSchoolYear> InstructorSchoolYears { get; set; }
		public DbSet<InstructorStatus> InstructorStatuses { get; set; }
		public DbSet<OrganizationType> OrganizationTypes { get; set; }
		public DbSet<PartnershipType> Partnerships { get; set; }
		public DbSet<Student> Students { get; set; }
		public DbSet<FamilyAttendance> FamilyAttendances { get; set; }
		public DbSet<StudentAttendanceRecord> StudentAttendanceRecords { get; set; }
		public DbSet<LookupDefinition> LookupDefinitions { get; set; }
		public DbSet<LookupValue> LookupValues { get; set; }
		public DbSet<SessionGrade> SessionGrades { get; set; }
		public DbSet<SessionDaySchedule> SessionDaySchedules { get; set; }
		public DbSet<SessionTimeSchedule> SessionTimeSchedules { get; set; }
		public DbSet<StudentRegistration> StudentRegistrations { get; set; }
		public DbSet<InstructorRegistration> InstructorRegistrations { get; set; }
		public DbSet<InstructorAttendanceRecord> InstructorAttendanceRecords { get; set; }
		public DbSet<Organization> Organizations { get; set; }
		public DbSet<OrganizationYear> OrganizationYears { get; set; }
		public DbSet<ExceptionLog> ExceptionLogs { get; set; }
		public DbSet<Year> Years { get; set; }
		public DbSet<StudentSchoolYear> StudentSchoolYears { get; set; }
		public DbSet<AttendanceRecord> AttendanceRecords { get; set; }
		public DbSet<StudentAttendanceTimeRecord> StudentAttendanceTimeRecords { get; set; }
		public DbSet<InstructorAttendanceTimeRecord> InstructorAttendanceTimeRecords { get; set; }


		//AttendanceRecords
		public DbSet<TotalStudentAttendanceViewModel> ReportTotalStudentAttendance { get; set; }
		public DbSet<TotalFamilyAttendanceDbModel> ReportTotalFamilyAttendance { get; set; }
		public DbSet<TotalActivityViewModel> ReportTotalActivity { get; set; }
		public DbSet<SiteSessionDbModel> ReportSiteSessions { get; set; }
		public DbSet<ClassSummaryDbModel> ReportClassSummary { get; set; }
		public DbSet<ProgramViewModel> ReportProgramOverview { get; set; }
		public DbSet<StaffSummaryDbModel> ReportStaffSurvey { get; set; }
		public DbSet<StudentSurveyViewModel> ReportStudentSurvey { get; set; }
        public DbSet<AttendanceCheckDbModel> AttendanceCheck { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
		{
			builder.HasDefaultSchema("GTkr");

			AuditLog.Setup(builder);
			Activity.Setup(builder);
			FundingSource.Setup(builder);
			Instructor.Setup(builder);
			InstructorStatus.Setup(builder);
			Objective.Setup(builder);
			OrganizationType.Setup(builder);
			Person.Setup(builder);
			Identity.Setup(builder);
			PartnershipType.Setup(builder);
			Session.Setup(builder);
			SessionType.Setup(builder);
			Student.Setup(builder);
			StudentRegistration.Setup(builder);
			FamilyAttendance.Setup(builder);
			StudentAttendanceRecord.Setup(builder);
			LookupDefinition.Setup(builder);
			LookupValue.Setup(builder);
			SessionGrade.Setup(builder);
			SessionDaySchedule.Setup(builder);
			SessionTimeSchedule.Setup(builder);
			StudentRegistration.Setup(builder);
			InstructorRegistration.Setup(builder);
			InstructorAttendanceRecord.Setup(builder);
			InstructorSchoolYear.Setup(builder);
			ExceptionLog.Setup(builder);
			Organization.Setup(builder);
			OrganizationYear.Setup(builder);
			StudentSchoolYear.Setup(builder);
			Year.Setup(builder);
			AttendanceRecord.Setup(builder);
			StudentAttendanceTimeRecord.Setup(builder);
			InstructorAttendanceTimeRecord.Setup(builder);

			//Reporting POCOs
			builder.Entity<TotalStudentAttendanceViewModel>().HasNoKey();
			builder.Entity<TotalActivityViewModel>().HasNoKey();
			builder.Entity<TotalFamilyAttendanceDbModel>().HasNoKey();
			builder.Entity<SiteSessionDbModel>().HasNoKey();
			builder.Entity<ClassSummaryDbModel>().HasNoKey();
			builder.Entity<ProgramViewModel>().HasNoKey();
			builder.Entity<StaffSummaryDbModel>().HasNoKey();
			builder.Entity<StudentSurveyViewModel>().HasNoKey();
            builder.Entity<AttendanceCheckDbModel>().HasNoKey();
        }

		/*private async Task UpdateAuditLogAsync()
		{
			ChangeTracker.DetectChanges();
			var editorIdentity = await _authRepository.GetIdentityAsync();

			try
			{
				List<AuditLog> auditLogs = new();
				foreach (var entry in ChangeTracker.Entries())
				{
					AuditLogAction action;
					switch (entry.State)
					{
						case EntityState.Added:
							action = AuditLogAction.Create;
							break;

						case EntityState.Deleted:
							action = AuditLogAction.Delete;
							break;

						case EntityState.Modified:
							action = AuditLogAction.Update;
							break;

						default:
							action = AuditLogAction.None;
							break;
					}

					AuditLog audit = new()
					{
						Guid = Guid.NewGuid(),
						Action = action,
						TableName = $"{entry.Metadata.GetSchema()}.{entry.Metadata.GetTableName()}",
						Values = JsonConvert.SerializeObject(entry.Entity, Formatting.None, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore }),
						ChangeDateTime = DateTime.Now,
						User = editorIdentity.UserName
					};

					auditLogs.Add(audit);
				}
				await base.AddRangeAsync(auditLogs);
				SaveChanges();
			}
			catch
			{
				throw;
			}
		}*/

		public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
		{
			//await UpdateAuditLogAsync();
			return await base.SaveChangesAsync(cancellationToken);
		}
	}
}