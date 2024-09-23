using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.DevRepository;

public interface IDevRepository
{
	Task CreateUsersAsync(List<Identity> userIdentities);
	Task<int> SynchronizeStudentGradesWithSynergyAsync(Guid YearGuid);
	Task AddPayrollYearAsync(List<Guid> yearGuids, PayrollYear payYear);
}