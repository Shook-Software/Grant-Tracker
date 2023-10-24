using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.InstructorSchoolYearRepository
{
	public interface IInstructorSchoolYearRepository
	{

		//matric, orgYearGuid, orgGuid, yearGuid, ssyGuid
		public Task<InstructorSchoolYearViewModel> CreateIfNotExistsAsync(Guid studentGuid, Guid organizationYearGuid, Guid statusGuid);
		public Task<InstructorSchoolYearViewModel> CreateAsync(Guid studentGuid, Guid organizationYearGuid, Guid statusGuid);

		public Task<InstructorSchoolYearViewModel?> GetInstructorSchoolYearAsync(Guid instructorSchoolYearGuid); 
		public Task<InstructorSchoolYearViewModel?> GetInstructorSchoolYearAsync(string badgeNumber, Guid organizationYearGuid);
		public Task<InstructorSchoolYearViewModel?> GetAsync(Guid instructorSchoolYearGuid);
	}
}
