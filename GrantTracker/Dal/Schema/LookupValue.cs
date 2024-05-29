using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class LookupValue
	{
		public Guid Guid { get; set; }
		public Guid DefinitionGuid { get; set; }
		public LookupDefinition Definition { get; set; }
		public string Value { get; set; }
		public string? Description { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<LookupValue>();

			entity.ToTable("LookupValue", "GTkr")
				.HasComment("Lookup table for persistent attributes' values and their meaning.")
				.HasKey(e => e.Guid);

			/// /Relations

			entity.HasOne(e => e.Definition)
				.WithMany(e => e.Values)
				.HasForeignKey(e => e.DefinitionGuid);

			/// /Properties

			entity.Property(e => e.Guid)
				.IsRequired()
				.HasColumnType("uniqueidentifier")
				.HasDefaultValueSql("NEWID()");

			entity.Property(e => e.DefinitionGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.Value)
				.IsRequired()
				.HasColumnType("varchar")
				.HasMaxLength(25)
				.HasComment("Name of the value.");

			entity.Property(e => e.Description)
				.HasColumnType("nvarchar")
				.HasMaxLength(400)
				.HasComment("Useful description of the value.");
		}
	}
}