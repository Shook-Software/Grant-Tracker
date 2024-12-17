namespace GrantTracker.Dal.Models.Dto.Attendance;

public class AttendanceGoalDTO
{
    public Guid Guid { get; set; }
    public Guid OrganizationGuid { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int RegularAttendees { get; set; }
}
