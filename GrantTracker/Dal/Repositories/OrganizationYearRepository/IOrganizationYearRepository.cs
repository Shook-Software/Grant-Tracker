using GrantTracker.Dal.Models.Views;
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

    Task<List<StudentGroupView>> GetStudentGroupsAsync(Guid organizationYearGuid, string? fields = null);
    Task<StudentGroupView> GetStudentGroupAsync(Guid groupGuid, string? fields = null);
    Task<StudentGroup> CreateStudentGrouping(Guid organizationYearGuid, string name);
    Task DeleteStudentGroup(Guid groupGuid);

    IQueryable<OrganizationYear> GetOrganizationYear(Guid OrganizationYearGuid);
}
