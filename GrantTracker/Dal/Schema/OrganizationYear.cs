using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GrantTracker.Utilities;

namespace GrantTracker.Dal.Schema
{
	public class OrganizationYear
	{
		public Guid OrganizationYearGuid { get; set; }
		public Guid OrganizationGuid { get; set; }
		public virtual Organization Organization { get; set; }
		public Guid YearGuid { get; set; }
		public virtual Year Year { get; set; }

		public virtual ICollection<StudentSchoolYear> StudentSchoolYears { get; set; }
		public virtual ICollection<InstructorSchoolYear> InstructorSchoolYears { get; set; }
		public virtual ICollection<Session> Sessions { get; set; }
        public virtual ICollection<StudentGroup> StudentGroups { get; set; }

        public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<OrganizationYear>();

			entity.ToTable("OrganizationYear", "GTkr")
				.HasComment("An organization during a given school year.")
				.HasKey(e => e.OrganizationYearGuid);

			entity.HasIndex(e => new { e.OrganizationGuid, e.YearGuid })
				.IsUnique();

            entity.HasMany(e => e.InstructorSchoolYears)
				.WithOne(e => e.OrganizationYear)
				.HasForeignKey(e => e.OrganizationYearGuid)
                .OnDelete(DeleteBehavior.Cascade);

			entity.HasMany(e => e.StudentSchoolYears)
				.WithOne(e => e.OrganizationYear)
				.HasForeignKey(e => e.OrganizationYearGuid)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Sessions)
                .WithOne(e => e.OrganizationYear)
                .HasForeignKey(e => e.OrganizationYearGuid)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Organization)
				.WithMany(e => e.Years)
				.HasForeignKey(e => e.OrganizationGuid);

			entity.HasOne(e => e.Year)
				.WithMany(e => e.Organizations)
				.HasForeignKey(e => e.YearGuid);
		}
	}
}
