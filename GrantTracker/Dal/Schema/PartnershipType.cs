using GrantTracker.Dal.Models.Views;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	//Consider deriving all schema classes from something that requires setup, then all of the dropdown options by yet another subclass
	public class PartnershipType : IDropdown
	{
		public Guid Guid { get; set; }
		public string Abbreviation { get; set; }
		public string Label { get; set; }
		public string Description { get; set; }

		public virtual ICollection<Session> Sessions { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<PartnershipType>();

			entity.ToTable("Partnership", "GTkr")
					.HasComment("Lookup table for session partnership types.")
					.HasKey(e => e.Guid);

			entity.HasIndex(e => e.Abbreviation)
					.IsUnique();

			entity.HasIndex(e => e.Label)
					.IsUnique();

			/// /Relations

			entity.HasMany(e => e.Sessions)
				.WithOne(e => e.PartnershipType)
				.HasForeignKey(e => e.OrganizationTypeGuid);

			/// /Properties

			entity.Property(e => e.Guid)
					.IsRequired()
					.HasColumnName("PartnershipGuid")
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
					.HasComment("Short textual description of the partnership type for use in frontend dropdowns.");

			entity.Property(e => e.Description)
					.HasColumnType("nvarchar")
					.HasMaxLength(400)
					.HasComment("Extended description of the partnership for future use and ensuring the partnership is well explained in the event it's label is unhelpful.");
		}
	}
}