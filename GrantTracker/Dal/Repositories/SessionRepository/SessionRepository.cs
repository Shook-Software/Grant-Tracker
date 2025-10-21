﻿using Castle.Core.Internal;
using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Models.DTO.ActionCenter;
using GrantTracker.Dal.Models.DTO.Attendance;
using GrantTracker.Dal.Models.DTO.SessionDTO;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Security.Claims;

namespace GrantTracker.Dal.Repositories.SessionRepository;

public class SessionRepository : ISessionRepository
{
    protected readonly GrantTrackerContext _grantContext;
    protected readonly ClaimsPrincipal _user;

    public SessionRepository(GrantTrackerContext grantContext, IHttpContextAccessor httpContextAccessor)
	{
        _grantContext = grantContext;
        _user = httpContextAccessor.HttpContext.User;
    }

	public async Task<SessionView> GetAsync(Guid sessionGuid)
	{
		var session = await _grantContext
			.Sessions
			.AsNoTracking()
			.Where(s => s.SessionGuid == sessionGuid)
			.Where(s => _user.IsAdmin()
                || (_user.IsCoordinator() && _user.HomeOrganizationGuids().Contains(s.OrganizationYear.OrganizationGuid))
                || (_user.IsTeacher() && s.InstructorRegistrations.Any(ir => ir.InstructorSchoolYear.Instructor.BadgeNumber.Trim() == _user.Id())))
			.Include(s => s.OrganizationYear).ThenInclude(oy => oy.Organization)
			.Include(s => s.OrganizationYear).ThenInclude(oy => oy.Year)
			.Include(s => s.Grades).ThenInclude(g => g.Grade)
			.Include(s => s.SessionType)
			.Include(s => s.Activity)
            .Include(s => s.SessionObjectives).ThenInclude(x => x.Objective)
            .Include(s => s.FundingSource)
			.Include(s => s.OrganizationType)
			.Include(s => s.PartnershipType)
            .Include(s => s.InstructorRegistrations).ThenInclude(i => i.InstructorSchoolYear).ThenInclude(i => i.StudentGroups).ThenInclude(g => g.Items).ThenInclude(i => i.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
            .Include(s => s.InstructorRegistrations).ThenInclude(i => i.InstructorSchoolYear).ThenInclude(i => i.Status)
			.Include(s => s.InstructorRegistrations).ThenInclude(i => i.InstructorSchoolYear).ThenInclude(i => i.Instructor)
			.Include(s => s.DaySchedules).ThenInclude(w => w.TimeSchedules)
			.Include(s => s.BlackoutDates)
			.Select(s => SessionView.FromDatabase(s))
			.SingleAsync();

		if (!session.DaySchedules.IsNullOrEmpty())
			session.DaySchedules = session.DaySchedules.OrderBy(schedule => schedule.DayOfWeek).ToList();

		return session;
	}

	public async Task<List<SimpleSessionView>> GetAsync(string sessionName, Guid organizationYearGuid)
	{
		//verify that the session's organization year is compatible with claimtype authorizations
		//Admin are allowed to see anything, coordinators can only see sessions from past years at their current organization

		//fetch sessions that match the given Organization and Year
		return await _grantContext.Sessions
			.AsNoTracking()
			.Where(s => s.OrganizationYearGuid == organizationYearGuid)
            .Where(s => _user.IsAdmin()
                || (_user.IsCoordinator() && _user.HomeOrganizationGuids().Contains(s.OrganizationYear.OrganizationGuid))
                || (_user.IsTeacher() && s.InstructorRegistrations.Any(ir => ir.InstructorSchoolYear.Instructor.BadgeNumber.Trim() == _user.Id())))
            .Include(s => s.OrganizationYear)
			.Include(s => s.InstructorRegistrations).ThenInclude(ir => ir.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
			.Include(s => s.Grades).ThenInclude(g => g.Grade)
			.Include(s => s.SessionType)
			.Include(s => s.Activity)
            .Include(s => s.SessionObjectives).ThenInclude(x => x.Objective)
            .Include(s => s.FundingSource)
			.Include(s => s.OrganizationType)
			.Include(s => s.PartnershipType)
			.Include(s => s.DaySchedules).ThenInclude(ds => ds.TimeSchedules)
			.Select(s => SimpleSessionView.FromDatabase(s))
			.ToListAsync();
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
		var session = sessionDetails.ToDbSession();
		var daySchedule = sessionDetails.GetDaySchedule();
		var timeSchedule = sessionDetails.GetTimeSchedule();
		var grades = sessionDetails.GetGrades();
		var instructorRegistrations = sessionDetails.GetInstructors();
		var sessionObjectives = sessionDetails.Objectives.Select(objective => new SessionObjective { SessionGuid = sessionDetails.Guid, ObjectiveGuid = objective });
		await _grantContext.Sessions.AddAsync(session);
		await _grantContext.SaveChangesAsync();
		_grantContext.SessionDaySchedules.AddRange(daySchedule);
		_grantContext.SessionTimeSchedules.AddRange(timeSchedule);
		_grantContext.SessionGrades.AddRange(grades);
		_grantContext.InstructorRegistrations.AddRange(instructorRegistrations);
		await _grantContext.SaveChangesAsync();
	}

	public async Task RegisterStudentAsync(Guid sessionGuid, List<Guid> scheduleGuids, Guid studentSchoolYearGuid)
	{
		var newRegistrations = scheduleGuids.Select(guid => new StudentRegistration
		{
			StudentSchoolYearGuid = studentSchoolYearGuid,
			DayScheduleGuid = guid
		})
		.ToList();

		_grantContext.StudentRegistrations.AddRange(newRegistrations);
		await _grantContext.SaveChangesAsync();
	}

	public async Task RemoveStudentAsync(Guid studentYearGuid, List<Guid> dayScheduleGuids)
	{
		var registrations = await _grantContext.StudentRegistrations.Where(reg => reg.StudentSchoolYearGuid == studentYearGuid && dayScheduleGuids.Any(guid => guid == reg.DayScheduleGuid)).ToListAsync();
		_grantContext.StudentRegistrations.RemoveRange(registrations);
		await _grantContext.SaveChangesAsync();
	}

	public async Task RegisterInstructorAsync(Guid sessionGuid, Guid instructorSchoolYearGuid)
	{
		_grantContext.InstructorRegistrations.Add(new InstructorRegistration()
		{
			InstructorSchoolYearGuid = instructorSchoolYearGuid,
			SessionGuid = sessionGuid
		});

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

	public async Task UpdateAsync(FormSessionDto form)
	{
		var newSession = form.ToDbSession();
		var newGrades = form.GetGrades();
		var newInstructors = form.GetInstructors();
        var sessionObjectives = form.Objectives.Select(objective => new SessionObjective { SessionGuid = form.Guid, ObjectiveGuid = objective }).OrderBy(x => x.ObjectiveGuid);

        var currentSession = await _grantContext
			.Sessions
			.Where(s => s.SessionGuid == newSession.SessionGuid)
			.Include(s => s.Grades)
			.Include(s => s.SessionObjectives)
			.Include(s => s.InstructorRegistrations)
			.Include(s => s.BlackoutDates)
			.FirstOrDefaultAsync();

		_grantContext.SessionBlackoutDates.RemoveRange(currentSession.BlackoutDates);

		currentSession.BlackoutDates = newSession.BlackoutDates.Select(bd => new SessionBlackoutDate()
		{
			Guid = bd.Guid == Guid.Empty ? Guid.NewGuid() : bd.Guid,
			SessionGuid = currentSession.SessionGuid,
			Date = bd.Date
		})
		.ToList();

        _grantContext.SessionBlackoutDates.AddRange(currentSession.BlackoutDates);
		await _grantContext.SaveChangesAsync();


        var organizationYearGuid = currentSession.OrganizationYearGuid;

		var newDaySchedule = form.GetDaySchedule();
		var currentSchedule = await _grantContext
			.SessionDaySchedules
			.Include(sds => sds.TimeSchedules)
			.Include(sds => sds.StudentRegistrations)
			.Where(sds => sds.SessionGuid == newSession.SessionGuid)
			.ToListAsync();

		if (!currentSession.SessionObjectives.OrderBy(x => x.ObjectiveGuid).SequenceEqual(sessionObjectives, new SessionObjectiveComparer()))
		{
			_grantContext.SessionObjectives.RemoveRange(currentSession.SessionObjectives);
			_grantContext.SessionObjectives.AddRange(sessionObjectives);
			await _grantContext.SaveChangesAsync();
		}

		//go ahead and handle these seperately from all else
		if (form.RegistrationShift.Count > 0)
		{
			foreach (var regShift in form.RegistrationShift)
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

		await UpdateGradeLevels(newGrades, currentSession.Grades.ToList());
		await UpdateInstructors(newInstructors, currentSession.InstructorRegistrations.ToList());

		//throw not found exception if the resource is null, possibly add the session to the db?

		_grantContext.Entry(currentSession).CurrentValues.SetValues(newSession);

		currentSession.OrganizationYearGuid = organizationYearGuid;
		await _grantContext.SaveChangesAsync();
	}

	public async Task DeleteAsync(Guid sessionGuid)
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
	}

	public async Task<List<StudentRegistrationView>> GetStudentRegistrationsAsync(Guid sessionGuid, int dayOfWeek = -1)
	{
		List<Guid> homeOrgIds = _user.HomeOrganizationGuids();

		var registrations = await _grantContext.Sessions
			.AsNoTracking()
            .Where(s => _user.IsAdmin()
                || (_user.IsCoordinator() && _user.HomeOrganizationGuids().Contains(s.OrganizationYear.OrganizationGuid))
                || (_user.IsTeacher() && s.InstructorRegistrations.Any(ir => ir.InstructorSchoolYear.Instructor.BadgeNumber.Trim() == _user.Id())))
            .Where(s => s.SessionGuid.Equals(sessionGuid))
			.Include(s => s.DaySchedules).ThenInclude(w => w.StudentRegistrations).ThenInclude(reg => reg.StudentSchoolYear).ThenInclude(s => s.Student)
			.SelectMany(s => s.DaySchedules)
			.Where(w => dayOfWeek.Equals(-1) || w.DayOfWeek.Equals((DayOfWeek)dayOfWeek))
			.SelectMany(w => w.StudentRegistrations)
			.Include(w => w.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
			.Include(reg => reg.DaySchedule).ThenInclude(w => w.TimeSchedules)
			.Include(reg => reg.DaySchedule).ThenInclude(d => d.Session)
			.ToListAsync();

		return registrations.GroupBy(x => x.StudentSchoolYearGuid,
			(ssyGuid, regs) =>
			{
				return StudentRegistrationView.FromDatabase(sessionGuid, regs.First().DaySchedule.Session.Name, regs.First().StudentSchoolYear, regs.Select(x => x.DaySchedule).ToList());
			})
		.ToList();
    }

	public async Task RemoveAttendanceRecordAsync(Guid attendanceGuid)
	{
		var attendanceRecord = await _grantContext
			.AttendanceRecords
			.Include(ar => ar.FamilyAttendance)
			.Include(ar => ar.InstructorAttendance)
                .Include(ar => ar.StudentAttendance)
                .Where(ar => ar.Guid == attendanceGuid)
			.SingleAsync();

		_grantContext.RemoveRange(attendanceRecord.InstructorAttendance);
		_grantContext.RemoveRange(attendanceRecord.FamilyAttendance);
		_grantContext.RemoveRange(attendanceRecord.StudentAttendance);
		_grantContext.Remove(attendanceRecord);
		await _grantContext.SaveChangesAsync();
	}

	public async Task<List<SessionIssuesDTO>> GetIssues(Guid organizationYearGuid)
	{
		var sessionHasMalformedScheduleTimes = (Session s) => s.DaySchedules.Any(ds => ds.TimeSchedules.Any(ts => ts.StartTime == ts.EndTime || ts.StartTime > ts.EndTime));
		var sessionHasDuplicateRegistrations = (Session s) => (
			s.DaySchedules.SelectMany(ds => ds.StudentRegistrations).DistinctBy(sr => new { sr.StudentSchoolYearGuid, sr.DaySchedule.DayOfWeek }).Count() != s.DaySchedules.SelectMany(ds => ds.StudentRegistrations).Count()
		);

        var sessionsWithIssues = (await _grantContext.Sessions
            .AsNoTracking()
            .Where(s => s.OrganizationYearGuid == organizationYearGuid)
            .Where(s => _user.IsAdmin()
                || (_user.IsCoordinator() && _user.HomeOrganizationGuids().Contains(s.OrganizationYear.OrganizationGuid))
                || (_user.IsTeacher() && s.InstructorRegistrations.Any(ir => ir.InstructorSchoolYear.Instructor.BadgeNumber.Trim() == _user.Id())))
            .Include(s => s.OrganizationYear)
            .Include(s => s.Grades).ThenInclude(g => g.Grade)
            .Include(s => s.SessionType)
            .Include(s => s.Activity)
            .Include(s => s.SessionObjectives).ThenInclude(x => x.Objective)
            .Include(s => s.FundingSource)
            .Include(s => s.OrganizationType)
            .Include(s => s.PartnershipType)
            .Include(s => s.DaySchedules).ThenInclude(ds => ds.StudentRegistrations)
            .Include(s => s.DaySchedules).ThenInclude(ds => ds.TimeSchedules)
            .ToListAsync())
            .Where(s => sessionHasMalformedScheduleTimes(s) || sessionHasDuplicateRegistrations(s))
			.ToList();

		return sessionsWithIssues
			.Select(s =>
			{
				SessionIssuesDTO sessionDTO = new()
				{
					SessionGuid = s.SessionGuid,
					Name = s.Name,
                    Issues = []
				};

				if (sessionHasMalformedScheduleTimes(s))
                    sessionDTO.Issues.Add(new IssueDTO<SessionIssue>
                    {
						Type = SessionIssue.Schedul,
						Message = "One or more schedule times are invalid."
					});

				if (sessionHasDuplicateRegistrations(s))
                    sessionDTO.Issues.Add(new IssueDTO<SessionIssue>
                    {
                        Type = SessionIssue.Schedul,
                        Message = "One or more students registrations are duplicated."
                    });

                return sessionDTO;
			})
			.ToList();
    }

	public async Task<List<TodayAttendanceDTO>> GetTodayAttendanceAsync(Guid organizationYearGuid, DateOnly date)
	{
		// Get organization blackout dates
		var orgYear = await _grantContext.OrganizationYears
			.AsNoTracking()
			.Where(oy => oy.OrganizationYearGuid == organizationYearGuid)
			.Include(oy => oy.Organization)
			.FirstOrDefaultAsync();

		if (orgYear == null)
			return new List<TodayAttendanceDTO>();

		var orgBlackoutDates = await _grantContext.BlackoutDates
			.AsNoTracking()
			.Where(bd => bd.OrganizationGuid == orgYear.OrganizationGuid)
			.Select(bd => bd.Date)
			.ToListAsync();

		// Get sessions with a day schedule for the current day
		var dayOfWeek = date.DayOfWeek;

		var todaySessions = await _grantContext.Sessions
			.AsNoTracking()
			.Where(s => s.OrganizationYearGuid == organizationYearGuid)
			.Where(s => s.FirstSession <= date && s.LastSession >= date) // Session is active on this date
			.Where(s => s.DaySchedules.Any(ds => ds.DayOfWeek == dayOfWeek)) // Has schedule for today's day of week
			.Where(s => _user.IsAdmin()
				|| (_user.IsCoordinator() && _user.HomeOrganizationGuids().Contains(s.OrganizationYear.OrganizationGuid))
				|| (_user.IsTeacher() && s.InstructorRegistrations.Any(ir => ir.InstructorSchoolYear.Instructor.BadgeNumber.Trim() == _user.Id())))
			.Include(s => s.OrganizationYear)
			.Include(s => s.BlackoutDates)
			.Include(s => s.AttendanceRecords)
			.ToListAsync();

		// Filter out sessions with blackout dates
		var filteredSessions = todaySessions
			.Where(s => !orgBlackoutDates.Contains(date)) // Not an organization blackout
			.Where(s => !s.BlackoutDates.Any(bd => bd.Date == date)) // Not a session blackout
			.Select(s => new TodayAttendanceDTO
			{
				SessionGuid = s.SessionGuid,
				SessionName = s.Name,
				InstanceDate = date,
				HasAttendance = s.AttendanceRecords.Any(ar => ar.InstanceDate == date)
			})
			.OrderBy(s => s.SessionName)
			.ToList();

		return filteredSessions;
	}

	public async Task<List<OutstandingAttendanceDTO>> GetOutstandingAttendanceAsync(Guid organizationYearGuid)
	{
		var today = DateOnly.FromDateTime(DateTime.Now);

		// Get organization blackout dates
		var orgYear = await _grantContext.OrganizationYears
			.AsNoTracking()
			.Where(oy => oy.OrganizationYearGuid == organizationYearGuid)
			.Include(oy => oy.Organization)
			.FirstOrDefaultAsync();

		if (orgYear == null)
			return new List<OutstandingAttendanceDTO>();

		var orgBlackoutDates = await _grantContext.BlackoutDates
			.AsNoTracking()
			.Where(bd => bd.OrganizationGuid == orgYear.OrganizationGuid)
			.Select(bd => bd.Date)
			.ToListAsync();

		// Get all sessions for this org year
		var sessions = await _grantContext.Sessions
			.AsNoTracking()
			.Where(s => s.OrganizationYearGuid == organizationYearGuid)
			.Where(s => s.FirstSession < today) // Only sessions that have started
			.Where(s => _user.IsAdmin()
				|| (_user.IsCoordinator() && _user.HomeOrganizationGuids().Contains(s.OrganizationYear.OrganizationGuid))
				|| (_user.IsTeacher() && s.InstructorRegistrations.Any(ir => ir.InstructorSchoolYear.Instructor.BadgeNumber.Trim() == _user.Id())))
			.Include(s => s.DaySchedules)
			.Include(s => s.BlackoutDates)
			.Include(s => s.AttendanceRecords)
			.ToListAsync();

		var outstandingAttendance = new List<OutstandingAttendanceDTO>();

		foreach (var session in sessions)
		{
			// For each session, check all possible dates
			var sessionStart = session.FirstSession;
			var sessionEnd = session.LastSession < today ? session.LastSession : today.AddDays(-1);

			// Get all dates for this session's day schedules
			foreach (var daySchedule in session.DaySchedules)
			{
				var currentDate = sessionStart;

				// Find the first occurrence of the day of week
				while (currentDate <= sessionEnd && currentDate.DayOfWeek != daySchedule.DayOfWeek)
				{
					currentDate = currentDate.AddDays(1);
				}

				// Check each occurrence of this day of week
				while (currentDate <= sessionEnd)
				{
					// Check if attendance exists for this date
					var hasAttendance = session.AttendanceRecords.Any(ar => ar.InstanceDate == currentDate);

					// Check if this date is a blackout date
					var isOrgBlackout = orgBlackoutDates.Contains(currentDate);
					var isSessionBlackout = session.BlackoutDates.Any(bd => bd.Date == currentDate);

					// If no attendance and not a blackout, add to outstanding
					if (!hasAttendance && !isOrgBlackout && !isSessionBlackout)
					{
						outstandingAttendance.Add(new OutstandingAttendanceDTO
						{
							SessionGuid = session.SessionGuid,
							SessionName = session.Name,
							InstanceDate = currentDate
						});
					}

					currentDate = currentDate.AddDays(7); // Move to next week
				}
			}
		}

		return outstandingAttendance
			.OrderByDescending(o => o.InstanceDate)
			.ThenBy(o => o.SessionName)
			.ToList();
	}
}