using Castle.Core.Internal;
using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.AttendanceRepository;
using GrantTracker.Dal.Repositories.SessionRepository;
using GrantTracker.Dal.Repositories.StudentRepository;
using GrantTracker.Dal.Repositories.StudentSchoolYearRepository;
using GrantTracker.Dal.Repositories.InstructorRepository;
using GrantTracker.Dal.Repositories.InstructorSchoolYearRepository;
using GrantTracker.Dal.Repositories.OrganizationYearRepository;
using GrantTracker.Dal.Schema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrantTracker.Dal.Repositories.OrganizationRepository;
using GrantTracker.Utilities;
using GrantTracker.Dal.Schema.Sprocs;
using GrantTracker.Dal.Models.Dto.Attendance;
using System.Diagnostics;

namespace GrantTracker.Dal.Controllers;

[ApiController]
[Authorize(Policy = "AnyAuthorizedUser")]
[Route("session")]
public class SessionController : ControllerBase
{
	private readonly ISessionRepository _sessionRepository;
	private readonly IStudentRepository _studentRepository;
	private readonly IStudentSchoolYearRepository _studentSchoolYearRepository;
	private readonly IAttendanceRepository _attendanceRepository;
	private readonly IInstructorRepository _instructorRepository;
	private readonly IInstructorSchoolYearRepository _instructorSchoolYearRepository;
    private readonly IOrganizationRepository _organizationRepository;
    private readonly IOrganizationYearRepository _organizationYearRepository;
    private readonly ILogger<SessionController> _logger;

    public SessionController(ISessionRepository sessionRepository, IStudentRepository studentRepository, IStudentSchoolYearRepository studentSchoolYearRepository, 
		IAttendanceRepository attendanceRepository, IInstructorRepository instructorRepository, IOrganizationYearRepository organizationYearRepository, 
		IOrganizationRepository organizationRepository, IInstructorSchoolYearRepository instructorSchoolYearRepository
		, ILogger<SessionController> logger)
	{
		_sessionRepository = sessionRepository;
		_studentRepository = studentRepository;
		_studentSchoolYearRepository = studentSchoolYearRepository;
		_attendanceRepository = attendanceRepository;
		_instructorRepository = instructorRepository;
		_instructorSchoolYearRepository = instructorSchoolYearRepository;
		_organizationRepository = organizationRepository;
		_organizationYearRepository = organizationYearRepository;
		_logger = logger;
	}

	#region Get

	[HttpGet("")]
	public async Task<ActionResult<List<SimpleSessionView>>> GetAsync(Guid orgYearGuid)
    {
        Stopwatch watch = new(); watch.Start();
		var sessions = await _sessionRepository.GetAsync("", orgYearGuid);
        Debug.WriteLine($"Returned sessionS in {watch.ElapsedMilliseconds / 1000d:#.##}");
        return Ok(sessions);
	}

	//Users must be able to receive single sessions to view, edit, fill out attendance, and add students.
	[HttpGet("{sessionGuid:guid}")]
	public async Task<ActionResult<SessionView>> Get(Guid sessionGuid)
    {
        Stopwatch watch = new(); watch.Start();
        var session = await _sessionRepository.GetAsync(sessionGuid);
        Debug.WriteLine($"Returned session in {watch.ElapsedMilliseconds / 1000d:#.##}");
        return Ok(session);
	}

	[HttpGet("{sessionGuid:guid}/orgYear")]
	public async Task<ActionResult<OrganizationYearView>> GetOrganizationYearForSessionId(Guid sessionGuid)
	{
		try
		{
			var orgYear = await _organizationYearRepository.GetAsyncBySessionId(sessionGuid);
			return Ok(OrganizationYearView.FromDatabase(orgYear));
		}
		catch (Exception ex)
		{
			_logger.LogError("", ex);
			return StatusCode(500);
		}
	}

	[HttpGet("{sessionGuid:guid}/status")]
	public async Task<ActionResult<bool>> GetSessionStatus(Guid sessionGuid)
	{
		return Ok(await _sessionRepository.GetStatusAsync(sessionGuid));
	}

	[HttpGet("{sessionGuid:Guid}/registration")]
	public async Task<ActionResult<List<StudentRegistrationView>>> GetStudents(Guid sessionGuid, int dayOfWeek = -1)
	{
		var students = await _sessionRepository.GetStudentRegistrationsAsync(sessionGuid, dayOfWeek);
		return Ok(students);
	}

	////
	//Get - Attendance Overview
	//

	[HttpGet("{sessionGuid}/attendance")]
	public async Task<ActionResult<SimpleAttendanceViewModel>> GetAttendanceOverview(Guid sessionGuid)
	{
		var simpleAttendanceViews = await _attendanceRepository.GetAttendanceOverviewAsync(sessionGuid);
		return Ok(simpleAttendanceViews);
	}

	////
	//Get - Full Attendance Details
	//

	[HttpGet("{sessionGuid:guid}/attendance/{attendanceGuid:guid}")]
	public async Task<ActionResult<AttendanceViewModel>> GetAttendanceRecords(Guid sessionGuid, Guid attendanceGuid)
	{
		var attendanceRecord = await _attendanceRepository.GetAttendanceRecordAsync(attendanceGuid);

		return Ok(attendanceRecord);
	}

	[HttpGet("{sessionGuid:guid}/attendance/openDates")]
	public async Task<ActionResult<List<DateOnly>>> GetOpenAttendanceDates(Guid sessionGuid, DayOfWeek? dayOfWeek)
	{
		try
		{
			var session = await _sessionRepository.GetAsync(sessionGuid);

			if (!User.IsAdmin() && !User.HomeOrganizationGuids().Contains(session.OrganizationYear.Organization.Guid))
				return Unauthorized();

			DateOnly startDate = session.FirstSession;
			DateOnly endDate = session.LastSession;

			static List<DateOnly> GetWeekdaysBetween(DayOfWeek dayOfWeek, DateOnly startDate, DateOnly endDate)
			{
				List<DateOnly> openDates = new();

				//check out yield return as an iterable
				DateOnly currentDate;
				if (startDate.DayOfWeek < dayOfWeek)
				{
					currentDate = startDate.AddDays(dayOfWeek - startDate.DayOfWeek);
				}
				else if (startDate.DayOfWeek > dayOfWeek)
				{
					currentDate = startDate.AddDays((int)DayOfWeek.Saturday - (int)startDate.DayOfWeek + (int)dayOfWeek + 1);
				}
				else
				{
					currentDate = startDate;
				}

				while (currentDate <= endDate)
				{
					openDates.Add(currentDate);
					currentDate = currentDate.AddDays(7);
				}

				openDates.Sort();
				return openDates;
			}

			IEnumerable<DateOnly> attendanceDates = await _attendanceRepository.GetAttendanceDatesAsync(sessionGuid);
			IEnumerable<DateOnly> blackoutDates = (await _organizationRepository.GetBlackoutDatesAsync(session.OrganizationYear.Organization.Guid)).Select(x => x.Date);

			if (dayOfWeek is null)
			{
				List<DateOnly> openDates = new();

				foreach (var doW in session.DaySchedules.Where(x => x.DayOfWeek == dayOfWeek).Select(x => x.DayOfWeek))
				{
                    var dates = GetWeekdaysBetween(doW, startDate, endDate)
						.Except(blackoutDates)
						.Except(attendanceDates)
						.ToList(); //filter coordinator-defined blackout dates and already existing attendance;

					openDates.AddRange(dates);
                }

				return Ok(openDates);
			}
			else
			{
                var openDates = GetWeekdaysBetween(dayOfWeek.Value, startDate, endDate)
                    .Except(blackoutDates)
                    .Except(attendanceDates)
                    .ToList(); //filter coordinator-defined blackout dates and already existing attendance;

                return Ok(openDates);
            }
		}
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured.", nameof(GetOpenAttendanceDates));
            return StatusCode(500);
        }
    }


    #endregion Get

    #region Post

    [HttpPost("")]
	public async Task<ActionResult<Guid>> AddSession([FromBody] FormSessionDto session)
	{
		await _sessionRepository.AddAsync(session);
		return Created("session", session);
	}


	[HttpPost("{sessionGuid:guid}/registration")]
	public async Task<ActionResult<List<SessionErrorMessage>>> RegisterStudent(Guid sessionGuid, [FromBody] StudentRegistrationDto newRegistration)
	{
		//Fetch basic session details
		var targetSession = await _sessionRepository.GetAsync(sessionGuid);

		if (targetSession == null) 
			return BadRequest("SessionGuid is invalid: " + sessionGuid);

		var targetStudent = await _studentRepository.CreateIfNotExistsAsync(newRegistration.Student);
		var targetStudentSchoolYear = await _studentSchoolYearRepository.CreateIfNotExistsAsync(targetStudent.Guid, targetSession.OrganizationYear.Guid);

		await _sessionRepository.RegisterStudentAsync(sessionGuid, newRegistration.DayScheduleGuids, targetStudentSchoolYear.Guid);

		return Created($"{sessionGuid}/registration", targetStudentSchoolYear.Guid);
	}



	[HttpPost("{destinationSessionGuid:guid}/registration/copy")]
	public async Task<ActionResult<List<string>>> CopyStudentRegistrations(Guid destinationSessionGuid, [FromBody] List<Guid> studentSchoolYearGuids)
	{
		//the student school years are assured to exist, otherwise they wouldn't have been registered already
		List<Guid> scheduleGuids = (await _sessionRepository.GetAsync(destinationSessionGuid)).DaySchedules.Select(ds => ds.DayScheduleGuid).ToList();

		//we cannot make a list of Tasks without making the requisite repositories transient. Otherwise, thread-unsafe operation occurs.
		foreach (var studentSchoolYearGuid in studentSchoolYearGuids)
		{
			await _sessionRepository.RegisterStudentAsync(destinationSessionGuid, scheduleGuids, studentSchoolYearGuid);
		}

		return Created($"{destinationSessionGuid}/registration/copy", studentSchoolYearGuids);
	}
	
	[HttpPost("{sessionGuid:guid}/attendance")]
	public async Task<IActionResult> SubmitAttendance(Guid sessionGuid, [FromBody] SessionAttendanceDto sessionAttendance)
	{
		try
		{
			List<AttendanceConflict> conflicts = new();
			var session = await _sessionRepository.GetAsync(sessionGuid);

            if (sessionGuid == Guid.Empty)
                throw new ArgumentException("SessionGuid cannot be empty.", nameof(sessionAttendance));

			if (session.SessionType.Label != "Parent")
			{
                conflicts = await _sessionRepository.ValidateStudentAttendanceAsync(sessionAttendance.Date, sessionAttendance.StudentRecords);
				sessionAttendance.StudentRecords = sessionAttendance.StudentRecords.ExceptBy(conflicts.Select(x => x.StudentSchoolYearGuid), record => record.Id).ToList();
			}

            await _attendanceRepository.AddAttendanceAsync(sessionGuid, sessionAttendance);

            if (conflicts.Count > 0)
                return Conflict(conflicts.Select(x => x.Error));

            return NoContent();
        }
		catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured.", nameof(SubmitAttendance));
            return StatusCode(500);
		}
	}

	#endregion Post

	#region Patch
	[HttpPatch("")]
	public async Task<ActionResult<Guid>> EditSession([FromBody] FormSessionDto session)
	{
		try
        {
            await _sessionRepository.UpdateAsync(session);
            return Ok(session.Guid);
        }
		catch (Exception ex)
		{
            _logger.LogError(ex, "{Function} - An unhandled error occured.", nameof(EditSession));
            return StatusCode(500);
        }
	}

	//We need a builder pattern for grabbing most variable info..
	//this endpoint needs to be secured and ensure the requestor can view the resources before doing any actions...
	[HttpPatch("{sessionGuid:guid}/attendance/{attendanceGuid:guid}")]
	public async Task<IActionResult> EditAttendance(Guid sessionGuid, Guid attendanceGuid, [FromBody] SessionAttendanceDto sessionAttendance)
	{
		try
		{
            var errorList = await _sessionRepository.ValidateStudentAttendanceAsync(sessionAttendance.Date, sessionAttendance.StudentRecords, attendanceGuid);
            sessionAttendance.StudentRecords = sessionAttendance.StudentRecords.ExceptBy(errorList.Select(x => x.StudentSchoolYearGuid), record => record.Id).ToList();

            await _attendanceRepository.UpdateAttendanceAsync(attendanceGuid, sessionGuid, sessionAttendance);

            if (errorList.Count > 0)
                return Conflict(errorList.Select(x => x.Error));

            return Ok();
        }
		catch (Exception ex)
		{
            _logger.LogError(ex, "{Function} - An unhandled error occured.", nameof(EditAttendance));
            return StatusCode(500, "An unexpected error occurred while editing attendance. No changes were made.");
		}
	}

	#endregion Patch

	#region Delete

	[HttpDelete("{sessionGuid:Guid}")]
	public async Task<IActionResult> DeleteSession(Guid sessionGuid)
	{
		try
		{
            if (await _sessionRepository.GetStatusAsync(sessionGuid))
            {
                await _sessionRepository.DeleteAsync(sessionGuid);
            }
            return NoContent();
        }
		catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured.", nameof(DeleteSession));
            return StatusCode(500);
        }
	}

	[HttpDelete("registration")]
	public async Task<IActionResult> UnregisterStudent(Guid studentSchoolYearGuid, [FromQuery(Name = "dayScheduleGuid[]")] Guid[] dayScheduleGuids)
	{
		try
		{
            await _sessionRepository.RemoveStudentAsync(studentSchoolYearGuid, dayScheduleGuids.ToList());
            return Ok();
        }
		catch (Exception ex)
		{
            _logger.LogError(ex, "{Function} - An unhandled error occured.", nameof(UnregisterStudent));
            return StatusCode(500);
        }
	}

	[HttpDelete("attendance")]
	public async Task<IActionResult> DeleteAttendanceRecord(Guid attendanceGuid)
	{
		try
		{
            await _sessionRepository.RemoveAttendanceRecordAsync(attendanceGuid);
            return Ok();
        }
		catch (Exception ex)
		{
            _logger.LogError(ex, "{Function} - An unhandled error occured.", nameof(DeleteAttendanceRecord));
            return StatusCode(500);
        }
	}
    #endregion Delete
}