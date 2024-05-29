using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GrantTracker.Utilities;

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
		public Guid FundingSourceGuid { get; set; }
		public virtual FundingSource FundingSource { get; set; }
		public Guid OrganizationTypeGuid { get; set; }
		public virtual OrganizationType OrganizationType { get; set; }
		public Guid PartnershipTypeGuid { get; set; }
		public virtual PartnershipType PartnershipType { get; set; }
		public string Name { get; set; }
		public DateOnly FirstSession { get; set; }
		public DateOnly LastSession { get; set; }
		public bool Recurring { get; set; } = false;

		public virtual ICollection<SessionObjective> SessionObjectives { get; set; }
		public virtual ICollection<SessionDaySchedule> DaySchedules { get; set; }
		public virtual ICollection<AttendanceRecord> AttendanceRecords { get; set; }
		public virtual ICollection<InstructorRegistration> InstructorRegistrations { get; set; }
        public virtual ICollection<SessionGrade> SessionGrades { get; set; }

		public static void Setup(ModelBuilder builder, IHttpContextAccessor httpAccessor)
		{
			var entity = builder.Entity<Session>();

			entity.ToTable("Session", "GTkr", t => t.HasComment("Base table for sessions in the database. Contains the universal attributes any session contains."))
				.HasKey(e => e.SessionGuid);

            entity.HasQueryFilter(s => httpAccessor.HttpContext.User.IsAdmin()
                || (httpAccessor.HttpContext.User.IsCoordinator() && httpAccessor.HttpContext.User.HomeOrganizationGuids().Contains(s.OrganizationYear.OrganizationGuid))
				|| (httpAccessor.HttpContext.User.IsTeacher() && s.InstructorRegistrations.Any(ir => ir.InstructorSchoolYear.Instructor.BadgeNumber.Trim() == httpAccessor.HttpContext.User.Id())));

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

			entity.HasMany(e => e.SessionObjectives)
				.WithOne(o => o.Session)
				.HasForeignKey(e => e.SessionGuid)
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

			entity.HasMany(e => e.SessionGrades)
				.WithOne(e => e.Session)
				.HasForeignKey(e => e.SessionGuid);

            entity.HasMany(e => e.DaySchedules)
                .WithOne(e => e.Session)
                .HasForeignKey(e => e.SessionGuid)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.InstructorRegistrations)
                .WithOne(e => e.Session)
                .HasForeignKey(e => e.SessionGuid)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.AttendanceRecords)
                .WithOne(e => e.Session)
                .HasForeignKey(e => e.SessionGuid)
                .OnDelete(DeleteBehavior.Restrict);

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

			entity.Property(e => e.Recurring)
				.IsRequired()
				.HasColumnType("bit")
				.HasComment("");
        }
	}
}