using GrantTracker.Dal.EmployeeDb;

namespace GrantTracker.Dal.Models.Dto
{
	//from employee database
	public class EmployeeDto
	{
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string BadgeNumber { get; set; }
		public string OrganizationName { get; set; }

		public static EmployeeDto FromDatabase(Employee employee) => new()
		{
			FirstName = employee.GivenName,
			LastName = employee.Sn,
			OrganizationName = employee.Department,
			BadgeNumber = employee.EmployeeId
		};
	}
}