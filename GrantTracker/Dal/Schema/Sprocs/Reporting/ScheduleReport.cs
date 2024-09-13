namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public record ScheduleReport
{
    public string School { get; set; }
    public string ClassName { get; set; }
    public string Activity { get; set; }
    public string Objective { get; set; }
    public string SessionType { get; set; }
    public string DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}
