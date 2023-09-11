using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class Person
	{
		public Guid PersonGuid { get; set; } = Guid.NewGuid();
		public string FirstName { get; set; }
		public string LastName { get; set; }


		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<Person>();

			entity.ToTable("Person", "GTkr")
				.HasComment("Basic information that is ubiquitous to all people stored for use in the Grant Tracker.")
				.HasKey(e => e.PersonGuid);

			/// /Inheritance Relationships

			entity.HasDiscriminator<string>("PersonType")
				.HasValue<Student>("Student")
				.HasValue<Instructor>("Instructor");

			/// /Relationships

			/*entity.HasOne(e => e.Organization)
				.WithMany(o => o.People)
				.HasForeignKey(e => e.OrganizationGuid);*/

			/// /Properties

			entity.Property(e => e.PersonGuid)
				.IsRequired()
				.HasColumnType("uniqueidentifier");

			entity.Property(e => e.FirstName)
				.IsRequired()
				.HasColumnType("nvarchar")
				.HasMaxLength(50)
				.HasComment("The given, legal first name for a person.");

			entity.Property(e => e.LastName)
				.IsRequired()
				.HasColumnType("nvarchar")
				.HasMaxLength(100)
				.HasComment("The given, legal last name(s) for a person.");
		}
	}
}