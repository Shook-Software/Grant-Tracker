using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Dto
{
	public class UserIdentity
	{
		public Guid UserGuid { get; set; }
		public Guid UserOrganizationYearGuid { get; set; }
		public Guid OrganizationYearGuid { get; set; }

		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string BadgeNumber { get; set; }
		public IdentityClaim Claim { get; set; }

		//initial org and year for the current schoolYear
		public OrganizationView Organization { get; set; }
		public OrganizationYearView OrganizationYear { get; set; }
	}
}