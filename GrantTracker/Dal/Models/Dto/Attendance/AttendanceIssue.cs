namespace GrantTracker.Dal.Models.Dto.Attendance;



public class AttendanceIssueDTO
{
    public Guid StudentGuid { get; set; }
    public Guid StudentSchoolYearGuid { get; set; }
    public Guid AttendanceGuid { get; set; }
    public Guid SessionGuid { get; set; }
    public DateOnly InstanceDate { get; set; }
    public string SessionName { get; set; }
}
