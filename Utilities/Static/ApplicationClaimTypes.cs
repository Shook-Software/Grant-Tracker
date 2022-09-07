namespace GrantTracker.Utilities.Static
{
	public static class ApplicationInfo
	{
		public static List<string> ClaimTypes = new List<string>()
		{
			"Owner", "Admin", "DefaultUser"
		};

		public static List<string> PolicyTypes = new List<string>()
		{
			"OwnerOnly", "AdminOnly", "DefaultOnly"
		};
	}
}