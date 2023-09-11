using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class InstructorRegistration
	{
		public Guid SessionGuid { get; set; }
		public virtual Session Session { get; set; }
		public Guid InstructorSchoolYearGuid { get; set; }
		public virtual InstructorSchoolYear InstructorSchoolYear { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<InstructorRegistration>();

			entity.ToTable("InstructorRegistration", "GTkr")
				.HasComment("")
				.HasKey(e => new { e.SessionGuid, e.InstructorSchoolYearGuid });

			entity.HasOne(e => e.Session)
				.WithMany(e => e.InstructorRegistrations)
				.HasForeignKey(e => e.SessionGuid)
				.OnDelete(DeleteBehavior.Restrict);

			entity.HasOne(e => e.InstructorSchoolYear)
				.WithMany(e => e.SessionRegistrations)
				.HasForeignKey(e => e.InstructorSchoolYearGuid)
				.OnDelete(DeleteBehavior.Restrict);
		}
	}
}