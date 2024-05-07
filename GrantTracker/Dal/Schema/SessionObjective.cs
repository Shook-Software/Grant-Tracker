using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema;

public class SessionObjective
{
    public Guid SessionGuid { get; set; }
    public Guid ObjectiveGuid { get; set; }
    public virtual Session Session { get; set; }
    public virtual Objective Objective { get; set; }

    public static void Setup(ModelBuilder builder)
    {
        var entity = builder.Entity<SessionObjective>();

        entity.ToTable("SessionObjective", "GTkr")
            .HasComment("Many to many mapping for session objectives.")
            .HasKey(x => new { x.SessionGuid, x.ObjectiveGuid });
    }

    //What's left to do is create the MIGRATION
    //and then modify the back and front end to accomodate the new relationships
}
