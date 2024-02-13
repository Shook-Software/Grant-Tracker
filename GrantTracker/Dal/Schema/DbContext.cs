using Microsoft.EntityFrameworkCore;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema.Sprocs.Reporting;
using GrantTracker.Dal.Schema.Sprocs;

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
		public DbSet<FamilyAttendanceRecord> FamilyAttendances { get; set; }
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
        public DbSet<OrganizationBlackoutDate> BlackoutDates { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
		{
			builder.HasDefaultSchema("GTkr");

			builder.Entity<TotalStudentAttendanceViewModel>().HasNoKey().ToView(null);
            builder.Entity<StudentSurveyViewModel>().HasNoKey().ToView(null);
            builder.Entity<TotalFamilyAttendanceDbModel>().HasNoKey().ToView(null);
            builder.Entity<TotalActivityViewModel>().HasNoKey().ToView(null);
            builder.Entity<SiteSessionDbModel>().HasNoKey().ToView(null);
            builder.Entity<ClassSummaryDbModel>().HasNoKey().ToView(null);
            builder.Entity<ProgramViewModel>().HasNoKey().ToView(null);
            builder.Entity<StaffSummaryDbModel>().HasNoKey().ToView(null);
            builder.Entity<PayrollAuditDb>().HasNoKey().ToView(null);
            builder.Entity<AttendanceCheckDbModel>().HasNoKey().ToView(null);

			builder.Entity<SessionAttendance>().HasNoKey().ToView(null);

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
			FamilyAttendanceRecord.Setup(builder);
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
			OrganizationBlackoutDate.Setup(builder);
        }
	}
}