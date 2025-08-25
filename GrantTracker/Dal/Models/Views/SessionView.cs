using GrantTracker.Dal.Models.DTO;
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
		public List<DropdownOption> Objectives { get; set; }
		public List<SessionBlackoutDate> BlackoutDates { get; set; }

		public static SessionView FromDatabase(Session session) => new()
		{
			Guid = session.SessionGuid,
			Name = session.Name,
			FirstSession = session.FirstSession,
			LastSession = session.LastSession,
			OrganizationYear = OrganizationYearView.FromDatabase(session.OrganizationYear),
			SessionType = DropdownOption.FromDatabase(session.SessionType),
			Activity = DropdownOption.FromDatabase(session.Activity),
			FundingSource = DropdownOption.FromDatabase(session.FundingSource),
			OrganizationType = DropdownOption.FromDatabase(session.OrganizationType),
			PartnershipType = DropdownOption.FromDatabase(session.PartnershipType),
			DaySchedules = session.DaySchedules.Select(d => DayScheduleView.FromDatabase(d)).ToList(),
			Instructors = session.InstructorRegistrations.Select(reg => InstructorSchoolYearViewModel.FromDatabase(reg.InstructorSchoolYear)).ToList(),
			SessionGrades = session.Grades.Select(GradeView.FromDatabase).ToList(),
            Objectives = session.SessionObjectives
				.Select(x => DropdownOption.FromDatabase(x.Objective))
				.ToList(),
			BlackoutDates = session.BlackoutDates.Select(blackout => new SessionBlackoutDate()
				{
					Date = blackout.Date,
				})
				.OrderByDescending(blackout => blackout.Date)
				.ToList()
        };
	}

	public class StudentRegistrationView
	{
		public Guid SessionGuid { get; set; }
		public string SessionName { get; set; }
		public StudentSchoolYearViewModel StudentSchoolYear { get; set; }
		public List<DayScheduleView> Schedule { get; set; }

		public static StudentRegistrationView FromDatabase(Guid SessionGuid, string SessionName, StudentSchoolYear ssy, List<SessionDaySchedule> schedule) => new()
		{
			SessionGuid = SessionGuid,
            SessionName = SessionName,
            StudentSchoolYear = ssy is not null ? StudentSchoolYearViewModel.FromDatabase(ssy) : null,
            Schedule = schedule.Select(day => DayScheduleView.FromDatabase(day)).ToList()
		};
	}
}
