using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class Relationship
	{
		public Guid StudentGuid { get; set; }
		public virtual Student Student { get; set; }
		public Guid FamilyMemberGuid { get; set; }
		public virtual FamilyMember FamilyMember { get; set; }
		public string Relation { get; set; } //enum eventually?

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<Relationship>();

			entity.ToTable("StudentFamily", "GTkr")
				.HasComment("A many to many table that relates students and family members.")
				.HasKey(e => new { e.StudentGuid, e.FamilyMemberGuid }); //composite

			/// /Relations

			entity.HasOne(e => e.Student)
					.WithMany(e => e.Relationships)
					.HasForeignKey(e => e.StudentGuid)
					.OnDelete(DeleteBehavior.Restrict);

			entity.HasOne(e => e.FamilyMember)
					.WithMany(e => e.Relationships)
					.HasForeignKey(e => e.FamilyMemberGuid)
					.OnDelete(DeleteBehavior.Restrict);

			/// /Properties

			entity.Property(e => e.StudentGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.FamilyMemberGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.Relation)
				.HasColumnType("nvarchar")
				.HasMaxLength(50)
				.HasComment("A short textual descriptor of how a student and family member are related. Father, Mother, brother, cousin, etc.");
		}
	}
}