using GrantTracker.Dal.Models.Dto;
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

namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	//this should be restricted to Admin only
	[Route("developer")]
	public class DevController : ControllerBase
	{
		private readonly IDevRepository _devRepository;
		private readonly IDropdownRepository _dropdownRepository;
		private readonly IAuthRepository _authRepository;
		private readonly IInstructorRepository _instructorRepository;
		private readonly IYearRepository _yearRepository;
		private readonly IOrganizationRepository _organizationRepository;
		private readonly IOrganizationYearRepository _organizationYearRepository;
        private readonly ILogger<DevController> _logger;

        public DevController(IDevRepository devRepository, IDropdownRepository dropdownRepository, 
			IAuthRepository authRepository, IInstructorRepository staffRepository, 
			IYearRepository yearRepository, IOrganizationRepository organizationRepository, 
			IOrganizationYearRepository organizationYearRepository, ILogger<DevController> logger)
		{
			_devRepository = devRepository;
			_dropdownRepository = dropdownRepository;
			_authRepository = authRepository;
			_instructorRepository = staffRepository;
			_yearRepository = yearRepository;
			_organizationRepository = organizationRepository;
			_organizationYearRepository = organizationYearRepository;
            _logger = logger;
        }

		[HttpGet("exceptions")]
		public async Task<ActionResult<List<ExceptionLogView>>> GetExceptions()
		{
			var logs = await _devRepository.GetExceptionLogsAsync();
			return Ok(logs);
		}

		[HttpGet("dropdowns")]
		public async Task<ActionResult<DropdownOptions>> GetDropdownOptions()
		{
			var options = await _dropdownRepository.GetAllDropdownOptionsAsync();
			return Ok(options);
		}

		[HttpGet("authentication")]
		public async Task<ActionResult<List<UserIdentity>>> GetUserAuthentication(Guid yearGuid)
		{
			var users = await _authRepository.GetUsersAsync(yearGuid);
			return Ok(users);
		}

		[HttpGet("organizationYear")]
		public async Task<ActionResult<List<OrganizationYearView>>> GetOrganizations(Guid yearGuid)
		{
			var organizationYears = await _authRepository.GetOrganizationYearsForYear(yearGuid);
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

		[HttpPost("organizations")]
		public async Task<IActionResult> AddOrganization()
		{
			return Ok();
		}

		[HttpPatch("organizations/{organizationGuid:guid}")]
		public async Task<IActionResult> EditOrganization(Guid organizationGuid)
		{
			return Ok();
		}
	}
}