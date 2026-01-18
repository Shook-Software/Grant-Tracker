using Castle.Core.Internal;
using GrantTracker.Dal.Models.DTO;
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
using GrantTracker.Dal.Models.DTO.Attendance;
using System.Diagnostics;
using GrantTracker.Dal.Models.DTO.SessionDTO;
using ClosedXML.Excel;
using ClosedXML.Extensions;

namespace GrantTracker.Dal.Controllers;

[ApiController]
[Authorize(Policy = "Teacher")]
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
		try
        {
            var sessions = await _sessionRepository.GetAsync("", orgYearGuid);
            return Ok(sessions);
        }
		catch (Exception ex)
		{
			_logger.LogError(ex, "{Function} - orgYearGuid: {orgYearGuid}", nameof(GetAsync), orgYearGuid);
			return StatusCode(500);
		}
	}

	//Users must be able to receive single sessions to view, edit, fill out attendance, and add students.
	[HttpGet("{sessionGuid:guid}")]
	public async Task<ActionResult<SessionView>> Get(Guid sessionGuid)
    {
		try
        {
            var session = await _sessionRepository.GetAsync(sessionGuid);
            return Ok(session);
        }
		catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}", nameof(Get), sessionGuid);
            return StatusCode(500);
        }
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
			_logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}", nameof(GetOrganizationYearForSessionId), sessionGuid);
			return StatusCode(500);
		}
	}

	[HttpGet("{sessionGuid:guid}/status")]
	public async Task<ActionResult<bool>> GetSessionStatus(Guid sessionGuid)
	{
		try
		{
			return Ok(await _sessionRepository.GetStatusAsync(sessionGuid));
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}", nameof(GetSessionStatus), sessionGuid);
			return StatusCode(500);
		}
	}

	[HttpGet("{sessionGuid:Guid}/student/registration")]
	public async Task<ActionResult<List<StudentRegistrationView>>> GetStudents(Guid sessionGuid, int dayOfWeek = -1)
	{
		try
		{
			var students = await _sessionRepository.GetStudentRegistrationsAsync(sessionGuid, dayOfWeek);
			return Ok(students);
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}, dayOfWeek: {dayOfWeek}", nameof(GetStudents), sessionGuid, dayOfWeek);
			return StatusCode(500);
		}
	}

	////
	//Get - Attendance Overview
	//

	[HttpGet("{sessionGuid}/attendance")]
	public async Task<ActionResult<SimpleAttendanceViewModel>> GetAttendanceOverview(Guid sessionGuid)
	{
		try
		{
			var simpleAttendanceViews = await _attendanceRepository.GetOverviewAsync(sessionGuid);
			return Ok(simpleAttendanceViews);
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}", nameof(GetAttendanceOverview), sessionGuid);
			return StatusCode(500);
		}
	}

	////
	//Get - Full Attendance Details
	//

	[HttpGet("{sessionGuid:guid}/attendance/{attendanceGuid:guid}")]
	public async Task<ActionResult<AttendanceViewModel>> GetAttendanceRecords(Guid sessionGuid, Guid attendanceGuid)
	{
		try
		{
			var attendanceRecord = await _attendanceRepository.GetAsync(attendanceGuid);
			return Ok(attendanceRecord);
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}, attendanceGuid: {attendanceGuid}", nameof(GetAttendanceRecords), sessionGuid, attendanceGuid);
			return StatusCode(500);
		}
	}

	[HttpGet("{sessionGuid:guid}/attendance/openDates")]
	public async Task<ActionResult<List<DateOnly>>> GetOpenAttendanceDates(Guid sessionGuid, DayOfWeek? dayOfWeek)
	{
		try
		{
			SessionView session = await _sessionRepository.GetAsync(sessionGuid);

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

			List<DateOnly> attendanceDates = await _attendanceRepository.GetDatesAsync(sessionGuid);
			List<DateOnly> orgYearBlackoutDates = (await _organizationRepository.GetBlackoutDatesAsync(session.OrganizationYear.Organization.Guid)).Select(x => x.Date).ToList();
            List<DateOnly> sessionBlackoutDates = session.BlackoutDates.Select(x => x.Date).ToList();

            if (dayOfWeek is null)
			{
				List<DateOnly> openDates = new();

				foreach (var doW in session.DaySchedules.Select(x => x.DayOfWeek))
				{
                    var dates = GetWeekdaysBetween(doW, startDate, endDate)
						.Except(orgYearBlackoutDates)
						.Except(sessionBlackoutDates)
						.Except(attendanceDates)
						.ToList(); //filter coordinator-defined blackout dates and already existing attendance;

					openDates.AddRange(dates);
                }
				return Ok(openDates.OrderBy(date => date));
			}
			else
			{
                var openDates = GetWeekdaysBetween(dayOfWeek.Value, startDate, endDate)
                    .Except(orgYearBlackoutDates)
                    .Except(sessionBlackoutDates)
                    .Except(attendanceDates)
                    .ToList(); //filter coordinator-defined blackout dates and already existing attendance;

                return Ok(openDates.OrderBy(date => date));
            }
		}
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}, dayOfWeek: {dayOfWeek}", nameof(GetOpenAttendanceDates), sessionGuid, dayOfWeek);
            return StatusCode(500);
        }
    }

	[HttpGet("{sessionGuid:guid}/attendance/export")]
	public async Task<ActionResult<StreamContent>> DownloadAttendanceExportAsync(Guid sessionGuid, string startDate, string endDate)
	{
		try
		{
			XLWorkbook attendanceBook = await _attendanceRepository.CreateExcelExportAsync(sessionGuid, DateOnly.Parse(startDate), DateOnly.Parse(endDate));
			return Ok(await attendanceBook.Deliver("").Content.ReadAsStreamAsync());
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}, startDate: {startDate}, endDate: {endDate}", nameof(DownloadAttendanceExportAsync), sessionGuid, startDate, endDate);
			return StatusCode(500);
		}
	}

    #endregion Get

    #region Post

    [HttpPost("")]
	public async Task<ActionResult<Guid>> AddSession([FromBody] FormSessionDto session)
	{
		try
		{
            await _sessionRepository.AddAsync(session);
            return Created("session", session);
        }
		catch (Exception ex)
		{
            _logger.LogError(ex, "{Function} - Name: {Name}, OrganizationYearGuid: {OrganizationYearGuid}", nameof(AddSession), session.Name, session.OrganizationYearGuid);
			return StatusCode(500);
        }
	}

	[HttpPost("{sessionGuid:guid}/student/registration")]
	public async Task<ActionResult<List<SessionErrorMessage>>> RegisterStudent(Guid sessionGuid, [FromBody] StudentRegistrationDTO newRegistration)
	{
		try
        {
            await _sessionRepository.RegisterStudentAsync(sessionGuid, newRegistration.DayScheduleGuids, newRegistration.StudentSchoolYearGuid);
			return Ok();
        }
		catch (Exception ex)
		{
			_logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}, StudentSchoolYearGuid: {StudentSchoolYearGuid}", nameof(RegisterStudent), sessionGuid, newRegistration.StudentSchoolYearGuid);
            return StatusCode(500);
        }
    }

    [HttpPost("{sessionGuid:guid}/instructor/registration")]
    public async Task<IActionResult> RegisterInstructor(Guid sessionGuid, Guid instructorSchoolYearGuid)
    {
        try
        {
            await _sessionRepository.RegisterInstructorAsync(sessionGuid, instructorSchoolYearGuid);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}, instructorSchoolYearGuid: {instructorSchoolYearGuid}", nameof(RegisterInstructor), sessionGuid, instructorSchoolYearGuid);
            return StatusCode(500);
        }
    }

    [HttpPost("{destinationSessionGuid:guid}/registration/copy")]
	public async Task<ActionResult<List<string>>> CopyStudentRegistrations(Guid destinationSessionGuid, [FromBody] List<Guid> studentSchoolYearGuids)
	{
		try
		{
			List<Guid> scheduleGuids = (await _sessionRepository.GetAsync(destinationSessionGuid)).DaySchedules.Select(ds => ds.DayScheduleGuid).ToList();

			foreach (var studentSchoolYearGuid in studentSchoolYearGuids)
			{
				await _sessionRepository.RegisterStudentAsync(destinationSessionGuid, scheduleGuids, studentSchoolYearGuid);
			}

			return Created($"{destinationSessionGuid}/registration/copy", studentSchoolYearGuids);
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "{Function} - destinationSessionGuid: {destinationSessionGuid}, studentSchoolYearGuids: {studentSchoolYearGuids}", nameof(CopyStudentRegistrations), destinationSessionGuid, string.Join(", ", studentSchoolYearGuids));
			return StatusCode(500);
		}
    }

    [HttpPost("{sessionGuid:guid}/attendance/verify")]
    public async Task<ActionResult<List<AttendanceInputConflict>>> VerifyAttendance(Guid sessionGuid, string instanceDate, Guid? attendanceGuid, [FromBody] List<StudentAttendanceDto> studentRecords)
    {
        try
        {
            List<AttendanceInputConflict> conflicts = [];
            var session = await _sessionRepository.GetAsync(sessionGuid);

            if (session.SessionType.Label != "Parent")
                conflicts = await _attendanceRepository.ValidateStudentAttendanceAsync(DateOnly.Parse(instanceDate), studentRecords, attendanceGuid);

            if (conflicts.Any())
                return Conflict(conflicts);

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}, instanceDate: {instanceDate}, attendanceGuid: {attendanceGuid}", nameof(VerifyAttendance), sessionGuid, instanceDate, attendanceGuid);
            return StatusCode(500);
        }
    }

    [HttpPost("{sessionGuid:guid}/attendance")]
	public async Task<IActionResult> SubmitAttendance(Guid sessionGuid, [FromBody] SessionAttendanceDto sessionAttendance)
	{
		try
		{
			List<AttendanceInputConflict> conflicts = [];
			var session = await _sessionRepository.GetAsync(sessionGuid);

			if (session.SessionType.Label != "Parent")
			{
                conflicts = await _attendanceRepository.ValidateStudentAttendanceAsync(sessionAttendance.Date, sessionAttendance.StudentRecords);
				sessionAttendance.StudentRecords = sessionAttendance.StudentRecords.ExceptBy(conflicts.Select(x => x.StudentSchoolYearGuid), record => record.Id).ToList();
			}
			else
			{
				sessionAttendance.StudentRecords = sessionAttendance.StudentRecords.Where(sr => sr.FamilyAttendance.Any()).ToList();
				sessionAttendance.StudentRecords.ForEach(sr => { sr.Times = []; });
			}

            await _attendanceRepository.AddAsync(sessionGuid, sessionAttendance);

            if (conflicts.Count > 0)
                return Conflict(conflicts.Select(conflict =>
				{
					var student = sessionAttendance.StudentRecords.First(stu => conflict.StudentSchoolYearGuid == stu.Id);
					return $"{student.FirstName} {student.LastName} has a conflict with an existing attendance record from {conflict.StartTime.ToShortTimeString()} to {conflict.ExitTime.ToShortTimeString()}";
                }));

            return NoContent();
        }
		catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}, Date: {Date}", nameof(SubmitAttendance), sessionGuid, sessionAttendance.Date);
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
            _logger.LogError(ex, "{Function} - Guid: {Guid}, Name: {Name}", nameof(EditSession), session.Guid, session.Name);
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
            var conflicts = await _attendanceRepository.ValidateStudentAttendanceAsync(sessionAttendance.Date, sessionAttendance.StudentRecords, attendanceGuid);
            sessionAttendance.StudentRecords = sessionAttendance.StudentRecords.ExceptBy(conflicts.Select(x => x.StudentSchoolYearGuid), record => record.Id).ToList();

            await _attendanceRepository.UpdateAsync(attendanceGuid, sessionGuid, sessionAttendance);

            if (conflicts.Count > 0)
                return Conflict(conflicts.Select(conflict =>
                {
                    var student = sessionAttendance.StudentRecords.First(stu => conflict.StudentSchoolYearGuid == stu.Id);
                    return $"{student.FirstName} {student.LastName} has a conflict with an existing attendance record from {conflict.StartTime.ToShortTimeString()} to {conflict.ExitTime.ToShortTimeString()}";
                }));

            return Ok();
        }
		catch (Exception ex)
		{
            _logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}, attendanceGuid: {attendanceGuid}, Date: {Date}", nameof(EditAttendance), sessionGuid, attendanceGuid, sessionAttendance.Date);
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
            _logger.LogError(ex, "{Function} - sessionGuid: {sessionGuid}", nameof(DeleteSession), sessionGuid);
            return StatusCode(500);
        }
	}

	[HttpDelete("student/registration")]
	public async Task<IActionResult> UnregisterStudent(Guid studentSchoolYearGuid, [FromQuery(Name = "dayScheduleGuid[]")] Guid[] dayScheduleGuids)
	{
		try
		{
            await _sessionRepository.RemoveStudentAsync(studentSchoolYearGuid, dayScheduleGuids.ToList());
            return Ok();
        }
		catch (Exception ex)
		{
            _logger.LogError(ex, "{Function} - studentSchoolYearGuid: {studentSchoolYearGuid}, dayScheduleGuids: {dayScheduleGuids}", nameof(UnregisterStudent), studentSchoolYearGuid, string.Join(", ", dayScheduleGuids));
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
            _logger.LogError(ex, "{Function} - attendanceGuid: {attendanceGuid}", nameof(DeleteAttendanceRecord), attendanceGuid);
            return StatusCode(500);
        }
	}
    #endregion Delete
}