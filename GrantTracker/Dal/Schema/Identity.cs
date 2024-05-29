using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public enum IdentityClaim
	{
		Administrator = 0,
		Coordinator = 1,
		Teacher = 2
	}

	public class Identity
	{
		public Guid Guid { get; set; }
		public virtual InstructorSchoolYear SchoolYear { get; set; }
		public IdentityClaim Claim { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<Identity>();

			entity.ToTable("Identity", "GTkr")
				.HasComment("User authentication for assignment of authorization claims. Only display this information to top-level users. Never send it to the front-end otherwise.")
				.HasKey(e => e.Guid);

			/// /Relations

			entity.HasOne(e => e.SchoolYear)
				.WithOne(e => e.Identity)
				.HasForeignKey<Identity>(e => e.Guid)
				.IsRequired();

			/*entity.HasOne(e => e.ActiveSchoolYear)
				.WithOne(e => e.Identity)
				.HasForeignKey<Identity>(e => e.Guid)
				.IsRequired();*/

			/// /Properties

			entity.Property(e => e.Claim)
				.HasColumnType("tinyint")
				.IsRequired();
		}
	}
}