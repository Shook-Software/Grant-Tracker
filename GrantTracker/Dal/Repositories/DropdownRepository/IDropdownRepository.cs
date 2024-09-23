using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.DropdownRepository;


public enum DropdownOptionType
{
    Activity = 0,
    Objective = 1,
    FundingSource = 2,
    InstructorStatus = 3,
    OrganizationType = 4,
    PartnershipType = 5,
    SessionType = 6
}

public interface IDropdownRepository
{
	Task<SessionDropdownOptions> GetAllSessionDropdownOptionsAsync(bool filterInactive = true);

	Task<DropdownOptions> GetAllDropdownOptionsAsync(bool filterInactive = false);

	Task<List<DropdownOption>> GetInstructorStatusesAsync(bool filterInactive = true);

	Task<List<DropdownOption>> GetGradesAsync();

	Task<List<OrganizationView>> GetOrganizationsAsync(bool UserIsAdmin, List<Guid> HomeOrganizationGuid);

	Task<List<YearView>> GetYearsAsync(Guid? organizationGuid = default);

    Task<List<PayrollYear>> GetPayrollYearsAsync();


    Task CreateAsync(DropdownOptionType optionType, DropdownOption option);
    Task UpdateAsync(DropdownOptionType optionType, DropdownOption option);
}