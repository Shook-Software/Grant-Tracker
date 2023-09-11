using GrantTracker.Dal.Models;
using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Dto.Attendance;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.SessionRepository
{
	public interface ISessionRepository
	{
		public Task<SessionView> GetAsync(Guid sessionGuid);

		public Task<List<SimpleSessionView>> GetAsync(string sessionName, Guid organizationYearGuid);

		public Task AddAsync(FormSessionDto sessionDetails);

		public Task UpdateAsync(FormSessionDto sessionDetails);

		public Task DeleteAsync(Guid sessionGuid);

		public Task<bool> GetStatusAsync(Guid sessionGuid);

		public Task<List<StudentRegistrationView>> GetStudentRegistrationsAsync(Guid sessionGuid, int dayOfWeek = -1);

		public Task RegisterStudentAsync(Guid sessionGuid, List<Guid> scheduleGuids, Guid studentGuid);
		public Task<List<AttendanceConflict>> ValidateStudentAttendanceAsync(DateOnly instanceDate, List<StudentAttendanceDto> studentAttendance);

		//public Task CopyStudentRegistrationsAsync(Guid sourceSessionGuid, Guid destinationSessionGuid); 
		//public Task CopyStudentRegistrationsAsync(Guid sessionGuid, List<Guid> studentSchoolYearGuids);

		public Task RemoveStudentAsync(Guid studentSchoolYearGuid, List<Guid> dayScheduleGuids);
		public Task RemoveAttendanceRecordAsync(Guid attendanceGuid);
	}
}