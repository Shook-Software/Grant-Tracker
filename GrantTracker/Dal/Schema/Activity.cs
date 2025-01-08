using GrantTracker.Dal.Models.Views;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	//Consider deriving all schema classes from something that requires setup, then all of the dropdown options by yet another subclass
	public class Activity : DropdownOption
	{
		public virtual ICollection<Session> Sessions { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<Activity>();

			entity.ToTable("Activity", "GTkr")
				.HasComment("Lookup table for session activity types.")
				.HasKey(e => e.Guid);

			entity.HasIndex(e => e.Label).IsUnique();

			/// /Properties

			entity.Property(e => e.Guid)
				.IsRequired()
				.HasColumnName("ActivityGuid")
				.HasColumnType("uniqueidentifier")
				.HasDefaultValueSql("NEWID()");

			entity.Property(e => e.Abbreviation)
				.HasColumnType("nvarchar")
				.HasMaxLength(20)
				.HasComment("Abbreviation of the label for use in frontend dropdowns.");

			entity.Property(e => e.Label)
				.IsRequired()
				.HasColumnType("nvarchar")
				.HasMaxLength(75)
				.HasComment("Short textual description of the activity type for use in frontend dropdowns.");

			entity.Property(e => e.Description)
				.HasColumnType("nvarchar")
				.HasMaxLength(400)
				.HasComment("Extended description of the activity for future use and ensuring the activity is well explained in the event it's label is unhelpful.");

			DropdownOption.Setup(entity);
		}
	}
}