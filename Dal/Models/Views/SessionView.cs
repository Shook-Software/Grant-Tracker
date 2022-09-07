using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{

	public class GradeView
	{
		public Guid Guid { get; set; }
		public Guid SessionGuid { get; set; }
		public Guid GradeGuid { get; set; }
		public LookupValue Grade { get; set; }
		public static GradeView FromDatabase(SessionGrade grade)
		{
			return new()
			{
				Guid = grade.Guid,
				SessionGuid = grade.SessionGuid,
				GradeGuid = grade.GradeGuid,
				Grade = grade.Grade
			};
		}
	}

	public class SessionView
	{
		public Guid Guid { get; set; }
		public string Name { get; set; }
		public DateOnly FirstSession { get; set; }
		public DateOnly LastSession { get; set; }
		public bool Recurring { get; set; } = false;
		public Organization Organization { get; set; }
		public SessionType SessionType { get; set; }
		public Activity Activity { get; set; }
		public Objective Objective { get; set; }
		public FundingSource FundingSource { get; set; }
		public OrganizationType OrganizationType { get; set; }
		public PartnershipType PartnershipType { get; set; }

		public List<DayScheduleView> DaySchedules { get; set; }
		public List<InstructorSchoolYearView> Instructors { get; set; }
		public List<SessionGrade> SessionGrades { get; set; }

		public static SessionView FromDatabase(Session session) => new()
		{
			Guid = session.SessionGuid,
			Name = session.Name,
			FirstSession = session.FirstSession,
			LastSession = session.LastSession,
			Recurring = session.Recurring,
			Organization = session.OrganizationYear?.Organization,
			SessionType = session.SessionType,
			Activity = session.Activity,
			Objective = session.Objective,
			FundingSource = session.FundingSource,
			OrganizationType = session.OrganizationType,
			PartnershipType = session.PartnershipType,
			DaySchedules = session.DaySchedules.Select(d => DayScheduleView.FromDatabase(d)).ToList(),
			Instructors = session.InstructorRegistrations.Select(reg => InstructorSchoolYearView.FromDatabase(reg.InstructorSchoolYear)).ToList(),
			SessionGrades = session.SessionGrades.ToList()
		};
	}

	public class StudentRegistrationView
	{
		public Guid SessionGuid { get; set; }
		public string SessionName { get; set; }
		public StudentSchoolYearView StudentSchoolYear { get; set; }
		public DayScheduleView DaySchedule { get; set; }

		public static StudentRegistrationView FromDatabase(StudentRegistration registration) => new()
		{
			SessionGuid = registration.DaySchedule?.SessionGuid ?? Guid.Empty,
			StudentSchoolYear = StudentSchoolYearView.FromDatabase(registration.StudentSchoolYear),
			SessionName = registration.DaySchedule?.Session?.Name,
			DaySchedule = registration.DaySchedule != null ? DayScheduleView.FromDatabase(registration.DaySchedule) : null
		};
	}
}
