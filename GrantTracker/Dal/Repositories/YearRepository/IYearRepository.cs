using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.YearRepository
{
	public interface IYearRepository
	{
		public Task<List<Year>> GetAsync();
		public Task<Year> GetAsync(int year, Quarter quarter);
		public Task AddAsync(Year yearModel);
		public Task UpdateAsync(Year yearModel);
		public Task<List<string>> ValidateYearAsync(Year year);
	}
}
