using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Models.Views;
using System.DirectoryServices.AccountManagement;

namespace GrantTracker.Dal.Repositories.AuthRepository
{
	public interface IAuthRepository
	{
		public UserIdentity GetIdentity();

		public Task<List<UserIdentity>> GetCurrentUsersAsync();

		public Task AddUserAsync(UserIdentityView identity);

		public Task DeleteUserAsync(Guid userGuid);

		public Task<List<OrganizationYearView>> GetOrganizationYearsForCurrentYear();

		//public Task EditUserAsync();
	}
}