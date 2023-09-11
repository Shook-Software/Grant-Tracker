using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class UserIdentityView
	{
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string BadgeNumber { get; set; }
		public IdentityClaim Claim { get; set; }
		public Guid OrganizationYearGuid { get; set; }

		//initial org and year for the current schoolYear
		public OrganizationView Organization { get; set; }
		public YearView Year { get; set; }
	}
}
