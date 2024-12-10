using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Dto;

public class YearForm
{
    public Guid YearGuid { get; set; } = Guid.NewGuid();
    public short SchoolYear { get; set; }
    public Quarter Quarter { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public bool IsCurrentSchoolYear { get; set; } = false;
    public List<UserIdentity> Users { get; set; } = new();
}
