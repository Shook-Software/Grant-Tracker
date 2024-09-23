using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema;

public record PayrollPeriod
{
    public Guid Guid { get; init; } = Guid.NewGuid();
    public Guid PayrollYearGuid { get; set; }
    public virtual PayrollYear PayrollYear { get; set; }
    public int Period { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public DateOnly? AdjustmentDeadline { get; set; }
    public DateOnly? PortalChangeStartDate { get; set; }
    public DateOnly? PortalChangeEndDate { get; set; }
    public DateOnly? PaymentDate { get; set; }

    public static void Setup(ModelBuilder builder)
    {
        var entity = builder.Entity<PayrollPeriod>();

        entity.ToTable("PayrollPeriod", "GTkr", t => t.HasComment("A payroll period of two weeks that belongs to a single payroll year."))
            .HasKey(e => e.Guid);

        entity.Property(e => e.Period)
            .IsRequired();

        entity.Property(e => e.StartDate)
            .IsRequired();

        entity.Property(e => e.EndDate)
            .IsRequired();
    }
}
