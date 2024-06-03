using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema;

public class SessionBlackoutDate
{
    public Guid Guid { get; set; } = Guid.NewGuid();
    public Guid SessionGuid { get; set; }
    public Session Session { get; set; }
    public DateOnly Date { get; set; }

    public static void Setup(ModelBuilder builder)
    {
        var entity = builder.Entity<SessionBlackoutDate>();

        entity.ToTable("SessionBlackoutDates", "GTkr", t => t.HasComment("A date where no attendance is expected to be entered, removing it from attendance lists, attendance check report, and possibly other functionalities."))
            .HasKey(e => e.Guid);

        entity.HasIndex(e => new { e.SessionGuid, e.Date })
            .IsUnique();

        entity.HasOne(e => e.Session)
            .WithMany(e => e.BlackoutDates)
            .HasForeignKey(e => e.SessionGuid)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
