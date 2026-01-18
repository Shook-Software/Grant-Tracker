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
			try
			{
				var students = await _studentRepository.GetAsync("", organizationGuid, yearGuid);
				return Ok(students);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "{Function} - organizationGuid: {organizationGuid}, yearGuid: {yearGuid}", nameof(GetAll), organizationGuid, yearGuid);
				return StatusCode(500);
			}
		}

		[HttpGet("synergy")]
		public async Task<ActionResult<List<StudentSchoolYearViewModel>>> SearchSynergy(Guid organizationYearGuid, string? firstName = "", string? lastName = "", string? matricNumber = "", [FromQuery(Name = "grades[]")] Guid[]? grades = null)
		{
			try
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
			catch (Exception ex)
			{
				_logger.LogError(ex, "{Function} - organizationYearGuid: {organizationYearGuid}, firstName: {firstName}, lastName: {lastName}, matricNumber: {matricNumber}", nameof(SearchSynergy), organizationYearGuid, firstName, lastName, matricNumber);
				return StatusCode(500);
			}
		}

		[HttpGet("{studentGuid:guid}")]
		public async Task<ActionResult<StudentSchoolYearWithRecordsViewModel>> Get(Guid studentGuid)
		{
			try
			{
				var student = await _studentRepository.GetAsync(studentGuid);
				return Ok(student);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "{Function} - studentGuid: {studentGuid}", nameof(Get), studentGuid);
				return StatusCode(500);
			}
		}

		[HttpGet("{studentYearGuid:guid}/attendance")]
		public async Task<ActionResult<List<StudentAttendanceViewModel>>> GetSingle(Guid studentYearGuid)
		{
			try
			{
				var studentSchoolYear = await _studentRepository.GetAsync(studentYearGuid);
				return Ok(studentSchoolYear.AttendanceRecords);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "{Function} - studentYearGuid: {studentYearGuid}", nameof(GetSingle), studentYearGuid);
				return StatusCode(500);
			}
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
				_logger.LogError(ex, "{Function} - FirstName: {FirstName}, LastName: {LastName}, MatricNumber: {MatricNumber}, orgYearGuid: {orgYearGuid}", nameof(CreateNewStudentAsync), studentDto.FirstName, studentDto.LastName, studentDto.MatricNumber, orgYearGuid);
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
                _logger.LogError(ex, "{Function} - studentGroupGuid: {studentGroupGuid}, studentSchoolYearGuid: {studentSchoolYearGuid}", nameof(AddStudentToGroupAsync), studentGroupGuid, studentSchoolYearGuid);
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
                _logger.LogError(ex, "{Function} - studentGroupGuid: {studentGroupGuid}, studentSchoolYearGuid: {studentSchoolYearGuid}", nameof(DeleteStudentGroupItemAsync), studentGroupGuid, studentSchoolYearGuid);
                return StatusCode(500);
            }
        }
    }
}