namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public class StudentSurveyViewModel
{
    public string OrganizationName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string MatricNumber { get; set; }
    public string Grade { get; set; }
    public string Objective { get; set; }
    public int TotalDays { get; set; }
    public double TotalHours { get; set; }
}
