using Castle.Core.Internal;
using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Dto.Attendance;
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

		private bool HasTimeConflict(StudentAttendanceTimeRecord existingTimeSchedule, SessionTimeSchedule newTimeSchedule)
		{
				//if new end time is after the existing start time, and the new start time is before the existing end time
			if (existingTimeSchedule.EntryTime < newTimeSchedule.EndTime && existingTimeSchedule.ExitTime > newTimeSchedule.StartTime)
				return true;
			//ensure that the two sessions don't have the same start and end time
			else if (existingTimeSchedule.EntryTime == newTimeSchedule.StartTime && existingTimeSchedule.ExitTime == newTimeSchedule.EndTime)
				return true;
			return false;
		}

		/*public async Task<List<string>> ValidateStudentAttendanceAsync(DateOnly instanceDate, List<Guid> studentSchoolYearGuids)
		{
			List<string> validationErrors = new();

			
			
			/*foreach ()

				foreach (SessionDaySchedule daySchedule in daySchedules)
				{
					var existingRegistrationsOnDay = existingStudentAttendance.Where(sr => sr.DaySchedule.DayOfWeek == daySchedule.DayOfWeek).ToList();
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
		}*/

		//Initially, we're going to copy over entire schedules, with no selective day of week, but we MAY add that in future releases
		public async Task<List<AttendanceConflict>> ValidateStudentAttendanceAsync(DateOnly instanceDate, List<StudentAttendanceDto> studentAttendance)
		{
			List<AttendanceConflict> validationErrors = new();

				var existingAttendanceOnDay = await _grantContext
					.AttendanceRecords
					.Where(ar => ar.InstanceDate == instanceDate)
					.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
					.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.StudentSchoolYear)
					.ToListAsync();

			var existingStudentAttendance = existingAttendanceOnDay
				.Where(ar => ar.StudentAttendance.Any(sa => studentAttendance.Any(record => sa.StudentSchoolYearGuid == record.StudentSchoolYearGuid)))
				.SelectMany(ar => ar.StudentAttendance)
				.Where(sa => studentAttendance.Any(record => sa.StudentSchoolYearGuid == record.StudentSchoolYearGuid))
				.ToList();

			foreach (StudentAttendanceDto newAttendance in studentAttendance)
			{
				List<StudentAttendanceTimeRecord> existingAttendance = existingStudentAttendance
					.Where(sa => sa.StudentSchoolYearGuid == newAttendance.StudentSchoolYearGuid)
					.SelectMany(sa => sa.TimeRecords)
					.ToList();

				foreach (StudentAttendanceTimeRecord existingTime in existingAttendance)
				{
					foreach (SessionTimeSchedule newTime in newAttendance.Attendance)
						if (HasTimeConflict(existingTime, newTime))
						{
							//check how the ui looks if someone conflicts every student registration on an attempted copy
							AttendanceConflict conflict = new()
							{
								StudentSchoolYearGuid = newAttendance.StudentSchoolYearGuid,
								Error = $"{newAttendance.Student.FirstName} {newAttendance.Student.LastName} has a conflict with an existing attendance record from {existingTime.EntryTime.ToShortTimeString()} to {existingTime.ExitTime.ToShortTimeString()}"
							};
							validationErrors.Add(conflict);
						}
				}
			}

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



			foreach (var oldDay in oldSchedule)
			{
				if (newSchedule.Any(x => x.DayOfWeek == oldDay.DayOfWeek))
					continue;

				_grantContext.RemoveRange(oldDay.TimeSchedules);
				_grantContext.RemoveRange(oldDay.StudentRegistrations);
				_grantContext.Remove(oldDay);
			}

			foreach (var newDay in newSchedule)
			{
				var oldDay = oldSchedule.FirstOrDefault(old => old.DayOfWeek == newDay.DayOfWeek);

				if (oldDay != null)
				{
					_grantContext.RemoveRange(oldDay.TimeSchedules);
					newDay.TimeSchedulesTemp.ForEach(t => t.SessionDayGuid = oldDay.SessionDayGuid);
					_grantContext.AddRange(newDay.TimeSchedulesTemp);
					continue;
				}


				newDay.TimeSchedulesTemp.ForEach(x => x.SessionTimeGuid = Guid.NewGuid());
				_grantContext.SessionDaySchedules.Add(newDay);
				_grantContext.SessionTimeSchedules.AddRange(newDay.TimeSchedulesTemp);

				if (newDay.Registrations != null && newDay.Registrations.Count > 0)
					_grantContext.StudentRegistrations.AddRange(newDay.Registrations);
			}

				/*foreach (string day in Enum.GetNames(typeof(DayOfWeek)))
				{
					var newDay = newSchedule.FirstOrDefault(schedule => schedule.DayOfWeek.ToString() == day);
					var oldDay = oldSchedule.FirstOrDefault(schedule => schedule.DayOfWeek.ToString() == day);

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
						SessionDaySchedule newDaySchedule = new() 
						{
							SessionGuid = newDay.SessionGuid,
							SessionDayGuid = Guid.NewGuid(),
							DayOfWeek = newDay.DayOfWeek,
							TimeSchedules = newDay.TimeSchedulesTemp.ToList()
						};

						newDay.TimeSchedulesTemp.ForEach(x => x.SessionDayGuid = newDaySchedule.SessionDayGuid);

						_grantContext.SessionDaySchedules.Add(newDaySchedule);
						_grantContext.SessionTimeSchedules.AddRange(newDay.TimeSchedulesTemp.ToList());

						newDay.Registrations.ForEach(x => { x.DayScheduleGuid = newDaySchedule.SessionDayGuid; });

						_grantContext.StudentRegistrations.AddRange(newDay.Registrations);
					}
					else if (oldDay is not null)
					{
						_grantContext.RemoveRange(oldDay.StudentRegistrations);
						_grantContext.SessionTimeSchedules.RemoveRange(oldDay.TimeSchedules);
						_grantContext.SessionDaySchedules.Remove(oldDay);
					}

					await _grantContext.SaveChangesAsync();
				}*/

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
				var newGrades = formSession.GetGrades();
				var newInstructors = formSession.GetInstructors();

				var currentSession = await _grantContext
					.Sessions
					.Where(s => s.SessionGuid == newSession.SessionGuid)
					.Include(s => s.SessionGrades)
					.Include(s => s.InstructorRegistrations)
					.FirstOrDefaultAsync();

				var organizationYearGuid = currentSession.OrganizationYearGuid;


				//handle date change BULLSHIT HERE

				var newDaySchedule = formSession.GetDaySchedule();
				var currentSchedule = await _grantContext
					.SessionDaySchedules
					.Include(sds => sds.TimeSchedules)
					.Include(sds => sds.StudentRegistrations)
					.Where(sds => sds.SessionGuid == newSession.SessionGuid)
					.ToListAsync();

				//go ahead and handle these seperately from all else
				if (formSession.RegistrationShift.Count > 0)
				{
					foreach (var regShift in formSession.RegistrationShift)
					{
						var registrations = currentSession.DaySchedules.First(ds => ds.DayOfWeek == regShift.FromDay).StudentRegistrations.ToList();
						var targetDayScheduleIndex = newDaySchedule.FindIndex(ds => ds.DayOfWeek == regShift.ToDay);
						var newDay = newDaySchedule[targetDayScheduleIndex];

						if (!newDaySchedule.Any(nds => nds.DayOfWeek == regShift.FromDay))
						{
							var removedDay = currentSchedule.Find(cs => cs.DayOfWeek == regShift.FromDay);
							_grantContext.SessionTimeSchedules.RemoveRange(removedDay.TimeSchedules);
							_grantContext.StudentRegistrations.RemoveRange(removedDay.StudentRegistrations);
							_grantContext.SessionDaySchedules.Remove(removedDay);
							await _grantContext.SaveChangesAsync();

							int removedDayIndex = currentSchedule.FindIndex(cs => cs.DayOfWeek == regShift.FromDay);
							currentSchedule.RemoveAt(removedDayIndex);
						}

						registrations.ForEach(r => r.DayScheduleGuid = newDay.SessionDayGuid);

						_grantContext.Add(newDay);
						_grantContext.AddRange(newDay.TimeSchedulesTemp);
						_grantContext.AddRange(registrations);

						await _grantContext.SaveChangesAsync();

						newDaySchedule.RemoveAt(targetDayScheduleIndex);

						//special handling for an old day being deleted as it's registrations are moved to a new day. EF Core hates me. This is necessary in an imperfect world..
						//if day with regs is not in new schedule
						
					}

					await _grantContext.SaveChangesAsync();
				}

				foreach (DayOfWeek dayOfWeek in (DayOfWeek[]) Enum.GetValues(typeof(DayOfWeek)))
				{
					var oldDay = currentSchedule.FirstOrDefault(s => s.DayOfWeek == dayOfWeek);
					var newDay = newDaySchedule.FirstOrDefault(s => s.DayOfWeek == dayOfWeek);

					if (oldDay != null && newDay != null)
					{
						bool changeIsRequired = false;
						//only change things if the time schedules are different
						var oldTimeSchedule = oldDay.TimeSchedules.OrderBy(ts => ts.StartTime).ThenBy(ts => ts.EndTime).ToList();
						var newTimeSchedule = newDay.TimeSchedulesTemp.OrderBy(ts => ts.StartTime).ThenBy(ts => ts.EndTime).ToList();

						if (oldTimeSchedule.Count != newTimeSchedule.Count)
							changeIsRequired = true;
						else
						{
							//check each schedule to ensure an equal partner exists
							foreach (var timeSchedule in oldTimeSchedule)
							{
								if (!newTimeSchedule.Any(nts => nts.StartTime == timeSchedule.StartTime && nts.EndTime == timeSchedule.EndTime))
								{
									changeIsRequired = true;
									break;
								}
							}
						}

						if (changeIsRequired)
						{
							newDay.TimeSchedulesTemp.ForEach(x => x.SessionDayGuid = oldDay.SessionDayGuid);

							_grantContext.SessionTimeSchedules.RemoveRange(oldDay.TimeSchedules);
							_grantContext.SessionTimeSchedules.AddRange(newDay.TimeSchedulesTemp);
							await _grantContext.SaveChangesAsync();
						}
					}
					else if (newDay != null)
					{
						_grantContext.SessionTimeSchedules.AddRange(newDay.TimeSchedulesTemp);
						_grantContext.SessionDaySchedules.Add(newDay);
					}
					else if (oldDay != null)
					{
						_grantContext.SessionTimeSchedules.RemoveRange(oldDay.TimeSchedules);
						_grantContext.StudentRegistrations.RemoveRange(oldDay.StudentRegistrations);
						_grantContext.SessionDaySchedules.Remove(oldDay);
					}

					await _grantContext.SaveChangesAsync();
				}


				//fuck this fuck this fuck this function

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