using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema;

public record PayrollYearGrantTrackerYearMap
{
    public Guid GrantTrackerYearGuid { get; set; }
    public virtual Year GrantTrackerYear { get; set; }
    public Guid PayrollYearGuid { get; set; }
    public virtual PayrollYear PayrollYear { get; set; }

    public static void Setup(ModelBuilder builder)
    {
        var entity = builder.Entity<PayrollYearGrantTrackerYearMap>();

        entity.ToTable("PayrollYearGrantTrackerYearMap", "GTkr", t => t.HasComment("Maps payroll years to grant tracker years."))
            .HasKey(e => new { e.GrantTrackerYearGuid, e.PayrollYearGuid });
    }
}
