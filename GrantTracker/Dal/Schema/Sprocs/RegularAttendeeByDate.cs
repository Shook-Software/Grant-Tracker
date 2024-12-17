namespace GrantTracker.Dal.Schema.Sprocs;

public record RegularAttendeeDate
{
    public Guid OrganizationGuid { get; set; }
    public Guid StudentGuid { get; set; }
    public DateOnly DateOfRegularAttendance { get; set; }
}
