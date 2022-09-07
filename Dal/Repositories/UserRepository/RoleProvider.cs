using GrantTracker.Dal.Schema;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Repositories.UserRepository
{
	public class RoleProvider : IRoleProvider
	{
		private readonly GrantTrackerContext _db;

		public RoleProvider(GrantTrackerContext context)
		{
			_db = context;
		}

		public async Task<string> GetUserRoleAsync(string badgeNumber)
		{
			Identity userIdentity = await _db.UserIdentities.Where(e => e.SchoolYear.Instructor.BadgeNumber == badgeNumber).FirstOrDefaultAsync();

			if (userIdentity == null)
				return "Unauthorized";

			switch (userIdentity.Claim)
			{
				case IdentityClaim.Administrator:
					return "Administrator";

				case IdentityClaim.Coordinator:
					return "Coordinator";

				default:
					return "Unauthorized";
			}
		}
	}
}