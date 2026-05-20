using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using GrantTracker.Dal.Repositories.DevRepository;
using System;
using GrantTracker.Dal.Repositories.OrganizationRepository;
using GrantTracker.Dal.Schema.Sprocs.Reporting;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Xml.Serialization;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema.Sprocs;

namespace GrantTracker.Dal.Repositories.ReportRepository;

public class ReportRepository : IReportRepository
{
	private readonly GrantTrackerContext _grantContext;
	private readonly IOrganizationRepository _organizationRepository;
    protected readonly ClaimsPrincipal _user;

    public ReportRepository(GrantTrackerContext grantContext, IHttpContextAccessor httpContextAccessor, IOrganizationRepository organizationRepository)
	{
        _grantContext = grantContext;
		_organizationRepository = organizationRepository;
        _user = httpContextAccessor.HttpContext.User;

        // Set extended timeout for report queries (3 minutes)
        //_grantContext.Database.SetCommandTimeout(TimeSpan.FromMinutes(3));
    }

	private string DateOnlyToSQLString(DateOnly date) => $"{date.Year}-{date.Month}-{date.Day}";

	// Helper to convert org guids array to comma-delimited string for sprocs
	private string? GetOrgGuidsParam(Guid[]? organizationGuids) =>
		organizationGuids != null && organizationGuids.Length > 0
			? string.Join(",", organizationGuids)
			: null;

	public async Task<List<PayrollAuditView>> GetPayrollAuditAsync(DateOnly startDate, DateOnly endDate, Guid[]? organizationGuids = null)
	{
		var orgGuidsParam = GetOrgGuidsParam(organizationGuids);
		List<PayrollAuditDb> payrollAudit = await _grantContext
			.Set<PayrollAuditDb>()
			.FromSqlInterpolated($"exec GTkr.ReportQuery_PayrollAudit {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {orgGuidsParam}")
			.ToListAsync(); 
		
		var payrollSessionGuids = payrollAudit.Select(x => x.SessionGuid).ToList();

        return payrollAudit.GroupBy(x => new { x.School, x.ClassName, x.AttendanceGuid, x.InstanceDate },
				(id, grp) => new PayrollAuditView
				{
					SessionGuid = grp.First().SessionGuid,
					AttendanceGuid = id.AttendanceGuid,
					School = id.School,
					ClassName = id.ClassName,
					Activity = grp.First().Activity,
					InstanceDate = id.InstanceDate,
					TotalAttendees = grp.First().TotalAttendees,
					AttendingInstructorRecords = grp.GroupBy(x => x.InstructorSchoolYearGuid,
						(isyGuid, iGrp) => new PayrollAuditInstructorRecord
						{
							FirstName = iGrp.First().FirstName,
							LastName = iGrp.First().LastName,
							TimeRecords = iGrp.Select(x => new PayrollAuditTimeRecord
							{
								StartTime = x.EntryTime,
								EndTime = x.ExitTime
							})
							.ToList()
						})
					.ToList()
				})
			.OrderBy(x => x.School).ThenByDescending(x => x.InstanceDate).ThenBy(x => x.ClassName)
			.ToList();
    }

    public async Task<List<AttendanceCheckViewModel>> GetAttendanceCheckAsync(DateOnly startDate, DateOnly endDate, Guid[]? organizationGuids = null)
    {
		var orgGuidsParam = GetOrgGuidsParam(organizationGuids);
        List<AttendanceCheckDbModel> attendCheck = await _grantContext
            .Set<AttendanceCheckDbModel>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_AttendanceCheck {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {orgGuidsParam}")
            .ToListAsync();

		return await GroupAndFillAttendanceCheckAsync(startDate, endDate, organizationGuids, attendCheck);
    }

    private async Task<List<AttendanceCheckViewModel>> GroupAndFillAttendanceCheckAsync(DateOnly StartDate, DateOnly EndDate, Guid[]? OrganizationGuids, List<AttendanceCheckDbModel> AttendanceChecks)
    {
        var sessionsQuery = _grantContext.Sessions
			.AsNoTracking()
			.Where(s => s.OrganizationYear.Organization.Name.ToLower() != "administration")
            .Where(x => x.FirstSession <= EndDate)
            .Where(x => x.LastSession >= StartDate);

        // Hoist the org filter out of the predicate; combining a captured-array .Contains
        // with DateOnly converter parameters in a single lambda crashes EF Core 7's
        // expression compiler ("Cannot create boxed ByRef-like values"). Materializing
        // to a List also avoids the Span-based IL path used for array.Contains.
        if (OrganizationGuids != null && OrganizationGuids.Length > 0)
        {
            var orgGuidsList = OrganizationGuids.ToList();
            sessionsQuery = sessionsQuery.Where(x => orgGuidsList.Contains(x.OrganizationYear.OrganizationGuid));
        }

        var sessions = await sessionsQuery
            .Include(x => x.OrganizationYear).ThenInclude(x => x.Organization)
            .Include(x => x.DaySchedules).ThenInclude(ds => ds.TimeSchedules)
            .Include(x => x.InstructorRegistrations).ThenInclude(ir => ir.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
			.Include(s => s.BlackoutDates)
            .ToListAsync();

        var attendanceDatesBySession = AttendanceChecks
            .GroupBy(ac => ac.SessionGuid)
            .ToDictionary(g => g.Key, g => g.Select(ac => ac.InstanceDate).ToHashSet());

        var attendanceChecksBySession = sessions.Select(s =>
        {
            List<AttendanceCheckViewModel> attendances = new();

            var attendanceDates = attendanceDatesBySession.TryGetValue(s.SessionGuid, out var dates)
                ? dates
                : new HashSet<DateOnly>();

            var sessionBlackoutDates = s.BlackoutDates.Select(b => b.Date).ToHashSet();

            foreach (var daySchedule in s.DaySchedules)
            {
                var dayOfWeek = daySchedule.DayOfWeek;

                int daysUntilNextDoW = ((int)dayOfWeek - (int)s.FirstSession.DayOfWeek + 7) % 7;
                var currentDate = s.FirstSession.AddDays(daysUntilNextDoW);

                var today = DateOnly.FromDateTime(DateTime.Today);
                var endDateBound = today > EndDate ? EndDate : today;

                var lastSession = endDateBound > s.LastSession ? s.LastSession : endDateBound;
                while (currentDate <= lastSession)
                {
                    if (currentDate < StartDate || sessionBlackoutDates.Contains(currentDate))
                    {
                        currentDate = currentDate.AddDays(7);
                        continue;
                    }

                    attendances.Add(new()
                    {
                        SessionGuid = s.SessionGuid,
                        InstanceDate = currentDate,
                        OrganizationGuid = s.OrganizationYear.OrganizationGuid,
                        School = s.OrganizationYear.Organization.Name,
                        ClassName = s.Name,
                        Instructors = s.InstructorRegistrations
                            .Select(ir => new AttendanceCheckInstructor
                            {
                                InstructorSchoolYearGuid = ir.InstructorSchoolYearGuid,
                                FirstName = ir.InstructorSchoolYear.Instructor.FirstName,
                                LastName = ir.InstructorSchoolYear.Instructor.LastName
                            })
                            .ToList(),
                        TimeBounds = daySchedule.TimeSchedules
                            .Select(x => new AttendanceCheckTimeRecord
                            {
                                StartTime = x.StartTime,
                                EndTime = x.EndTime
                            })
                            .ToList(),
                        AttendanceEntry = attendanceDates.Contains(currentDate)
                    });
                    currentDate = currentDate.AddDays(7);
                }
            }

            return attendances;
        })
        .ToList();

		List<Guid> sessionGuids = attendanceChecksBySession.SelectMany(x => x, (_, y) => y.SessionGuid).Distinct().ToList();

		// Get blackout dates for all orgs when multiple are selected (or none), single org when one is selected
		var singleOrgGuid = OrganizationGuids != null && OrganizationGuids.Length == 1 ? OrganizationGuids[0] : (Guid?)null;
        List<OrganizationBlackoutDate> orgBlackoutDates = await _organizationRepository.GetBlackoutDatesAsync(singleOrgGuid);
		List<SessionBlackoutDate> sesBlackoutDates = await _grantContext.SessionBlackoutDates
			.Where(sbd => sessionGuids.Contains(sbd.SessionGuid))
			.ToListAsync();

        var orgBlackoutSet = orgBlackoutDates.Select(bd => (bd.OrganizationGuid, bd.Date)).ToHashSet();
        var sesBlackoutSet = sesBlackoutDates.Select(sbd => (sbd.SessionGuid, sbd.Date)).ToHashSet();

        return attendanceChecksBySession
            .SelectMany(x => x)
            .Where(x => !orgBlackoutSet.Contains((x.OrganizationGuid, x.InstanceDate)))
            .Where(x => !sesBlackoutSet.Contains((x.SessionGuid, x.InstanceDate)))
            .Select(x => new { Check = x, EarliestStart = x.TimeBounds.Min(t => t.StartTime) })
            .OrderByDescending(x => x.Check.InstanceDate)
            .ThenBy(x => x.EarliestStart)
            .Select(x => x.Check)
            .ToList();
    }

    public async Task<List<TotalFamilyAttendanceViewModel>> GetFamilyAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid[]? organizationGuids = null)
    {
		var orgGuidsParam = GetOrgGuidsParam(organizationGuids);
        List<TotalFamilyAttendanceDbModel> familyAttendance = await _grantContext
            .Set<TotalFamilyAttendanceDbModel>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_FamilyAttendance {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {orgGuidsParam}")
            .ToListAsync();

		return familyAttendance
			.GroupBy(fa => new { fa.OrganizationName, fa.FirstName, fa.LastName, fa.Grade, fa.MatricNumber },
				(key, fa) => new TotalFamilyAttendanceViewModel()
				{
					OrganizationName = key.OrganizationName,
					MatricNumber = key.MatricNumber,
					FirstName = key.FirstName,
					LastName = key.LastName,
					Grade = key.Grade,
					FamilyAttendance = fa.Select(fa => new TotalFamilyAttendanceViewModel.FamilyMemberAttendanceViewModel()
					{
						FamilyMember = fa.FamilyMember,
						TotalDays = fa.TotalDays,
						TotalHours = fa.TotalHours
					})
				.ToList()
				})
			.ToList();
    }

    public async Task<List<ProgramViewModel>> GetProgramOverviewAsync(DateOnly startDate, DateOnly endDate, Guid[]? organizationGuids = null)
    {
		var orgGuidsParam = GetOrgGuidsParam(organizationGuids);
        double weeksToDate = (endDate.DayNumber - startDate.DayNumber) / 7f;
        return await _grantContext
            .Set<ProgramViewModel>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_ProgramOverview {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {weeksToDate}, {orgGuidsParam}")
            .ToListAsync();
    }

    public async Task<List<StaffSummaryViewModel>> GetStaffSummaryAsync(Guid yearGuid, Guid[]? organizationGuids = null)
    {
		var orgGuidsParam = GetOrgGuidsParam(organizationGuids);
        List<StaffSummaryDbModel> staffSummary = await _grantContext
            .Set<StaffSummaryDbModel>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_Staffing {yearGuid}, {orgGuidsParam}")
            .ToListAsync();

		return staffSummary
			.GroupBy(s => s.Status,
					(status, staff) => new StaffSummaryViewModel()
					{
						OrganizationName = staff.First().OrganizationName,
						Status = status,
						Instructors = staff.Select(s => new StaffSummaryViewModel.InstructorViewModel()
						{
							FirstName = s.FirstName,
							LastName = s.LastName,
							InstructorSchoolYearGuid = s.InstructorSchoolYearGuid
						})
						.ToList()
					}
				)
				.ToList();
    }

    public async Task<List<StaffMember>> GetStaffMembersAsync()
    {
		return await _grantContext
            .Set<StaffMember>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_Staffing")
            .ToListAsync();
    }

    public async Task<StudentAttendanceReportViewModel> GetStudentAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid[]? organizationGuids = null)
    {
		var orgGuidsParam = GetOrgGuidsParam(organizationGuids);
		var students = await _grantContext
			.Set<TotalStudentAttendanceViewModel>()
			.FromSqlInterpolated($"exec GTkr.ReportQuery_StudentAttendance {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {orgGuidsParam}")
			.ToListAsync();

		return new StudentAttendanceReportViewModel
		{
			Students = students,
			AttendanceBuckets = BucketAttendanceDays(students)
		};
    }

	// Buckets: [>=1 Day, 1-10 Days, 11-20 Days, 21-29 Days, 30+ Days].
	// The first bucket is cumulative (any attendance); the rest are exclusive ranges.
	private static int[] BucketAttendanceDays(List<TotalStudentAttendanceViewModel> students)
	{
		var buckets = new int[5];
		foreach (var s in students)
		{
			if (s.TotalDays >= 1) buckets[0]++;

			if (s.TotalDays <= 10) buckets[1]++;
			else if (s.TotalDays <= 20) buckets[2]++;
			else if (s.TotalDays < 30) buckets[3]++;
			else buckets[4]++;
		}
		return buckets;
	}

    public async Task<List<StudentSurveyViewModel>> GetStudentSurveyAsync(DateOnly startDate, DateOnly endDate, Guid[]? organizationGuids = null, bool regularAttendeesOnly = false)
    {
		var orgGuidsParam = GetOrgGuidsParam(organizationGuids);
        return await _grantContext
            .Set<StudentSurveyViewModel>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_StudentSurvey {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {orgGuidsParam}, {regularAttendeesOnly}")
            .ToListAsync();
    }

	public async Task<List<ClassSummaryViewModel>> GetSummaryOfClassesAsync(DateOnly startDate, DateOnly endDate, Guid[]? organizationGuids = null)
	{
		var orgGuidsParam = GetOrgGuidsParam(organizationGuids);
		List<ClassSummaryDbModel> summary = await _grantContext
			.Set<ClassSummaryDbModel>()
			.FromSqlInterpolated($"exec GTkr.ReportQuery_SummaryOfCLasses {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {orgGuidsParam}")
			.ToListAsync();

		return summary.GroupBy(s => new { s.OrganizationName, s.SessionName },
			(key, s) =>
			{
				var firstRow = s.First();

				return new ClassSummaryViewModel()
				{
					OrganizationName = key.OrganizationName,
					OrganizationYearGuid = firstRow.OrganizationYearGuid,
					SessionGuid = firstRow.SessionGuid,
					SessionName = key.SessionName,
					ActivityType = firstRow.ActivityType,
					FundingSource = firstRow.FundingSource,
					FirstSession = firstRow.FirstSession,
					LastSession = firstRow.LastSession,
					DaysOfWeek = firstRow.DaysOfWeek,
					WeeksToDate = firstRow.WeeksToDate,
					AvgDailyAttendance = firstRow.AvgDailyAttendance,
					AvgHoursPerDay = firstRow.AvgHoursPerDay,
					Objectives = s.Select(x => x.Objective).Distinct().ToList(),
					Instructors = s.Select(s => new ClassSummaryViewModel.InstructorViewModel()
					{
						FirstName = s.InstructorFirstName,
						LastName = s.InstructorLastName,
						Status = s.InstructorStatus
					})
					.ToList()
				};
			})
			.ToList();
	}

    public async Task<List<TotalActivityViewModel>> GetTotalActivityAsync(DateOnly startDate, DateOnly endDate, Guid[]? organizationGuids = null)
    {
		var orgGuidsParam = GetOrgGuidsParam(organizationGuids);
        return await _grantContext
            .Set<TotalActivityViewModel>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_TotalActivity {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {orgGuidsParam}")
            .ToListAsync();
    }

	public async Task<List<CCLC10ViewModel>> GetCCLC10Async(DateOnly startDate, DateOnly endDate)
	{
		return await _grantContext
			.Set<CCLC10ViewModel>()
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_AzEDS_CCLC10 {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}")
			.ToListAsync();
	}

	public async Task<List<SiteSessionViewModel>> GetSiteSessionsAsync(DateOnly startDate, DateOnly endDate, Guid[]? organizationGuids = null)
	{
		var orgGuidsParam = GetOrgGuidsParam(organizationGuids);
		List<SiteSessionDbModel> siteSessions = await _grantContext
			.Set<SiteSessionDbModel>()
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_SiteSessions {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {orgGuidsParam}")
			.AsNoTracking()
			.ToListAsync();

		return siteSessions
			.GroupBy(s => new { s.OrganizationName, s.SessionName, s.InstanceDate },
				(key, s) =>
				{
					var firstRow = s.First();
					return new SiteSessionViewModel()
					{
						OrganizationName = key.OrganizationName,
						SessionName = key.SessionName,
						ActivityType = firstRow.ActivityType,
						SessionType = firstRow.SessionType,
						FundingSource = firstRow.FundingSource,
						PartnershipType = firstRow.PartnershipType,
						OrganizationType = firstRow.PartnershipType,
						Grades = firstRow.Grades,
						InstanceDate = key.InstanceDate,
						AttendeeCount = firstRow.AttendeeCount,
                        Objectives = s.Select(x => x.Objective).Distinct().ToList(),
                        Instructors = s.Select(s => new SiteSessionViewModel.InstructorViewModel()
						{
							FirstName = s.InstructorFirstName,
							LastName = s.InstructorLastName,
							Status = s.InstructorStatus
						})
						.ToList(),
					};
				})
			.ToList();
	}

	public async Task<List<ScheduleReport>> GetScheduleReportAsync(DateOnly startDate, DateOnly endDate, Guid[]? organizationGuids = null)
	{
		var orgGuidsParam = GetOrgGuidsParam(organizationGuids);
		return await _grantContext.Set<ScheduleReport>()
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_Schedule {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {orgGuidsParam}")
			.AsNoTracking()
			.ToListAsync();
    }

    public async Task<List<FamilySessionRow>> GetFamilySessionReportAsync(DateOnly startDate, DateOnly endDate)
    {
        return await _grantContext.Set<FamilySessionRow>()
            .FromSqlInterpolated($"EXEC [GTkr].ReportQuery_FamilySession {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}")
            .AsNoTracking()
            .ToListAsync();
    }

}