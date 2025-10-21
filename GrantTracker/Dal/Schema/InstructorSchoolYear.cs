using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema;

public class InstructorSchoolYear
{
    public Guid InstructorSchoolYearGuid { get; set; } = Guid.NewGuid();
    public Guid InstructorGuid { get; set; }
    public virtual Instructor Instructor { get; set; }
    public Guid OrganizationYearGuid { get; set; }
    public virtual OrganizationYear OrganizationYear { get; set; }
    public Guid StatusGuid { get; set; }
    public bool IsPendingDeletion { get; set; } = false;
    public string? Title { get; set; }
    public virtual InstructorStatus Status { get; set; }
    public virtual Identity Identity { get; set; }

    public virtual ICollection<InstructorRegistration> SessionRegistrations { get; set; }
    public virtual ICollection<InstructorAttendanceRecord> AttendanceRecords { get; set; }
    public virtual ICollection<StudentGroup> StudentGroups { get; set; }

    public static void Setup(ModelBuilder builder)
    {
        var entity = builder.Entity<InstructorSchoolYear>();

        entity.ToTable("InstructorSchoolYear", "GTkr")
            .HasComment("An instructor at a school during a given school year.")
            .HasKey(e => e.InstructorSchoolYearGuid);

        entity.HasIndex(e => new { e.InstructorGuid, e.OrganizationYearGuid })
            .IsUnique();

        entity.HasOne(e => e.Identity)
            .WithOne(e => e.SchoolYear)
            .HasForeignKey<Identity>(e => e.Guid);

        entity.HasOne(e => e.Instructor)
            .WithMany(e => e.InstructorSchoolYears)
            .HasForeignKey(e => e.InstructorGuid)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(e => e.OrganizationYear)
            .WithMany(e => e.InstructorSchoolYears)
            .HasForeignKey(e => e.OrganizationYearGuid)
            .OnDelete(DeleteBehavior.NoAction);

        entity.HasMany(e => e.StudentGroups)
            .WithMany(e => e.InstructorSchoolYears)
            .UsingEntity<InstructorSchoolYearStudentGroupMap>();

        /// /Properties
        /// 

        entity.Property(e => e.Title).HasMaxLength(40);
    }
}
