using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class ExceptionLog
	{
		public Guid Guid { get; set; }
		public Guid InstructorSchoolYearGuid { get; set; }
		public virtual InstructorSchoolYear InstructorSchoolYear { get; set; }
		public string Source { get; set; }
		public string Message { get; set; }
		public string InnerMessage { get; set; }
		public string StackTrace { get; set; }
		public string TargetSite { get; set; }
		public DateTime DateTime { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<ExceptionLog>();

			entity.ToTable("ExceptionLog", "GTkr")
				.HasComment("Log to view exceptions in production. The next programmer may have access to the production site and database, but I do not.")
				.HasKey(e => e.Guid);

			entity.HasOne(e => e.InstructorSchoolYear)
				.WithMany(e => e.ExceptionLogs)
				.HasForeignKey(e => e.InstructorSchoolYearGuid);
		}
	}
}