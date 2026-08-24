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
    public string Title { get; set; }
    public string FundingSource { get; set; } //one row per distinct funding source snapshotted on the staff member's attendance records; null when none
}
