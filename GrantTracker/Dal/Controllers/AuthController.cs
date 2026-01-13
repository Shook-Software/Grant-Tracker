using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Repositories.AuthRepository;
using GrantTracker.Dal.Repositories.InstructorRepository;
using GrantTracker.Dal.Repositories.OrganizationYearRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Models.Views;
using Microsoft.EntityFrameworkCore;
using GrantTracker.Utilities;
using Microsoft.Extensions.Caching.Memory;


namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	[Authorize(Policy = "Teacher")]
	[Route("user")]
	public class AuthController : ControllerBase
	{
		private readonly IAuthRepository _authRepository;
		private readonly IInstructorRepository _staffRepository;
		private readonly IOrganizationYearRepository _organizationYearRepository;
		private readonly ILogger<AuthController> _logger;
		private GrantTrackerContext _context;
		private readonly IMemoryCache _cache;

		public AuthController(IAuthRepository repository, IInstructorRepository staffRepository, IOrganizationYearRepository organizationYearRepository, ILogger<AuthController> logger, GrantTrackerContext context, IMemoryCache cache)
		{
			_authRepository = repository;
			_staffRepository = staffRepository;
			_organizationYearRepository = organizationYearRepository;
			_logger = logger;
            _context = context;
			_cache = cache;
        }

		[HttpGet("")]
        [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)] // 12 hours
        public ActionResult<UserIdentityView> Get()
		{
			try
			{
				var badgeNumber = User.Id();
				var cacheKey = $"UserIdentity_{badgeNumber}";

				if (_cache.TryGetValue<UserIdentityView>(cacheKey, out var cachedIdentity))
				{
					_logger.LogInformation($"User identity for badge {badgeNumber} retrieved from cache");
					return Ok(cachedIdentity);
				}

				_logger.LogInformation($"Looking up user identity for badge {badgeNumber} in database");
                var identity = _authRepository.GetIdentity();

				var cacheOptions = new MemoryCacheEntryOptions
				{
					AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12),
					SlidingExpiration = TimeSpan.FromHours(6)
				};
				_cache.Set(cacheKey, identity, cacheOptions);
				_logger.LogInformation($"User identity for badge {badgeNumber} cached");

                Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private";
                return Ok(identity);
            }
			catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception.");
                return StatusCode(500);
			}
		}

		[HttpGet("orgYear")]
		[ResponseCache(Duration = 43200, VaryByHeader = "Authorization")] // 12 hours
		public async Task<ActionResult<List<OrganizationYearView>>> GetAuthorizedOrganizationYearsAsync()
		{
			try
			{
				var badgeNumber = User.Id();
				var cacheKey = $"UserOrgYears_{badgeNumber}";

				if (_cache.TryGetValue(cacheKey, out object cachedOrgYearsObj) && cachedOrgYearsObj is List<OrganizationYearView> cachedOrgYears)
				{
					_logger.LogInformation($"Organization years for badge {badgeNumber} retrieved from cache ({cachedOrgYears.Count} org years)");
					return Ok(cachedOrgYears);
				}

				_logger.LogInformation($"Looking up organization years for badge {badgeNumber} in database");
				var authorizedOrgYears = await _organizationYearRepository.GetAsync();
				var result = authorizedOrgYears.OrderBy(oy => oy.Organization.Name).Select(OrganizationYearView.FromDatabase).ToList();

				var cacheOptions = new MemoryCacheEntryOptions
				{
					AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12),
					SlidingExpiration = TimeSpan.FromHours(6)
				};
				_cache.Set(cacheKey, result, cacheOptions);
				_logger.LogInformation($"Organization years for badge {badgeNumber} cached ({result.Count} org years)");

				return Ok(result);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Unhandled exception.");
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
        [Authorize(Policy = "Administrator")]
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
        [Authorize(Policy = "Administrator")]
        public async Task<IActionResult> DeleteUser(Guid userOrganizationYearGuid)
		{
			await _authRepository.DeleteUserAsync(userOrganizationYearGuid);
			return NoContent();
		}

		//[HttpPut("user")]
	}
}