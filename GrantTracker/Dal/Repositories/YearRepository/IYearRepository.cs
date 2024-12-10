using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.YearRepository
{
	public interface IYearRepository
	{
		Task<List<Year>> GetAsync();
		Task<Year> GetAsync(int year, Quarter quarter);
		Task AddAsync(YearForm yearModel);
		Task UpdateAsync(YearForm yearModel);
		Task<List<string>> ValidateYearAsync(YearForm year);
		IQueryable<Year> Get(Guid YearGuid);
    }
}
