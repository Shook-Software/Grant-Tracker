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

		public async Task<string> GetUserRoleAsync(string BadgeNumber)
		{
			Identity userIdentity = await _db.UserIdentities.Where(e => e.SchoolYear.Instructor.BadgeNumber == BadgeNumber).FirstOrDefaultAsync();

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

		public async Task<Guid?> GetCurrentUserOrganizationGuidAsync(string BadgeNumber)
		{
			Guid currentYearGuid = _db.Years.Where(y => y.IsCurrentSchoolYear).Select(y => y.YearGuid).FirstOrDefault();

			var instructorSchoolYear = await _db.InstructorSchoolYears
				.Include(isy => isy.OrganizationYear)
				.Where(isy => isy.Instructor.BadgeNumber == BadgeNumber && isy.OrganizationYear.YearGuid == currentYearGuid)
				.FirstOrDefaultAsync();

			return instructorSchoolYear?.OrganizationYear?.OrganizationGuid;
		}
	}
}