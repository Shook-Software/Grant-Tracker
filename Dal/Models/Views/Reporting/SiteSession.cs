namespace GrantTracker.Dal.Models.Views.Reporting;

public class SiteSessionDbModel
{
	public string OrganizationName { get; set; }
	public string SessionName { get; set; }
	public string ActivityType { get; set; }
	public string Objective { get; set; }
	public string SessionType { get; set; }
	public string FundingSource { get; set; }
	public string PartnershipType { get; set; }
	public string OrganizationType { get; set; }
	public string Grades { get; set; }
	public string InstructorFirstName { get; set; }
	public string InstructorLastName { get; set; }
	public string InstructorStatus { get; set; }
	public DateOnly InstanceDate { get; set; }
	public int AttendeeCount { get; set; }
}

public class SiteSessionViewModel
{
	public class InstructorViewModel
	{
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string Status { get; set; }
	}

	public string OrganizationName { get; set; }
	public string SessionName { get; set; }
	public string ActivityType { get; set; }
	public string Objective { get; set; }
	public string SessionType { get; set; }
	public string FundingSource { get; set; }
	public string PartnershipType { get; set; }
	public string OrganizationType { get; set; }
	public string Grades { get; set; }
	public List<InstructorViewModel> Instructors { get; set; }
	public DateOnly InstanceDate { get; set; }
	public int AttendeeCount { get; set; }
}
