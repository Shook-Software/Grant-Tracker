using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Repositories.StudentRepository
{
	public interface IStudentRepository
	{
		public Task AddAsync(StudentDto newStudent);

		public Task<List<StudentSchoolYearView>> GetAsync(string name, Guid organizationGuid, Guid yearGuid);

		public Task<StudentSchoolYearWithRecordsView> GetAsync(Guid studentYearGuid, Guid organizationYearGuid = new Guid());

		public Task<StudentSchoolYearWithRecordsView> GetSingleAsync(string matricNumber);

		public Task<List<StudentView>> SearchSynergyAsync(StudentFilter filter);

		public Task SyncStudentsWithSynergyAsync();

		//public Task<List<Student>> Get(List<Guid> students);

		//No deletion, we want to retain info
		//We need to have something to discriminate students in a given time period.
	}
}