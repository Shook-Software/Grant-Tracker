namespace GrantTracker.Dal.Models.Views.Reporting;

public class AttendanceCheckDbModel
{
    public string DayOfWeek { get; set; }
    public Guid SessionGuid { get; set; }
    public Guid AttendanceGuid { get; set; }
    public Guid? InstructorAttendanceGuid { get; set; }
    public DateOnly InstanceDate { get; set; }
    public string School { get; set; }
    public string? InstructorFirstName { get; set; }
    public string? InstructorLastName { get; set; }
    public string ClassName { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public char AttendanceEntry { get; set; }
}

public class AttendanceCheckViewModel
{
    public string DayOfWeek { get; set; }
    public Guid SessionGuid { get; set; }
    public DateOnly InstanceDate { get; set; }
    public string School { get; set; }
    public List<AttendanceCheckInstructor> InstructorAttendance { get; set; }
    public string ClassName { get; set; }
    public char AttendanceEntry { get; set; }
}

public class AttendanceCheckSession
{
    public Guid SessionGuid { get; set; }
    public string SessionName { get; set; }
}

public class AttendanceCheckInstructor
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public List<AttendanceCheckInstructorTime> AttendanceTimes { get; set; }
}

public class AttendanceCheckInstructorTime
{
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}