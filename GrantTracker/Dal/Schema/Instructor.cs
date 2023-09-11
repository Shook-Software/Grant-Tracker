using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class Instructor : Person
	{
		public string BadgeNumber { get; set; }
		//public Guid CurrentSchoolYearGuid

		public virtual ICollection<InstructorSchoolYear> InstructorSchoolYears { get; set; }

		public new static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<Instructor>();

			/// /Relations

			entity.HasMany(e => e.InstructorSchoolYears)
				.WithOne(e => e.Instructor)
				.HasForeignKey(e => e.InstructorGuid);

			/// /Properties

			entity.Property(e => e.BadgeNumber)
				.HasColumnType("varchar")
				.HasMaxLength(10)
				.HasComment("Some rare exceptions may not have a badge number, as free input must be allowed. Not required, but supply a badge number when possible.");
		}
	}
}