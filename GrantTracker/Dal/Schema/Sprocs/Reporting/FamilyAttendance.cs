namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public class TotalFamilyAttendanceDbModel
{
    public string OrganizationName { get; set; }
    public string MatricNumber { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Grade { get; set; }
    public string FamilyMember { get; set; }
    public int TotalDays { get; set; }
    public double TotalHours { get; set; }
}

public class TotalFamilyAttendanceViewModel
{
    public class FamilyMemberAttendanceViewModel
    {
        public string FamilyMember { get; set; }
        public int TotalDays { get; set; }
        public double TotalHours { get; set; }
    }

    public string OrganizationName { get; set; }
    public string MatricNumber { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Grade { get; set; }
    public List<FamilyMemberAttendanceViewModel> FamilyAttendance { get; set; }
}