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
			var instructorSchoolYear = await _db.InstructorSchoolYears
				.Include(isy => isy.OrganizationYear)
				.Where(isy => isy.Instructor.BadgeNumber == BadgeNumber)
				.Where(isy => isy.OrganizationYear.Year.IsCurrentSchoolYear == true)
				.FirstOrDefaultAsync();

			return instructorSchoolYear?.OrganizationYear?.OrganizationGuid;
        }

        public async Task<List<Guid>> GetCurrentUserOrganizationGuidsAsync(string BadgeNumber)
        {
			return await _db.UserIdentities
				.Include(id => id.SchoolYear).ThenInclude(isy => isy.OrganizationYear)
				.Where(id => id.SchoolYear.Instructor.BadgeNumber == BadgeNumber)
				.Where(id => id.SchoolYear.OrganizationYear.Year.IsCurrentSchoolYear == true)
				.Select(id => id.SchoolYear.OrganizationYear.OrganizationGuid)
                .ToListAsync();
        }
    }
}