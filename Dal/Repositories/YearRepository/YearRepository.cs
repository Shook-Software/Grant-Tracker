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

		//I don't know how useful this would actually be.
		public IQueryable GetCurrentYear()
		{
			return _grantContext.Years.Where(year => year.IsCurrentSchoolYear == true);
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
			static bool DateIsBetween(DateOnly date, DateOnly startDate, DateOnly endDate)
			{
				return date > startDate && date < endDate;
			};

			await UseDeveloperLog(async () =>
			{
				//validate
				var existingYears = await this.GetAsync();
				if (existingYears.Any(y => y.SchoolYear == yearModel.SchoolYear && y.Quarter == yearModel.Quarter))
					throw new Exception("A school year with the provided year and quarter already exists.");

				//for the given year in newGrantYear, ensure the start and end date do not overlap another SchoolYear of that year.
				if (existingYears
				.Where(y => y.SchoolYear == yearModel.SchoolYear)
				.Any(y => DateIsBetween(yearModel.StartDate, y.StartDate, y.EndDate) || DateIsBetween(yearModel.EndDate, y.StartDate, y.EndDate))
				)
					throw new Exception("The new year's start and end date cannot fall between the existing start and end dates for an already existing record.");

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
	}
}

