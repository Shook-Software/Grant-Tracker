using GrantTracker.Dal.Models;
using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Models.DTO.Attendance;
using GrantTracker.Dal.Models.DTO.SessionDTO;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.SessionRepository;

public interface ISessionRepository
{
	Task<SessionView> GetAsync(Guid sessionGuid);

	Task<List<SimpleSessionView>> GetAsync(string sessionName, Guid organizationYearGuid);

	Task AddAsync(FormSessionDto sessionDetails);

	Task UpdateAsync(FormSessionDto sessionDetails);

	Task DeleteAsync(Guid sessionGuid);

	Task<bool> GetStatusAsync(Guid sessionGuid);

	Task<List<StudentRegistrationView>> GetStudentRegistrationsAsync(Guid sessionGuid, int dayOfWeek = -1);

	Task RegisterStudentAsync(Guid sessionGuid, List<Guid> scheduleGuids, Guid studentGuid);

	//Task CopyStudentRegistrationsAsync(Guid sourceSessionGuid, Guid destinationSessionGuid); 
	//Task CopyStudentRegistrationsAsync(Guid sessionGuid, List<Guid> studentSchoolYearGuids);

	Task RemoveStudentAsync(Guid studentSchoolYearGuid, List<Guid> dayScheduleGuids);
	Task RemoveAttendanceRecordAsync(Guid attendanceGuid);

	Task<List<SessionIssuesDTO>> GetIssues(Guid organizationYearGuid);
}