using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Dto.Attendance;
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



    Task<List<AttendanceConflict>> ValidateStudentAttendanceAsync(DateOnly instanceDate, List<StudentAttendanceDto> studentAttendance, Guid? ignoredAttendanceGuid = default);
}