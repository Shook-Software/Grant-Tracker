using DocumentFormat.OpenXml.Drawing;

namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public class PayrollAuditDb
{
    public Guid SessionGuid { get; set; }
    public Guid AttendanceGuid { get; set; }
    public string School { get; set; }
    public string ClassName { get; set; }
    public string Activity { get; set; }
    public DateOnly InstanceDate { get; set; }
    public Guid InstructorSchoolYearGuid { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public TimeOnly EntryTime { get; set; }
    public TimeOnly ExitTime { get; set; }
    public int TotalAttendees { get; set; }
}

public class PayrollAuditView
{
    public Guid SessionGuid { get; set; }
    public Guid AttendanceGuid { get; set; }
    public string School { get; set; }
    public string ClassName { get; set; }
    public string Activity { get; set; }
    public DateOnly InstanceDate { get; set; }
    public int TotalAttendees { get; set; }
    public List<PayrollAuditInstructorRecord> AttendingInstructorRecords { get; set; }
}

public class PayrollAuditInstructorRecord
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public List<PayrollAuditTimeRecord> TimeRecords { get; set; }
    public string TotalTime
    {
        get
        {
            var totalTime = TimeRecords.Aggregate(new TimeSpan(), (acc, tr) => acc + (tr.EndTime - tr.StartTime));
            return $"{totalTime.Hours}:{totalTime.Minutes}{(totalTime.Minutes >= 10 ? "" : 0)}";
        } 
    }
}

public class PayrollAuditTimeRecord
{
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string TotalTime => $"{(EndTime - StartTime).Hours}:{(EndTime - StartTime).Minutes}{((EndTime - StartTime).Minutes >= 10 ? "" : 0)}";
}