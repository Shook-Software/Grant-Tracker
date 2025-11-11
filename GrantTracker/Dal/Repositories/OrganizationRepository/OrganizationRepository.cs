using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using GrantTracker.Dal.Repositories.DevRepository;
using Microsoft.EntityFrameworkCore;
using GrantTracker.Dal.Models.Views;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using GrantTracker.Dal.Schema.Sprocs;

namespace GrantTracker.Dal.Repositories.OrganizationRepository;

public class OrganizationRepository : IOrganizationRepository
{
    protected readonly GrantTrackerContext _grantContext;
    protected readonly ClaimsPrincipal _user;

    public OrganizationRepository(GrantTrackerContext grantContext, IHttpContextAccessor httpContextAccessor)
    {
        _grantContext = grantContext;
        _user = httpContextAccessor.HttpContext.User;
    }

	//Used for views, any use for dropdown options will be in DropdownRepo/Controller
	public async Task<List<OrganizationYearView>> GetOrganizationYearsAsync()
	{
		var currentYearGuid = await _grantContext.Years.Where(sy => sy.IsCurrentSchoolYear).Select(sy => sy.YearGuid).FirstOrDefaultAsync();

        var orgYears = await _grantContext
			.OrganizationYears
			.AsNoTracking()
			.Include(oy => oy.Organization)
			.Include(oy => oy.Year)
			.Where(oy => oy.YearGuid == currentYearGuid)
			.OrderBy(oy => oy.Organization.Name)
			.ToListAsync();

		return orgYears.Select(OrganizationYearView.FromDatabase).ToList();
	}

    public async Task<OrganizationView> GetYearsAsync(Guid OrganizationGuid)
	{
        if (!_user.IsAuthorizedToViewOrganization(OrganizationGuid))
            throw new Exception("User is not authorized to view this resource.");

            var organization = await _grantContext
			.Organizations
			.AsNoTracking()
			.Where(org => org.OrganizationGuid == OrganizationGuid)
			.Include(org => org.Years)
			.ThenInclude(oy => oy.Year)
			.SingleAsync();

		return OrganizationView.FromDatabase(organization);
	}

	public async Task<OrganizationYearView> GetOrganizationYearAsync(Guid organizationYearGuid)
	{
		Guid organizationGuid = (await _grantContext.OrganizationYears.FindAsync(organizationYearGuid)).OrganizationGuid;

		if (!_user.IsAuthorizedToViewOrganization(organizationGuid))
			throw new Exception("User is not authorized to view this resource.");

		var organizationYear = await _grantContext
			.OrganizationYears
			.Where(oy => oy.OrganizationYearGuid == organizationYearGuid)
			.Include(oy => oy.Organization)
			.Include(oy => oy.Year)
			.SingleAsync();

		return OrganizationYearView.FromDatabase(organizationYear);
	}

	public async Task<List<Organization>> GetOrganizationsAsync(Guid yearGuid)
	{
		return await _grantContext
			.OrganizationYears
			.Where(oy => oy.YearGuid == yearGuid)
			.Include(oy => oy.Organization)
			.Select(oy => oy.Organization)
			.ToListAsync();
    }

	//admin only
    public async Task<List<OrganizationView>> GetOrganizationsAsync()
    {
        var organizations = await _grantContext
            .Organizations
            .AsNoTracking()
            .Include(org => org.Years).ThenInclude(oy => oy.Year)
			.Include(org => org.AttendanceGoals)
			.OrderBy(o => o.Name)
            .ToListAsync();

		return organizations.Select(OrganizationView.FromDatabase).ToList();
    }

	public async Task<List<OrganizationBlackoutDate>> GetBlackoutDatesAsync(Guid? organizationGuid = null)
	{
		return await _grantContext.BlackoutDates.AsNoTracking().Where(x => organizationGuid == null || x.OrganizationGuid == organizationGuid).ToListAsync();
    }

    public async Task AddBlackoutDateAsync(Guid OrganizationGuid, DateOnly BlackoutDate)
	{
		_grantContext.BlackoutDates.Add(new OrganizationBlackoutDate()
		{
			OrganizationGuid = OrganizationGuid,
			Date = BlackoutDate
		});

		await _grantContext.SaveChangesAsync();
    }

    public async Task<List<OrganizationAttendanceGoal>> GetAttendanceGoalsAsync(DateOnly date)
    {
        return await _grantContext.AttendanceGoals
            .Where(ag => ag.StartDate <= date && date <= ag.EndDate)
            .Include(ag => ag.Organization)
            .ToListAsync();
    }

    public async Task<OrganizationAttendanceGoal> GetAttendanceGoalAsync(Guid organizationGuid, DateOnly date)
	{
        return await _grantContext.AttendanceGoals
            .Include(ag => ag.Organization)
			.FirstAsync(ag => ag.OrganizationGuid == organizationGuid && ag.StartDate <= date && date <= ag.EndDate);
	}

    private string DateOnlyToSQLString(DateOnly date) => $"{date.Year}-{date.Month}-{date.Day}";
    public async Task<List<RegularAttendeeDate>> GetRegularAttendeeThresholdDatesAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
    {
        return await _grantContext.Set<RegularAttendeeDate>()
			.FromSqlInterpolated($"GTkr.DataQuery_GetRegularAttendeesThresholdDates {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}")
			.ToListAsync();
    }

    public async Task<List<StudentDaysAttendedDTO>> GetStudentDaysAttendedAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
    {
        return await _grantContext.Set<StudentDaysAttendedDTO>()
            .FromSqlInterpolated($"GTkr.DataQuery_GetDaysAttendedByStudent {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}")
            .ToListAsync();
    }

	public async Task<Guid> CreateOrganizationAttendanceGoalAsync(OrganizationAttendanceGoal goal)
	{
		goal.Created = goal.Updated = DateTime.Now;

		var entity = _grantContext.AttendanceGoals.Add(goal);
		await _grantContext.SaveChangesAsync();

		return entity.Entity.Guid;
    }

    public async Task AlterOrganizationAttendanceGoalAsync(Guid attendanceGoalGuid, OrganizationAttendanceGoal goal)
    {
        OrganizationAttendanceGoal existingRecord = await _grantContext.AttendanceGoals.FindAsync(attendanceGoalGuid);

		existingRecord.StartDate = goal.StartDate;
		existingRecord.EndDate = goal.EndDate;
		existingRecord.RegularAttendeeCountThreshold = goal.RegularAttendeeCountThreshold;
        existingRecord.Updated = DateTime.Now;

        await _grantContext.SaveChangesAsync();
    }

	public async Task DeleteOrganizationAttendanceGoalAsync(Guid attendanceGoalGuid)
    {
        OrganizationAttendanceGoal existingRecord = await _grantContext.AttendanceGoals.FindAsync(attendanceGoalGuid);
		_grantContext.AttendanceGoals.Remove(existingRecord);

        await _grantContext.SaveChangesAsync();
    }

    public async Task DeleteBlackoutDateAsync(Guid BlackoutDateGuid)
	{
		_grantContext.BlackoutDates.Remove(new OrganizationBlackoutDate() { Guid = BlackoutDateGuid });
		await _grantContext.SaveChangesAsync();
	}

    public async Task DeleteOrganizationAsync(Guid OrganizationGuid)
	{
		var orgToDelete = await _grantContext.Organizations.FindAsync(OrganizationGuid);
		_grantContext.Remove(orgToDelete);
		await _grantContext.SaveChangesAsync();
	}
    
}
