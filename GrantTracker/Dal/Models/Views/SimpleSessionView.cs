using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class SessionErrorMessage
	{
		public string Message { get; set; }
		public Guid SessionGuid { get; set; }
	}

	public class StudentRegistrationDTO
	{
		public List<Guid> DayScheduleGuids { get; set; }
		public Guid StudentSchoolYearGuid { get; set; }
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
		public List<DropdownOption> Objectives { get; set; }
        public DateOnly FirstSessionDate { get; set; }
        public DateOnly LastSessionDate { get; set; }
		public List<InstructorView> Instructors { get; set; }
		public List<DayScheduleView> DaySchedules { get; set; }
		public List<GradeView> SessionGrades { get; set; }

		public static SimpleSessionView FromDatabase(Session session) => new()
		{
			SessionGuid = session.SessionGuid,
			Name = session.Name,
			OrganizationYear = OrganizationYearView.FromDatabase(session.OrganizationYear),
			SessionType = DropdownOption.FromDatabase(session.SessionType),
			Activity = DropdownOption.FromDatabase(session.Activity),
			Objectives = session.SessionObjectives.Select(so => DropdownOption.FromDatabase(so.Objective)).OrderBy(x => x.Abbreviation).ToList(),
			FirstSessionDate = session.FirstSession,
			LastSessionDate = session.LastSession,
			Instructors = session.InstructorRegistrations.Select(ir => new InstructorView()
			{
				Guid = ir.InstructorSchoolYear.InstructorGuid,
				FirstName = ir.InstructorSchoolYear.Instructor.FirstName,
                LastName = ir.InstructorSchoolYear.Instructor.LastName,
				BadgeNumber = ir.InstructorSchoolYear.Instructor.BadgeNumber,
            }).ToList(),
			DaySchedules = session.DaySchedules.Select(DayScheduleView.FromDatabase).ToList(),
			SessionGrades = session.Grades.Select(GradeView.FromDatabase).ToList()
		};
	}
}
