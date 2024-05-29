using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.AuthRepository;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Repositories.DropdownRepository;
using GrantTracker.Dal.Repositories.InstructorRepository;
using GrantTracker.Dal.Repositories.YearRepository;
using GrantTracker.Dal.Repositories.OrganizationRepository;
using GrantTracker.Dal.Repositories.OrganizationYearRepository;
using GrantTracker.Dal.Schema;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace GrantTracker.Dal.Controllers;

[ApiController]
//this should be restricted to Admin only
[Route("developer")]
public class DevController(
    IDevRepository devRepository, 
    IDropdownRepository dropdownRepository,
    IAuthRepository authRepository, 
    IInstructorRepository staffRepository,
    IYearRepository yearRepository, 
    IOrganizationRepository organizationRepository,
    IOrganizationYearRepository organizationYearRepository, 
    ILogger<DevController> logger
) : ControllerBase
{
    private readonly IDevRepository _devRepository = devRepository;
    private readonly IDropdownRepository _dropdownRepository = dropdownRepository;
    private readonly IAuthRepository _authRepository = authRepository;
    private readonly IInstructorRepository _instructorRepository = staffRepository;
    private readonly IYearRepository _yearRepository = yearRepository;
    private readonly IOrganizationRepository _organizationRepository = organizationRepository;
    private readonly IOrganizationYearRepository _organizationYearRepository = organizationYearRepository;
    private readonly ILogger<DevController> _logger = logger;

    [HttpGet("dropdowns")]
    public async Task<ActionResult<DropdownOptions>> GetDropdownOptions()
    {
        var options = await _dropdownRepository.GetAllDropdownOptionsAsync();
        return Ok(options);
    }

    [HttpGet("authentication")]
    public async Task<ActionResult<List<UserIdentity>>> GetUserAuthentication()
    {
        var users = await _authRepository.GetCurrentUsersAsync();
        return Ok(users);
    }

    [HttpGet("organizationYear")]
    public async Task<ActionResult<List<OrganizationYearView>>> GetOrganizations()
    {
        var organizationYears = await _authRepository.GetOrganizationYearsForCurrentYear();
        return Ok(organizationYears);
    }

    #region School Year Controls

    [HttpGet("year")]
    public async Task<ActionResult<List<Year>>> GetYears()
    {
        var schoolYears = await _yearRepository.GetAsync();
        return Ok(schoolYears);
    }

    [HttpPatch("year")]
    public async Task<IActionResult> UpdateYear([FromBody] Year yearModel)
    {
        try
        {
            if (yearModel is null)
                throw new Exception("Parameter object cannot be null.");

            await _yearRepository.UpdateAsync(yearModel);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500);
        }
    }

    [HttpPatch("year/{YearGuid:Guid}/grades/sync")]
    public async Task<ActionResult<int>> SynchronizeSynergyGrades(Guid YearGuid)
    {
        try
        {
            var numRecordsUpdated = await _devRepository.SynchronizeStudentGradesWithSynergyAsync(YearGuid);
            return Ok(numRecordsUpdated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured.", nameof(SynchronizeSynergyGrades));
            return StatusCode(500);
        }
    }

    //Parameters
    //4 digit year
    //quarter of year
    //start date
    //end date
    //we need the coordinators to be added onto the year [taken from a list in ui of current coordinators and their locations]
    public class UserProps
    {
        public Guid UserGuid { get; set; }
        public Guid OrganizationGuid { get; set; }
        public IdentityClaim Claim { get; set; }
    }

    public class YearProps
    {
        public Year yearModel { get; set; }
        public List<UserProps> users { get; set; }
    }

    [HttpPost("year")]
    public async Task<IActionResult> AddYear([FromBody] Year year)
    {
        try
        {
            //Ensure no parameters are null, year is 4 digits, start date and end date do not intersect already existing Years
            //validation
            if (year is null)
                throw new Exception("Parameter object cannot be null.");

            var errors = await _yearRepository.ValidateYearAsync(year);
            if (errors.Count > 0)
                return BadRequest(errors);

            //yearGuid in model will be entered in DB
            await _yearRepository.AddAsync(year);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured.", nameof(AddYear));
            return StatusCode(500);
        }
    }

    #endregion School Year Controls

    [HttpPost("dropdown")]
    public async Task<IActionResult> AddDropdownOption(DropdownOptionType type, DropdownOption option)
    {
        try
        {
            await _dropdownRepository.CreateAsync(type, option);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "");
            return StatusCode(500);
        }
    }

    [HttpPatch("dropdown")]
    public async Task<IActionResult> UpdateDropdownOption(DropdownOptionType type, DropdownOption option)
    {
        try
        {
            await _dropdownRepository.UpdateAsync(type, option);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "");
            return StatusCode(500);
        }
    }
}