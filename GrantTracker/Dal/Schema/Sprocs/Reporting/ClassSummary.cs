namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public class ClassSummaryDbModel
{
    public Guid OrganizationYearGuid { get; set; }
    public string OrganizationName { get; set; }
    public Guid SessionGuid { get; set; }
    public string SessionName { get; set; }
    public string ActivityType { get; set; }
    public string FundingSource { get; set; }
    public string Objective { get; set; }
    public string InstructorFirstName { get; set; }
    public string InstructorLastName { get; set; }
    public string InstructorStatus { get; set; }
    public DateOnly FirstSession { get; set; }
    public DateOnly LastSession { get; set; }
    public double WeeksToDate { get; set; }
    public string DaysOfWeek { get; set; }
    public double AvgDailyAttendance { get; set; }
    public double AvgHoursPerDay { get; set; }
}

public class ClassSummaryViewModel
{
    public class InstructorViewModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Status { get; set; }
    }

    public Guid OrganizationYearGuid { get; set; }
    public string OrganizationName { get; set; }
    public Guid SessionGuid { get; set; }
    public string SessionName { get; set; }
    public string ActivityType { get; set; }
    public string FundingSource { get; set; }
    public string Objective { get; set; }
    public DateOnly FirstSession { get; set; }
    public DateOnly LastSession { get; set; }
    public string DaysOfWeek { get; set; }
    public double WeeksToDate { get; set; }
    public double AvgDailyAttendance { get; set; }
    public double AvgHoursPerDay { get; set; }
    public List<InstructorViewModel> Instructors { get; set; }
}
