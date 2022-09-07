using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class GrantTrackerContext : DbContext
	{
		//private readonly IAuthRepository _authRepository;

		public GrantTrackerContext(DbContextOptions<GrantTrackerContext> options/*, IAuthRepository authRepository*/) : base(options)
		{
			//_authRepository = authRepository;
		}

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
		public DbSet<FamilyMember> FamilyMembers { get; set; }
		public DbSet<Relationship> Relationships { get; set; }
		public DbSet<FamilyAttendance> FamilyAttendances { get; set; }
		public DbSet<StudentAttendance> StudentAttendanceRecords { get; set; }
		public DbSet<LookupDefinition> LookupDefinitions { get; set; }
		public DbSet<LookupValue> LookupValues { get; set; }
		public DbSet<SessionGrade> SessionGrades { get; set; }
		public DbSet<SessionDaySchedule> SessionDaySchedules { get; set; }
		public DbSet<SessionTimeSchedule> SessionTimeSchedules { get; set; }
		public DbSet<StudentRegistration> StudentRegistrations { get; set; }
		public DbSet<InstructorRegistration> InstructorRegistrations { get; set; }
		public DbSet<InstructorAttendance> InstructorAttendanceRecords { get; set; }
		public DbSet<Organization> Organizations { get; set; }
		public DbSet<OrganizationYear> OrganizationYears { get; set; }
		public DbSet<ExceptionLog> ExceptionLogs { get; set; }
		public DbSet<Year> Years { get; set; }
		public DbSet<StudentSchoolYear> StudentSchoolYears { get; set; }

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
			FamilyMember.Setup(builder);
			Relationship.Setup(builder);
			StudentRegistration.Setup(builder);
			FamilyAttendance.Setup(builder);
			StudentAttendance.Setup(builder);
			LookupDefinition.Setup(builder);
			LookupValue.Setup(builder);
			SessionGrade.Setup(builder);
			SessionDaySchedule.Setup(builder);
			SessionTimeSchedule.Setup(builder);
			StudentRegistration.Setup(builder);
			InstructorRegistration.Setup(builder);
			InstructorAttendance.Setup(builder);
			InstructorSchoolYear.Setup(builder);
			ExceptionLog.Setup(builder);
			Organization.Setup(builder);
			OrganizationYear.Setup(builder);
			StudentSchoolYear.Setup(builder);
			Year.Setup(builder);
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