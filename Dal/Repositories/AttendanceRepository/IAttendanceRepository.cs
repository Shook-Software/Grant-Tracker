using GrantTracker.Dal.Models.Dto;

namespace GrantTracker.Dal.Repositories.AttendanceRepository
{
	public interface IAttendanceRepository
	{
		public Task<List<DateOnly>> GetAttendanceDatesAsync(Guid sessionGuid);
		public Task AddAttendanceAsync(Guid sessionGuid, SessionAttendanceDto sessionAttendance);


		//public Task<List<StudentAttendance>> GetSessionAttendance(Guid sessionGuid, DateOnly date);

		//edit and delete attendance
	}
}