using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DropdownRepository;
using Microsoft.AspNetCore.Mvc;

namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	[Route("dropdown")]
	public class DropdownController : ControllerBase
	{
		private readonly IDropdownRepository _dropdownRepository;

		public DropdownController(IDropdownRepository repository)
		{
			_dropdownRepository = repository;
		}

		[HttpGet("view/all")]
		public async Task<ActionResult<SessionDropdownOptions>> GetAllAsync()
		{
			try
			{
				var allOptions = await _dropdownRepository.GetAllSessionDropdownOptionsAsync();
				return Ok(allOptions);
			}
			catch (Exception ex)
			{
				//log
				return StatusCode(500, ex.Message);
			}
		}

		[HttpGet("view/instructorStatus")]
		public async Task<ActionResult<List<DropdownOption>>> GetStatuses()
		{
			var instructorStatuses = await _dropdownRepository.GetInstructorStatusesAsync();
			return Ok(instructorStatuses);
		}

		[HttpGet("view/grades")]
		public async Task<ActionResult<List<DropdownOption>>> GetGrades()
		{
			var grades = await _dropdownRepository.GetGradesAsync();
			return Ok(grades);
		}

		[HttpGet("organization")]
		public async Task<ActionResult<List<OrganizationView>>> GetOrganizations()
		{
			var organizations = await _dropdownRepository.GetOrganizationsAsync();
			return Ok(organizations);
		}

		[HttpGet("year")]
		public async Task<ActionResult<List<YearView>>> GetOrganizationYears(Guid organizationGuid)
		{
			var years = await _dropdownRepository.GetOrganizationYearsAsync(organizationGuid);
			return Ok(years);
		}

		[HttpPost("")]
		public async Task<IActionResult> AddDropdownValue()
		{

			return NoContent();
		}
	}
}