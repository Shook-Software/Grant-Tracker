using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using GrantTracker.Dal.Repositories.DevRepository;
using Microsoft.EntityFrameworkCore;
using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Repositories.OrganizationYearRepository
{
	public class OrganizationRepository : RepositoryBase, IOrganizationRepository
	{
		public OrganizationRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext)
			: base(devRepository, httpContext, grantContext)
		{

		}

		//Used for views, any use for dropdown options will be in DropdownRepo/Controller
		public async Task<List<OrganizationYearView>> GetYearsAsync()
		{
			var orgYears = await _grantContext
				.OrganizationYears
				.Include(oy => oy.Organization)
				.Include(oy => oy.Year)
				.Where(oy => oy.YearGuid == _currentYearGuid)
				.OrderBy(oy => oy.Organization.Name)
				.ToListAsync();

			return orgYears.Select(OrganizationYearView.FromDatabase).ToList();
		}

		public async Task<OrganizationView> GetYearsAsync(Guid organizationGuid)
		{
			var organization = await _grantContext
				.Organizations
				.Where(org => org.OrganizationGuid == organizationGuid)
				.Include(org => org.Years)
				.ThenInclude(oy => oy.Year)
				.SingleAsync();

			return OrganizationView.FromDatabase(organization);
		}

		public async Task<OrganizationYearView> GetOrganizationYearAsync(Guid organizationYearGuid)
		{
			Guid organizationGuid = (await _grantContext.OrganizationYears.FindAsync(organizationYearGuid)).OrganizationGuid;

			if (_identity.Claim != IdentityClaim.Administrator && _identity.Organization.Guid != organizationGuid)
				throw new Exception("User is not authorized to view this resource.");

			var organizationYear = await _grantContext
				.OrganizationYears
				.Where(oy => oy.OrganizationYearGuid == organizationYearGuid)
				.Include(oy => oy.Organization)
				.SingleAsync();

			return OrganizationYearView.FromDatabase(organizationYear);
		}
	}
}
