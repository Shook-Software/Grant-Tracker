namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public record StaffMember
{
    public string OrganizationName { get; set; }
    public short SchoolYear { get; set; }
    public Quarter Quarter { get; set; }
    public string BadgeNumber { get; set; }
    public Guid InstructorSchoolYearGuid { get; set; }
    public string Status { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}
