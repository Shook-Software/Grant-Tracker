using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views;

public record StudentGroupViewInstructorView
{
    public Guid InstructorSchoolYearGuid { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string BadgeNumber { get; set; }
}

public record StudentGroupItemView
{
    public Guid StudentSchoolYearGuid { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string MatricNumber { get; set; }
}

public record StudentGroupView
{
    public Guid GroupGuid { get; set; }
    public string? Name { get; set; }
    public List<StudentGroupItemView>? Students { get; set; }
    public List<StudentGroupViewInstructorView>? Instructors { get; set; }
}
