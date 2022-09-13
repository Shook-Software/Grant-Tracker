using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Repositories.InstructorRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrantTracker.Dal.Models.Views;

//This is where Instructors are grabbed from Synergy and added to Grant Tracker
namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	[Authorize(Policy = "AnyAuthorizedUser")]
	[Route("instructor")]
	public class InstructorController : ControllerBase
	{
		private readonly IInstructorRepository _instructorRepository;

		public InstructorController(IInstructorRepository instructorRepository)
		{
			_instructorRepository = instructorRepository;
		}

		[HttpGet("")]
		public async Task<ActionResult<List<InstructorSchoolYearView>>> GetInstructors(string name, Guid organizationGuid, Guid yearGuid)
		{
			var instructors = await _instructorRepository.GetInstructorsAsync(name, organizationGuid, yearGuid);
			return Ok(instructors);
		}

		//should we in some way umbrella this under Organization/OrganizationYear control?
		[HttpGet("{instructorSchoolYearGuid:guid}")]
		public async Task<ActionResult<InstructorSchoolYearView>> GetInstructor(Guid instructorSchoolYearGuid)
		{
			var instructorSchoolYear = await _instructorRepository.GetInstructorSchoolYearAsync(instructorSchoolYearGuid);
			return Ok(instructorSchoolYear);
		}

		[HttpGet("search")]
		public async Task<ActionResult<List<EmployeeDto>>> SearchAllDistrictEmployees(string name = "", string badgeNumber = "")
		{
			return await _instructorRepository.SearchSynergyStaffAsync(name, badgeNumber);
		}

		[HttpPost("add")]
		public async Task<IActionResult> AddInstructor(InstructorDto instructor)
		{
			await _instructorRepository.CreateAsync(instructor);
			return NoContent();
		}

		public class PatchStatusProps
		{
			public Guid InstructorSchoolYearGuid { get; set; }
			public Guid StatusGuid { get; set; }
		}

		[HttpPatch("{instructorSchoolYearGuid:guid}/status")]
		public async Task<IActionResult> AlterInstructorStatus(Guid instructorSchoolYearGuid, [FromBody] InstructorSchoolYearView instructorSchoolYear)
		{
			await _instructorRepository.UpdateInstructorAsync(instructorSchoolYearGuid, instructorSchoolYear);
			return NoContent();
		}
	}
}