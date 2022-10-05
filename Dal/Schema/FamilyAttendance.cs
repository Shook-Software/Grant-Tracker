using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public enum FamilyMember
	{
		Mother = 0,
		Father = 1,
		Guardian = 2,
		Grandma = 3,
		Grandfather = 4,
		Other = 5
	}

	public class FamilyAttendance
	{
		public Guid Guid { get; set; }
		public Guid StudentAttendanceRecordGuid { get; set; }
		public virtual StudentAttendanceRecord StudentAttendanceRecord { get; set; }
		public FamilyMember FamilyMember { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<FamilyAttendance>();

			entity.ToTable("FamilyAttendance", "GTkr")
				.HasComment("Log for family attendance, tied to studentAttendanceRecords,")
				.HasKey(e => e.Guid);

			entity.HasOne(e => e.StudentAttendanceRecord)
				.WithMany(e => e.FamilyAttendance)
				.HasForeignKey(e => e.StudentAttendanceRecordGuid);

			entity.Property(e => e.FamilyMember)
				.HasColumnType("tinyint")
				.IsRequired();
		}
	}
}