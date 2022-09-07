namespace GrantTracker.Dal.EmployeeDb
{
	public partial class Employee
	{
		public string EmployeeId { get; set; }
		public string SamAccountName { get; set; }
		public string EmailAddress { get; set; }
		public string LocationCode { get; set; }
		public string Sn { get; set; }
		public string GivenName { get; set; }
		public string MiddleName { get; set; }
		public string Domain { get; set; }
		public string Title { get; set; }
		public string Department { get; set; }
	}
}