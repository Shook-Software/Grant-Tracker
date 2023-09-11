namespace GrantTracker.Dal.Models.Views.Reporting;

public class TotalStudentAttendanceViewModel
{
	public string OrganizationName { get; set; }
	public string MatricNumber { get; set; }
	public string FirstName { get; set; }
	public string LastName { get; set; }
	public string Grade { get; set; }
	public int TotalDays { get; set; }
	public double TotalHours { get; set; }
}
