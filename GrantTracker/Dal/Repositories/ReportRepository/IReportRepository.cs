using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Schema.Sprocs.Reporting;

namespace GrantTracker.Dal.Repositories.ReportRepository;

public interface IReportRepository
{

	Task<List<CCLC10ViewModel>> GetCCLC10Async(DateOnly startDate, DateOnly endDate);

	Task<List<SiteSessionViewModel>> GetSiteSessionsAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null);

	Task<List<PayrollAuditView>> GetPayrollAuditAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null);

	Task<List<AttendanceCheckViewModel>> GetAttendanceCheckAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null);

    Task<List<ProgramViewModel>> GetProgramOverviewAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null);

	Task<List<StaffSummaryViewModel>> GetStaffSummaryAsync(Guid yearGuid, Guid? organizationGuid = null);

	Task<List<StaffMember>> GetStaffMembersAsync();

    Task<List<TotalStudentAttendanceViewModel>> GetStudentAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null);

	Task<List<ClassSummaryViewModel>> GetSummaryOfClassesAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null);

    Task<List<TotalActivityViewModel>> GetTotalActivityAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null);

	Task<List<TotalFamilyAttendanceViewModel>> GetFamilyAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null);

	Task<List<StudentSurveyViewModel>> GetStudentSurveyAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null);

	Task<List<ScheduleReport>> GetScheduleReportAsync(Guid yearGuid, Guid? organizationGuid = null);
}