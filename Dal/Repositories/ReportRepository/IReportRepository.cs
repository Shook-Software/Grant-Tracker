using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.ReportRepository
{
	public interface IReportRepository
	{
		Task<List<TotalStudentAttendanceViewModel>> GetTotalStudentAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
		Task<List<TotalFamilyAttendanceViewModel>> GetFamilyMemberAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
		Task<List<TotalActivityViewModel>> GetTotalActivityAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
		Task<List<SiteSessionViewModel>> GetSiteSessionsAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
		Task<List<ClassSummaryViewModel>> GetSummaryOfClassesAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
		Task<List<ProgramViewModel>> GetProgramOverviewAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
		Task<List<StaffSummaryViewModel>> GetStaffingSummaryAsync(short schoolYear, Quarter quarter, Guid organizationGuid = default);
		Task<List<StudentSummaryViewModel>> GetStudentSummaryAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
	}
}
