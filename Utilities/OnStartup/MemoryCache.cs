using Microsoft.Extensions.Caching.Memory;

namespace GrantTracker.Utilities.OnStartup
{
	public static class MemoryCache
	{
		public static void Setup(WebApplicationBuilder builder)
		{
			builder.Services.AddMemoryCache();
		}
	}
}
