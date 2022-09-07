using GrantTracker.Dal.Models;
using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.SessionRepository
{
	public interface ISessionRepository
	{
		public Task<SessionView> GetAsync(Guid sessionGuid);

		public Task<List<SimpleSessionView>> GetAsync(string sessionName, List<Guid> grades, Guid organizationGuid, Guid yearGuid);

		public Task AddAsync(FormSessionDto sessionDetails);

		public Task UpdateAsync(FormSessionDto sessionDetails);

		public Task DeleteAsync(Guid sessionGuid);

		public Task<bool> GetStatusAsync(Guid sessionGuid);

		//public Task<List<Session>> GetAllByInstructorAsync(Guid instructorGuid);

		public Task<List<StudentRegistrationView>> GetStudentRegistrationsAsync(Guid sessionGuid, int dayOfWeek = -1);

		public Task<Registration> RegisterStudentAsync(Guid sessionGuid, List<Guid> scheduleGuids, Guid studentGuid);

		public Task RemoveStudentAsync(Guid studentSchoolYearGuid, List<Guid> dayScheduleGuids);
	}
}