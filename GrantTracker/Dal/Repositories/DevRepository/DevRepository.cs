using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.SynergySchema;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Repositories.DevRepository
{
	public class DevRepository : IDevRepository
	{
		private readonly GrantTrackerContext _grantContext;
		private readonly SynergyEODContext _synergyContext;

        public DevRepository(GrantTrackerContext grantContext, SynergyEODContext synergyContext)
		{
			_grantContext = grantContext;
			_synergyContext = synergyContext;
		}

		public async Task<int> SynchronizeStudentGradesWithSynergyAsync(Guid YearGuid)
		{
			var gtYear = await _grantContext.Years.FindAsync(YearGuid);
			//if it's a past summer, we use the 21stCC school year, which starts in summer
			//synergy school year starts in fall
            int synergyYear = gtYear.Quarter == Quarter.Summer && gtYear.IsCurrentSchoolYear ? gtYear.SchoolYear - 1 : gtYear.SchoolYear;
			var synergyExtension = gtYear.Quarter == Quarter.Summer && gtYear.IsCurrentSchoolYear ? "S" : "R";

            List<string> matricNumbers = await _grantContext
				.OrganizationYears
				.Include(x => x.StudentSchoolYears).ThenInclude(x => x.Student)
				.Where(x => x.YearGuid == YearGuid)
				.SelectMany(x => x.StudentSchoolYears)
				.Select(x => x.Student.MatricNumber)
				.ToListAsync();

			//it's summer and not fall
			//sync summer
			//fetch from 2022 S

			//it's fall
			//sync summer
			//fetch from 2023 R
			//if it doesn't exist, it isn't updated

			List<Tuple<string, string>> matricGrades = await _synergyContext.RevSSY
				.Include(x => x.Student)
				.Where(x => x.Year.SchoolYear == synergyYear)
				.Where(x => x.Year.Extension == synergyExtension)
				.Where(x => matricNumbers.Contains(x.Student.SisNumber))
				.Select(x => new Tuple<string, string>(x.Student.SisNumber, x.Grade))
				.ToListAsync();

			var studentSchoolYears = await _grantContext.StudentSchoolYears
				.Include(x => x.Student)
				.Where(x => x.OrganizationYear.YearGuid == YearGuid)
				.ToListAsync();

			studentSchoolYears.ForEach(ssy =>
			{
				var matricGradesForSSY = matricGrades.Where(x => x.Item1 == ssy.Student.MatricNumber);
				if (matricGradesForSSY.Any())
				{
					var updatedGrade = GradeDto.FromSynergy(matricGradesForSSY.MaxBy(x => x.Item2).Item2);
					ssy.Grade = updatedGrade;
                }
			});

			_grantContext.StudentSchoolYears.UpdateRange(studentSchoolYears);
			return await _grantContext.SaveChangesAsync();
		}

		public async Task AddExceptionLogAsync(Exception exception, UserIdentity requestor)
		{
			if (exception is null)
				return;

			ExceptionLog newLog = new()
			{
				Guid = Guid.NewGuid(),
				InstructorSchoolYearGuid = requestor.UserOrganizationYearGuid,
				Source = exception.Source,
				Message = exception.Message,
				InnerMessage = exception.InnerException?.Message ?? "",
				StackTrace = exception.StackTrace,
				TargetSite = exception.TargetSite.Name,
				DateTime = DateTime.Now
			};

			await _grantContext.AddAsync(newLog);
			await _grantContext.SaveChangesAsync();
		}

		public async Task<List<ExceptionLogView>> GetExceptionLogsAsync()
		{
			var domainLogs = await _grantContext.ExceptionLogs
				.Include(log => log.InstructorSchoolYear).ThenInclude(rsy => rsy.Identity)
				.Include(log => log.InstructorSchoolYear).ThenInclude(rsy => rsy.Instructor)
				.Include(log => log.InstructorSchoolYear).ThenInclude(rsy => rsy.OrganizationYear).ThenInclude(oy => oy.Organization)
				.OrderBy(log => log.DateTime)
				.ToListAsync();

			return domainLogs
				.Select(ExceptionLogView.FromDatabase)
				.ToList();
		}

		public async Task CreateUsersAsync(List<Identity> identities)
		{
			identities = identities.Distinct().ToList();
			await _grantContext.AddRangeAsync(identities);
			await _grantContext.SaveChangesAsync();
		}
	}
}