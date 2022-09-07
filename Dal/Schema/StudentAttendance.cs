using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class StudentAttendance
	{
		public Guid StudentAttendanceGuid { get; set; }
		public Guid StudentSchoolYearGuid { get; set; }
		public virtual StudentSchoolYear StudentSchoolYear { get; set; }
		public Guid SessionGuid { get; set; }
		public virtual Session Session { get; set; }
		public short MinutesAttended { get; set; }
		public DateOnly InstanceDate { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<StudentAttendance>();

			entity.ToTable("StudentAttendance", "GTkr")
				.HasComment("Audit log for student attendance, contains any change that updates student hours.")
				.HasKey(e => e.StudentAttendanceGuid);

			entity.HasIndex(e => new { e.StudentSchoolYearGuid, e.SessionGuid, e.InstanceDate })
				.IsUnique();

			/// /Relations

			entity.HasOne(e => e.StudentSchoolYear)
				.WithMany(s => s.AttendanceRecords)
				.HasForeignKey(e => e.StudentSchoolYearGuid)
				.OnDelete(DeleteBehavior.Restrict);

			entity.HasOne(e => e.Session)
				.WithMany(s => s.StudentAttendance)
				.HasForeignKey(e => e.SessionGuid)
				.OnDelete(DeleteBehavior.Restrict);

			/// /Properties

			entity.Property(e => e.StudentSchoolYearGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.SessionGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.MinutesAttended)
				.IsRequired()
				.HasColumnType("smallint")
				.HasComment("Total number of minutes attended by a student for the instance of a session.");

			entity.Property(e => e.InstanceDate)
				.IsRequired()
				.HasColumnType("date")
				.HasComment("Specific date that the session took place on.");
		}
	}
}