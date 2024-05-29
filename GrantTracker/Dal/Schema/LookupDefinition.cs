using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class LookupDefinition
	{
		public Guid Guid { get; set; }
		public string Name { get; set; }
		public string? Description { get; set; }

		public ICollection<LookupValue> Values { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<LookupDefinition>();

			entity.ToTable("LookupDefinition", "GTkr")
				.HasComment("Lookup table for persistent attributes.")
				.HasKey(e => e.Guid);

			entity.HasIndex(e => e.Name).IsUnique();

			/// /Relations

			entity.HasMany(e => e.Values)
				.WithOne(e => e.Definition)
				.HasForeignKey(e => e.DefinitionGuid);

			/// /Properties

			entity.Property(e => e.Guid)
				.IsRequired()
				.HasColumnType("uniqueidentifier")
				.HasDefaultValueSql("NEWID()");

			entity.Property(e => e.Name)
				.IsRequired()
				.HasColumnType("nvarchar")
				.HasMaxLength(75)
				.HasComment("Name of the definition.");

			entity.Property(e => e.Description)
				.HasColumnType("nvarchar")
				.HasMaxLength(400)
				.HasComment("Useful description of what is being defined.");
		}
	}
}