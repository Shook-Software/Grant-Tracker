using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Repositories.StudentRepository
{
	public interface IStudentRepository
	{
		public Task<StudentViewModel> CreateIfNotExistsAsync(StudentDto student);
		public Task<StudentViewModel> CreateAsync(StudentDto newStudent);

		public Task<List<StudentSchoolYearViewModel>> GetAsync(string name, Guid organizationGuid, Guid yearGuid);

		public Task<StudentSchoolYearWithRecordsViewModel> GetAsync(Guid studentYearGuid, Guid organizationYearGuid = new Guid());

		public Task<StudentSchoolYearWithRecordsViewModel> GetSingleAsync(string matricNumber);

		public Task<List<StudentSchoolYearViewModel>> SearchSynergyAsync(StudentFilter filter);


		//public Task<List<Student>> Get(List<Guid> students);

		//No deletion, we want to retain info
		//We need to have something to discriminate students in a given time period.
	}
}