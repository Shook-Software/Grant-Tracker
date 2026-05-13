namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public record FamilySessionRow
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string MatricNumber { get; set; }
    public string Grade { get; set; }
    public string FamilyMember { get; set; }
    public string SessionName { get; set; }
    public string SessionDate { get; set; }
    public string SessionType { get; set; }
    public string TotalTime { get; set; }
    public string Site { get; set; }
}
