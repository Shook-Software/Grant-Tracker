using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.LookupRepository
{
	public class LookupRepository : ILookupRepository
	{
		private readonly GrantTrackerContext _grantTrackerContext;

		public LookupRepository(GrantTrackerContext grantTrackerContext)
		{
			_grantTrackerContext = grantTrackerContext;
		}

		public async Task<string> GetValueAsync(Guid valueGuid)
		{
			var lookupValue = await _grantTrackerContext.LookupValues
				.FindAsync(valueGuid);

			return lookupValue.Value;
		}
	}
}