namespace GrantTracker.Dal.Models.Views.Reporting;

public class StaffSummaryDbModel
{
	public string OrganizationName { get; set; }
	public Guid InstructorSchoolYearGuid { get; set; }
	public string Status { get; set; }
	public string FirstName { get; set; }
	public string LastName { get; set; }
}

public class StaffSummaryViewModel
{
	public class InstructorViewModel
	{
		public Guid InstructorSchoolYearGuid { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
	}

	public string OrganizationName { get; set; }
	public string Status { get; set; }
	public List<InstructorViewModel> Instructors { get; set; }
}
