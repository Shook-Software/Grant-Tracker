using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Repositories.InstructorSchoolYearRepository;

public interface IInstructorSchoolYearRepository
{
	Task<InstructorSchoolYearViewModel> CreateIfNotExistsAsync(Guid studentGuid, Guid organizationYearGuid, Guid statusGuid);
	Task<InstructorSchoolYearViewModel> CreateAsync(Guid studentGuid, Guid organizationYearGuid, Guid statusGuid);

	Task<InstructorSchoolYearViewModel?> GetAsync(Guid instructorSchoolYearGuid);

	Task<InstructorSchoolYearStudentGroupMap> AttachStudentGroupAsync(Guid instructorSchoolYearGuid, Guid studentGroupGuid);
	Task DetachStudentGroupAsync(Guid instructorSchoolYearGuid, Guid studentGroupGuid);
}
