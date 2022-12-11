using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.ReportRepository
{
	public interface IReportRepository
	{
		public Task<List<TotalStudentAttendanceViewModel>> GetTotalStudentAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
		public Task<List<TotalActivityViewModel>> GetTotalActivityAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
		public Task<List<SiteSessionViewModel>> GetSiteSessionsAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
		public Task<List<ClassSummaryViewModel>> GetSummaryOfClassesAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
		public Task<List<ProgramViewModel>> GetProgramOverviewAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
		public Task<List<StaffSummaryViewModel>> GetStaffingSummaryAsync(short schoolYear, Quarter quarter, Guid organizationGuid = default);
		public Task<List<StudentSummaryViewModel>> GetStudentSummaryAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default);
	}
}
