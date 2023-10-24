using GrantTracker.Utilities;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.SynergySchema;
using GrantTracker.Dal.Models.Views;
using Microsoft.EntityFrameworkCore;
using GrantTracker.Dal.Models.Dto;
using System.Runtime.Intrinsics.X86;

namespace GrantTracker.Dal.Repositories.StudentSchoolYearRepository
{
	public class StudentSchoolYearRepository : RepositoryBase, IStudentSchoolYearRepository
	{
		private readonly SynergyEODContext _synergyContext;

		public StudentSchoolYearRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext, SynergyEODContext synergyContext)
			: base(devRepository, httpContext, grantContext)
		{
			_synergyContext = synergyContext;
		}

		public async Task<string> GetCurrentStudentSchoolYearGrade(Guid StudentGuid, Guid OrganizationYearGuid)
		{
			var student = await _grantContext.Students.FindAsync(StudentGuid);
			var gtYear = (await _grantContext.OrganizationYears.Include(x => x.Year).FirstOrDefaultAsync(x => x.OrganizationYearGuid == OrganizationYearGuid)).Year;

			if (student is not null)
            {
                int synergyYear = gtYear.Quarter == Quarter.Summer && gtYear.IsCurrentSchoolYear ? gtYear.SchoolYear - 1 : gtYear.SchoolYear;
                var synergyExtension = gtYear.Quarter == Quarter.Summer && gtYear.IsCurrentSchoolYear ? "S" : "R";

                return GradeDto.FromSynergy(await _synergyContext.RevSSY
					.Where(x => x.Year.SchoolYear == synergyYear)
					.Where(x => x.Year.Extension == synergyExtension)
					.Where(x => x.Student.SisNumber == student.MatricNumber)
					.MaxAsync(x => x.Grade));
			}

			return string.Empty;
		}

		public async Task<StudentSchoolYearViewModel> CreateIfNotExistsAsync(Guid studentGuid, Guid organizationYearGuid)
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
					return await this.CreateAsync(studentGuid, organizationYearGuid);
				}

				return StudentSchoolYearViewModel.FromDatabase(studentSchoolYear);
			});
		}

		public async Task<StudentSchoolYearViewModel> CreateAsync(Guid studentGuid, Guid organizationYearGuid)
		{
			return await UseDeveloperLog(async () =>
			{
				StudentSchoolYear dbSSY = new()
				{
					StudentGuid = studentGuid,
					OrganizationYearGuid = organizationYearGuid,
					Grade = await GetCurrentStudentSchoolYearGrade(studentGuid, organizationYearGuid),
				};

				_grantContext.StudentSchoolYears.Add(dbSSY);
				await _grantContext.SaveChangesAsync();

				return await this.GetAsync(dbSSY.StudentSchoolYearGuid);
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
