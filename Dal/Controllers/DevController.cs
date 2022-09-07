using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.AuthRepository;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Repositories.DropdownRepository;
using GrantTracker.Dal.Repositories.StaffRepository;
using GrantTracker.Dal.Repositories.YearRepository;
using GrantTracker.Dal.Schema;
using Microsoft.AspNetCore.Mvc;

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
		private readonly IInstructorRepository _staffRepository;
		private readonly IYearRepository _yearRepository;

		public DevController(IDevRepository devRepository, IDropdownRepository dropdownRepository, IAuthRepository authRepository, IInstructorRepository staffRepository, IYearRepository yearRepository)
		{
			_devRepository = devRepository;
			_dropdownRepository = dropdownRepository;
			_authRepository = authRepository;
			_staffRepository = staffRepository;
			_yearRepository = yearRepository;
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
		public async Task<ActionResult<List<UserIdentity>>> GetUserAuthentication()
		{
			var users = await _authRepository.GetUsersAsync();
			return Ok(users);
		}

		[HttpGet("organizations")]
		public async Task<ActionResult<Organization>> GetOrganizations()
		{
			return Ok();
		}

		#region School Year Controls

		[HttpGet("year")] 
		public async Task<ActionResult<List<Year>>> GetYears()
		{
			var schoolYears = await _yearRepository.GetAsync();
			return Ok(schoolYears);
		}

		[HttpPatch("year")]
		public async Task<IActionResult> SetActiveYear(Year yearModel)
		{
			if (yearModel is null)
				throw new Exception("Parameter object cannot be null.");

			await _yearRepository.UpdateAsync(yearModel);

			return NoContent();
		}

		//Parameters
		//4 digit year
		//quarter of year
		//start date
		//end date
		//we need the coordinators to be added onto the year [taken from a list in ui of current coordinators and their locations]

		public class YearProps
		{
			public Year yearModel { get; set; }
			public List<Guid> coordinatorGuids { get; set; }
		}

		[HttpPost("year")]
		public async Task<IActionResult> AddYear(YearProps props)
		{
			Year yearModel = props.yearModel;
			List<Guid> coordinatorGuids = props.coordinatorGuids;

			//Ensure no parameters are null, year is 4 digits, start date and end date do not intersect already existing Years
			//validation
			if (yearModel is null)
				throw new Exception("Parameter object cannot be null.");

			await _yearRepository.AddAsync(yearModel);

			//await add coordinators to the next year along with their locations.

			//automatically add all existing config admin to the next school year

			return NoContent();
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