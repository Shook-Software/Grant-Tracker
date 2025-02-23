namespace GrantTracker.Dal.Schema.Sprocs;



public record StudentDaysAttendedDTO
{
    public Guid OrganizationGuid { get; set; }
    public Guid StudentGuid { get; set; }
    public string MatricNumber { get; set; }
    public int DaysAttended { get; set; }
}