using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using GrantTracker.Utilities.OnStartup;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Security.Claims;

namespace GrantTracker.Dal.Repositories.AuthRepository;

public class AuthRepository : IAuthRepository
{
    protected readonly GrantTrackerContext _grantContext;
    protected readonly ClaimsPrincipal _user;
	protected readonly HttpContext _httpContext;

    public AuthRepository(IDevRepository devRepository, GrantTrackerContext grantContext, IHttpContextAccessor httpContextAccessor)
	{
        _grantContext = grantContext;
        _user = httpContextAccessor.HttpContext.User;
		_httpContext = httpContextAccessor.HttpContext;
    }

	public UserIdentity GetIdentity()
	{
		var badgeNumber = _user.Id();

		var currentYearGuid = _grantContext.Years.Where(sy => sy.IsCurrentSchoolYear).Select(sy => sy.YearGuid).FirstOrDefault();

		if (_user.IsTeacher())
			return _grantContext.InstructorSchoolYears
				.Include(isy => isy.OrganizationYear).ThenInclude(oy => oy.Year)
                .Include(isy => isy.OrganizationYear).ThenInclude(oy => oy.Organization)
				.Include(isy => isy.Instructor)
				.Where(isy => isy.Instructor.BadgeNumber == badgeNumber && isy.OrganizationYear.YearGuid == currentYearGuid)
				.Select(isy => new UserIdentity
                {
                    UserGuid = isy.InstructorGuid,
                    UserOrganizationYearGuid = isy.OrganizationYearGuid, //why do we have these both
                    OrganizationYearGuid = isy.OrganizationYearGuid,

                    FirstName = isy.Instructor.FirstName,
                    LastName = isy.Instructor.LastName,
                    BadgeNumber = isy.Instructor.BadgeNumber,
                    Claim = IdentityClaim.Teacher,

                    Organization = new OrganizationView
                    {
                        Guid = isy.OrganizationYear.OrganizationGuid,
                        Name = isy.OrganizationYear.Organization.Name
                    },
                    OrganizationYear = OrganizationYearView.FromDatabase(isy.OrganizationYear)
                })
            .FirstOrDefault();

        return _grantContext.UserIdentities
			.Include(u => u.SchoolYear).ThenInclude(i => i.Instructor)
			.Include(u => u.SchoolYear).ThenInclude(i => i.OrganizationYear).ThenInclude(o => o.Organization)
			.Include(u => u.SchoolYear).ThenInclude(i => i.OrganizationYear).ThenInclude(o => o.Year)
			.Where(u => u.SchoolYear.Instructor.BadgeNumber == badgeNumber && u.SchoolYear.OrganizationYear.Year.YearGuid == currentYearGuid)
			.Select(u => new UserIdentity
			{
				UserGuid = u.SchoolYear.InstructorGuid,
				UserOrganizationYearGuid = u.Guid,
				OrganizationYearGuid = u.SchoolYear.OrganizationYearGuid,

				FirstName = u.SchoolYear.Instructor.FirstName,
				LastName = u.SchoolYear.Instructor.LastName,
				BadgeNumber = u.SchoolYear.Instructor.BadgeNumber,
				Claim = u.Claim,

				Organization = new OrganizationView
				{
					Guid = u.SchoolYear.OrganizationYear.OrganizationGuid,
					Name = u.SchoolYear.OrganizationYear.Organization.Name
				},
				OrganizationYear = OrganizationYearView.FromDatabase(u.SchoolYear.OrganizationYear)
			})
			.FirstOrDefault();
	}

	public async Task<List<UserIdentity>> GetCurrentUsersAsync()
	{
		return await _grantContext.UserIdentities
			.AsNoTracking()
			.Include(user => user.SchoolYear).ThenInclude(i => i.OrganizationYear).ThenInclude(o => o.Organization)
			.Include(user => user.SchoolYear).ThenInclude(i => i.OrganizationYear).ThenInclude(o => o.Year)
			.Include(user => user.SchoolYear).ThenInclude(i => i.Instructor)
			.Where(user => user.SchoolYear.OrganizationYear.Year.IsCurrentSchoolYear) //to be replaced with a filter eventually
			.Select(u => new UserIdentity
			{
				UserGuid = u.SchoolYear.InstructorGuid,
				UserOrganizationYearGuid = u.Guid,
				OrganizationYearGuid = u.SchoolYear.OrganizationYearGuid,

				FirstName = u.SchoolYear.Instructor.FirstName,
				LastName = u.SchoolYear.Instructor.LastName,
				BadgeNumber = u.SchoolYear.Instructor.BadgeNumber,
				Claim = u.Claim,

				Organization = new OrganizationView
				{
					Guid = u.SchoolYear.OrganizationYear.OrganizationGuid,
					Name = u.SchoolYear.OrganizationYear.Organization.Name
				},
				OrganizationYear = OrganizationYearView.FromDatabase(u.SchoolYear.OrganizationYear)
			})
			.OrderBy(identity => identity.Organization.Name)
			.ToListAsync();
	}

	//Add site users such as coordinators or administrators
	public async Task AddUserAsync(UserIdentityView newUser)
	{
		//if user is not authenticated and not in the grant tracker database already
		var existingInstructor = await _grantContext.Instructors
			.AsNoTracking()
			.Include(i => i.InstructorSchoolYears)
			.ThenInclude(isy => isy.OrganizationYear)
			.Where(i => i.BadgeNumber == newUser.BadgeNumber)
			.FirstOrDefaultAsync();

		if (existingInstructor is null)
		{
			var newInstructorGuid = Guid.NewGuid();
			var adminStatus = await _grantContext.InstructorStatuses.Where(i => i.Label == "Administrator").SingleOrDefaultAsync();
			var newInstructor = new Instructor()
			{
				PersonGuid = newInstructorGuid,
				FirstName = newUser.FirstName,
				LastName = newUser.LastName,
				BadgeNumber = newUser.BadgeNumber,
				InstructorSchoolYears = new List<InstructorSchoolYear>() {
				new InstructorSchoolYear()
				{
					InstructorGuid = newInstructorGuid,
					OrganizationYearGuid = newUser.OrganizationYearGuid,
					StatusGuid = adminStatus.Guid.Value,
					Identity = new Identity()
					{
						Guid = newInstructorGuid,
						Claim = newUser.Claim
					}
				}
			}
			};

			await _grantContext.Instructors.AddAsync(newInstructor);
			await _grantContext.SaveChangesAsync();
			existingInstructor = await _grantContext.Instructors.Include(i => i.InstructorSchoolYears).Where(i => i.BadgeNumber == newUser.BadgeNumber).FirstOrDefaultAsync();
		}
		else if (!existingInstructor.InstructorSchoolYears.Any(isy => isy.OrganizationYear.OrganizationYearGuid == newUser.OrganizationYearGuid))
		{
			var instructorSchoolYearGuid = Guid.NewGuid();
			var newSchoolYear = new InstructorSchoolYear()
			{
				InstructorSchoolYearGuid = instructorSchoolYearGuid,
				InstructorGuid = existingInstructor.PersonGuid,
				OrganizationYearGuid = newUser.OrganizationYearGuid,
				Identity = new Identity()
				{
					Guid = instructorSchoolYearGuid,
					Claim = newUser.Claim
				},
				StatusGuid = _grantContext.InstructorStatuses.Where(stat => stat.Label == "Administrator").First().Guid.Value
            };

			await _grantContext.InstructorSchoolYears.AddAsync(newSchoolYear);
			await _grantContext.SaveChangesAsync();
			return;
		}

		var instructorSchoolYear = await _grantContext.InstructorSchoolYears
				.Include(isy => isy.Instructor)
				.Include(isy => isy.OrganizationYear)
				.Where(isy => isy.Instructor.BadgeNumber == newUser.BadgeNumber && isy.OrganizationYear.OrganizationYearGuid == newUser.OrganizationYearGuid)
				.FirstOrDefaultAsync();

		var newIdentity = new Identity()
		{
			Guid = instructorSchoolYear.InstructorSchoolYearGuid,
			Claim = newUser.Claim
		};
		await _grantContext.UserIdentities.AddAsync(newIdentity);

		await _grantContext.SaveChangesAsync();
	}

	public async Task DeleteUserAsync(Guid userOrganizationYearGuid)
	{
		var userIdentity = await _grantContext.UserIdentities.FindAsync(userOrganizationYearGuid) 
			?? throw new ArgumentException(String.Format("Cannot find an existing user identity with the given guid.", nameof(userOrganizationYearGuid)));
            _grantContext.UserIdentities.Remove(userIdentity);
		await _grantContext.SaveChangesAsync();
	}

	public async Task<List<OrganizationYearView>> GetOrganizationYearsForCurrentYear()
	{
		return await _grantContext
			.OrganizationYears
			.AsNoTracking()
			.Where(oy => oy.Year.IsCurrentSchoolYear)
			.Include(oy => oy.Organization)
			.Include(oy => oy.Year)
			.OrderBy(oy => oy.Organization.Name)
			.Select(oy => OrganizationYearView.FromDatabase(oy))
			.ToListAsync();
	}
}