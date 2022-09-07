using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Repositories.StaffRepository
{
	public interface IInstructorRepository
	{
		public Task<List<EmployeeDto>> SearchSynergyStaffAsync(string name, string badgeNumber);

		public Task<List<InstructorSchoolYearView>> GetInstructorsAsync(string name, Guid organizationGuid, Guid yearGuid);

		public Task<InstructorSchoolYearView> GetInstructorSchoolYearAsync(Guid instructorSchoolYearGuid);

		public Task AddInstructorAsync(InstructorDto person);

		public Task UpdateInstructorAsync(Guid instructorSchoolYearGuid, InstructorSchoolYearView instructor);
	}
}