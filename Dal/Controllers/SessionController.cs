using Castle.Core.Internal;
using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.AttendanceRepository;
using GrantTracker.Dal.Repositories.SessionRepository;
using GrantTracker.Dal.Repositories.StudentRepository;
using GrantTracker.Dal.Repositories.StudentSchoolYearRepository;
using GrantTracker.Dal.Repositories.InstructorRepository;
using GrantTracker.Dal.Repositories.OrganizationYearRepository;
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
		private readonly IStudentSchoolYearRepository _studentSchoolYearRepository;
		private readonly IAttendanceRepository _attendanceRepository;
		private readonly IInstructorRepository _instructorRepository;
		private readonly IOrganizationYearRepository _organizationYearRepository;

		public SessionController(ISessionRepository sessionRepository, IStudentRepository studentRepository, IStudentSchoolYearRepository studentSchoolYearRepository, IAttendanceRepository attendanceRepository, IInstructorRepository instructorRepository, IOrganizationYearRepository organizationYearRepository)
		{
			_sessionRepository = sessionRepository;
			_studentRepository = studentRepository;
			_studentSchoolYearRepository = studentSchoolYearRepository;
			_attendanceRepository = attendanceRepository;
			_instructorRepository = instructorRepository;
			_organizationYearRepository = organizationYearRepository;
		}
		#region Get

		[HttpGet("")]
		public async Task<ActionResult<List<SimpleSessionView>>> GetAsync(string sessionName, [FromQuery(Name = "grades[]")] Guid[] grades, Guid organizationGuid, Guid yearGuid)
		{
			var organizationYearGuid = await _organizationYearRepository.GetGuidAsync(organizationGuid, yearGuid);
			var sessions = await _sessionRepository.GetAsync(sessionName, organizationYearGuid);
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

		[HttpGet("{sessionGuid:guid}/attendance")]
		public async Task<ActionResult<List<AttendanceRecordView>>> GetAttendanceRecords(Guid sessionGuid)
		{
			var attendanceRecords = await _attendanceRepository.GetAttendanceRecordsAsync(sessionGuid);

			return Ok(attendanceRecords);
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
			//Fetch basic session details
			var targetSession = await _sessionRepository.GetAsync(sessionGuid);

			if (targetSession == null) 
				return BadRequest("SessionGuid is invalid: " + sessionGuid);

			//ensure student exists in database
			var targetStudent = await _studentRepository.CreateIfNotExistsAsync(newRegistration.Student);

			//ensure student school year exists for the session's organizationYear
			var targetStudentSchoolYear = await _studentSchoolYearRepository.CreateIfNotExistsAsync(targetStudent.Guid, targetSession.OrganizationYear.Guid, newRegistration.Student.Grade);

			//validate the registration and ensure that the student does not have time conflicts
			var dayScheduleGuids = targetSession.DaySchedules.Select(ds => ds.DayScheduleGuid).ToList();
			List<string> conflicts = await _sessionRepository.ValidateStudentRegistrationAsync(dayScheduleGuids, targetStudentSchoolYear.Guid);

			if (!conflicts.IsNullOrEmpty())
			{
				return Conflict(conflicts);
			}

			await _sessionRepository.RegisterStudentAsync(sessionGuid, newRegistration.DayScheduleGuids, targetStudentSchoolYear.Guid);

			return Created($"{sessionGuid}/registration", targetStudentSchoolYear.Guid);
		}



		[HttpPost("{destinationSessionGuid:guid}/registration/copy")]
		public async Task<ActionResult<List<string>>> CopyStudentRegistrations(Guid destinationSessionGuid, [FromBody] List<Guid> studentSchoolYearGuids)
		{
			//the student school years are assured to exist, otherwise they wouldn't have been registered already
			List<Guid> scheduleGuids = (await _sessionRepository.GetAsync(destinationSessionGuid)).DaySchedules.Select(ds => ds.DayScheduleGuid).ToList();
			List<string> conflicts = await _sessionRepository.ValidateStudentRegistrationsAsync(destinationSessionGuid, studentSchoolYearGuids);

			if (conflicts.Count > 0)
				return Conflict(conflicts);

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
			//A lot of this could be moved to the repository side

			var organizationYearGuid = (await _sessionRepository.GetAsync(sessionGuid)).OrganizationYear.Guid;

			if (sessionAttendance.SessionGuid == Guid.Empty)
				throw new ArgumentException("SessionGuid cannot be empty.", nameof(sessionAttendance));

			List<InstructorAttendanceDto> substituteAttendance = new();
			foreach (var substituteRecord in sessionAttendance.SubstituteRecords)
			{
				Guid instructorSchoolYearGuid = substituteRecord.InstructorSchoolYearGuid;

				//this needs to check the organization year specified by the session, not just try and find one for her
				bool instructorSchoolYearGuidExists = instructorSchoolYearGuid != Guid.Empty;

				if (!instructorSchoolYearGuidExists)
				{
					bool substituteHasBadgeNumber = !substituteRecord.Substitute.BadgeNumber.IsNullOrEmpty();
					if (substituteHasBadgeNumber)
					{
						instructorSchoolYearGuid = await _instructorRepository.CreateAsync(substituteRecord.Substitute, organizationYearGuid);
					}
					if (instructorSchoolYearGuid == Guid.Empty)
						instructorSchoolYearGuid = await _instructorRepository.CreateAsync(substituteRecord.Substitute, organizationYearGuid);
				}

				InstructorAttendanceDto instructorAttendanceRecord = new()
				{
					InstructorSchoolYearGuid = instructorSchoolYearGuid,
					Attendance = substituteRecord.Attendance
				};

				substituteAttendance.Add(instructorAttendanceRecord);
			}

			sessionAttendance.InstructorRecords.AddRange(substituteAttendance);
			sessionAttendance.InstructorRecords = sessionAttendance.InstructorRecords.Distinct().ToList(); //ensure the substitutes haven't introduced a duplication error

			List<StudentAttendanceDto> studentAttendance = new();
			foreach (var studentRecord in sessionAttendance.StudentRecords)
			{
				//stopgap solution. We need to handle adding a student that is not with the current OrgYear a little more eloquently.. maybe, idk
				Guid studentGuid = studentRecord.StudentGuid;

				bool studentExistsInGrantTracker = studentGuid != Guid.Empty;
				if (!studentExistsInGrantTracker)
				{
					var student = await _studentRepository.CreateIfNotExistsAsync(studentRecord.Student);
					studentGuid = student.Guid;
				}
				//ensure studentSchoolYear exists for the session orgYear
				var studentSchoolYear = await _studentSchoolYearRepository.CreateIfNotExistsAsync(studentGuid, organizationYearGuid, studentRecord.Student.Grade);

				StudentAttendanceDto studentAttendanceDto = new()
				{
					StudentGuid = studentGuid,
					StudentSchoolYearGuid = studentSchoolYear.Guid,
					Student = studentRecord.Student,
					Attendance = studentRecord.Attendance
				};

				studentAttendance.Add(studentAttendanceDto);
			}
			//reassign with verified student records
			sessionAttendance.StudentRecords = studentAttendance;

			await _attendanceRepository.AddAttendanceAsync(sessionGuid, sessionAttendance);
			return NoContent();
		}

		#endregion Post

		#region Patch
		[HttpPut("")]
		public async Task<ActionResult<Guid>> EditSession([FromBody] FormSessionDto session)
		{
			await _sessionRepository.UpdateAsync(session);
			return Ok(session.Guid);
		}

		[HttpPatch("attendance")]
		public async Task<IActionResult> EditAttendance(Guid attendanceGuid, [FromBody] SessionAttendanceDto sessionAttendance)
		{
			var organizationYearGuid = (await _sessionRepository.GetAsync(sessionAttendance.SessionGuid)).OrganizationYear.Guid;

			//instructors don't need validation as they are ensured to exist in the given orgYear
			//Ensure substitutes have all information required and are added to the session's organizationYear
			List<InstructorAttendanceDto> substituteAttendance = new();
			foreach (var substituteRecord in sessionAttendance.SubstituteRecords)
			{
				Guid instructorSchoolYearGuid = Guid.Empty;
				
				bool substituteHasBadgeNumber = !substituteRecord.Substitute.BadgeNumber.IsNullOrEmpty();
				if (substituteHasBadgeNumber)
					instructorSchoolYearGuid = (await _instructorRepository.GetInstructorSchoolYearAsync(substituteRecord.Substitute.BadgeNumber, organizationYearGuid)).Guid;

				if (instructorSchoolYearGuid == Guid.Empty)
					instructorSchoolYearGuid = await _instructorRepository.CreateAsync(substituteRecord.Substitute, organizationYearGuid);

				InstructorAttendanceDto instructorAttendanceRecord = new()
				{
					InstructorSchoolYearGuid = instructorSchoolYearGuid,
					Attendance = substituteRecord.Attendance
				};

				substituteAttendance.Add(instructorAttendanceRecord);
			}

			//reassign with verified instructor records
			sessionAttendance.InstructorRecords.AddRange(substituteAttendance);
			sessionAttendance.InstructorRecords = sessionAttendance.InstructorRecords.Distinct().ToList(); //ensure the substitutes haven't introduced a duplication error

			//Ensure students have all information required and are added to the session's organizationYear
			List<StudentAttendanceDto> studentAttendance = new();
			foreach (var studentRecord in sessionAttendance.StudentRecords)
			{
				//stopgap solution. We need to handle adding a student that is not with the current OrgYear a little more eloquently.. maybe, idk
				Guid studentGuid = studentRecord.StudentGuid;

				bool studentExistsInGrantTracker = studentGuid != Guid.Empty;
				if (!studentExistsInGrantTracker)
				{
					var student = await _studentRepository.CreateIfNotExistsAsync(studentRecord.Student);
					studentGuid = student.Guid;
				}
				//ensure studentSchoolYear exists for the session orgYear
				var studentSchoolYear = await _studentSchoolYearRepository.CreateIfNotExistsAsync(studentGuid, organizationYearGuid, studentRecord.Student.Grade);

				StudentAttendanceDto studentAttendanceDto = new()
				{
					StudentGuid = studentGuid,
					StudentSchoolYearGuid = studentSchoolYear.Guid,
					Student = studentRecord.Student,
					Attendance = studentRecord.Attendance
				};

				studentAttendance.Add(studentAttendanceDto);
			}
			//reassign with verified student records
			sessionAttendance.StudentRecords = studentAttendance;

			await _attendanceRepository.EditAttendanceAsync(attendanceGuid, sessionAttendance);

			return Ok();
		}

		#endregion Patch

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

		[HttpDelete("attendance")]
		public async Task<IActionResult> DeleteAttendanceRecord(Guid attendanceGuid)
		{
			await _sessionRepository.RemoveAttendanceRecordAsync(attendanceGuid);
			return Ok();
		}
		#endregion Delete
	}
}