using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class AttendanceRecord
	{
		public Guid Guid { get; set; }
		public Guid SessionGuid { get; set; }
		public virtual Session Session { get; set; }
		public DateOnly InstanceDate { get; set; }
		/*public DateTime? CreatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
		public InstructorSchoolYear? CreatedByInstructor { get; set; } 
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
        public InstructorSchoolYear? UpdatedByInstructor { get; set; }*/
        public virtual ICollection<InstructorAttendanceRecord> InstructorAttendance { get; set; }
		public virtual ICollection<StudentAttendanceRecord> StudentAttendance { get; set; }
		public virtual ICollection<FamilyAttendanceRecord> FamilyAttendance { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<AttendanceRecord>();

			entity.ToTable("AttendanceRecord", "GTkr")
					.HasComment("Base record for attendance on a given date.")
					.HasKey(e => e.Guid); 
			
			entity.HasIndex(e => new { e.SessionGuid, e.InstanceDate })
				.IsUnique();

			/// /Relations

			entity.HasOne(e => e.Session)
				.WithMany(e => e.AttendanceRecords)
				.HasForeignKey(e => e.SessionGuid);

			entity.HasMany(e => e.InstructorAttendance)
				.WithOne(e => e.AttendanceRecord)
				.HasForeignKey(e => e.AttendanceRecordGuid);

			entity.HasMany(e => e.StudentAttendance)
				.WithOne(e => e.AttendanceRecord)
				.HasForeignKey(e => e.AttendanceRecordGuid);

            entity.HasMany(e => e.FamilyAttendance)
                .WithOne(e => e.AttendanceRecord)
                .HasForeignKey(e => e.AttendanceRecordGuid);

            /// /Properties

            entity.Property(e => e.InstanceDate)
				.IsRequired()
				.HasColumnType("date")
				.HasComment("Specific date that the session took place on. Only one record is allowed per diem.");
		}
	}
}
