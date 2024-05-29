using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.DTO
{
	public class FormSessionDto
	{
		public class ScheduleRegistrationShift
		{
			public DayOfWeek FromDay { get; set; }
			public DayOfWeek ToDay { get; set; }
		}

		public Session ToDbSession()
		{
			return new Session()
			{
				SessionGuid = Guid,
				OrganizationYearGuid = OrganizationYearGuid,
				Name = Name,
				SessionTypeGuid = Type,
				ActivityGuid = Activity,
				FundingSourceGuid = FundingSource,
				OrganizationTypeGuid = OrganizationType,
				PartnershipTypeGuid = PartnershipType,
				FirstSession = FirstSessionDate,
				LastSession = LastSessionDate,
				Recurring = Recurring,
                SessionObjectives = Objectives
                    .Select(objGuid => new SessionObjective
                    {
                        SessionGuid = Guid,
                        ObjectiveGuid = objGuid
                    })
                    .ToList(),
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
						SessionTimeGuid = Guid.NewGuid(),
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
						SessionTimeGuid = timeSchedule.Guid != default ? timeSchedule.Guid : Guid.NewGuid(),
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
		public List<Guid> Objectives { get; set; }
		public Guid FundingSource { get; set; }
		public Guid OrganizationType { get; set; }
		public Guid PartnershipType { get; set; }
		public DateOnly FirstSessionDate { get; set; }
		public DateOnly LastSessionDate { get; set; }
		public bool Recurring { get; set; }
		public List<DaySchedule> Scheduling { get; set; }
		public List<Guid> Grades { get; set; }
		public List<Guid> Instructors { get; set; }
		public List<ScheduleRegistrationShift> RegistrationShift { get; set; } = new();
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

	public class TempDaySchedule : SessionDaySchedule
	{
		public List<SessionTimeSchedule> TimeSchedulesTemp { get; set; }
		public List<StudentRegistration> Registrations { get; set; }
	}
}