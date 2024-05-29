using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GrantTracker.Dal.Schema;

public class StudentGroup
{
    public Guid GroupGuid { get; set; }
    public string DisplayName { get; set; }
    public Guid OrganizationYearGuid { get; set; }
    public OrganizationYear OrganizationYear { get; set; }
    public virtual ICollection<StudentGroupItem> Items { get; set; }
    public virtual ICollection<InstructorSchoolYear> InstructorSchoolYears { get; set; }

    public static void Setup(ModelBuilder builder, ClaimsPrincipal user)
    {
        var entity = builder.Entity<StudentGroup>();

        entity.ToTable("StudentGroup", "GTkr", t => t.HasComment("Groupings of students to attach to instructors or extended for use elsewhere."))
            .HasKey(e => e.GroupGuid);

        entity.Navigation(e => e.Items).AutoInclude();

        entity.HasMany(e => e.InstructorSchoolYears)
            .WithMany(e => e.StudentGroups)
            .UsingEntity<InstructorSchoolYearStudentGroupMap>(
                map => map.HasOne(e => e.InstructorSchoolYear).WithMany().HasForeignKey(e => e.InstructorSchoolYearGuid).HasPrincipalKey(e => e.InstructorSchoolYearGuid).OnDelete(DeleteBehavior.Restrict),
                map => map.HasOne(e => e.Group).WithMany().HasForeignKey(e => e.StudentGroupGuid).HasPrincipalKey(e => e.GroupGuid).OnDelete(DeleteBehavior.Restrict)
            );

        entity.HasMany(e => e.Items)
            .WithOne(e => e.Group)
            .HasForeignKey(e => e.GroupGuid);

        entity.HasOne(e => e.OrganizationYear)
            .WithMany(e => e.StudentGroups)
            .HasForeignKey(e => e.OrganizationYearGuid);
    }
}
