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
			IdentityClaim? claim = (await _db.UserIdentities.Where(e => e.SchoolYear.Instructor.BadgeNumber == BadgeNumber).FirstOrDefaultAsync())?.Claim;

			claim ??= await _db.Instructors.AnyAsync(p => p.BadgeNumber == BadgeNumber) ? IdentityClaim.Teacher : null;

			if (claim == null)
				return "Unauthorized";

			return claim switch
            {
                IdentityClaim.Administrator => "Administrator",
                IdentityClaim.Coordinator => "Coordinator",
                IdentityClaim.Teacher => "Teacher",
                _ => "Unauthorized"
            };
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

        public async Task<List<Guid>> GetCurrentUserOrganizationGuidsAsync(string BadgeNumber, string role)
        {
			if (role == "Teacher")
				return await _db.InstructorSchoolYears
					.Include(isy => isy.Instructor)
					.Include(isy => isy.OrganizationYear)
					.Where(isy => isy.Instructor.BadgeNumber == BadgeNumber)
					.Where(isy => isy.OrganizationYear.Year.IsCurrentSchoolYear == true)
					.Select(isy => isy.OrganizationYear.OrganizationGuid)
					.ToListAsync();

            return await _db.UserIdentities
				.Include(id => id.SchoolYear).ThenInclude(isy => isy.OrganizationYear)
				.Where(id => id.SchoolYear.Instructor.BadgeNumber == BadgeNumber)
				.Where(id => id.SchoolYear.OrganizationYear.Year.IsCurrentSchoolYear == true)
				.Select(id => id.SchoolYear.OrganizationYear.OrganizationGuid)
                .ToListAsync();
        }
    }
}