namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public record FamilySessionRow
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string MatricNumber { get; set; }
    public string Grade { get; set; }
    public string Relationship { get; set; }
    public string Session { get; set; }
    public string Date { get; set; }
    public string SessionType { get; set; }
    public string TotalTime { get; set; }
    public string School { get; set; }
    public string Activity { get; set; }
    public string FamilyEngagementCategory { get; set; }
}
