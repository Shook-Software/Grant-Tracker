using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Repositories.DropdownRepository;

public interface IDropdownRepository
{
	Task<SessionDropdownOptions> GetAllSessionDropdownOptionsAsync();

	Task<DropdownOptions> GetAllDropdownOptionsAsync();

	Task<List<DropdownOption>> GetInstructorStatusesAsync();

	Task<List<DropdownOption>> GetGradesAsync();

	Task<List<OrganizationView>> GetOrganizationsAsync(bool UserIsAdmin, List<Guid> HomeOrganizationGuid);

	Task<List<YearView>> GetYearsAsync(Guid? organizationGuid = default);
}