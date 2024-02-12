using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.OrganizationYearRepository;

public interface IOrganizationYearRepository
{
	Task<List<OrganizationYear>> GetAsync();
    Task<List<OrganizationYear>> GetAsync(Guid yearGuid);
	Task<OrganizationYear> GetAsyncBySessionId(Guid sessionGuid);
    Task<Guid> GetGuidAsync(Guid organizationGuid, Guid yearGuid);
	Task CreateAsync(List<Organization> organizations, Guid yearGuid);

	Task DeleteOrganizationYearAsync(Guid OrganizationYearGuid);


	IQueryable<OrganizationYear> GetOrganizationYear(Guid OrganizationYearGuid);
}
