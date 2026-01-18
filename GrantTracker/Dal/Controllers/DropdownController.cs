using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DropdownRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GrantTracker.Dal.Controllers;

[ApiController]
[Route("dropdown")]
[Authorize]
public class DropdownController : ControllerBase
{
    private readonly IDropdownRepository _dropdownRepository;
    private readonly ILogger<IDropdownRepository> _logger;

    public DropdownController(IDropdownRepository repository, ILogger<IDropdownRepository> logger)
    {
        _dropdownRepository = repository;
        _logger = logger;
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
            _logger.LogError(ex, "{Function}", nameof(GetAllAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("view/instructorStatus")]
    public async Task<ActionResult<List<DropdownOption>>> GetStatuses()
    {
        try
        {
            var instructorStatuses = await _dropdownRepository.GetInstructorStatusesAsync();
            return Ok(instructorStatuses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function}", nameof(GetStatuses));
            return StatusCode(500);
        }
    }

    [HttpGet("view/grades")]
    public async Task<ActionResult<List<DropdownOption>>> GetGrades()
    {
        try
        {
            var grades = await _dropdownRepository.GetGradesAsync();
            return Ok(grades);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function}", nameof(GetGrades));
            return StatusCode(500);
        }
    }

    [HttpGet("organization")]
    public async Task<ActionResult<List<OrganizationView>>> GetOrganizations()
    {
        try
        {
            var user = HttpContext.User;
            var organizations = await _dropdownRepository.GetOrganizationsAsync(user.IsAdmin(), User.HomeOrganizationGuids());
            return Ok(organizations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function}", nameof(GetOrganizations));
            return StatusCode(500);
        }
    }

    [HttpGet("year")]
    public async Task<ActionResult<List<YearView>>> GetYears(Guid? OrganizationGuid = default)
    {
        try
        {
            if ((OrganizationGuid == default && !HttpContext.User.IsAdmin()) || !HttpContext.User.IsAuthorizedToViewOrganization(OrganizationGuid))
                return Unauthorized();

            var years = (await _dropdownRepository.GetYearsAsync(OrganizationGuid)).OrderByDescending(y => y.SchoolYear).ThenByDescending(y => y.Quarter).ToList();
            return Ok(years);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - OrganizationGuid: {OrganizationGuid}", nameof(GetYears), OrganizationGuid);
            return StatusCode(500);
        }
    }

    [HttpGet("payrollYear")]
    public async Task<ActionResult<List<PayrollYearDto>>> GetPayrollYearAsync()
    {
        try
        {
            var payrollYears = await _dropdownRepository.GetPayrollYearsAsync();

            return Ok(payrollYears.Select(py => new PayrollYearDto
            {
                Guid = py.Guid,
                Name = py.Name,
                Periods = [.. py.Periods.Select(p => new PayrollPeriodDto
                    {
                        Period = p.Period,
                        StartDate = p.StartDate,
                        EndDate = p.EndDate
                    })
                    .OrderBy(p => p.Period)],
                Years = [..py.GrantTrackerYears
                    .OrderByDescending(y => y.SchoolYear).ThenByDescending(y => y.Quarter)]
            })
            .ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function}", nameof(GetPayrollYearAsync));
            return StatusCode(500);
        }
    }
}