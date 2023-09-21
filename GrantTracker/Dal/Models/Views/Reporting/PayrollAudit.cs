namespace GrantTracker.Dal.Models.Views.Reporting;

public class PayrollAuditDb
{
    public string School { get; set; }
    public string ClassName { get; set; }
    public DateOnly InstanceDate { get; set; }
    public Guid InstructorSchoolYearGuid { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public bool IsSubstitute { get; set; }
    public TimeOnly EntryTime { get; set; }
    public TimeOnly ExitTime { get; set; }
}

public class PayrollAuditView
{
    public string School { get; set; }
    public string ClassName { get; set; }
    public DateOnly InstanceDate { get; set; }
    public List<PayrollAuditInstructorRecord> InstructorRecords { get; set; }
}

public class PayrollAuditInstructorRecord
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public bool IsSubstitute { get; set; }
    public List<PayrollAuditTimeRecord> TimeRecords { get; set; }
    public double TotalTime => TimeRecords.Sum(x => (x.EndTime - x.StartTime).TotalMinutes);
}

public class PayrollAuditTimeRecord
{
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}