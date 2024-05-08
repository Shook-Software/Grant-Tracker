using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Repositories.AuthRepository;
using GrantTracker.Dal.Repositories.InstructorRepository;
using GrantTracker.Dal.Repositories.OrganizationYearRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Models.Views;


namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	[Authorize(Policy = "AnyAuthorizedUser")]
	[Route("user")]
	public class AuthController : ControllerBase
	{
		private readonly IAuthRepository _authRepository;
		private readonly IInstructorRepository _staffRepository;
		private readonly IOrganizationYearRepository _organizationYearRepository;
		private readonly ILogger<AuthController> _logger;

		public AuthController(IAuthRepository repository, IInstructorRepository staffRepository, IOrganizationYearRepository organizationYearRepository, ILogger<AuthController> logger)
		{
			_authRepository = repository;
			_staffRepository = staffRepository;
			_organizationYearRepository = organizationYearRepository; 
			_logger = logger;
        }

		[HttpGet("")]
		public ActionResult<UserIdentityView> Get()
		{
			try
			{
                var identity = _authRepository.GetIdentity();
                return Ok(identity);
            }
			catch (Exception ex)
            {
                _logger.LogError("Unhandled exception.", ex);
                return StatusCode(500);
			}
		}

		[HttpGet("orgYear")]
		public async Task<ActionResult<List<OrganizationYearView>>> GetAuthorizedOrganizationYearsAsync()
		{
			try
			{
				var authorizedOrgYears = await _organizationYearRepository.GetAsync();
				return Ok(authorizedOrgYears.OrderBy(oy => oy.Organization.Name).Select(OrganizationYearView.FromDatabase));
			}
			catch (Exception ex)
			{
				_logger.LogError("Unhandled exception.", ex);
                return StatusCode(500);
            }
		}

		//this doesn't belong here
		[HttpGet("organizationYear")]
		public async Task<ActionResult<Guid>> GetOrganizationYearGuid(Guid organizationGuid, Guid yearGuid)
		{
			//if user is an admin
			Guid organizationYearGuid = await _organizationYearRepository.GetGuidAsync(organizationGuid, yearGuid);
			return Ok(organizationYearGuid);
		}

		public class Props
		{
			public Guid OrganizationYearGuid { get; set; }
			public string BadgeNumber { get; set; }
			public int ClaimType { get; set; }
		}

		[HttpPost("")]
		public async Task<IActionResult> AddUser(Props props)
		{
			EmployeeDto employee = (await _staffRepository.SearchSynergyStaffAsync("", props.BadgeNumber)).FirstOrDefault();

			await _authRepository.AddUserAsync(new UserIdentityView()
			{
				FirstName = employee.FirstName,
				LastName = employee.LastName,
				BadgeNumber = props.BadgeNumber,
				OrganizationYearGuid = props.OrganizationYearGuid,
				Claim = props.ClaimType == 0 ? IdentityClaim.Administrator : IdentityClaim.Coordinator
			});

			return Ok();
		}

		[HttpDelete("")]
		public async Task<IActionResult> DeleteUser(Guid userOrganizationYearGuid)
		{
			await _authRepository.DeleteUserAsync(userOrganizationYearGuid);
			return NoContent();
		}

		//[HttpPut("user")]
	}
}