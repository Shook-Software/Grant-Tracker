using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using System.DirectoryServices.AccountManagement;

namespace GrantTracker.Dal.Repositories.AuthRepository
{
	public interface IAuthRepository
	{
		public UserIdentity GetIdentity();

		public Task<List<UserIdentity>> GetUsersAsync();

		public Task AddUserAsync(UserIdentityView identity);

		public Task DeleteUserAsync(Guid userGuid);

		public Task<Guid> GetOrganizationYearGuid(Guid organizationGuid, Guid yearGuid);

		//public Task EditUserAsync();
	}
}