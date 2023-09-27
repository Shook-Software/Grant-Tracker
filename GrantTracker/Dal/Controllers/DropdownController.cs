using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DropdownRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	[Route("dropdown")]
	[Authorize]
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
			var user = HttpContext.User;
			var organizations = await _dropdownRepository.GetOrganizationsAsync(user.IsAdmin(), User.HomeOrganizationGuids());
			return Ok(organizations);
		}

		[HttpGet("year")]
		public async Task<ActionResult<List<YearView>>> GetOrganizationYears(Guid? OrganizationGuid = default)
		{
			if (!HttpContext.User.IsAuthorizedToViewOrganization(OrganizationGuid))
				return Unauthorized();

			var years = await _dropdownRepository.GetOrganizationYearsAsync(OrganizationGuid);
			return Ok(years);
		}

		[HttpPost("")]
		public async Task<IActionResult> AddDropdownValue()
		{

			return NoContent();
		}

		//[HttpPatch("{")] //how do we uniquely identify between dropdown options in an extensible way? Should we allow for new options to be added? This would've been easier if we didn't use separate tables for the options
		//fuck, do I need to do an entire overhaul??
	}
}