using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class SessionView
	{
		public Guid Guid { get; set; }
		public string Name { get; set; }
		public DateOnly FirstSession { get; set; }
		public DateOnly LastSession { get; set; }
		public bool Recurring { get; set; } = false;
		public OrganizationYearView OrganizationYear { get; set; }
		public DropdownOption SessionType { get; set; }
		public DropdownOption Activity { get; set; }
		public DropdownOption Objective { get; set; }
		public DropdownOption FundingSource { get; set; }
		public DropdownOption OrganizationType { get; set; }
		public DropdownOption PartnershipType { get; set; }

		public List<DayScheduleView> DaySchedules { get; set; }
		public List<InstructorSchoolYearViewModel> Instructors { get; set; }
		public List<GradeView> SessionGrades { get; set; }

		public static SessionView FromDatabase(Session session) => new()
		{
			Guid = session.SessionGuid,
			Name = session.Name,
			FirstSession = session.FirstSession,
			LastSession = session.LastSession,
			Recurring = session.Recurring,
			OrganizationYear = OrganizationYearView.FromDatabase(session.OrganizationYear),
			SessionType = DropdownOption.FromDatabase(session.SessionType),
			Activity = DropdownOption.FromDatabase(session.Activity),
			Objective = DropdownOption.FromDatabase(session.Objective),
			FundingSource = DropdownOption.FromDatabase(session.FundingSource),
			OrganizationType = DropdownOption.FromDatabase(session.OrganizationType),
			PartnershipType = DropdownOption.FromDatabase(session.PartnershipType),
			DaySchedules = session.DaySchedules.Select(d => DayScheduleView.FromDatabase(d)).ToList(),
			Instructors = session.InstructorRegistrations.Select(reg => InstructorSchoolYearViewModel.FromDatabase(reg.InstructorSchoolYear)).ToList(),
			SessionGrades = session.SessionGrades.Select(GradeView.FromDatabase).ToList()
		};
	}

	public class StudentRegistrationView
	{
		public Guid SessionGuid { get; set; }
		public string SessionName { get; set; }
		public StudentSchoolYearViewModel StudentSchoolYear { get; set; }
		public DayScheduleView DaySchedule { get; set; }

		public static StudentRegistrationView FromDatabase(StudentRegistration registration) => new()
		{
			SessionGuid = registration.DaySchedule?.SessionGuid ?? Guid.Empty,
			StudentSchoolYear = StudentSchoolYearViewModel.FromDatabase(registration.StudentSchoolYear),
			SessionName = registration.DaySchedule?.Session?.Name,
			DaySchedule = registration.DaySchedule != null ? DayScheduleView.FromDatabase(registration.DaySchedule) : null
		};
	}
}
