using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class YearView
	{
		public Guid Guid { get; set; }
		public short SchoolYear { get; set; }
		public Quarter Quarter { get; set; }
		//Add other attributes as needed

		public static YearView FromDatabase(Year year) => new()
		{
			Guid = year.YearGuid,
			SchoolYear = year.SchoolYear,
			Quarter = year.Quarter
		};
	}

	public class OrganizationView
	{
		public Guid Guid { get; set; }
		public string Name { get; set; }

		public List<OrganizationYearView> OrganizationYears { get; set; }

		public static OrganizationView FromDatabase(Organization organization) => new()
		{
			Guid = organization.OrganizationGuid,
			Name = organization.Name,
			OrganizationYears = organization.Years == null ? new List<OrganizationYearView>() : organization.Years.Select(OrganizationYearView.FromDatabase).ToList()
		};
	}

	public class OrganizationYearView
	{
		public Guid Guid { get; set; }
		public YearView Year { get; set; }
		public OrganizationView Organization { get; set; }

		public static OrganizationYearView FromDatabase(OrganizationYear organizationYear) => new()
		{
			Guid = organizationYear.OrganizationYearGuid,
			Year = YearView.FromDatabase(organizationYear.Year),
			Organization = new()
			{
				Guid = organizationYear.Organization.OrganizationGuid,
				Name = organizationYear.Organization.Name
			}
		};
	}
}
