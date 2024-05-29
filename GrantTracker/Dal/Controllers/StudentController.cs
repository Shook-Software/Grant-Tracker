using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.LookupRepository;
using GrantTracker.Dal.Repositories.StudentRepository;
using GrantTracker.Dal.Repositories.StudentSchoolYearRepository;
using GrantTracker.Dal.Schema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	[Authorize(Policy = "Teacher")]
	[Route("student")]
	public class StudentController : ControllerBase
	{
		private readonly IStudentRepository _studentRepository;
        private readonly IStudentSchoolYearRepository _studentSchoolYearRepository;
        private readonly ILookupRepository _lookupRepository;
        private readonly ILogger<StudentController> _logger;

        public StudentController(IStudentRepository studentRepository, IStudentSchoolYearRepository ssyRepo, ILookupRepository lookupRepository, ILogger<StudentController> logger)
		{
			_studentSchoolYearRepository = ssyRepo;
			_studentRepository = studentRepository;
			_lookupRepository = lookupRepository;
			_logger = logger;
		}

		[HttpGet("")]
		public async Task<ActionResult<List<StudentSchoolYearViewModel>>> GetAll(Guid organizationGuid, Guid yearGuid)
		{
			var students = await _studentRepository.GetAsync("", organizationGuid, yearGuid);
			return Ok(students);
		}

		[HttpGet("synergy")]
		public async Task<ActionResult<List<StudentSchoolYearViewModel>>> SearchSynergy(Guid organizationYearGuid, string? firstName = "", string? lastName = "", string? matricNumber = "", [FromQuery(Name = "grades[]")] Guid[]? grades = null)
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

		[HttpGet("{studentYearGuid:guid}/attendance")]
		public async Task<ActionResult<List<StudentAttendanceViewModel>>> GetSingle(Guid studentYearGuid)
		{
			var studentSchoolYear = await _studentRepository.GetAsync(studentYearGuid);
			return Ok(studentSchoolYear.AttendanceRecords);
		}

		[HttpPost("")]
		public async Task<ActionResult<Guid>> CreateNewStudentAsync([FromBody] StudentDTO studentDto, Guid orgYearGuid)
		{
			try
			{
				StudentViewModel student = await _studentRepository.CreateIfNotExistsAsync(studentDto);
				StudentSchoolYearViewModel studentSchoolYear = await _studentSchoolYearRepository.CreateIfNotExistsAsync(student.Guid, orgYearGuid);

				return Ok(studentSchoolYear.Guid);
            }
			catch (Exception ex)
			{
				_logger.LogError(ex, "");
				return StatusCode(500);
			}
        }

        [HttpPost("/studentSchoolYear/{studentSchoolYearGuid:guid}/studentGroup/{studentGroupGuid:guid}")]
        public async Task<IActionResult> AddStudentToGroupAsync(Guid studentGroupGuid, Guid studentSchoolYearGuid)
        {
            try
            {
                await _studentSchoolYearRepository.AddStudentGroupItem(studentGroupGuid, studentSchoolYearGuid);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "");
                return StatusCode(500);
            }
        }

        [HttpDelete("/studentSchoolYear/{studentSchoolYearGuid:guid}/studentGroup/{studentGroupGuid:guid}")]
        public async Task<IActionResult> DeleteStudentGroupItemAsync(Guid studentGroupGuid, Guid studentSchoolYearGuid)
        {
            try
            {
                await _studentSchoolYearRepository.DeleteStudentGroupItem(studentGroupGuid, studentSchoolYearGuid);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "");
                return StatusCode(500);
            }
        }
    }
}