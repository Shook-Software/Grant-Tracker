namespace GrantTracker.Dal.Models.Dto.Attendance;

public class AttendanceConflict
{
    public Guid StudentSchoolYearGuid { get; set; }
    public string Error { get; set; }
}
