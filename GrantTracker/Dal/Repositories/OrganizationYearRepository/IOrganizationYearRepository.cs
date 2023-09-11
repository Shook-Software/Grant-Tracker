using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.OrganizationYearRepository
{
	public interface IOrganizationYearRepository
	{
		public Task<Guid> GetGuidAsync(Guid organizationGuid, Guid yearGuid);
		public Task<List<OrganizationYear>> GetAsync(Guid yearGuid);
		public Task CreateAsync(List<Organization> organizations, Guid yearGuid);
	}
}
