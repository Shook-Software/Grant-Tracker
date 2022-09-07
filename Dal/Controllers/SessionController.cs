using Castle.Core.Internal;
using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.AttendanceRepository;
using GrantTracker.Dal.Repositories.SessionRepository;
using GrantTracker.Dal.Repositories.StudentRepository;
using GrantTracker.Dal.Schema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	[Authorize(Policy = "AnyAuthorizedUser")]
	[Route("session")]
	public class SessionController : ControllerBase
	{
		private readonly ISessionRepository _sessionRepository;
		private readonly IStudentRepository _studentRepository;
		private readonly IAttendanceRepository _attendanceRepository;

		public SessionController(ISessionRepository sessionRepository, IStudentRepository studentRepository, IAttendanceRepository attendanceRepository)
		{
			_sessionRepository = sessionRepository;
			_studentRepository = studentRepository;
			_attendanceRepository = attendanceRepository;
		}
		#region Get

		[HttpGet("")]
		public async Task<ActionResult<List<SimpleSessionView>>> Search(string sessionName, [FromQuery(Name = "grades[]")] Guid[] grades, Guid organizationGuid, Guid yearGuid)
		{
			var sessions = await _sessionRepository.GetAsync(sessionName, grades.ToList(), organizationGuid, yearGuid);
			return Ok(sessions);
		}

		//Users must be able to receive single sessions to view, edit, fill out attendance, and add students.
		[HttpGet("{sessionGuid:guid}")]
		public async Task<ActionResult<SessionView>> Get(Guid sessionGuid)
		{
			var session = await _sessionRepository.GetAsync(sessionGuid);
			return Ok(session);
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
			//check if student is already in our database
			var studentSchoolYear = await newRegistration.Student.EnsureStudentExistsAsync(_studentRepository, newRegistration);

			//if they don't exist, add them
			if (studentSchoolYear is null)
			{
				StudentDto newStudent = new()
				{
					FirstName = newRegistration.Student.FirstName,
					LastName = newRegistration.Student.LastName,
					MatricNumber = newRegistration.Student.MatricNumber,
					Grade = newRegistration.Student.Grade
				};

				await _studentRepository.AddAsync(newStudent);
				studentSchoolYear = await _studentRepository.GetSingleAsync(newStudent.MatricNumber);
			}

			var scheduleAdditions = await _sessionRepository.RegisterStudentAsync(sessionGuid, newRegistration.DayScheduleGuids, studentSchoolYear.Guid);

			//if there are conflicts, create error messages for display and return it
			if (!scheduleAdditions.Conflicts.IsNullOrEmpty())
			{
				List<SessionErrorMessage> errorMessages = new();
				scheduleAdditions.Conflicts.ForEach(conflict =>
				{
					string timeConflicts = conflict.TimeSchedules.Aggregate("", (result, current) => result += $"{current.StartTime} to {current.EndTime}\n");
					errorMessages.Add(new SessionErrorMessage()
					{
						Message = $"Conflict with existing session on {conflict.DayOfWeek}:\n {timeConflicts}",
						SessionGuid = conflict.SessionGuid
					});
				});

				return Conflict(errorMessages);
			}

			return Ok();
		}

		[HttpPost("{sessionGuid:guid}/attendance")]
		public async Task<IActionResult> SubmitAttendance(Guid sessionGuid, [FromBody] SessionAttendanceDto sessionAttendance)
		{
			//A lot of this could be moved to the repository side

			if (sessionAttendance.SessionGuid == Guid.Empty)
				throw new ArgumentException("SessionGuid cannot be empty.", nameof(sessionAttendance));

			await _attendanceRepository.AddAttendanceAsync(sessionGuid, sessionAttendance);
			return NoContent();
		}

		#endregion Post

		#region Put
		[HttpPut("")]
		public async Task<ActionResult<Guid>> EditSession([FromBody] FormSessionDto session)
		{
			await _sessionRepository.UpdateAsync(session);
			return Ok(session.Guid);
		}
		#endregion Put

		#region Delete

		[HttpDelete("{sessionGuid:Guid}")]
		public async Task<IActionResult> DeleteSession(Guid sessionGuid)
		{
			if (await _sessionRepository.GetStatusAsync(sessionGuid))
			{
				await _sessionRepository.DeleteAsync(sessionGuid);
			}
			return NoContent();
		}

		[HttpDelete("registration")]
		public async Task<IActionResult> UnregisterStudent(Guid studentSchoolYearGuid, [FromQuery(Name = "dayScheduleGuid[]")] Guid[] dayScheduleGuids)
		{
			await _sessionRepository.RemoveStudentAsync(studentSchoolYearGuid, dayScheduleGuids.ToList());
			return Ok();
		}
		#endregion Delete
	}
}