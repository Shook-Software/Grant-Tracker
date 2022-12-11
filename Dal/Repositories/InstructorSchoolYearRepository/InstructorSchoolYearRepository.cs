using GrantTracker.Utilities;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.SynergySchema;
using GrantTracker.Dal.Models.Views;
using Microsoft.EntityFrameworkCore;

using System.Diagnostics;

namespace GrantTracker.Dal.Repositories.InstructorSchoolYearRepository
{
	public class InstructorSchoolYearRepository : RepositoryBase, IInstructorSchoolYearRepository
	{
		public InstructorSchoolYearRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext, SynergyEODContext synergyContext)
			: base(devRepository, httpContext, grantContext)
		{

		}

		public async Task<InstructorSchoolYearViewModel> CreateIfNotExistsAsync(Guid instructorGuid, Guid organizationYearGuid, Guid statusGuid)
		{
			return await UseDeveloperLog(async () =>
			{
				var instructorSchoolYear = await _grantContext
					.InstructorSchoolYears
					.Include(isy => isy.Instructor)
					.AsNoTracking()
					.Where(isy => isy.Instructor.PersonGuid == instructorGuid && isy.OrganizationYearGuid == organizationYearGuid)
					.FirstOrDefaultAsync();

				if (instructorSchoolYear == null)
				{
					return await this.CreateAsync(instructorGuid, organizationYearGuid, statusGuid);
				}

				return InstructorSchoolYearViewModel.FromDatabase(instructorSchoolYear);
			});
		}

		public async Task<InstructorSchoolYearViewModel> CreateAsync(Guid instructorGuid, Guid organizationYearGuid, Guid statusGuid)
		{
			return await UseDeveloperLog(async () =>
			{
				Guid instructorSchoolYearGuid = Guid.NewGuid();

				InstructorSchoolYear dbISY = new()
				{
					InstructorSchoolYearGuid = instructorSchoolYearGuid,
					InstructorGuid = instructorGuid,
					OrganizationYearGuid = organizationYearGuid
				};

				await _grantContext.InstructorSchoolYears.AddAsync(dbISY);
				await _grantContext.SaveChangesAsync();

				return await this.GetAsync(instructorSchoolYearGuid);
			});
		}

		//we need to remove the latter part of this tbh, and query it separately
		public async Task<InstructorSchoolYearViewModel> GetInstructorSchoolYearAsync(Guid instructorSchoolYearGuid)
		{
			//we could probably put these in two different functions and connect them from there
			//all info for the given schoolYear
			var instructorSchoolYear = await _grantContext
				.InstructorSchoolYears
				.AsNoTracking()
				.Include(isy => isy.OrganizationYear).ThenInclude(oy => oy.Organization)
				.Include(isy => isy.OrganizationYear).ThenInclude(oy => oy.Year)
				.Include(isy => isy.Instructor)
				.Include(isy => isy.Status)
				.Include(isy => isy.Identity)
				.Include(isy => isy.SessionRegistrations).ThenInclude(sr => sr.Session).ThenInclude(s => s.DaySchedules).ThenInclude(day => day.TimeSchedules)
				.Include(isy => isy.AttendanceRecords)
				.Where(isy => isy.InstructorSchoolYearGuid == instructorSchoolYearGuid)
				.SingleAsync();

			//A list of other school years
			var organizationYears = await _grantContext
				.Instructors
				.Include(i => i.InstructorSchoolYears).ThenInclude(isy => isy.OrganizationYear).ThenInclude(oy => oy.Organization)
				.Include(i => i.InstructorSchoolYears).ThenInclude(isy => isy.OrganizationYear).ThenInclude(oy => oy.Year)
				.Where(i => i.PersonGuid == instructorSchoolYear.InstructorGuid)
				.Select(i => i.InstructorSchoolYears.Select(isy => isy.OrganizationYear).ToList())
				.SingleAsync();

			return InstructorSchoolYearViewModel.FromDatabase(instructorSchoolYear, organizationYears);
		}

		public async Task<InstructorSchoolYearViewModel> GetInstructorSchoolYearAsync(string badgeNumber, Guid organizationYearGuid)
		{
			var instructorSchoolYear = await _grantContext
				.InstructorSchoolYears
				.AsNoTracking()
				.Include(isy => isy.OrganizationYear).ThenInclude(oy => oy.Organization)
				.Include(isy => isy.OrganizationYear).ThenInclude(oy => oy.Year)
				.Include(isy => isy.Instructor)
				.Include(isy => isy.Status)
				.Include(isy => isy.Identity)
				.Include(isy => isy.SessionRegistrations).ThenInclude(sr => sr.Session).ThenInclude(s => s.DaySchedules).ThenInclude(day => day.TimeSchedules)
				.Include(isy => isy.AttendanceRecords)
				.Where(isy => isy.Instructor.BadgeNumber == badgeNumber && isy.OrganizationYearGuid == organizationYearGuid)
				.SingleAsync();

			//A list of other school years
			var organizationYears = await _grantContext
				.Instructors
				.Include(i => i.InstructorSchoolYears).ThenInclude(isy => isy.OrganizationYear).ThenInclude(oy => oy.Organization)
				.Include(i => i.InstructorSchoolYears).ThenInclude(isy => isy.OrganizationYear).ThenInclude(oy => oy.Year)
				.Where(i => i.PersonGuid == instructorSchoolYear.InstructorGuid)
				.Select(i => i.InstructorSchoolYears.Select(isy => isy.OrganizationYear).ToList())
				.SingleAsync();

			return InstructorSchoolYearViewModel.FromDatabase(instructorSchoolYear, organizationYears);
		}

		public async Task<InstructorSchoolYearViewModel> GetAsync(Guid instructorSchoolYearGuid)
		{
			var instructorSchoolYear = await _grantContext
				.InstructorSchoolYears
				.Include(isy => isy.Instructor)
				.Include(isy => isy.Status)
				.FirstAsync(isy => isy.InstructorSchoolYearGuid == instructorSchoolYearGuid);

			return InstructorSchoolYearViewModel.FromDatabase(instructorSchoolYear);
		}
	}
}
