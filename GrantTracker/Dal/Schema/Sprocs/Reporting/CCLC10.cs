namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public class CCLC10ViewModel
{
    public string School { get; set; }
    public string MatricNumber { get; set; }
    public string Grade { get; set; }
    public string LastName { get; set; }
    public string FirstName { get; set; }
    public string Session { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string Activity { get; set; }
}