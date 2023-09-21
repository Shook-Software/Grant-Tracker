using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class StudentRegistration
	{
		public Guid StudentSchoolYearGuid { get; set; }
		public virtual StudentSchoolYear StudentSchoolYear { get; set; }
		public Guid DayScheduleGuid { get; set; }
		public virtual SessionDaySchedule DaySchedule { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<StudentRegistration>();

			entity.ToTable("StudentRegistration", "GTkr")
				.HasComment("Contains student registrees for a session, so that students can be added and expected for filling out their attendance record.");

			//No unique restraint required, given composite key
			entity.HasKey(e => new { e.StudentSchoolYearGuid, e.DayScheduleGuid });

			/// /Relations

			entity.HasOne(e => e.StudentSchoolYear)
				.WithMany(e => e.SessionRegistrations)
				.HasForeignKey(e => e.StudentSchoolYearGuid)
				.OnDelete(DeleteBehavior.NoAction);

			entity.HasOne(e => e.DaySchedule)
				.WithMany(e => e.StudentRegistrations)
				.HasForeignKey(e => e.DayScheduleGuid)
				.OnDelete(DeleteBehavior.Restrict);

			/// /Properties

			entity.Property(e => e.StudentSchoolYearGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.DayScheduleGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");
		}
	}
}