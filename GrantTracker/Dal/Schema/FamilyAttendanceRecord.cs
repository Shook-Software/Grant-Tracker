using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public enum FamilyMember
	{
		Mother = 0,
		Father = 1,
		Guardian = 2,
		Grandmother = 3,
		Grandfather = 4,
		OtherAdult = 5
	}

	public class FamilyAttendanceRecord
	{
		public Guid Guid { get; set; } = Guid.NewGuid();

		public Guid StudentSchoolYearGuid { get; set; }
		public virtual StudentSchoolYear StudentSchoolYear { get; set; }

		public Guid AttendanceRecordGuid { get; set; }
		public virtual AttendanceRecord AttendanceRecord { get; set; }

		public FamilyMember FamilyMember { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<FamilyAttendanceRecord>();

			entity.ToTable("FamilyAttendanceRecord", "GTkr")
				.HasComment("Log for family attendance, tied to the base attendance record and a student school year.")
				.HasKey(e => e.Guid);

			entity.HasOne(x => x.StudentSchoolYear)
				.WithMany(x => x.FamilyAttendance)
                .HasForeignKey(e => e.StudentSchoolYearGuid)
				.OnDelete(DeleteBehavior.Cascade);

			entity.HasOne(e => e.AttendanceRecord)
				.WithMany(e => e.FamilyAttendance)
				.HasForeignKey(e => e.AttendanceRecordGuid);

			entity.Property(e => e.FamilyMember)
				.HasColumnType("tinyint")
				.IsRequired();
		}
	}
}