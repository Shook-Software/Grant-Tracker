using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class FamilyAttendance
	{
		public Guid AttendanceGuid { get; set; }
		public Guid FamilyMemberGuid { get; set; }
		public virtual FamilyMember FamilyMember { get; set; }
		public Guid SessionGuid { get; set; }
		public virtual Session Session { get; set; }
		public short MinutesAttended { get; set; }
		public DateOnly InstanceDate { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<FamilyAttendance>();

			entity.ToTable("FamilyAttendance", "GTkr")
				.HasComment("Audit log for family attendance, contains any change that updates family hours.")
				.HasKey(e => e.AttendanceGuid);

			entity.HasIndex(e => new { e.FamilyMemberGuid, e.SessionGuid, e.InstanceDate })
				.IsUnique();

			/// /Relations

			entity.HasOne(e => e.FamilyMember)
				.WithMany(s => s.AttendanceRecords)
				.HasForeignKey(e => e.FamilyMemberGuid)
				.OnDelete(DeleteBehavior.Restrict);

			entity.HasOne(e => e.Session)
				.WithMany(s => s.FamilyAttendance)
				.HasForeignKey(e => e.SessionGuid)
				.OnDelete(DeleteBehavior.Restrict);

			/// /Properties

			entity.Property(e => e.AttendanceGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.FamilyMemberGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.SessionGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.MinutesAttended)
				.IsRequired()
				.HasColumnType("smallint")
				.HasComment("Total number of minutes attended by a family member for the instance of a session.");

			entity.Property(e => e.InstanceDate)
				.IsRequired()
				.HasColumnType("date")
				.HasComment("Specific date that the session took place on.");
		}
	}
}