using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using GrantTracker.Dal.Repositories.DevRepository;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Repositories.YearRepository
{
	public class YearRepository : RepositoryBase, IYearRepository
	{//can we use fragments to create a whole?
	 //Make a GetCurrentYear that doesn't call the database yet?

		public YearRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext)
			: base(devRepository, httpContext, grantContext)
		{
		}

		public async Task<List<Year>> GetAsync()
		{
			return await _grantContext.Years.ToListAsync();
		}

		public async Task<Year> GetAsync(int year, Quarter quarter)
		{
			return await _grantContext.Years
				.Where(sy => sy.SchoolYear == year && sy.Quarter == quarter)
				.FirstOrDefaultAsync();
		}

		public async Task AddAsync(Year yearModel)
		{
			await UseDeveloperLog(async () =>
			{
				await _grantContext.AddAsync(new Year
				{
					YearGuid = yearModel.YearGuid,
					SchoolYear = yearModel.SchoolYear,
					Quarter = yearModel.Quarter,
					StartDate = yearModel.StartDate,
					EndDate = yearModel.EndDate,
					IsCurrentSchoolYear = false
				});

				await _grantContext.SaveChangesAsync();
			});
		}

		public async Task UpdateAsync(Year yearModel)
		{
			await UseDeveloperLog(async () =>
			{
				Year dbYear = await _grantContext.Years.FindAsync(yearModel.YearGuid);
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
			});
		}

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
}

