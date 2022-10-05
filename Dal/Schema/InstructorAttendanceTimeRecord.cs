using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class InstructorAttendanceTimeRecord
	{
		public Guid Guid { get; set; }
		public Guid InstructorAttendanceRecordGuid { get; set; }
		public virtual InstructorAttendanceRecord InstructorAttendanceRecord { get; set; }
		public TimeOnly EntryTime { get; set; }
		public TimeOnly ExitTime { get; set; }
		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<InstructorAttendanceTimeRecord>();

			entity.ToTable("InstructorAttendanceTimeRecord", "GTkr")
				.HasComment("Records for instructor attendance, with the start and end times. Multiple can exist for a single day.")
				.HasKey(e => e.Guid);

			entity.Property(e => e.EntryTime)
				.IsRequired()
				.HasColumnType("time");

			entity.Property(e => e.ExitTime)
				.IsRequired()
				.HasColumnType("time");
		}
	}
}

