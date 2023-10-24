namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public class TotalActivityViewModel
{
    public string OrganizationName { get; set; }
    public string Activity { get; set; }
    public int TotalAttendees { get; set; }
    public double TotalHours { get; set; }
}
