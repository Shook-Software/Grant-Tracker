using GrantTracker.Dal.Models.Views;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema;

public class FamilyEngagementCategory : DropdownOption
{
    public static void Setup(ModelBuilder builder)
    {
        var entity = builder.Entity<FamilyEngagementCategory>();

        entity.ToTable("FamilyEngagementCategory", "GTkr")
            .HasComment("Lookup table for family engagement category options.")
            .HasKey(e => e.Guid);

        entity.HasIndex(e => e.Label).IsUnique();

        /// /Properties

        entity.Property(e => e.Guid)
            .IsRequired()
            .HasColumnName("FamilyEngagementCategoryGuid")
            .HasColumnType("uniqueidentifier")
            .HasDefaultValueSql("NEWID()");

        entity.Property(e => e.Abbreviation)
            .HasColumnType("nvarchar")
            .HasMaxLength(10)
            .HasComment("Abbreviation of the label for use in frontend dropdowns.");

        entity.Property(e => e.Label)
            .IsRequired()
            .HasColumnType("nvarchar")
            .HasMaxLength(75)
            .HasComment("Short textual description of the family engagement category for use in frontend dropdowns.");

        entity.Property(e => e.Description)
            .HasColumnType("nvarchar")
            .HasMaxLength(400)
            .HasComment("Extended description of the family engagement category for future use and ensuring the category is well explained in the event its label is unhelpful.");

        DropdownOption.Setup(entity);
    }
}
