namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public class PayrollAuditDb
{
    public Guid SessionGuid { get; set; }
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
    public Guid SessionGuid { get; set; }
    public string School { get; set; }
    public string ClassName { get; set; }
    public DateOnly InstanceDate { get; set; }
    public List<Instructor> RegisteredInstructors { get; set; }
    public List<PayrollAuditInstructorRecord> AttendingInstructorRecords { get; set; }
}

//Todo: Refactor all these instructor/person/time record whatevers into proper relations with inheritence and composition
public class Instructor
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
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