using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using GrantTracker.Dal.Repositories.DevRepository;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace GrantTracker.Dal.Repositories.YearRepository;

public class YearRepository : IYearRepository
{
    protected readonly GrantTrackerContext _grantContext;
    protected readonly ClaimsPrincipal _user;

    public YearRepository(GrantTrackerContext grantContext,IHttpContextAccessor httpContextAccessor)
    {
        _grantContext = grantContext;
        _user = httpContextAccessor.HttpContext.User;
    }

	public async Task<List<Year>> GetAsync()
	{
		return await _grantContext.Years
            .OrderByDescending(x => x.SchoolYear)
            .ThenBy(x => x.Quarter)
		.ToListAsync();
    }

    public IQueryable<Year> Get(Guid YearGuid)
    {
		return _grantContext.Years.Where(x => x.YearGuid == YearGuid);
    }

    public async Task<Year> GetAsync(int year, Quarter quarter)
	{
		return await _grantContext.Years
			.Where(sy => sy.SchoolYear == year && sy.Quarter == quarter)
			.FirstOrDefaultAsync();
	}

	public async Task AddAsync(Year yearModel)
	{
		await _grantContext.AddAsync(new Year
		{
			YearGuid = Guid.NewGuid(),
			SchoolYear = yearModel.SchoolYear,
			Quarter = yearModel.Quarter,
			StartDate = yearModel.StartDate,
			EndDate = yearModel.EndDate,
			IsCurrentSchoolYear = false
		});

		await _grantContext.SaveChangesAsync();
	}

	public async Task UpdateAsync(Year yearModel)
	{
		Year dbYear = await _grantContext.Years.FindAsync(yearModel.YearGuid);
		dbYear.SchoolYear = yearModel.SchoolYear;
		dbYear.Quarter = yearModel.Quarter;
		dbYear.StartDate = yearModel.StartDate;
		dbYear.EndDate = yearModel.EndDate;

		if (yearModel.IsCurrentSchoolYear != dbYear.IsCurrentSchoolYear)
		{
			Year currentActiveYear = await _grantContext.Years.Where(y => y.IsCurrentSchoolYear).SingleAsync();
			Year nextActiveYear = await _grantContext.Years.FindAsync(yearModel.YearGuid);

			currentActiveYear.IsCurrentSchoolYear = false;
			nextActiveYear.IsCurrentSchoolYear = true;
		}

		await _grantContext.SaveChangesAsync();
	}

	//todo: Create a validator class instead of this
	public async Task<List<string>> ValidateYearAsync(Year year)
	{
		static bool DateIsBetween(DateOnly date, DateOnly startDate, DateOnly endDate)
		{
			return date > startDate && date < endDate;
		};

		List<string> validationErrors = new();
		var existingYears = await this.GetAsync();

		var yearHasSameQuarterAsExistingSameYear = existingYears.Any(y => y.SchoolYear == year.SchoolYear && y.Quarter == year.Quarter);

		if (yearHasSameQuarterAsExistingSameYear)
			validationErrors.Add("A school year with the provided year and quarter already exists.");


		var endDateIsBeforeStartDate = year.StartDate > year.EndDate;

		if (endDateIsBeforeStartDate)
			validationErrors.Add("End date cannot be before the start date.");


		var yearIntersectsExistingYears = existingYears
			.Where(y => y.SchoolYear == year.SchoolYear)
			.Any(y => DateIsBetween(year.StartDate, y.StartDate, y.EndDate) || DateIsBetween(year.EndDate, y.StartDate, y.EndDate));

		if (yearIntersectsExistingYears)
			validationErrors.Add("The new year's start and end date cannot fall between the existing start and end dates for an already existing record.");

		return validationErrors;
	}
}

public static class YearExtensions
{
	public static IIncludableQueryable<Year, IEnumerable<OrganizationYear>> WithOrganizationYears(this IQueryable<Year> Query)
	{
		return Query.Include(year => year.Organizations);
	}

	public static IIncludableQueryable<Year, Organization> WithOrganizations(this IIncludableQueryable<Year, IEnumerable<OrganizationYear>> Query)
	{
		return Query.ThenInclude(x => x.Organization);
	}

	public static IIncludableQueryable<Year, IEnumerable<InstructorSchoolYear>> WithInstructorSchoolYears(this IIncludableQueryable<Year, IEnumerable<OrganizationYear>> Query)
	{
		return Query.ThenInclude(x => x.InstructorSchoolYears);
    }

    public static IIncludableQueryable<Year, Identity> WithCoordinatorIdentities(this IIncludableQueryable<Year, IEnumerable<InstructorSchoolYear>> Query)
    {
        return Query.ThenInclude(x => x.Identity);
    }
}