using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.InstructorRepository
{
	public interface IInstructorRepository
	{
		public Task<List<EmployeeDto>> SearchSynergyStaffAsync(string name, string badgeNumber);

		public Task<List<InstructorSchoolYearView>> GetInstructorsAsync(string name, Guid organizationGuid, Guid yearGuid);

		public Task<InstructorSchoolYearView> GetInstructorSchoolYearAsync(Guid instructorSchoolYearGuid);
		public Task<InstructorSchoolYearView> GetInstructorSchoolYearAsync(string badgeNumber);

		public Task<Guid> CreateAsync(InstructorDto person);

		public Task CreateAsync(List<InstructorSchoolYear> instructorSchoolYears); //create an instructorOrgYear repo for this

		public Task UpdateInstructorAsync(Guid instructorSchoolYearGuid, InstructorSchoolYearView instructor);
	}
}