using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class InstructorAttendanceRecord
	{
		public Guid Guid { get; set; }
		public Guid InstructorSchoolYearGuid { get; set; }
		public virtual InstructorSchoolYear InstructorSchoolYear { get; set; }
		public Guid AttendanceRecordGuid { get; set; }
		public virtual AttendanceRecord AttendanceRecord { get; set; }
        public bool IsSubstitute { get; set; }

        public ICollection<InstructorAttendanceTimeRecord> TimeRecords { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<InstructorAttendanceRecord>();

			entity.ToTable("InstructorAttendanceRecord", "GTkr")
				.HasComment("Records for instructor attendance, stemming from a base attendance record for an instance date.")
				.HasKey(e => e.Guid);

			entity.HasIndex(e => new { e.InstructorSchoolYearGuid, e.AttendanceRecordGuid })
				.IsUnique();

			/// /Relations

			entity.HasOne(e => e.InstructorSchoolYear)
				.WithMany(s => s.AttendanceRecords)
				.HasForeignKey(e => e.InstructorSchoolYearGuid)
				.OnDelete(DeleteBehavior.Cascade);

			entity.HasOne(e => e.AttendanceRecord)
				.WithMany(s => s.InstructorAttendance)
				.HasForeignKey(e => e.AttendanceRecordGuid)
				.OnDelete(DeleteBehavior.Cascade);

			entity.HasMany(e => e.TimeRecords)
				.WithOne(e => e.InstructorAttendanceRecord)
				.HasForeignKey(e => e.InstructorAttendanceRecordGuid)
				.OnDelete(DeleteBehavior.Cascade);

			/// /Properties

			entity.Property(e => e.InstructorSchoolYearGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.AttendanceRecordGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.IsSubstitute)
                .IsRequired()
                .HasDefaultValue(0)
				.HasColumnType("bit");
		}
	}
}