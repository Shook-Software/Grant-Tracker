using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.OrganizationYearRepository;

public interface IOrganizationYearRepository
{
	Task<Guid> GetGuidAsync(Guid organizationGuid, Guid yearGuid);
	Task<List<OrganizationYear>> GetAsync(Guid yearGuid);
	Task CreateAsync(List<Organization> organizations, Guid yearGuid);

	Task DeleteOrganizationYearAsync(Guid OrganizationYearGuid);


	IQueryable<OrganizationYear> GetOrganizationYear(Guid OrganizationYearGuid);
}
