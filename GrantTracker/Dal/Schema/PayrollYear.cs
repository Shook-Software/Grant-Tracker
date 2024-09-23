using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema;

public record PayrollYear
{
    public Guid Guid { get; set; } = Guid.NewGuid();
    public string Name { get; set; }

    public virtual List<PayrollPeriod> Periods { get; set; }
    public virtual List<Year> GrantTrackerYears { get; set; }

    public static void Setup(ModelBuilder builder)
    {
        var entity = builder.Entity<PayrollYear>();

        entity.ToTable("PayrollYear", "GTkr", t => t.HasComment("Base table payroll years."))
            .HasKey(e => e.Guid);

        entity.HasMany(e => e.Periods)
            .WithOne(e => e.PayrollYear)
            .HasForeignKey(e => e.PayrollYearGuid)
            .HasPrincipalKey(e => e.Guid);

        entity.HasMany(e => e.GrantTrackerYears)
            .WithMany(e => e.PayrollYears)
            .UsingEntity<PayrollYearGrantTrackerYearMap>(
                map => map.HasOne(e => e.GrantTrackerYear).WithMany().HasForeignKey(e => e.GrantTrackerYearGuid).HasPrincipalKey(e => e.YearGuid).OnDelete(DeleteBehavior.Restrict),
                map => map.HasOne(e => e.PayrollYear).WithMany().HasForeignKey(e => e.PayrollYearGuid).HasPrincipalKey(e => e.Guid).OnDelete(DeleteBehavior.Restrict)
            );

        entity.Property(e => e.Name)
            .HasMaxLength(16)
            .IsRequired();
    }
}