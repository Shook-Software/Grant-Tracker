namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public class AttendanceCheckDbModel
{
    public Guid SessionGuid { get; set; }
    public DateOnly InstanceDate { get; set; }
}

public class AttendanceCheckViewModel
{
    public Guid SessionGuid { get; set; }
    public DateOnly InstanceDate { get; set; }
    public Guid OrganizationGuid { get; set; }
    public string School { get; set; }
    public string ClassName { get; set; }
    public bool AttendanceEntry { get; set; }
    public List<AttendanceCheckTimeRecord> TimeBounds { get; set; }
    public List<AttendanceCheckInstructor> Instructors { get; set; }
}

public class AttendanceCheckInstructor
{
    public Guid InstructorSchoolYearGuid { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}

public class AttendanceCheckTimeRecord
{
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}