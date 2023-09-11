using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class SessionDaySchedule
	{
		public Guid SessionDayGuid { get; set; }
		public Guid SessionGuid { get; set; }
		public virtual Session Session { get; set; }
		public DayOfWeek DayOfWeek { get; set; }

		public virtual ICollection<SessionTimeSchedule> TimeSchedules { get; set; }
		public virtual ICollection<StudentRegistration> StudentRegistrations { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<SessionDaySchedule>();

			entity.ToTable("SessionDaySchedule", "GTkr")
				.HasComment("")
				.HasKey(e => e.SessionDayGuid);

			/// /Relations

			entity.HasOne(e => e.Session)
				.WithMany(e => e.DaySchedules)
				.HasForeignKey(e => e.SessionGuid);

			entity.HasMany(e => e.TimeSchedules)
				.WithOne(e => e.DaySchedule)
				.HasForeignKey(e => e.SessionDayGuid)
				.OnDelete(DeleteBehavior.Cascade);

			entity.HasMany(e => e.StudentRegistrations)
				.WithOne(e => e.DaySchedule)
				.HasForeignKey(e => e.DayScheduleGuid)
				.OnDelete(DeleteBehavior.Cascade); 

			/// /Properties

			entity.Property(e => e.SessionDayGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier")
				.HasDefaultValueSql("NEWID()");

			entity.Property(e => e.SessionGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.DayOfWeek)
				.IsRequired()
				.HasColumnType("tinyint")
				.HasComment("Enumerated representation for day of the week, Sunday = 1, Monday = 2, ..., Saturday = 7. Handled by EfCore ValueConverters automatically.");
		}
	}
}