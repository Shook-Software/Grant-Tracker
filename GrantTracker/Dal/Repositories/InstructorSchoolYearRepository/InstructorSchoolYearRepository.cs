using GrantTracker.Utilities;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.SynergySchema;
using GrantTracker.Dal.Models.Views;
using Microsoft.EntityFrameworkCore;

using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace GrantTracker.Dal.Repositories.InstructorSchoolYearRepository;

public class InstructorSchoolYearRepository : IInstructorSchoolYearRepository
{
    protected readonly GrantTrackerContext _grantContext;
    protected readonly ClaimsPrincipal _user;

    public InstructorSchoolYearRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContextAccessor, SynergyEODContext synergyContext)
    {
        _grantContext = grantContext;
        _user = httpContextAccessor.HttpContext.User;
    }

    //we need to remove the latter part of this tbh, and query it separately
    public async Task<InstructorSchoolYearViewModel?> GetAsync(Guid instructorSchoolYearGuid)
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
            .Include(isy => isy.AttendanceRecords).ThenInclude(ar => ar.TimeRecords)
            .Include(isy => isy.AttendanceRecords).ThenInclude(sa => sa.AttendanceRecord).ThenInclude(ar => ar.Session)
                .Where(isy => isy.InstructorSchoolYearGuid == instructorSchoolYearGuid)
                .FirstOrDefaultAsync();

        if (instructorSchoolYear is null)
            return null;

        //A list of other school years
        var organizationYears = await _grantContext
            .Instructors
            .Include(i => i.InstructorSchoolYears).ThenInclude(isy => isy.OrganizationYear).ThenInclude(oy => oy.Organization)
            .Include(i => i.InstructorSchoolYears).ThenInclude(isy => isy.OrganizationYear).ThenInclude(oy => oy.Year)
            .Where(i => i.PersonGuid == instructorSchoolYear.InstructorGuid)
            .Select(i => i.InstructorSchoolYears.Select(isy => isy.OrganizationYear).ToList())
            .FirstOrDefaultAsync();

        if (organizationYears is null)
            return null;

        return InstructorSchoolYearViewModel.FromDatabase(instructorSchoolYear, organizationYears);
    }

    public async Task<InstructorSchoolYearViewModel> CreateIfNotExistsAsync(Guid instructorGuid, Guid organizationYearGuid, Guid statusGuid)
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
	}

	public async Task<InstructorSchoolYearViewModel> CreateAsync(Guid instructorGuid, Guid organizationYearGuid, Guid statusGuid)
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
    }

    public async Task<InstructorSchoolYearStudentGroupMap> AttachStudentGroupAsync(Guid instructorSchoolYearGuid, Guid studentGroupGuid)
    {
        var studentGroupMap = _grantContext.InstructorStudentGroups.Add(new()
        {
            InstructorSchoolYearGuid = instructorSchoolYearGuid,
            StudentGroupGuid = studentGroupGuid
        });

        await _grantContext.SaveChangesAsync();

        return studentGroupMap.Entity;
    }

    public async Task DetachStudentGroupAsync(Guid instructorSchoolYearGuid, Guid studentGroupGuid)
    {
        var studentGroupMap = await _grantContext.InstructorStudentGroups.FindAsync(instructorSchoolYearGuid, studentGroupGuid);

        if (studentGroupMap is null)
                throw new Exception("Entity to delete does not exist.");

        _grantContext.InstructorStudentGroups.Remove(studentGroupMap);

        await _grantContext.SaveChangesAsync();
    }
}
