using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Repositories.DropdownRepository
{
	public interface IDropdownRepository
	{
		public Task<SessionDropdownOptions> GetAllSessionDropdownOptionsAsync();

		public Task<DropdownOptions> GetAllDropdownOptionsAsync();

		public Task<List<DropdownOption>> GetInstructorStatusesAsync();

		public Task<List<DropdownOption>> GetGradesAsync();

		public Task<List<OrganizationView>> GetOrganizationsAsync(bool UserIsAdmin, Guid HomeOrganizationGuid);

		public Task<List<OrganizationYearView>> GetOrganizationYearsAsync(Guid? organizationGuid);
	}
}