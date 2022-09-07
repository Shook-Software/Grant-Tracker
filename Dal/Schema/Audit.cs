using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public enum AuditLogAction
	{
		Create = 0,
		Update = 1,
		Delete = 2,
		None = 3,
	}

	public class AuditLog
	{
		public Guid Guid { get; set; }
		public AuditLogAction Action { get; set; }
		public string TableName { get; set; } //Schema model name or database name? - Change this to a guid with a lookup table at some point
		public string Values { get; set; }
		public DateTime ChangeDateTime { get; set; }
		public string User { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<AuditLog>();

			entity.ToTable("AuditLog", "GTkr")
					.HasComment("Change log for the database.")
					.HasKey(e => e.Guid);

			/// /Properties

			entity.Property(e => e.Guid)
					.IsRequired()
					.HasColumnType("uniqueidentifier");

			entity.Property(e => e.Action)
					.IsRequired()
					.HasColumnType("tinyint")
					.HasComment("");

			entity.Property(e => e.TableName)
					.IsRequired()
					.HasColumnType("nvarchar")
					.HasMaxLength(100)
					.HasComment("");

			entity.Property(e => e.Values)
				.IsRequired()
				.HasColumnType("text")
				.HasComment("");

			entity.Property(e => e.ChangeDateTime)
				.IsRequired()
				.HasColumnType("datetime")
				.HasComment("");

			entity.Property(e => e.User)
				.IsRequired()
				.HasColumnType("nvarchar")
				.HasMaxLength(50)
				.HasComment("");
		}
	}
}