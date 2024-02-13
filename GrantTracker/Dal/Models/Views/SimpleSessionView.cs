using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class SessionErrorMessage
	{
		public string Message { get; set; }
		public Guid SessionGuid { get; set; }
	}

	public class StudentRegistrationDto
	{
		public Guid YearGuid { get; set; }
		public List<Guid> DayScheduleGuids { get; set; }
		public StudentDto Student { get; set; }
	}

	public class TimeScheduleView
	{
		public string Guid { get; set; }
		public TimeOnly StartTime { get; set; }
		public TimeOnly EndTime { get; set; }

		public static TimeScheduleView FromDatabase(SessionTimeSchedule time)
		{
			return new TimeScheduleView()
			{
				Guid = time.SessionTimeGuid.ToString(),
				StartTime = time.StartTime,
				EndTime = time.EndTime
			};
		}
	}

	public class DayScheduleView
	{
		public Guid DayScheduleGuid { get; set; }
		public Guid SessionGuid { get; set; }
		public DayOfWeek DayOfWeek { get; set; }
		public List<TimeScheduleView> TimeSchedules { get; set; }

		public static DayScheduleView FromDatabase(SessionDaySchedule sds)
		{
			return new DayScheduleView()
			{
				DayScheduleGuid = sds.SessionDayGuid,
				SessionGuid = sds.SessionGuid,
				DayOfWeek = sds.DayOfWeek,
				TimeSchedules = sds.TimeSchedules != null ? sds.TimeSchedules.Select(t => TimeScheduleView.FromDatabase(t)).ToList() : null
			};
		}
	}

	public class SimpleSessionView
	{
		public Guid SessionGuid { get; set; }
		public string Name { get; set; }
		public OrganizationYearView OrganizationYear { get; set; }
		public DropdownOption SessionType { get; set; }
		public DropdownOption Activity { get; set; }
		public bool Recurring { get; set; } = false;
		public List<DayScheduleView> DaySchedules { get; set; }
		public List<GradeView> SessionGrades { get; set; }

		public static SimpleSessionView FromDatabase(Session session) => new()
		{
			SessionGuid = session.SessionGuid,
			Name = session.Name,
			OrganizationYear = OrganizationYearView.FromDatabase(session.OrganizationYear),
			SessionType = DropdownOption.FromDatabase(session.SessionType),
			Activity = DropdownOption.FromDatabase(session.Activity),
			Recurring = session.Recurring,
			DaySchedules = session.DaySchedules.Select(DayScheduleView.FromDatabase).ToList(),
			SessionGrades = session.SessionGrades.Select(GradeView.FromDatabase).ToList()
		};
	}
}
