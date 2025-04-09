using GrantTracker.Utilities;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.SynergySchema;
using GrantTracker.Dal.Models.Views;
using Microsoft.EntityFrameworkCore;

using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using GrantTracker.Dal.Schema.Sprocs;

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

    public async Task<List<Guid>> GetSchoolYearsIdsAsync(Guid instructorGuid)
    {
        return await _grantContext.InstructorSchoolYears.Where(isy => isy.InstructorGuid == instructorGuid)
            .Select(isy => isy.InstructorSchoolYearGuid)
            .ToListAsync();
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

    public async Task ToggleDeletionAsync(Guid instructorSchoolYearGuid)
    {
        var instructorSchoolYear = await _grantContext.InstructorSchoolYears.FindAsync(instructorSchoolYearGuid);
        instructorSchoolYear.IsPendingDeletion = !instructorSchoolYear.IsPendingDeletion;

        await _grantContext.SaveChangesAsync();
    }

    public async Task DeleteInstructorSchoolYearAsync(Guid instructorSchoolYearGuid)
    {
        using var transaction = await _grantContext.Database.BeginTransactionAsync();

        try
        {
            await _grantContext.InstructorAttendanceRecords
                .Where(iar => iar.InstructorSchoolYearGuid == instructorSchoolYearGuid)
                .ExecuteDeleteAsync();

            await _grantContext.InstructorRegistrations
                .Where(ir => ir.InstructorSchoolYearGuid == instructorSchoolYearGuid)
                .ExecuteDeleteAsync();

            await _grantContext.InstructorStudentGroups
                .Where(isg => isg.InstructorSchoolYearGuid == instructorSchoolYearGuid)
                .ExecuteDeleteAsync();

            await _grantContext.InstructorSchoolYears
                .Where(isy => isy.InstructorSchoolYearGuid == instructorSchoolYearGuid)
                .ExecuteDeleteAsync();

            await transaction.CommitAsync();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
