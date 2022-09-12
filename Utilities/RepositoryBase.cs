using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities.OnStartup;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GrantTracker.Utilities
{
	public class RepositoryBase
	{
		protected readonly GrantTrackerContext _grantContext;
		protected readonly IDevRepository _devRepository;
		protected Guid _currentYearGuid;
		protected UserIdentity _identity;

		public RepositoryBase(IDevRepository devRepository, IHttpContextAccessor httpContext, GrantTrackerContext grantContext)
		{
			var badgeNumber = Auth.GetBadgeNumber(httpContext.HttpContext.User.Identity as ClaimsIdentity);

			_devRepository = devRepository;
			_grantContext = grantContext;

			_currentYearGuid = _grantContext.Years.Where(sy => sy.IsCurrentSchoolYear).Select(sy => sy.YearGuid).FirstOrDefault();

			_identity = _grantContext.UserIdentities
			 .Include(u => u.SchoolYear).ThenInclude(i => i.Instructor)
			 .Include(u => u.SchoolYear).ThenInclude(i => i.OrganizationYear).ThenInclude(o => o.Organization)
			 .Include(u => u.SchoolYear).ThenInclude(i => i.OrganizationYear).ThenInclude(o => o.Year)
			 .Where(u => u.SchoolYear.Instructor.BadgeNumber == badgeNumber && u.SchoolYear.OrganizationYear.Year.YearGuid == _currentYearGuid)
			 .Select(u => new UserIdentity
			 {
				 UserGuid = u.SchoolYear.InstructorGuid,
				 UserOrganizationYearGuid = u.Guid,
				 OrganizationYearGuid = u.SchoolYear.OrganizationYearGuid,

				 FirstName = u.SchoolYear.Instructor.FirstName,
				 LastName = u.SchoolYear.Instructor.LastName,
				 BadgeNumber = u.SchoolYear.Instructor.BadgeNumber,
				 Claim = u.Claim,

				 Organization = new OrganizationView
				 {
					 Guid = u.SchoolYear.OrganizationYear.OrganizationGuid,
					 Name = u.SchoolYear.OrganizationYear.Organization.Name
				 },
				 OrganizationYear = OrganizationYearView.FromDatabase(u.SchoolYear.OrganizationYear)
			 })
			 .FirstOrDefault();
		}

		protected async Task<T> UseDeveloperLog<T>(Func<Task<T>> callback)
		{
			try
			{
				T result = await callback();
				return result;
			}
			catch (Exception ex)
			{
				await _devRepository.AddExceptionLogAsync(ex, _identity);
				throw;
			}
		}

		protected async Task UseDeveloperLog(Func<Task> callback)
		{
			try
			{
				await callback();
			}
			catch (Exception ex)
			{
				await _devRepository.AddExceptionLogAsync(ex, _identity);
				throw;
			}
		}
	}
}


