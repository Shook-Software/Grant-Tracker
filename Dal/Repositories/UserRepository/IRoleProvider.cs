namespace GrantTracker.Dal.Repositories.UserRepository
{
	public interface IRoleProvider
	{
		public Task<string> GetUserRoleAsync(string badgeNumber);
	}
}