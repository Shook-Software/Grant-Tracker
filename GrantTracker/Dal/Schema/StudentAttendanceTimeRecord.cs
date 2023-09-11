using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class StudentAttendanceTimeRecord
	{
		public Guid Guid { get; set; }
		public Guid StudentAttendanceRecordGuid { get; set; }
		public virtual StudentAttendanceRecord StudentAttendanceRecord { get; set; }
		public TimeOnly EntryTime { get; set; }
		public TimeOnly ExitTime { get; set; }
		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<StudentAttendanceTimeRecord>();

			entity.ToTable("StudentAttendanceTimeRecord", "GTkr")
				.HasComment("Records for student attendance, with the start and end times. Multiple can exist for a single day.")
				.HasKey(e => e.Guid);

			entity.HasOne(x => x.StudentAttendanceRecord)
				.WithMany(x => x.TimeRecords)
				.HasForeignKey(e => e.StudentAttendanceRecordGuid)
				.OnDelete(DeleteBehavior.Cascade);

			entity.Property(e => e.EntryTime)
				.IsRequired()
				.HasColumnType("time");

			entity.Property(e => e.ExitTime)
				.IsRequired()
				.HasColumnType("time");
		}
	}
}
