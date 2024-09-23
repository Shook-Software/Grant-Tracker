using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Dto;

public record PayrollYearDto
{
    public Guid Guid { get; set; }
    public string Name { get; set; }
    public List<Year> Years { get; set; } = new();
    public List<PayrollPeriodDto> Periods { get; set; } = new();
}

public record PayrollPeriodDto
{
    public int Period { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}
