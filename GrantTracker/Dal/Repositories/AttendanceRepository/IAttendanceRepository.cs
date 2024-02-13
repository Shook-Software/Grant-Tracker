using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.AttendanceRepository
{
	public interface IAttendanceRepository
	{
		public Task<List<DateOnly>> GetAttendanceDatesAsync(Guid sessionGuid);
		public Task<List<SimpleAttendanceViewModel>> GetAttendanceOverviewAsync(Guid sessionGuid);
		public Task<AttendanceViewModel> GetAttendanceRecordAsync(Guid attendanceGuid);
		Task AddAttendanceAsync(AttendanceRecord Record);
        public Task AddAttendanceAsync(Guid sessionGuid, SessionAttendanceDto sessionAttendance);
		Task DeleteAttendanceRecordAsync(Guid AttendanceGuid);
        public Task UpdateAttendanceAsync(Guid attendanceGuid, Guid sessionGuid, SessionAttendanceDto sessionAttendance);


		//public Task<List<StudentAttendance>> GetSessionAttendance(Guid sessionGuid, DateOnly date);

		//edit and delete attendance
	}
}