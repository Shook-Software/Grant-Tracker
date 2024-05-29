namespace GrantTracker.Dal.Models.DTO.Attendance;


public enum AttendanceIssue
{
    Conflict,
    Malformed
}

public class AttendanceIssueDTO
{
    public Guid AttendanceGuid { get; set; }
    public Guid SessionGuid { get; set; }
    public DateOnly InstanceDate { get; set; }
    public string SessionName { get; set; }
    public AttendanceIssue Type { get; set; }
    public string Message { get; set; }
}
