using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.YearRepository
{
	public interface IYearRepository
	{
		Task<List<Year>> GetAsync();
		Task<Year> GetAsync(int year, Quarter quarter);
		Task AddAsync(Year yearModel);
		Task UpdateAsync(Year yearModel);
		Task<List<string>> ValidateYearAsync(Year year);
		IQueryable<Year> Get(Guid YearGuid);
    }
}
