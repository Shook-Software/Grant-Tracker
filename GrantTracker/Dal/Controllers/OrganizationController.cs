using GrantTracker.Dal.Repositories.OrganizationRepository;
using GrantTracker.Dal.Schema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.OrganizationYearRepository;
using GrantTracker.Utilities;

namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	[Authorize(Policy = "AnyAuthorizedUser")]
	[Route("")]
	public class OrganizationController : ControllerBase
	{
		private readonly IOrganizationRepository _organizationRepository;
        private readonly IOrganizationYearRepository _organizationYearRepository;

        public OrganizationController(IOrganizationRepository OrganizationRepository, IOrganizationYearRepository OrganizationYearRepository)
		{
			_organizationRepository = OrganizationRepository;
			_organizationYearRepository = OrganizationYearRepository;
		}

        [HttpGet("organization")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<List<OrganizationView>>> GetOrganizations()
        {
            try
            {
                var organizations = await _organizationRepository.GetOrganizationsAsync();
                return Ok(organizations);
            }
            catch (Exception ex)
            {
                return StatusCode(500);
            }
        }

        [HttpGet("organization/{OrganizationGuid:Guid}")]
		public async Task<ActionResult<OrganizationView>> GetOrganizationYears(Guid OrganizationGuid)
		{
			try
            {
                var organization = await _organizationRepository.GetYearsAsync(OrganizationGuid);
                return Ok(organization);
            }
			catch (Exception ex)
			{
				return StatusCode(500);
			}
		}

		[HttpGet("organizationYear")]
		public async Task<ActionResult<OrganizationYearView>> GetOrganizationYear(Guid organizationYearGuid)
		{
			try
            {
                var organizationYear = await _organizationRepository.GetOrganizationYearAsync(organizationYearGuid);
                return Ok(organizationYear);
            }
			catch (Exception ex)
			{
				return StatusCode(500);
			}
		}

        [Authorize(Policy = "Administrator")]
        [HttpDelete("organization/{OrganizationGuid:Guid}")]
        public async Task<IActionResult> DeleteOrganization(Guid OrganizationGuid)
		{
			try
			{
                await _organizationRepository.DeleteOrganizationAsync(OrganizationGuid);
                return NoContent();
            }
			catch (Exception ex)
			{
                return StatusCode(500);
            }
        }

        [Authorize(Policy = "Administrator")]
        [HttpDelete("organizationYear/{OrganizationYearGuid:Guid}")]
        public async Task<IActionResult> DeleteOrganizationYear(Guid OrganizationYearGuid)
        {
            try
            {
				await _organizationYearRepository.DeleteOrganizationYearAsync(OrganizationYearGuid);
				return NoContent();
            }
            catch (Exception ex)
            {
				return StatusCode(500);
            }
        }
    }
}