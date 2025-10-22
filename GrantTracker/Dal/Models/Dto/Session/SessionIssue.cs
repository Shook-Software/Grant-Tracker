namespace GrantTracker.Dal.Models.DTO.SessionDTO;

public enum SessionIssue
{
    Schedule = 0,
    Registrations = 1,
    Attendance = 2
}

public class SessionIssuesDTO
{
    public Guid SessionGuid { get; set; }
    public string Name { get; set; }
    public List<IssueDTO<SessionIssue>> Issues { get; set; }
}

public class IssueDTO<T> where T: Enum
{
    public T Type { get; set; }
    public string Message { get; set; }

}
