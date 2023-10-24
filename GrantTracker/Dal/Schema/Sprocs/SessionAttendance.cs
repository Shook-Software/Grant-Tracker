namespace GrantTracker.Dal.Schema.Sprocs;

public class SessionAttendance
{
    public Guid SessionGuid { get; set; }
    public DateOnly InstanceDate { get; set; }
}
