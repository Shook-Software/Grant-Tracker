using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GrantTracker.Dal.Schema;

public class StudentGroupItem
{
    public Guid GroupGuid { get; set; }
    public StudentGroup Group { get; set; }
    public Guid StudentSchoolYearGuid { get; set; }
    public StudentSchoolYear StudentSchoolYear { get; set; }

    public static void Setup(ModelBuilder builder, ClaimsPrincipal user)
    {
        var entity = builder.Entity<StudentGroupItem>();

        entity.ToTable("StudentGroupItem", "GTkr", t => t.HasComment("Represents a single student school year belonging to a grouping of students."))
                .HasKey(e => new { e.GroupGuid, e.StudentSchoolYearGuid });

        entity.Navigation(e => e.StudentSchoolYear).AutoInclude();

        entity.HasOne(e => e.StudentSchoolYear)
            .WithMany(e => e.StudentGroups)
            .HasForeignKey(e => e.StudentSchoolYearGuid);
    }
}
