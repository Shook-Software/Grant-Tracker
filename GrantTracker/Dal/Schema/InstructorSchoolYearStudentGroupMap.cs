using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GrantTracker.Dal.Schema;

public class InstructorSchoolYearStudentGroupMap
{
    public Guid InstructorSchoolYearGuid { get; set; }
    public InstructorSchoolYear InstructorSchoolYear { get; set; }
    public Guid StudentGroupGuid { get; set; }
    public virtual StudentGroup Group { get; set; }
    
    public static void Setup(ModelBuilder builder)
    {
        var entity = builder.Entity<InstructorSchoolYearStudentGroupMap>();

        entity.ToTable("InstructorSchoolYearStudentGroupMap", "GTkr", t => t.HasComment("Maps student groups to an instructor school year."))
            .HasKey(e => new { e.InstructorSchoolYearGuid, e.StudentGroupGuid });
    }
}
