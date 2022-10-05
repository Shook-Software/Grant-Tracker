using Castle.Core.Internal;
using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Repositories.SessionRepository
{
	public class SessionRepository : RepositoryBase, ISessionRepository
	{

		public SessionRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext)
			: base(devRepository, httpContext, grantContext)
		{

		}

		//come back to this and fix the identity thing
		public async Task<SessionView> GetAsync(Guid sessionGuid)
		{
			return await UseDeveloperLog(async () =>
			{
				var session = await _grantContext
					.Sessions
					.AsNoTracking()
					.Where(s => s.SessionGuid == sessionGuid
					&& (_identity.Claim == IdentityClaim.Administrator || s.OrganizationYear.OrganizationGuid == _identity.Organization.Guid))
					.Include(s => s.OrganizationYear).ThenInclude(oy => oy.Organization)
					.Include(s => s.OrganizationYear).ThenInclude(oy => oy.Year)
					.Include(s => s.SessionGrades).ThenInclude(g => g.Grade)
					.Include(s => s.SessionType)
					.Include(s => s.Activity)
					.Include(s => s.Objective)
					.Include(s => s.FundingSource)
					.Include(s => s.OrganizationType)
					.Include(s => s.PartnershipType)
					.Include(s => s.InstructorRegistrations).ThenInclude(i => i.InstructorSchoolYear).ThenInclude(i => i.Status)
					.Include(s => s.InstructorRegistrations).ThenInclude(i => i.InstructorSchoolYear).ThenInclude(i => i.Instructor)
					.Include(s => s.DaySchedules).ThenInclude(w => w.TimeSchedules)
					.Include(s => s.AttendanceRecords).ThenInclude(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
					.Include(s => s.AttendanceRecords).ThenInclude(ar => ar.StudentAttendance).ThenInclude(sa => sa.FamilyAttendance)
					.Include(s => s.AttendanceRecords).ThenInclude(ar => ar.InstructorAttendance).ThenInclude(ia => ia.TimeRecords)
					.Select(s => SessionView.FromDatabase(s))
					.SingleAsync();

				if (!session.DaySchedules.IsNullOrEmpty())
					session.DaySchedules = session.DaySchedules.OrderBy(schedule => schedule.DayOfWeek).ToList();

				return session;
			});
		}

		public async Task<List<SimpleSessionView>> GetAsync(string sessionName, Guid organizationYearGuid)
		{
			return await UseDeveloperLog(async () =>
			{
				//verify that the session's organization year is compatible with claimtype authorizations
				//Admin are allowed to see anything, coordinators can only see sessions from past years at their current organization

				//fetch sessions that match the given Organization and Year
				return await _grantContext.Sessions
					.AsNoTracking()
					.Where(s => (sessionName == null || s.Name.Contains(sessionName)) && s.OrganizationYearGuid == organizationYearGuid) 
					.Include(s => s.OrganizationYear).ThenInclude(s => s.Organization)
					.Include(s => s.OrganizationYear).ThenInclude(s => s.Year)
					.Include(s => s.SessionGrades).ThenInclude(g => g.Grade)
					.Include(s => s.SessionType)
					.Include(s => s.Activity)
					.Include(s => s.Objective)
					.Include(s => s.FundingSource)
					.Include(s => s.OrganizationType)
					.Include(s => s.PartnershipType)
					.Include(s => s.DaySchedules)
					.Select(s => SimpleSessionView.FromDatabase(s))
					.ToListAsync();
			});
		}

		//This returns if a session has any attendance records, and if it does, 
		//Before I finished writing the above, I realize we can absolutely delete this
		public async Task<bool> GetStatusAsync(Guid sessionGuid)
		{
			var session = await _grantContext.Sessions
				.AsNoTracking()
				.Include(s => s.AttendanceRecords)
				.Where(s => s.SessionGuid == sessionGuid)
				.SingleOrDefaultAsync();

			var allowed = session.AttendanceRecords.Count == 0;

			return allowed;
		}

		public async Task AddAsync(FormSessionDto sessionDetails)
		{
			await UseDeveloperLog(async () =>
			{
				var session = sessionDetails.ToDbSession();
				var daySchedule = sessionDetails.GetDaySchedule();
				var timeSchedule = sessionDetails.GetTimeSchedule();
				var grades = sessionDetails.GetGrades();
				var instructorRegistrations = sessionDetails.GetInstructors();
				await _grantContext.Sessions.AddAsync(session);
				await _grantContext.SaveChangesAsync();
				await _grantContext.SessionDaySchedules.AddRangeAsync(daySchedule);
				await _grantContext.SessionTimeSchedules.AddRangeAsync(timeSchedule);
				await _grantContext.SessionGrades.AddRangeAsync(grades);
				await _grantContext.InstructorRegistrations.AddRangeAsync(instructorRegistrations);
				await _grantContext.SaveChangesAsync();
			});
		}

		public async Task RegisterStudentAsync(Guid sessionGuid, List<Guid> scheduleGuids, Guid studentSchoolYearGuid)
		{
			await UseDeveloperLog(async () =>
			{
				var newRegistrations = scheduleGuids.Select(guid => new StudentRegistration
				{
					StudentSchoolYearGuid = studentSchoolYearGuid,
					DayScheduleGuid = guid
				})
				.ToList();

				await _grantContext.StudentRegistrations.AddRangeAsync(newRegistrations);
				await _grantContext.SaveChangesAsync();
			});
		}

		private bool HasTimeConflict(SessionTimeSchedule existingTimeSchedule, SessionTimeSchedule newTimeSchedule)
		{
				//if new end time is after the existing start time, and the new start time is before the existing end time
			if (existingTimeSchedule.StartTime < newTimeSchedule.EndTime && existingTimeSchedule.EndTime > newTimeSchedule.StartTime)
				return true;
			//ensure that the two sessions don't have the same start and end time
			else if (existingTimeSchedule.StartTime == newTimeSchedule.StartTime && existingTimeSchedule.EndTime == newTimeSchedule.EndTime)
				return true;
			return false;
		}

		public async Task<List<string>> ValidateStudentRegistrationAsync(List<Guid> dayScheduleGuids, Guid studentSchoolYearGuid)
		{
			List<string> validationErrors = new();

			var existingStudentRegistrations = await _grantContext
				.StudentRegistrations
				.Where(sr => sr.StudentSchoolYearGuid == studentSchoolYearGuid)
				.Include(sr => sr.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
				.Include(sr => sr.DaySchedule).ThenInclude(ds => ds.TimeSchedules)
				.ToListAsync();

			var daySchedules = await _grantContext
				.SessionDaySchedules
				.Include(sds => sds.TimeSchedules)
				.Where(sds => dayScheduleGuids.Contains(sds.SessionDayGuid))
				.ToListAsync();

			foreach (SessionDaySchedule daySchedule in daySchedules)
			{
				var existingRegistrationsOnDay = existingStudentRegistrations.Where(sr => sr.DaySchedule.DayOfWeek == daySchedule.DayOfWeek).ToList(); 
				foreach (var registration in existingRegistrationsOnDay)
					foreach (SessionTimeSchedule newTimeSchedule in daySchedule.TimeSchedules)
						//...compare their start and end times to the new session's
						foreach (var existingTimeSchedule in registration.DaySchedule.TimeSchedules)
					{
						if (HasTimeConflict(existingTimeSchedule, newTimeSchedule))
						{
							//check how the ui looks if someone conflicts every student registration on an attempted copy
							validationErrors.Add($"{registration.StudentSchoolYear.Student.FirstName} {registration.StudentSchoolYear.Student.LastName} has a conflict with an existing registration on {daySchedule.DayOfWeek} from {existingTimeSchedule.StartTime.ToShortTimeString()} to {existingTimeSchedule.EndTime.ToShortTimeString()}");
						}
					}
			}

			return validationErrors;
		}

		//Initially, we're going to copy over entire schedules, with no selective day of week, but we MAY add that in future releases
		public async Task<List<string>> ValidateStudentRegistrationsAsync(Guid destinationSessionGuid, List<Guid> studentSchoolYearGuids)
		{
			List<string> validationErrors = new();

			var sessionSchedule = await _grantContext
				.Sessions
				.Where(s => s.SessionGuid == destinationSessionGuid)
				.Include(s => s.DaySchedules).ThenInclude(ds => ds.TimeSchedules)
				.SelectMany(s => s.DaySchedules)
				.ToListAsync();

			List<StudentRegistration> existingStudentRegistrations = await _grantContext
				.StudentRegistrations
				.Where(sr => studentSchoolYearGuids.Contains(sr.StudentSchoolYearGuid))
				.Include(sr => sr.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
				.Include(sr => sr.DaySchedule).ThenInclude(ds => ds.TimeSchedules)
				.ToListAsync();

			foreach (Guid studentSchoolYearGuid in studentSchoolYearGuids)
				validationErrors.AddRange(await this.ValidateStudentRegistrationAsync(sessionSchedule.Select(ss => ss.SessionDayGuid).ToList(), studentSchoolYearGuid));
			//it isn't as bad as it looks
			//for each day of the week (most will be skipped)
			/*foreach (DayOfWeek weekday in Enum.GetValues(typeof(DayOfWeek)))
			{
				var newDaySchedule = sessionSchedule.Find(ss => ss.DayOfWeek == weekday);
				if (newDaySchedule == null)
					continue;

				var registrationsOnDay = existingStudentRegistrations.Where(sr => sr.DaySchedule.DayOfWeek == weekday).ToList();

				//... then for each start and end time on this day for the session...
				foreach (SessionTimeSchedule newTimeSchedule in newDaySchedule.TimeSchedules)
					//...get each existing registration
					foreach (var registration in registrationsOnDay)
					//...compare their start and end times to the new session's
						foreach (var existingTimeSchedule in registration.DaySchedule.TimeSchedules)
						{
							if (HasTimeConflict(existingTimeSchedule, newTimeSchedule))
							{
								//check how the ui looks if someone conflicts every student registration on an attempted copy
								validationErrors.Add($"{registration.StudentSchoolYear.Student.FirstName} {registration.StudentSchoolYear.Student.LastName} has a conflict with an existing registration on {weekday} from {existingTimeSchedule.StartTime.ToShortTimeString()} to {existingTimeSchedule.EndTime.ToShortTimeString()}");
							}
						}
			}*/

			return validationErrors;
		}

		//this should honestly just be remove student async, not multiple.
		public async Task RemoveStudentAsync(Guid studentYearGuid, List<Guid> dayScheduleGuids)
		{
			var registrations = await _grantContext.StudentRegistrations.Where(reg => reg.StudentSchoolYearGuid == studentYearGuid && dayScheduleGuids.Any(guid => guid == reg.DayScheduleGuid)).ToListAsync();
			_grantContext.StudentRegistrations.RemoveRange(registrations);
			await _grantContext.SaveChangesAsync();
		}

		private async Task UpdateWeekdaySchedules(List<TempDaySchedule> newSchedule, List<SessionDaySchedule> oldSchedule)
		{
			if (newSchedule
					.OrderBy(s => s.DayOfWeek)
					.SequenceEqual(oldSchedule.OrderBy(s => s.DayOfWeek))
				 )
				return;

			foreach (string day in Enum.GetNames(typeof(DayOfWeek)))
			{
				var newDay = newSchedule.Find(schedule => schedule.DayOfWeek.ToString() == day);
				var oldDay = oldSchedule.Find(schedule => schedule.DayOfWeek.ToString() == day);

				if (newDay is not null && oldDay is not null)
				{
					newDay.StudentRegistrations = oldDay.StudentRegistrations;
					newDay.SessionDayGuid = oldDay.SessionDayGuid;
					newDay.TimeSchedulesTemp.ForEach(t => t.SessionDayGuid = oldDay.SessionDayGuid);
					_grantContext.Entry(oldDay).CurrentValues.SetValues(newDay);
					_grantContext.RemoveRange(oldDay.TimeSchedules);
					_grantContext.AddRange(newDay.TimeSchedulesTemp);
				}
				else if (newDay is null && oldDay is null)
				{
					continue;
				}
				else if (newDay is not null)
				{
					await _grantContext.SessionDaySchedules.AddAsync(newDay);
					_grantContext.SessionTimeSchedules.AddRange(newDay.TimeSchedulesTemp);
				}
				else if (oldDay is not null)
				{
					_grantContext.SessionDaySchedules.Remove(oldDay);
					_grantContext.SessionTimeSchedules.RemoveRange(oldDay.TimeSchedules);
				}
			}

			await _grantContext.SaveChangesAsync();
		}

		private async Task UpdateSingleDaySchedule(List<SessionTimeSchedule> newSchedule, List<SessionTimeSchedule> oldSchedule)
		{
			_grantContext.SessionTimeSchedules.RemoveRange(oldSchedule);
			await _grantContext.AddRangeAsync(newSchedule);
			await _grantContext.SaveChangesAsync();
		}

		private async Task UpdateGradeLevels(List<SessionGrade> newGrades, List<SessionGrade> oldGrades)
		{
			if (newGrades.OrderBy(g => g.GradeGuid).SequenceEqual(oldGrades.OrderBy(g => g.GradeGuid))) return;

			_grantContext.RemoveRange(oldGrades);
			await _grantContext.SaveChangesAsync();
			_grantContext.AddRange(newGrades);
			await _grantContext.SaveChangesAsync();
		}

		private async Task UpdateInstructors(List<InstructorRegistration> newRegistrations, List<InstructorRegistration> oldRegistrations)
		{
			if (newRegistrations.OrderBy(reg => reg.InstructorSchoolYearGuid).SequenceEqual(oldRegistrations.OrderBy(reg => reg.InstructorSchoolYearGuid))) return;

			_grantContext.RemoveRange(oldRegistrations);
			await _grantContext.SaveChangesAsync();
			_grantContext.AddRange(newRegistrations);
			await _grantContext.SaveChangesAsync();
		}

		public async Task UpdateAsync(FormSessionDto formSession)
		{
			await UseDeveloperLog(async () =>
			{
				var newSession = formSession.ToDbSession();
				var newDaySchedule = formSession.GetDaySchedule();
				var newTimeSchedule = formSession.GetTimeSchedule();
				var newGrades = formSession.GetGrades();
				var newInstructors = formSession.GetInstructors();

				var sessionQuery = _grantContext.Sessions.Where(s => s.SessionGuid == newSession.SessionGuid)
					.Include(s => s.SessionGrades)
					.Include(s => s.InstructorRegistrations)
					.Include(s => s.DaySchedules).ThenInclude(w => w.StudentRegistrations)
					.Include(s => s.DaySchedules).ThenInclude(w => w.TimeSchedules);

				var currentSession = await sessionQuery.FirstOrDefaultAsync();
				var organizationYearGuid = currentSession.OrganizationYearGuid;

				if (newSession.Recurring)
				{
					await UpdateWeekdaySchedules(newDaySchedule, currentSession.DaySchedules.ToList());
				}
				else
				{
					List<StudentRegistration> registrations = null;
					var newSchedule = formSession.Scheduling.Where(s => s.TimeSchedules.Count != 0).Single();
					var existingDaySchedules = _grantContext.SessionDaySchedules
						.Where(sds => sds.SessionGuid == newSession.SessionGuid)
						.Include(sds => sds.StudentRegistrations)
						.ToList();

					if (currentSession.Recurring)
					{
						registrations = existingDaySchedules.First().StudentRegistrations.ToList();
						registrations.ForEach(reg => reg.DayScheduleGuid = newSchedule.Guid);
					}

					_grantContext.SessionDaySchedules.RemoveRange(existingDaySchedules);
					_grantContext.SessionDaySchedules.Add(new SessionDaySchedule()
					{
						SessionDayGuid = newSchedule.Guid,
						SessionGuid = newSession.SessionGuid,
						DayOfWeek = Enum.Parse<DayOfWeek>(newSchedule.DayOfWeek),
						StudentRegistrations = registrations
					});
					var newTimeSchedule2 = newSchedule.TimeSchedules.Select(ts => new SessionTimeSchedule()
					{
						SessionTimeGuid = Guid.NewGuid(),
						SessionDayGuid = newSchedule.Guid,
						StartTime = ts.StartTime,
						EndTime = ts.EndTime
					})
					.ToList();
					_grantContext.SessionTimeSchedules.AddRange(newTimeSchedule2);
					await _grantContext.SaveChangesAsync();

				}
				await UpdateGradeLevels(newGrades, currentSession.SessionGrades.ToList());
				await UpdateInstructors(newInstructors, currentSession.InstructorRegistrations.ToList());

				//throw not found exception if the resource is null, possibly add the session to the db?

				_grantContext.Entry(currentSession).CurrentValues.SetValues(newSession);

				currentSession.OrganizationYearGuid = organizationYearGuid;
				await _grantContext.SaveChangesAsync();
			});
		}

		public async Task DeleteAsync(Guid sessionGuid)
		{
			await UseDeveloperLog(async () =>
			{
				Session session = await _grantContext.Sessions.FindAsync(sessionGuid);
				List<InstructorRegistration> instructorRegistrations = await _grantContext.InstructorRegistrations
					.Where(reg => reg.SessionGuid == session.SessionGuid)
					.ToListAsync();
				List<SessionDaySchedule> schedules = await _grantContext.SessionDaySchedules
					.Include(day => day.StudentRegistrations)
					.Where(day => day.SessionGuid == session.SessionGuid)
					.ToListAsync();
				List<StudentRegistration> studentRegistrations = schedules.SelectMany(s => s.StudentRegistrations).ToList();

				if (session != null)
				{
					_grantContext.StudentRegistrations.RemoveRange(studentRegistrations);
					_grantContext.SessionDaySchedules.RemoveRange(schedules);
					_grantContext.InstructorRegistrations.RemoveRange(session.InstructorRegistrations ?? new List<InstructorRegistration>());
					_grantContext.Sessions.Remove(session);
				}

				await _grantContext.SaveChangesAsync();
			});
		}

		public async Task<List<StudentRegistrationView>> GetStudentRegistrationsAsync(Guid sessionGuid, int dayOfWeek = -1)
		{
			var registrations = await _grantContext.Sessions
				.AsNoTracking()
				.Where(s => s.SessionGuid.Equals(sessionGuid) && (_identity.Claim == IdentityClaim.Administrator || s.OrganizationYear.OrganizationGuid.Equals(_identity.Organization.Guid)))
				.Include(s => s.DaySchedules).ThenInclude(w => w.StudentRegistrations).ThenInclude(reg => reg.StudentSchoolYear).ThenInclude(s => s.Student)
				.SelectMany(s => s.DaySchedules)
				.Where(w => dayOfWeek.Equals(-1) || w.DayOfWeek.Equals((DayOfWeek)dayOfWeek))
				.SelectMany(w => w.StudentRegistrations)
				.Include(w => w.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
				.Include(reg => reg.DaySchedule).ThenInclude(w => w.TimeSchedules)
				.Include(reg => reg.DaySchedule).ThenInclude(d => d.Session)
				.ToListAsync();

			return registrations.Select(StudentRegistrationView.FromDatabase).ToList();
		}

		public async Task RemoveAttendanceRecordAsync(Guid attendanceGuid)
		{
			var attendanceRecord = await _grantContext
				.AttendanceRecords
				.Include(ar => ar.InstructorAttendance)
				.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.FamilyAttendance)
				.Where(ar => ar.Guid == attendanceGuid)
				.SingleAsync();

			_grantContext.RemoveRange(attendanceRecord.InstructorAttendance);
			_grantContext.RemoveRange(attendanceRecord.StudentAttendance.SelectMany(sa => sa.FamilyAttendance).ToList());
			_grantContext.RemoveRange(attendanceRecord.StudentAttendance);
			_grantContext.Remove(attendanceRecord);
			await _grantContext.SaveChangesAsync();
		}
	}
}