using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Repositories.OrganizationRepository;

public interface IOrganizationRepository
{
	Task<List<OrganizationYearView>> GetOrganizationYearsAsync();

	Task<OrganizationView> GetYearsAsync(Guid organizationGuid);

	Task<OrganizationYearView> GetOrganizationYearAsync(Guid organizationYearGuid);

	Task<List<Organization>> GetOrganizationsAsync(Guid yearGuid);
	Task<List<OrganizationView>> GetOrganizationsAsync();


    Task DeleteOrganizationAsync(Guid OrganizationGuid);
}
