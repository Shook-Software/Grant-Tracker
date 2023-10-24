using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.DevRepository
{
	public interface IDevRepository
	{
		//We need to print all dropdown options. - We can just use the dropdownrepository for this, honestly.
		//We need to show any error logs.
		public Task AddExceptionLogAsync(Exception exception, UserIdentity requestor);
		public Task<List<ExceptionLogView>> GetExceptionLogsAsync();
		public Task CreateUsersAsync(List<Identity> userIdentities);
		Task<int> SynchronizeStudentGradesWithSynergyAsync(Guid YearGuid);

        //public Task DeleteUsersAsync(List<Identity> userIdentities);
    }
}