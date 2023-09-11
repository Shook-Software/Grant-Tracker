using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class StudentAttendanceRecord
	{
		public Guid Guid { get; set; }
		public Guid StudentSchoolYearGuid { get; set; }
		public virtual StudentSchoolYear StudentSchoolYear { get; set; }
		public Guid AttendanceRecordGuid { get; set; }
		public virtual AttendanceRecord AttendanceRecord { get; set; }
		public virtual ICollection<FamilyAttendance> FamilyAttendance { get; set; }
		public virtual ICollection<StudentAttendanceTimeRecord> TimeRecords { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<StudentAttendanceRecord>();

			entity.ToTable("StudentAttendanceRecord", "GTkr")
				.HasComment("Records for student attendance, stemming from a base attendance record for an instance date. Only one can exist per base record.")
				.HasKey(e => e.Guid);

			entity.HasIndex(e => new { e.StudentSchoolYearGuid, e.AttendanceRecordGuid })
				.IsUnique();

			/// /Relations

			entity.HasOne(e => e.StudentSchoolYear)
				.WithMany(s => s.AttendanceRecords)
				.HasForeignKey(e => e.StudentSchoolYearGuid)
				.OnDelete(DeleteBehavior.Restrict);

			entity.HasOne(e => e.AttendanceRecord)
				.WithMany(s => s.StudentAttendance)
				.HasForeignKey(e => e.AttendanceRecordGuid)
				.OnDelete(DeleteBehavior.Restrict);

			entity.HasMany(e => e.TimeRecords)
				.WithOne(e => e.StudentAttendanceRecord)
				.HasForeignKey(e => e.StudentAttendanceRecordGuid)
				.OnDelete(DeleteBehavior.Cascade);

			/// /Properties

			entity.Property(e => e.StudentSchoolYearGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.AttendanceRecordGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");
		}
	}
}