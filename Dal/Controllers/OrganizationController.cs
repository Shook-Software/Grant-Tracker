using GrantTracker.Dal.Repositories.OrganizationYearRepository;
using GrantTracker.Dal.Schema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	[Authorize(Policy = "AnyAuthorizedUser")]
	[Route("organization")]
	public class OrganizationController : ControllerBase
	{
		private readonly IOrganizationRepository _organizationYearRepository;
		public OrganizationController(IOrganizationRepository organizationYearRepository)
		{
			_organizationYearRepository = organizationYearRepository;
		}

		[HttpGet("")]
		public async Task<ActionResult<OrganizationView>> GetOrganizationYears(Guid organizationGuid)
		{
			var organization = await _organizationYearRepository.GetYearsAsync(organizationGuid);
			return Ok(organization);
		}

		//This is fucked atm
		[HttpGet("year")]
		public async Task<ActionResult<OrganizationYearView>> GetOrganizationYear(Guid organizationYearGuid)
		{
			var organizationYear = await _organizationYearRepository.GetOrganizationYearAsync(organizationYearGuid);
			return Ok(organizationYear);
		}
	}
}