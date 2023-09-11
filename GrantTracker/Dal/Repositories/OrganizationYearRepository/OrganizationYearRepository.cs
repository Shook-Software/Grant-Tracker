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
		public async Task<Guid> GetGuidAsync(Guid organizationGuid, Guid yearGuid)
		{
			return await UseDeveloperLog(async () =>
			{
				//ensure they are authorized to access the specified organization
				if (_identity.Claim.Equals(IdentityClaim.Coordinator) && !_identity.Organization.Guid.Equals(organizationGuid))
				{
					throw new Exception("The requestor is not authorized to access this resource.");
				}

				return await _grantContext
				.OrganizationYears
				.AsNoTracking()
				.Where(oy => oy.YearGuid == yearGuid && oy.OrganizationGuid == organizationGuid)
				.Select(oy => oy.OrganizationYearGuid)
				.SingleAsync();
			});
		}

		public async Task<List<OrganizationYear>> GetAsync(Guid yearGuid)
		{
			return await _grantContext
				.OrganizationYears
				.AsNoTracking()
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
