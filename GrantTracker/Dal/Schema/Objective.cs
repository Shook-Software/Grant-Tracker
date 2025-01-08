using GrantTracker.Dal.Models.Views;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema;

public class Objective : DropdownOption
{
    public virtual ICollection<SessionObjective> SessionObjectives { get; set; }

    public static void Setup(ModelBuilder builder)
    {
        var entity = builder.Entity<Objective>();

        entity.ToTable("Objective", "GTkr")
                .HasComment("Lookup table for session objective option definitions.")
                .HasKey(e => e.Guid);
        entity.HasIndex(e => e.Label)
                .IsUnique();

        /// /Relations

        entity.HasMany(e => e.SessionObjectives)
            .WithOne(e => e.Objective)
            .HasForeignKey(e => e.ObjectiveGuid);

        /// /Properties

        entity.Property(e => e.Guid)
                .IsRequired()
                .HasColumnName("ObjectiveGuid")
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
                .HasComment("Short textual description of the objective for use in frontend dropdowns.");

        entity.Property(e => e.Description)
                 .HasColumnType("nvarchar")
                 .HasMaxLength(400)
                 .HasComment("Extended description of the objective for future use and ensuring the objective is well explained in the event it's label is unhelpful.");

        DropdownOption.Setup(entity);
    }
}