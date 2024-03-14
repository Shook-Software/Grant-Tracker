using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Dto.Attendance;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.AttendanceRepository;

public interface IAttendanceRepository
{
	Task<List<DateOnly>> GetAttendanceDatesAsync(Guid sessionGuid);
	Task<List<SimpleAttendanceViewModel>> GetAttendanceOverviewAsync(Guid sessionGuid);
	Task<AttendanceViewModel> GetAttendanceRecordAsync(Guid attendanceGuid);
	Task AddAttendanceAsync(AttendanceRecord Record);
    Task AddAttendanceAsync(Guid sessionGuid, SessionAttendanceDto sessionAttendance);
	Task DeleteAttendanceRecordAsync(Guid AttendanceGuid);
    Task UpdateAttendanceAsync(Guid attendanceGuid, Guid sessionGuid, SessionAttendanceDto sessionAttendance);
	Task<List<AttendanceIssueDTO>> GetConflictsAsync(Guid organizationGuid);

        //public Task<List<StudentAttendance>> GetSessionAttendance(Guid sessionGuid, DateOnly date);

        //edit and delete attendance
    }