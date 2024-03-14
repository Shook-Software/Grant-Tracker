namespace GrantTracker.Dal.Models.Dto.Attendance;

public class AttendanceInputConflict
{
    public Guid StudentSchoolYearGuid { get; set; }
    public string Error { get; set; }
}
