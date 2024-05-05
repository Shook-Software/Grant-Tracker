using GrantTracker.Dal.Models.Views;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema;

public class InstructorStatus : DropdownOption
{
	public virtual ICollection<InstructorSchoolYear> InstructorYears { get; set; }

	public static void Setup(ModelBuilder builder)
	{
		var entity = builder.Entity<InstructorStatus>();

		entity.ToTable("InstructorStatus", "GTkr")
				.HasComment("")
				.HasKey(e => e.Guid);

		entity.HasIndex(e => e.Abbreviation)
				.IsUnique();

		entity.HasIndex(e => e.Label)
				.IsUnique();

		/// /Relations

		entity.HasMany(e => e.InstructorYears)
			.WithOne(e => e.Status)
			.HasForeignKey(e => e.StatusGuid);

		/// /Properties

		entity.Property(e => e.Guid)
				.IsRequired()
				.HasColumnName("StatusGuid")
				.HasColumnType("uniqueidentifier")
				.HasDefaultValueSql("NEWID()");

		entity.Property(e => e.Abbreviation)
				.HasColumnType("nvarchar")
				.HasMaxLength(10)
				.HasComment("Abbreviation of the label for use in frontend dropdowns.");

		entity.Property(e => e.Label)
				.IsRequired()
				.HasColumnType("nvarchar")
				.HasMaxLength(50)
				.HasComment("Short textual description of the objective for use in frontend dropdowns.");

		entity.Property(e => e.Description)
				 .HasColumnType("nvarchar")
				 .HasMaxLength(400)
				 .HasComment("Extended description of the objective for future use and ensuring the objective is well explained in the event it's label is unhelpful.");
	}
}