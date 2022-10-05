using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class AttendanceRecordView
	{
		public Guid Guid { get; set; }
		public Guid SessionGuid { get; set; }
		public string SessionName { get; set; }
		public short MinutesAttended { get; set; }
		public DateOnly InstanceDate { get; set; }
	}

	public class StatusView
	{
		public Guid Guid { get; set; }
		public string Abbreviation { get; set; }
		public string Label { get; set; }
		public string Description { get; set; }

		public static StatusView FromDatabase(InstructorStatus status) => new()
		{
			Guid = status.Guid,
			Abbreviation = status.Abbreviation,
			Label = status.Label,
			Description = status.Description
		};
	}

	public class InstructorView
	{
		public Guid Guid { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string BadgeNumber { get; set; }

		public static InstructorView FromDatabase(Instructor instructor) => new()
		{
			Guid = instructor.PersonGuid,
			FirstName = instructor.FirstName,
			LastName = instructor.LastName,
			BadgeNumber = instructor.BadgeNumber
		};
	}

	public class InstructorSchoolYearViewModel
	{
		public Guid Guid { get; set; }
		public InstructorView Instructor { get; set; }
		public YearView Year { get; set; }
		public string OrganizationName { get; set; }
		public short SchoolYear { get; set; }
		public Quarter Quarter { get; set; }
		public StatusView Status { get; set; }
		public List<OrganizationView> Organizations { get; set; } //populate years with only whichever this staff member has
		public List<EnrollmentView> EnrollmentRecords { get; set; }
		public List<AttendanceRecordView> AttendanceRecords { get; set; }

		public static InstructorSchoolYearViewModel FromDatabase(InstructorSchoolYear instructorSchoolYear, List<OrganizationYear> organizationYears = null) => new()
		{
			Guid = instructorSchoolYear.InstructorSchoolYearGuid,
			Instructor = InstructorView.FromDatabase(instructorSchoolYear.Instructor),
			Year = instructorSchoolYear.OrganizationYear != null ? YearView.FromDatabase(instructorSchoolYear.OrganizationYear.Year) : null,
			OrganizationName = instructorSchoolYear.OrganizationYear?.Organization?.Name,
			Status = StatusView.FromDatabase(instructorSchoolYear.Status),
			Organizations = organizationYears?
				.GroupBy(oy => oy.OrganizationGuid)
				.Select(oy => new OrganizationView
				{
					Guid = oy.Key,
					Name = oy.First().Organization.Name,
					OrganizationYears = oy.Select(OrganizationYearView.FromDatabase).ToList()
				})
				.ToList(),
			EnrollmentRecords = instructorSchoolYear
				.SessionRegistrations?
				.Select(reg => EnrollmentView.FromDatabase(reg))
				.ToList()
		};
	}
}
