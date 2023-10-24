namespace GrantTracker.Dal.Schema.Sprocs.Reporting;

public class ReportsDbModel
{
    public List<TotalStudentAttendanceViewModel> TotalStudentAttendance { get; set; }
    public List<TotalFamilyAttendanceDbModel> TotalFamilyAttendance { get; set; }
    public List<TotalActivityViewModel> TotalActivity { get; set; }
    public List<SiteSessionDbModel> SiteSessions { get; set; }
    public List<ClassSummaryDbModel> ClassSummaries { get; set; }
    public List<ProgramViewModel> ProgramOverviews { get; set; }
    public List<StaffSummaryDbModel> StaffSummaries { get; set; }
    public List<StudentSurveyViewModel> StudentSurvey { get; set; }
    public List<AttendanceCheckDbModel> AttendanceCheck { get; set; }
    public List<PayrollAuditDb> PayrollAudit { get; set; }
}

public class ReportsViewModel
{
    public List<TotalStudentAttendanceViewModel> TotalStudentAttendance { get; set; }
    public List<TotalFamilyAttendanceViewModel> TotalFamilyAttendance { get; set; }
    public List<TotalActivityViewModel> TotalActivity { get; set; }
    public List<SiteSessionViewModel> SiteSessions { get; set; }
    public List<ClassSummaryViewModel> ClassSummaries { get; set; }
    public List<ProgramViewModel> ProgramOverviews { get; set; }
    public List<StaffSummaryViewModel> StaffSummaries { get; set; }
    public List<StudentSurveyViewModel> StudentSurvey { get; set; }
    public List<AttendanceCheckViewModel> AttendanceCheck { get; set; }
    public List<PayrollAuditView> PayrollAudit { get; set; }
}
