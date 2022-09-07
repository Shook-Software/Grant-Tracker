using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class StudentSchoolYear
	{
		public Guid StudentSchoolYearGuid { get; set; } = Guid.NewGuid();
		public Guid StudentGuid { get; set; }
		public virtual Student Student { get; set; }
		public Guid OrganizationYearGuid { get; set; }
		public virtual OrganizationYear OrganizationYear { get; set; }
		public string Grade { get; set; }

		public virtual ICollection<StudentRegistration> SessionRegistrations { get; set; }
		public virtual ICollection<StudentAttendance> AttendanceRecords { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<StudentSchoolYear>();

			entity.ToTable("StudentSchoolYear", "GTkr")
			.HasComment("A student at a school during a given school year.")
			.HasKey(e => e.StudentSchoolYearGuid);

			entity.HasOne(e => e.OrganizationYear)
				.WithMany(e => e.StudentSchoolYears)
				.HasForeignKey(e => e.OrganizationYearGuid);

			entity.Property(e => e.Grade)
				.HasColumnType("varchar")
				.HasMaxLength(10)
				.IsRequired();
		}
	}
}
