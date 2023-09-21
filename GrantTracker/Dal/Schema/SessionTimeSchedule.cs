using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class SessionTimeSchedule
	{
		public Guid SessionTimeGuid { get; set; }
		public Guid SessionDayGuid { get; set; }
		public virtual SessionDaySchedule DaySchedule { get; set; }
		public TimeOnly StartTime { get; set; }
		public TimeOnly EndTime { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<SessionTimeSchedule>();

			entity.ToTable("SessionTimeSchedule", "GTkr")
				.HasComment("")
				.HasKey(e => e.SessionTimeGuid);

			/// /Relations

			entity.HasOne(s => s.DaySchedule)
				.WithMany(s => s.TimeSchedules)
				.HasForeignKey(s => s.SessionDayGuid)
				.IsRequired(false)
				.OnDelete(DeleteBehavior.Cascade);

			/// /Properties

			entity.Property(e => e.SessionTimeGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier")
				.HasDefaultValueSql("NEWID()");

			entity.Property(e => e.SessionDayGuid)
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.StartTime)
				.IsRequired()
				.HasColumnType("time")
				.HasComment("Time of day the session starts, Arizona time.");

			entity.Property(e => e.EndTime)
				.IsRequired()
				.HasColumnType("time")
				.HasComment("Time of day the session ends, Arizona time.");
		}
	}
}