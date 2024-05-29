using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;
using System.Threading.Tasks;

namespace GrantTracker.Dal.Repositories.StudentSchoolYearRepository;

public interface IStudentSchoolYearRepository
{
	Task<StudentSchoolYearViewModel> CreateIfNotExistsAsync(Guid studentGuid, Guid organizationYearGuid);

	Task<StudentSchoolYearViewModel> CreateAsync(Guid studentGuid, Guid organizationYearGuid);

	Task<StudentSchoolYearViewModel> GetAsync(Guid studentSchoolYearGuid);

    Task<StudentGroupItem> AddStudentGroupItem(Guid groupGuid, Guid studentSchoolYearGuid);
    Task DeleteStudentGroupItem(Guid groupGuid, Guid studentSchoolYearGuid);
}
