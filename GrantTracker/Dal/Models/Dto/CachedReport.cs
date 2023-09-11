
namespace GrantTracker.Dal.Models.Views
{
	public class Report<T>
	{
		public DateTime GeneratedAt { get; init; }
		public List<T> Data { get; set; } = null;

		public Report(List<T> reportData) 
		{
			Data = reportData;
			GeneratedAt = DateTime.Now;
		}
	}
}
