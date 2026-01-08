using GrantTracker.Dal.Repositories.UserRepository;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Server.IISIntegration;
using Microsoft.Extensions.Caching.Memory;
using System.DirectoryServices.AccountManagement;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Text.Json.Serialization;
using System.Text.Json;
using Serilog;

namespace GrantTracker.Utilities.OnStartup
{
	#region Startup Initialization

	public static class Auth
	{
		public static string GetBadgeNumber(ClaimsIdentity identity, IMemoryCache cache, Microsoft.Extensions.Logging.ILogger logger)
		{
			try
			{
                if (identity.Name == null)
                    return "";

				string cacheKey = $"BadgeNumber_{identity.Name}";
				if (cache.TryGetValue(cacheKey, out string cachedBadgeNumber))
				{
					logger.LogInformation($"Badge number for {identity.Name} retrieved from cache");
					return cachedBadgeNumber;
				}

                string badgeNumber = Regex.Replace(identity.Name, "[^0-9]", ""); //Remove string "TUSD\\" from "TUSD\\######"

                if (!int.TryParse(badgeNumber, out int _))
                {
					logger.LogInformation($"Looking up badge number for {identity.Name} in Active Directory");
                    var tusdContext = new PrincipalContext(ContextType.Domain, "admin.tusd.local");
                    var user = UserPrincipal.FindByIdentity(tusdContext, IdentityType.SamAccountName, identity.Name);
                    badgeNumber = user.EmployeeId;
                }

				var cacheOptions = new MemoryCacheEntryOptions
				{
					AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1),
					SlidingExpiration = TimeSpan.FromMinutes(30)
				};
				cache.Set(cacheKey, badgeNumber, cacheOptions);
				logger.LogInformation($"Badge number for {identity.Name} cached");

                return badgeNumber;
            }
			catch (Exception ex)
			{
				throw;
			}
        }

		public static void Setup(WebApplicationBuilder builder)
		{
			builder.Services.AddAuthentication(IISDefaults.AuthenticationScheme).AddNegotiate();
			builder.Services.AddAuthorization(options =>
			{
				options.AddPolicy("Administrator", policy => policy.RequireClaim("UserRole", "Administrator"));
                options.AddPolicy("Coordinator", policy => policy.RequireAssertion(ctx => ctx.User.HasClaim(c => c.Type == "UserRole" && (c.Value == "Administrator" || c.Value == "Coordinator"))));
                options.AddPolicy("Teacher", policy => policy.RequireAuthenticatedUser());
            });

			builder.Services.AddScoped<IClaimsTransformation, RoleAuthorizationTransform>();
			builder.Services.AddSingleton<IAuthorizationHandler, AuthorizationHandler>();
		}

		public static void Configure(WebApplication app)
		{
			app.UseAuthentication();
			app.UseAuthorization();
		}
	}

	#endregion Startup Initialization

	#region Authorization Transform

	//Authenticate and assign authorization level from database repository.

	public class RoleAuthorizationTransform : IClaimsTransformation
	{
		private readonly IRoleProvider _roleProvider;
		private readonly ILogger<RoleAuthorizationTransform> _logger;
		private readonly IMemoryCache _cache;

		public RoleAuthorizationTransform(IRoleProvider roleProvider, ILogger<RoleAuthorizationTransform> logger, IMemoryCache cache)
		{
			_roleProvider = roleProvider ?? throw new ArgumentNullException(nameof(roleProvider));
			_logger = logger;
			_cache = cache ?? throw new ArgumentNullException(nameof(cache));
        }

		private async Task<string> GetUserRoleAsync(string badgeNumber)
		{
			string cacheKey = $"UserRole_{badgeNumber}";

			if (_cache.TryGetValue(cacheKey, out string cachedRole))
			{
				_logger.LogInformation($"User role for badge {badgeNumber} retrieved from cache: {cachedRole}");
				return cachedRole;
			}

			_logger.LogInformation($"Looking up user role for badge {badgeNumber} in database");
			var userRole = await _roleProvider.GetUserRoleAsync(badgeNumber);

			var cacheOptions = new MemoryCacheEntryOptions
			{
				AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30),
				SlidingExpiration = TimeSpan.FromMinutes(15)
			};
			_cache.Set(cacheKey, userRole, cacheOptions);
			_logger.LogInformation($"User role for badge {badgeNumber} cached: {userRole}");

			return userRole;
		}

		private async Task<List<Guid>> GetUserOrganizationGuidsAsync(string badgeNumber, string role)
		{
			string cacheKey = $"UserOrgs_{badgeNumber}_{role}";

			if (_cache.TryGetValue(cacheKey, out List<Guid> cachedOrgs))
			{
				_logger.LogInformation($"User organizations for badge {badgeNumber} retrieved from cache ({cachedOrgs.Count} orgs)");
				return cachedOrgs;
			}

			_logger.LogInformation($"Looking up user organizations for badge {badgeNumber} in database");
			var userOrgs = await _roleProvider.GetCurrentUserOrganizationGuidsAsync(badgeNumber, role);

			var cacheOptions = new MemoryCacheEntryOptions
			{
				AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30),
				SlidingExpiration = TimeSpan.FromMinutes(15)
			};
			_cache.Set(cacheKey, userOrgs, cacheOptions);
			_logger.LogInformation($"User organizations for badge {badgeNumber} cached ({userOrgs.Count} orgs)");

			return userOrgs;
		}

		//Called first to determine authorization level
		public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
		{
			try
			{
				_logger.LogInformation($"Authorization attempted");

				if (principal.Identity is null) return principal;

				ClaimsIdentity identity = new();
				_logger.LogInformation($"Authorization for identity named: {principal.Identity.Name}");
				string badgeNumber = Auth.GetBadgeNumber((ClaimsIdentity)principal.Identity, _cache, _logger);

				var userRole = await GetUserRoleAsync(badgeNumber);
				var userOrgs = await GetUserOrganizationGuidsAsync(badgeNumber, userRole);

				Claim roleClaim = new("UserRole", userRole);
				Claim orgClaim = new("HomeOrg", JsonSerializer.Serialize(userOrgs));
				Claim badgeNumberClaim = new Claim("Id", badgeNumber);

				identity.AddClaim(roleClaim);
				identity.AddClaim(orgClaim);
				identity.AddClaim(badgeNumberClaim);

				principal.AddIdentity(identity);
				return principal;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Unhandled exception in Auth Transform");
				throw;
			}
		}

    }

	#endregion Authorization Transform

	#region Handle Authorization Requirements

	//[Authorize] controllers call this
	//Assess policy-based authorization requirements for a given controller and approve or deny access.

	public class AuthorizationHandler : IAuthorizationHandler
    {
        private readonly ILogger<AuthorizationHandler> _logger;

        public AuthorizationHandler(ILogger<AuthorizationHandler> logger)
        {
            _logger = logger;
        }

        //Called when policies are evaluated, after user claims are evaluated and set
        public async Task HandleAsync(AuthorizationHandlerContext context)
		{
			var user = context.User;
			foreach (var requirement in context.PendingRequirements)
			{
				if (requirement is ClaimsAuthorizationRequirement claimsRequirement)
				{
					var requiredClaimType = claimsRequirement.ClaimType;
					if (user.IsInRole(requiredClaimType)) context.Succeed(requirement);
					else
					{
						context.Fail(new AuthorizationFailureReason(this, $"User does not have the required claims. Required claim: {requiredClaimType}"));
                        _logger.LogError($"Failed to authorize requirement for {context.User.Identity.Name}");
                    }
				}
				else if (requirement is AssertionRequirement assertRequirement)
				{
					if (await assertRequirement.Handler(context)) context.Succeed(requirement);
					else
					{
						context.Fail(new AuthorizationFailureReason(this, $"User does not have the required claims. Required claim: [One of X, can't tell yet]"));
						_logger.LogError($"Failed to authorize requirement for {context.User.Identity.Name}");
					}
				}
			}
		}
	}

	#endregion Handle Authorization Requirements
}
