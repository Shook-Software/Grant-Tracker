using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class InstructorAttendance
	{
		public Guid InstructorAttendanceGuid { get; set; }
		public Guid InstructorSchoolYearGuid { get; set; }
		public virtual InstructorSchoolYear InstructorSchoolYear { get; set; }
		public Guid SessionGuid { get; set; }
		public virtual Session Session { get; set; }
		public short MinutesAttended { get; set; }
		public DateOnly InstanceDate { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<InstructorAttendance>();

			entity.ToTable("InstructorAttendance", "GTkr")
				.HasComment("Audit log for instructor attendance, contains any change that updates instructor hours.")
				.HasKey(e => e.InstructorAttendanceGuid);

			entity.HasIndex(e => new { e.InstructorSchoolYearGuid, e.SessionGuid, e.InstanceDate })
				.IsUnique();

			/// /Relations

			entity.HasOne(e => e.InstructorSchoolYear)
				.WithMany(s => s.AttendanceRecords)
				.HasForeignKey(e => e.InstructorSchoolYearGuid)
				.OnDelete(DeleteBehavior.Restrict);

			entity.HasOne(e => e.Session)
				.WithMany(s => s.InstructorAttendance)
				.HasForeignKey(e => e.SessionGuid)
				.OnDelete(DeleteBehavior.Restrict);

			/// /Properties

			entity.Property(e => e.InstructorSchoolYearGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.SessionGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.MinutesAttended)
				.IsRequired()
				.HasColumnType("smallint")
				.HasComment("Total number of minutes attended by an instructor for the instance of a session.");

			entity.Property(e => e.InstanceDate)
				.IsRequired()
				.HasColumnType("date")
				.HasComment("Specific date that the session took place on.");
		}
	}
}