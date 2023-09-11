using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.LookupRepository;
using GrantTracker.Dal.Repositories.StudentRepository;
using GrantTracker.Dal.Schema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	[Authorize(Policy = "AnyAuthorizedUser")]
	[Route("student")]
	public class StudentController : ControllerBase
	{
		private readonly IStudentRepository _studentRepository;
		private readonly ILookupRepository _lookupRepository;

		public StudentController(IStudentRepository studentRepository, ILookupRepository lookupRepository)
		{
			_studentRepository = studentRepository;
			_lookupRepository = lookupRepository;
		}

		[HttpGet("")]
		public async Task<ActionResult<List<StudentSchoolYearViewModel>>> GetAll(string name, Guid organizationGuid, Guid yearGuid)
		{
			var students = await _studentRepository.GetAsync(name, organizationGuid, yearGuid);
			return Ok(students);
		}

		[HttpGet("synergy")]
		public async Task<ActionResult<List<StudentSchoolYearViewModel>>> SearchSynergy(string firstName, string lastName, string matricNumber, [FromQuery(Name = "grades[]")] Guid[] grades, Guid organizationYearGuid)
		{
			List<string> synergyGrades = new();
			List<string> grantTrackerGrades = new();

			foreach (Guid guid in grades)
			{
				string grade = await _lookupRepository.GetValueAsync(guid);
				string synergyGrade = GradeDto.ToSynergy(grade);

				if (!String.IsNullOrEmpty(grade))
					grantTrackerGrades.Add(grade);
				if (!String.IsNullOrEmpty(synergyGrade))
					synergyGrades.Add(synergyGrade);
			}

			var filter = new StudentFilter()
			{
				FirstName = firstName,
				LastName = lastName,
				SynergyGrades = synergyGrades,
				GrantTrackerGrades = grantTrackerGrades,
				MatricNumber = matricNumber,
				OrganizationYearGuid = organizationYearGuid
			};

			var students = await _studentRepository.SearchSynergyAsync(filter);

			return Ok(students);
		}

		[HttpGet("{studentGuid:guid}")]
		public async Task<ActionResult<StudentSchoolYearWithRecordsViewModel>> Get(Guid studentGuid)
		{
			var student = await _studentRepository.GetAsync(studentGuid);
			return Ok(student);
		}

		//not sure 
		[HttpGet("{studentYearGuid:guid}/attendance")]
		public async Task<ActionResult<List<StudentAttendanceViewModel>>> GetSingle(Guid studentYearGuid)
		{
			var studentSchoolYear = await _studentRepository.GetAsync(studentYearGuid);
			return Ok(studentSchoolYear.AttendanceRecords);
		}
	}
}