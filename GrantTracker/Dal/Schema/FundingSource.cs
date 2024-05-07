using GrantTracker.Dal.Models.Views;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class FundingSource : DropdownOption
	{
		public virtual ICollection<Session> Sessions { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<FundingSource>();

			entity.ToTable("FundingSource", "GTkr")
				.HasComment("Lookup table for session funding sources.")
				.HasKey(e => e.Guid);

			entity.HasIndex(e => e.Abbreviation)
				.IsUnique();

			entity.HasIndex(e => e.Label)
				.IsUnique();

			/// /Relations

			entity.HasMany(e => e.Sessions)
				.WithOne(e => e.FundingSource)
				.HasForeignKey(e => e.FundingSourceGuid);

			/// /Properties

			entity.Property(e => e.Guid)
					.IsRequired()
					.HasColumnName("FundingGuid")
					.HasColumnType("uniqueidentifier")
					.HasDefaultValueSql("NEWID()");

			entity.Property<string>(e => e.Abbreviation)
					.HasColumnType("nvarchar")
					.HasMaxLength(10)
					.HasComment("Abbreviation of the label for use in frontend dropdowns.");

			entity.Property<string>(e => e.Label)
					.IsRequired()
					.HasColumnType("nvarchar")
					.HasMaxLength(50)
					.HasComment("Short textual description of the funding source for use in frontend dropdowns.");

			entity.Property<string>(e => e.Description)
					.HasColumnType("nvarchar")
					.HasMaxLength(400)
					.HasComment("Extended description of the source for future use and ensuring the source is well explained in the event it's label is unhelpful.");
		}
	}
}