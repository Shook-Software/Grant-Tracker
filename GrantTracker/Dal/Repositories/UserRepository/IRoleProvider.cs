namespace GrantTracker.Dal.Repositories.UserRepository
{
	public interface IRoleProvider
	{
		Task<string> GetUserRoleAsync(string badgeNumber);
		Task<Guid?> GetCurrentUserOrganizationGuidAsync(string BadgeNumber);
		Task<List<Guid>> GetCurrentUserOrganizationGuidsAsync(string BadgeNumber, string role);

    }
}