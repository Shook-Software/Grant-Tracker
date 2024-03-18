namespace GrantTracker.Dal.Models.Dto.Attendance;

public class AttendanceInputConflict
{
    public Guid StudentSchoolYearGuid { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly ExitTime { get; set; }
}
