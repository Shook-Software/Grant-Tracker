using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema;

public class OrganizationBlackoutDate
{
    public Guid Guid { get; set; } = Guid.NewGuid();
    public Guid OrganizationGuid { get; set; }
    public Organization Organization { get; set; }
    public DateOnly Date { get; set; }

    public static void Setup(ModelBuilder builder)
    {
        var entity = builder.Entity<OrganizationBlackoutDate>();

        entity.ToTable("OrganizationBlackoutDate", "GTkr", t => t.HasComment("A date where no attendance is expected to be entered, removing it from attendance lists, attendance check report, and possibly other functionalities."))
            .HasKey(e => e.Guid);

        entity.HasIndex(e => new { e.OrganizationGuid, e.Date })
            .IsUnique();

        entity.HasOne(e => e.Organization)
            .WithMany(e => e.BlackoutDates)
            .HasForeignKey(e => e.OrganizationGuid)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
