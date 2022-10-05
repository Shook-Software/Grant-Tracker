using GrantTracker.Utilities;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.SynergySchema;
using GrantTracker.Dal.Models.Views;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Repositories.StudentSchoolYearRepository
{
	public class StudentSchoolYearRepository : RepositoryBase, IStudentSchoolYearRepository
	{
		public StudentSchoolYearRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext, SynergyEODContext synergyContext)
			: base(devRepository, httpContext, grantContext)
		{

		}

		public async Task<StudentSchoolYearViewModel> CreateIfNotExistsAsync(Guid studentGuid, Guid organizationYearGuid, string grade)
		{
			return await UseDeveloperLog(async () =>
			{
				var studentSchoolYear = await _grantContext
					.StudentSchoolYears
					.Include(ssy => ssy.Student)
					.AsNoTracking()
					.Where(ssy => ssy.Student.PersonGuid == studentGuid && ssy.OrganizationYearGuid == organizationYearGuid)
					.FirstOrDefaultAsync();

				if (studentSchoolYear == null)
				{
					return await this.CreateAsync(studentGuid, organizationYearGuid, grade);
				}

				return StudentSchoolYearViewModel.FromDatabase(studentSchoolYear);
			});
		}

		public async Task<StudentSchoolYearViewModel> CreateAsync(Guid studentGuid, Guid organizationYearGuid, string grade)
		{
			return await UseDeveloperLog(async () =>
			{
				Guid studentSchoolYearGuid = Guid.NewGuid();

				StudentSchoolYear dbSSY = new()
				{
					StudentSchoolYearGuid = studentSchoolYearGuid,
					StudentGuid = studentGuid,
					OrganizationYearGuid = organizationYearGuid,
					Grade = grade,
				};

				await _grantContext.StudentSchoolYears.AddAsync(dbSSY);
				await _grantContext.SaveChangesAsync();

				return await this.GetAsync(studentSchoolYearGuid);
			});
		}

		public async Task<StudentSchoolYearViewModel> GetAsync(Guid studentSchoolYearGuid)
		{
			var studentSchoolYear = await _grantContext
				.StudentSchoolYears
				.FindAsync(studentSchoolYearGuid);

			return StudentSchoolYearViewModel.FromDatabase(studentSchoolYear);
		}
	}
}
