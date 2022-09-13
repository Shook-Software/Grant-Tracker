using Castle.Core.Internal;
using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.AttendanceRepository;
using GrantTracker.Dal.Repositories.SessionRepository;
using GrantTracker.Dal.Repositories.StudentRepository;
using GrantTracker.Dal.Repositories.InstructorRepository;
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
		private readonly IInstructorRepository _instructorRepository;

		public SessionController(ISessionRepository sessionRepository, IStudentRepository studentRepository, IAttendanceRepository attendanceRepository, IInstructorRepository instructorRepository)
		{
			_sessionRepository = sessionRepository;
			_studentRepository = studentRepository;
			_attendanceRepository = attendanceRepository;
			_instructorRepository = instructorRepository;
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

		[HttpGet("{sessionGuid:guid}/attendance/openDates")]
		public async Task<ActionResult<List<DateOnly>>> GetOpenAttendanceDates(Guid sessionGuid, DayOfWeek dayOfWeek)
		{
			var session = await _sessionRepository.GetAsync(sessionGuid);
			DateOnly startDate = session.FirstSession;
			DateOnly endDate = session.LastSession;

			List<DateOnly> GetWeekdaysBetween(DayOfWeek dayOfWeek, DateOnly startDate, DateOnly endDate)
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

				openDates.Add(currentDate);
				while (currentDate < endDate)
				{
					currentDate = currentDate.AddDays(7);
					openDates.Add(currentDate);
				}

				openDates.Sort();
				return openDates;
			}
			

			List<DateOnly> attendanceDates = await _attendanceRepository.GetAttendanceDatesAsync(sessionGuid);

			var openDates = GetWeekdaysBetween(dayOfWeek, startDate, endDate).Where(openDate => !attendanceDates.Any(closedDate => closedDate == openDate)).ToList();

			return Ok(openDates);
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
			var studentSchoolYear = await _studentRepository.GetSingleAsync(newRegistration.Student.MatricNumber);

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



		[HttpPost("{destinationSessionGuid:guid}/registration/copy")]
		public async Task<ActionResult<List<string>>> CopyStudentRegistrations(Guid destinationSessionGuid, [FromBody] List<Guid> studentSchoolYearGuids)
		{
			var conflicts = await _sessionRepository.ValidateStudentRegistrationsAsync(destinationSessionGuid, studentSchoolYearGuids);

			if (conflicts.Count > 0)
				return Conflict(conflicts);

			return Created($"{destinationSessionGuid}/registration", studentSchoolYearGuids);
		}


		//THIS NEEDS TO USE THE TARGETED ORGGUID AND YEARGUID otherwise we'll have reporting issues when Liz fills things in
		[HttpPost("{sessionGuid:guid}/attendance")]
		public async Task<IActionResult> SubmitAttendance(Guid sessionGuid, [FromBody] SessionAttendanceDto sessionAttendance)
		{
			//A lot of this could be moved to the repository side

			if (sessionAttendance.SessionGuid == Guid.Empty)
				throw new ArgumentException("SessionGuid cannot be empty.", nameof(sessionAttendance));

			List<InstructorAttendanceDto> substituteAttendance = new();
			foreach (var substituteRecord in sessionAttendance.SubstituteRecords)
			{
				Guid instructorSchoolYearGuid;
				bool substituteHasBadgeNumber = !substituteRecord.Substitute.BadgeNumber.IsNullOrEmpty();

				if (substituteHasBadgeNumber)
					instructorSchoolYearGuid = (await _instructorRepository.GetInstructorSchoolYearAsync(substituteRecord.Substitute.BadgeNumber)).Guid;
				else
					instructorSchoolYearGuid = await _instructorRepository.CreateAsync(substituteRecord.Substitute);

				InstructorAttendanceDto instructorAttendanceRecord = new()
				{
					InstructorSchoolYearGuid = instructorSchoolYearGuid,
					Attendance = substituteRecord.Attendance
				};

				substituteAttendance.Add(instructorAttendanceRecord);
			}

			sessionAttendance.InstructorRecords.AddRange(substituteAttendance);
			sessionAttendance.InstructorRecords = sessionAttendance.InstructorRecords.Distinct().ToList(); //ensure the substitutes haven't introduced a duplication error

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