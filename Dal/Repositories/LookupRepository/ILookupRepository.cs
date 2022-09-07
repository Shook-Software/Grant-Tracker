namespace GrantTracker.Dal.Repositories.LookupRepository
{
	public interface ILookupRepository
	{
		public Task<string> GetValueAsync(Guid valueGuid);
	}
}