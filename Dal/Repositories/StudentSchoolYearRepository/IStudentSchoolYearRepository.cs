using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Repositories.StudentSchoolYearRepository
{
	public interface IStudentSchoolYearRepository
	{

		//matric, orgYearGuid, orgGuid, yearGuid, ssyGuid
		public Task<StudentSchoolYearViewModel> CreateIfNotExistsAsync(Guid studentGuid, Guid organizationYearGuid, string Grade);

		public Task<StudentSchoolYearViewModel> CreateAsync(Guid studentGuid, Guid organizationYearGuid, string grade);

		public Task<StudentSchoolYearViewModel> GetAsync(Guid studentSchoolYearGuid);
	}
}
