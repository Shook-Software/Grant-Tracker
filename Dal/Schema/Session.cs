using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class Session
	{
		public Guid SessionGuid { get; set; }
		public Guid OrganizationYearGuid { get; set; }

		public OrganizationYear OrganizationYear { get; set; }
		public Guid SessionTypeGuid { get; set; }

		public virtual SessionType SessionType { get; set; }
		public Guid ActivityGuid { get; set; }
		public virtual Activity Activity { get; set; }
		public Guid ObjectiveGuid { get; set; }
		public virtual Objective Objective { get; set; }
		public Guid FundingSourceGuid { get; set; }
		public virtual FundingSource FundingSource { get; set; }
		public Guid OrganizationTypeGuid { get; set; }
		public virtual OrganizationType OrganizationType { get; set; }
		public Guid PartnershipTypeGuid { get; set; }
		public virtual PartnershipType PartnershipType { get; set; }
		public string Name { get; set; }
		public DateOnly FirstSession { get; set; }
		public DateOnly LastSession { get; set; }
		/*public TimeOnly StartTime { get; set; } = TimeOnly.MinValue;
		public TimeOnly EndTime { get; set; } = TimeOnly.MinValue;*/
		public bool Recurring { get; set; } = false;

		public virtual ICollection<SessionDaySchedule> DaySchedules { get; set; }

		public virtual ICollection<StudentAttendance> StudentAttendance { get; set; }
		public virtual ICollection<FamilyAttendance> FamilyAttendance { get; set; }

		public virtual ICollection<InstructorRegistration> InstructorRegistrations { get; set; }
		public virtual ICollection<InstructorAttendance> InstructorAttendance { get; set; }

		public virtual ICollection<SessionGrade> SessionGrades { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<Session>();

			entity.ToTable("Session", "GTkr")
				.HasComment("Base table for sessions in the database. Contains the universal attributes any session contains.")
				.HasKey(e => e.SessionGuid);

			/// /Relations

			entity.HasOne(e => e.OrganizationYear)
				.WithMany(o => o.Sessions)
				.HasForeignKey(e => e.OrganizationYearGuid);

			entity.HasOne(e => e.SessionType)
				.WithMany(a => a.Sessions)
				.HasForeignKey(e => e.SessionTypeGuid)
				.IsRequired();

			entity.HasOne(e => e.Activity)
				.WithMany(a => a.Sessions)
				.HasForeignKey(e => e.ActivityGuid)
				.IsRequired();

			entity.HasOne(e => e.Objective)
				.WithMany(o => o.Sessions)
				.HasForeignKey(e => e.ObjectiveGuid)
				.IsRequired();

			entity.HasOne(e => e.FundingSource)
				.WithMany(f => f.Sessions)
				.HasForeignKey(e => e.FundingSourceGuid)
				.IsRequired();

			entity.HasOne(e => e.OrganizationType)
				.WithMany(p => p.Sessions)
				.HasForeignKey(e => e.OrganizationTypeGuid)
				.IsRequired();

			entity.HasOne(e => e.PartnershipType)
				.WithMany(p => p.Sessions)
				.HasForeignKey(e => e.PartnershipTypeGuid)
				.IsRequired();

			entity.HasMany(e => e.FamilyAttendance)
				.WithOne(e => e.Session)
				.HasForeignKey(e => e.SessionGuid)
				.IsRequired(false);

			entity.HasMany(e => e.SessionGrades)
				.WithOne(e => e.Session)
				.HasForeignKey(e => e.SessionGuid);

			/// /Properties

			entity.Property(e => e.SessionGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.OrganizationYearGuid)
				.HasColumnType("uniqueidentifier")
				.HasComment("");

			entity.Property(e => e.ActivityGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.ObjectiveGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.FundingSourceGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.PartnershipTypeGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.Name)
				.IsRequired()
				.HasColumnType("nvarchar")
				.HasMaxLength(100)
				.HasComment("Name of the session, set by a responsible party.");

			entity.Property(e => e.FirstSession)
				.IsRequired()
				.HasColumnType("date")
				.HasComment("Date of the first session.");

			entity.Property(e => e.LastSession)
				.HasColumnType("date")
				.HasComment("Date of the first session.");

			/*entity.Property(e => e.StartTime)
				.IsRequired()
				.HasColumnType("time")
				.HasComment("Time of day when the session starts.");

			entity.Property(e => e.EndTime)
				.IsRequired()
				.HasColumnType("time")
				.HasComment("Time of day when the session ends.");*/

			entity.Property(e => e.Recurring)
				.IsRequired()
				.HasColumnType("bit")
				.HasComment("");
		}
	}
}