using GrantTracker.Dal.Models.Dto.Attendance;
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
		public List<AttendanceGoalDTO> AttendanceGoals { get; set; }

		public static OrganizationView? FromDatabase(Organization? organization)
		{
			if (organization is null)
				return null;

			return new()
			{
				Guid = organization.OrganizationGuid,
				Name = organization.Name,
				OrganizationYears = organization.Years.Select(oy =>
				{
					oy.Organization = null;
					oy.Year.Organizations = new();
					return OrganizationYearView.FromDatabase(oy);
				}).ToList(),
				AttendanceGoals = organization.AttendanceGoals?.Select(ag => new AttendanceGoalDTO()
				{
					Guid = ag.Guid,
					StartDate = ag.StartDate,
					EndDate = ag.EndDate,
					RegularAttendees = ag.RegularAttendeeCountThreshold
				}).ToList() ?? []
			};
		}
	}

	public class OrganizationYearView
	{
		public Guid Guid { get; set; }
		public YearView Year { get; set; }
		public OrganizationView Organization { get; set; }

		public static OrganizationYearView FromDatabase(OrganizationYear organizationYear)
		{
			if (organizationYear.Year is not null) 
				organizationYear.Year.Organizations = [];

			if (organizationYear.Organization is not null)
				organizationYear.Organization.Years = [];

			return new()
			{
				Guid = organizationYear.OrganizationYearGuid,
				Year = YearView.FromDatabase(organizationYear.Year),
				Organization = OrganizationView.FromDatabase(organizationYear.Organization)
			};
		}
	}
}
