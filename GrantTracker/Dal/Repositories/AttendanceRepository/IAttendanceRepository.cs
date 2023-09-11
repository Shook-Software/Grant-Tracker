using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Repositories.AttendanceRepository
{
	public interface IAttendanceRepository
	{
		public Task<List<DateOnly>> GetAttendanceDatesAsync(Guid sessionGuid);
		public Task<List<SimpleAttendanceViewModel>> GetAttendanceOverviewAsync(Guid sessionGuid);
		public Task<AttendanceViewModel> GetAttendanceRecordAsync(Guid attendanceGuid);
		public Task AddAttendanceAsync(Guid sessionGuid, SessionAttendanceDto sessionAttendance);
		public Task EditAttendanceAsync(Guid attendanceGuid, SessionAttendanceDto sessionAttendance);


		//public Task<List<StudentAttendance>> GetSessionAttendance(Guid sessionGuid, DateOnly date);

		//edit and delete attendance
	}
}