using GrantTracker.Dal.Repositories.OrganizationRepository;
using GrantTracker.Dal.Schema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.OrganizationYearRepository;
using GrantTracker.Utilities;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	[Authorize(Policy = "AnyAuthorizedUser")]
	[Route("")]
	public class OrganizationController : ControllerBase
	{
		private readonly IOrganizationRepository _organizationRepository;
        private readonly IOrganizationYearRepository _organizationYearRepository;
        private readonly ILogger<OrganizationController> _logger;

        public OrganizationController(IOrganizationRepository OrganizationRepository, IOrganizationYearRepository OrganizationYearRepository, ILogger<OrganizationController> logger)
		{
			_organizationRepository = OrganizationRepository;
			_organizationYearRepository = OrganizationYearRepository;
            _logger = logger;
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

        [HttpGet("organizationYear/{OrganizationYearGuid:Guid}/Attendance/Missing")]
        public async Task<ActionResult<List<AttendanceRecord>>> GetMissingAttendanceRecordsAsync(Guid OrganizationYearGuid)
        {
            try
            {
                var orgYear = await _organizationYearRepository.GetOrganizationYear(OrganizationYearGuid).FirstAsync();
                var blackoutDates = await _organizationRepository.GetBlackoutDatesAsync(orgYear.OrganizationGuid);

                var missingRecords = await _organizationYearRepository.GetOrganizationYear(OrganizationYearGuid)
                    .WithSessions().WithAttendanceRecords()
                    .GetMissingAttendanceRecordsAsync(blackoutDates);

                return Ok(missingRecords);

            }
            catch (Exception ex)
            {
                return StatusCode(500, "An unknown error occured while fetching missing attendance.");
            }
        }

        [HttpGet("organization/{OrganizationGuid:Guid}/blackout")]
        public async Task<ActionResult<List<OrganizationBlackoutDate>>> GetBlackoutDates(Guid OrganizationGuid)
        {
            try
            {
                if (!User.IsAdmin() && !User.HomeOrganizationGuids().Contains(OrganizationGuid))
                    return Unauthorized();

                var dates = await _organizationRepository.GetBlackoutDatesAsync(OrganizationGuid);
                return Ok(dates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An unknown error occured while fetching blackout dates.");
            }
        }

        [HttpPost("organization/{OrganizationGuid:Guid}/blackout")]
        public async Task<IActionResult> AddBlackoutDate(Guid OrganizationGuid, [FromBody] DateOnly BlackoutDate)
        {
            try
            {
                if (!User.IsAdmin() && !User.HomeOrganizationGuids().Contains(OrganizationGuid))
                    return Unauthorized();

                if ((await _organizationRepository.GetBlackoutDatesAsync(OrganizationGuid)).Any(x => x.Date.CompareTo(BlackoutDate) == 0))
                    return Conflict();

                await _organizationRepository.AddBlackoutDateAsync(OrganizationGuid, BlackoutDate);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An unknown error occured while adding the blackout date {BlackoutDate.ToShortDateString()}.");
            }
        }

        [HttpDelete("organization/{OrganizationGuid:Guid}/blackout/{BlackoutDateGuid:Guid}")]
        public async Task<IActionResult> DeleteBlackoutDate(Guid OrganizationGuid, Guid BlackoutDateGuid)
        {
            try
            {
                if (!User.IsAdmin() && !User.HomeOrganizationGuids().Contains(OrganizationGuid))
                    return Unauthorized();

                if (!(await _organizationRepository.GetBlackoutDatesAsync(OrganizationGuid)).Any(x => x.Guid == BlackoutDateGuid))
                    return NotFound("A blackout date with the given identifier could not be found.");

                await _organizationRepository.DeleteBlackoutDateAsync(BlackoutDateGuid);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An unknown error occured while deleting blackout date.");
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