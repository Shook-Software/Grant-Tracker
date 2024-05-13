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
public class SessionObjectiveComparer : IEqualityComparer<SessionObjective>
{
    public bool Equals(SessionObjective x, SessionObjective y)
    {
        if (x == null && y == null)
            return true;
        if (x == null || y == null)
            return false;
        return x.SessionGuid == y.SessionGuid && x.ObjectiveGuid == y.ObjectiveGuid;
    }

    public int GetHashCode(SessionObjective obj)
    {
        int hashSessionGuid = obj.SessionGuid.GetHashCode();
        int hashObjectiveGuid = obj.ObjectiveGuid.GetHashCode();
        return hashSessionGuid ^ hashObjectiveGuid;  // XOR for combining the two hash codes
    }
}