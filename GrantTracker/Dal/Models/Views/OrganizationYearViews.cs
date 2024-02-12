using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class YearView
	{
		public Guid Guid { get; set; }
		public short SchoolYear { get; set; }
		public Quarter Quarter { get; set; }
		public DateOnly StartDate { get; set; }
		public DateOnly EndDate { get; set; }
		public bool IsCurrentYear { get; set; }
		//Add other attributes as needed

		public static YearView? FromDatabase(Year? year) 
		{
			if (year is null)
				return null;

			return new()
			{
				Guid = year.YearGuid,
				SchoolYear = year.SchoolYear,
				Quarter = year.Quarter,
				StartDate = year.StartDate,
				EndDate = year.EndDate,
				IsCurrentYear = year.IsCurrentSchoolYear
			};
		}
	}

	public class OrganizationView
	{
		public Guid Guid { get; set; }
		public string Name { get; set; }

		public List<OrganizationYearView> OrganizationYears { get; set; }

		public static OrganizationView? FromDatabase(Organization? organization)
		{
			if (organization is null)
				return null;

			return new()
			{
				Guid = organization.OrganizationGuid,
				Name = organization.Name
			};
		}
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
			Organization = OrganizationView.FromDatabase(organizationYear.Organization)
		};
	}
}
