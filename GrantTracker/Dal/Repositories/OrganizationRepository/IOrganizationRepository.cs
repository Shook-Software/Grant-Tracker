using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Repositories.OrganizationRepository
{
	public interface IOrganizationRepository
	{
		public Task<List<OrganizationYearView>> GetOrganizationYearsAsync();

		public Task<OrganizationView> GetYearsAsync(Guid organizationGuid);

		public Task<OrganizationYearView> GetOrganizationYearAsync(Guid organizationYearGuid);

		public Task<List<Organization>> GetOrganizationsAsync(Guid yearGuid);
	}
}
