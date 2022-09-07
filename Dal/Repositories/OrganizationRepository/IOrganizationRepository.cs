using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Repositories.OrganizationYearRepository
{
	public interface IOrganizationRepository
	{
		public Task<List<OrganizationYearView>> GetYearsAsync();

		public Task<OrganizationView> GetYearsAsync(Guid organizationGuid);

		public Task<OrganizationYearView> GetOrganizationYearAsync(Guid organizationYearGuid);
	}
}
