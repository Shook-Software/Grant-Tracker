using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class SessionGrade
	{
		public Guid Guid { get; set; }
		public Guid SessionGuid { get; set; }
		public virtual Session Session { get; set; }
		public Guid GradeGuid { get; set; }
		public virtual LookupValue Grade { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<SessionGrade>();

			entity.ToTable("SessionGrade", "GTkr")
				.HasComment("Each row designates one of the allowable grade levels for a session.")
				.HasKey(e => e.Guid);

			entity.HasIndex(e => new { e.SessionGuid, e.GradeGuid })
				.IsUnique();

			/// /Relations

			entity.HasOne(e => e.Session)
				.WithMany(e => e.SessionGrades)
				.HasForeignKey(e => e.SessionGuid);

			/// /Properties

			entity.Property(e => e.Guid)
				.IsRequired()
				.HasColumnType("uniqueidentifier")
				.HasDefaultValueSql("NEWID()");

			entity.Property(e => e.SessionGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.GradeGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");
		}
	}
}