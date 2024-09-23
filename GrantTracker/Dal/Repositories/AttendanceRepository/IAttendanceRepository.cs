using ClosedXML.Excel;
using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Models.DTO.Attendance;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.AttendanceRepository;

public interface IAttendanceRepository
{
	Task<List<DateOnly>> GetDatesAsync(Guid sessionGuid);
	Task<List<SimpleAttendanceViewModel>> GetOverviewAsync(Guid sessionGuid);
	Task<AttendanceViewModel> GetAsync(Guid attendanceGuid);
	Task AddAsync(AttendanceRecord Record);
    Task AddAsync(Guid sessionGuid, SessionAttendanceDto sessionAttendance);
	Task DeleteAsync(Guid AttendanceGuid);
    Task UpdateAsync(Guid attendanceGuid, Guid sessionGuid, SessionAttendanceDto sessionAttendance);
	Task<List<AttendanceIssueDTO>> GetIssuesAsync(Guid organizationGuid);

    Task<List<AttendanceInputConflict>> ValidateStudentAttendanceAsync(DateOnly instanceDate, List<StudentAttendanceDto> studentAttendance, Guid? ignoredAttendanceGuid = default);

	Task<XLWorkbook> CreateExcelExportAsync(Guid sessionGuid, DateOnly startDate, DateOnly endDate);
}