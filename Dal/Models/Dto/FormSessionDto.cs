using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Dto
{
	public class FormSessionDto
	{
		public Session ToDbSession()
		{
			return new Session()
			{
				SessionGuid = Guid,
				OrganizationYearGuid = OrganizationYearGuid,
				Name = Name,
				SessionTypeGuid = Type,
				ActivityGuid = Activity,
				ObjectiveGuid = Objective,
				FundingSourceGuid = FundingSource,
				OrganizationTypeGuid = OrganizationType,
				PartnershipTypeGuid = PartnershipType,
				FirstSession = FirstSessionDate,
				LastSession = LastSessionDate,
				Recurring = Recurring
			};
		}

		public List<TempDaySchedule> GetDaySchedule()
		{
			if (Recurring)
			{
				return Scheduling
				.Where(daySchedule => daySchedule.Recurs)
				.Select(daySchedule => new TempDaySchedule()
				{
					SessionDayGuid = daySchedule.Guid,
					SessionGuid = Guid,
					DayOfWeek = Enum.Parse<DayOfWeek>(daySchedule.DayOfWeek),
					TimeSchedulesTemp = daySchedule.TimeSchedules.Select(s => new SessionTimeSchedule()
					{
						SessionDayGuid = daySchedule.Guid,
						StartTime = s.StartTime,
						EndTime = s.EndTime
					}).ToList()
				})
				.ToList();
			}
			//else
			return new List<TempDaySchedule>();
		}

		public List<SessionTimeSchedule> GetTimeSchedule()
		{
			if (!Recurring)
			{
				return new List<SessionTimeSchedule>();
				/*var daySchedule = Scheduling.Where(s => s.TimeSchedules.Count != 0).SingleOrDefault();
				return daySchedule.TimeSchedules
					.Select(timeSchedule => new SessionTimeSchedule()
					{
						SessionTimeGuid = timeSchedule.Guid,
						StartTime = timeSchedule.StartTime,
						EndTime = timeSchedule.EndTime
					})
					.ToList();
				*/
			}

			var Schedule = Scheduling
				.Where(daySchedule => daySchedule.Recurs)
				.ToList();

			List<SessionTimeSchedule> timeSchedules = new();

			foreach (DaySchedule daySchedule in Schedule)
			{
				foreach (TimeSchedule timeSchedule in daySchedule.TimeSchedules)
				{
					SessionTimeSchedule newTimeSchedule = new()
					{
						SessionTimeGuid = timeSchedule.Guid,
						SessionDayGuid = daySchedule.Guid,
						StartTime = timeSchedule.StartTime,
						EndTime = timeSchedule.EndTime
					};
					timeSchedules.Add(newTimeSchedule);
				}
			}

			return timeSchedules;
		}

		public List<SessionGrade> GetGrades()
		{
			return Grades
				.Select(grade => new SessionGrade()
				{
					Guid = Guid.NewGuid(),
					SessionGuid = Guid,
					GradeGuid = grade
				})
				.ToList();
		}

		public List<InstructorRegistration> GetInstructors()
		{
			return Instructors
				.Select(guid => new InstructorRegistration()
				{
					SessionGuid = Guid,
					InstructorSchoolYearGuid = guid
				})
				.ToList();
		}

		public Guid Guid { get; set; } = Guid.NewGuid();
		public string Name { get; set; }
		public Guid OrganizationYearGuid { get; set; }
		public Guid Type { get; set; }
		public Guid Activity { get; set; }
		public Guid Objective { get; set; }
		public Guid FundingSource { get; set; }
		public Guid OrganizationType { get; set; }
		public Guid PartnershipType { get; set; }
		public DateOnly FirstSessionDate { get; set; }
		public DateOnly LastSessionDate { get; set; }
		public bool Recurring { get; set; }
		public List<DaySchedule> Scheduling { get; set; }
		public List<Guid> Grades { get; set; }
		public List<Guid> Instructors { get; set; }
	}

	public class TimeSchedule
	{
		public Guid Guid { get; init; } = Guid.NewGuid();
		public TimeOnly StartTime { get; set; }
		public TimeOnly EndTime { get; set; }
	}

	public class DaySchedule
	{
		public Guid Guid { get; } = Guid.NewGuid();
		public string DayOfWeek { get; set; }
		public bool Recurs { get; set; }
		public List<TimeSchedule> TimeSchedules { get; set; }
	}

	public class Schedule
	{
		public string DayOfWeek { get; set; }
		public bool Recurs { get; set; }
		public TimeOnly StartTime { get; set; }
		public TimeOnly EndTime { get; set; }
	}

	public class TempDaySchedule : SessionDaySchedule
	{
		public List<SessionTimeSchedule> TimeSchedulesTemp { get; set; }
	}
}