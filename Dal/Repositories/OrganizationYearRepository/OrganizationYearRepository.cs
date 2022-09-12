using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using GrantTracker.Dal.Repositories.DevRepository;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Repositories.OrganizationYearRepository
{
	public class OrganizationYearRepository : RepositoryBase, IOrganizationYearRepository
	{
		public OrganizationYearRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext)
			: base(devRepository, httpContext, grantContext)
		{

		}

		public async Task<List<OrganizationYear>> GetAsync(Guid yearGuid)
		{
			return await _grantContext
				.OrganizationYears
				.Where(oy => oy.YearGuid == yearGuid)
				.Include(oy => oy.Organization)
				.Include(oy => oy.Year)
				.ToListAsync();
		}

		public async Task CreateAsync(List<Organization> organizations, Guid yearGuid)
		{
			List<OrganizationYear> newOrganizationYears = organizations
				.Select(org => new OrganizationYear()
				{
					OrganizationYearGuid = Guid.NewGuid(),
					OrganizationGuid = org.OrganizationGuid,
					YearGuid = yearGuid
				})
				.ToList();

			await _grantContext.OrganizationYears.AddRangeAsync(newOrganizationYears);
			await _grantContext.SaveChangesAsync();
		}
	}
}
