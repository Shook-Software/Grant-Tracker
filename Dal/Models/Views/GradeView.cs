using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class GradeView
	{
		public Guid Guid { get; set; }
		public Guid SessionGuid { get; set; }
		public Guid GradeGuid { get; set; }
		public LookupValue Grade { get; set; }
		public static GradeView FromDatabase(SessionGrade grade)
		{
			return new()
			{
				Guid = grade.Guid,
				SessionGuid = grade.SessionGuid,
				GradeGuid = grade.GradeGuid,
				Grade = grade.Grade
			};
		}
	}
}
