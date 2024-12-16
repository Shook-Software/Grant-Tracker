using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema;

//very possible to change as requirements change.
//12-22-2024 - Current regular attendee is defined as 30+ days

public class OrganizationAttendanceGoal
{
    public Guid Guid { get; set; } = Guid.NewGuid();
    public Guid OrganizationGuid { get; set; }
    public Organization Organization { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public DateTime Created { get; set; }
    public DateTime Updated { get; set; }
    public Int16 RegularAttendeeCountThreshold { get; set; }


    public static void Setup(ModelBuilder builder)
    {
        var entity = builder.Entity<OrganizationAttendanceGoal>();

        entity.ToTable("OrganizationAttendanceGoal", "GTkr", t =>
        {
            t.HasComment("Attendance goals for the given date range.");
        })
        .HasKey(e => e.Guid);

        entity.Property(e => e.Guid).HasDefaultValueSql("NEWID()");

        entity.Property(e => e.RegularAttendeeCountThreshold).HasColumnType("smallint");
    }
}

/*
 * Bind it by organization... then find the goal that has today within it's date range.
 * Maybe allow users to go back and forth, with default goal range as the above.
 * 
 */
