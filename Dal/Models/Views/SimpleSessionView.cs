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
		public List<Guid> DayScheduleGuids { get; set; }
		public StudentDto Student { get; set; }
	}

	public class TimeScheduleView
	{
		public TimeOnly StartTime { get; set; }
		public TimeOnly EndTime { get; set; }

		public static TimeScheduleView FromDatabase(SessionTimeSchedule time)
		{
			return new TimeScheduleView()
			{
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
		public SessionType SessionType { get; set; }
		public Activity Activity { get; set; }
		public bool Recurring { get; set; } = false;
		public List<DayScheduleView> DaySchedules { get; set; }
		public List<SessionGrade> SessionGrades { get; set; }

		public static SimpleSessionView FromDatabase(Session session) => new()
		{
			SessionGuid = session.SessionGuid,
			Name = session.Name,
			SessionType = session.SessionType,
			Activity = session.Activity,
			Recurring = session.Recurring,
			DaySchedules = session.DaySchedules.Select(DayScheduleView.FromDatabase).ToList(),
			SessionGrades = session.SessionGrades.ToList()
		};
	}
}
