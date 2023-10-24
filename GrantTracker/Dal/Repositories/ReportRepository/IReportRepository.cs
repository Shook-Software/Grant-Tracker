using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Schema.Sprocs.Reporting;

namespace GrantTracker.Dal.Repositories.ReportRepository;

public interface IReportRepository
{
	Task<ReportsViewModel> RunAllReportQueriesAsync(DateOnly startDate, DateOnly endDate, Guid organizationYearGuid, Guid? organizationGuid = null);

	Task<List<SiteSessionViewModel>> GetSiteSessionsAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null);

	/*Task<List<TotalStudentAttendanceViewModel>> GetTotalStudentAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
	Task<List<TotalFamilyAttendanceViewModel>> GetFamilyMemberAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
	Task<List<TotalActivityViewModel>> GetTotalActivityAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
	Task<List<SiteSessionViewModel>> GetSiteSessionsAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
	Task<List<ClassSummaryViewModel>> GetSummaryOfClassesAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
	Task<List<ProgramViewModel>> GetProgramOverviewAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
	Task<List<StaffSummaryViewModel>> GetStaffingSummaryAsync(short schoolYear, Quarter quarter, Guid organizationGuid = default);
	Task<List<StudentSummaryViewModel>> GetStudentSummaryAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
	*/
}