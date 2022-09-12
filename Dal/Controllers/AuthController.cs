using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Repositories.AuthRepository;
using GrantTracker.Dal.Repositories.InstructorRepository;
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

		public AuthController(IAuthRepository repository, IInstructorRepository staffRepository)
		{
			_authRepository = repository;
			_staffRepository = staffRepository;
		}

		[HttpGet("")]
		public async Task<ActionResult<UserIdentityView>> Get()
		{
			var identity = _authRepository.GetIdentity();
			return Ok(identity);
		}

		//this doesn't belong here
		[HttpGet("organizationYear")]
		public async Task<ActionResult<Guid>> GetOrganizationYearGuid(Guid organizationGuid, Guid yearGuid)
		{
			//if user is an admin
			Guid organizationYearGuid = await _authRepository.GetOrganizationYearGuid(organizationGuid, yearGuid);
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
			EmployeeDto employee = (await _staffRepository.SearchSynergyStaffAsync("", props.BadgeNumber)).ElementAt(0);

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