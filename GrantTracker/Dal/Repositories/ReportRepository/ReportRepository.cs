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
    }

	private string DateOnlyToSQLString(DateOnly date) => $"{date.Year}-{date.Month}-{date.Day}";

	public async Task<List<PayrollAuditView>> GetPayrollAuditAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
	{
		List<PayrollAuditDb> payrollAudit = await _grantContext
			.Set<PayrollAuditDb>()
			.FromSqlInterpolated($"exec GTkr.ReportQuery_PayrollAudit {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}")
			.ToListAsync(); 
		
		var payrollSessionGuids = payrollAudit.Select(x => x.SessionGuid).ToList();
        var registeredSessionPayrollAuditInstructors = _grantContext
            .Sessions
            .Where(x => payrollSessionGuids.Contains(x.SessionGuid))
            .Include(x => x.InstructorRegistrations).ThenInclude(ir => ir.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
            .SelectMany(x => x.InstructorRegistrations,
                (s, ir) => new
                {
                    SessionGuid = s.SessionGuid,
                    FirstName = ir.InstructorSchoolYear.Instructor.FirstName,
                    LastName = ir.InstructorSchoolYear.Instructor.LastName
                }
            )
            .ToList();

        return payrollAudit.GroupBy(x => new { x.School, x.ClassName, x.InstanceDate },
				(id, grp) => new PayrollAuditView
				{
					SessionGuid = grp.First().SessionGuid,
					School = id.School,
					ClassName = id.ClassName,
					InstanceDate = id.InstanceDate,
					RegisteredInstructors = registeredSessionPayrollAuditInstructors
						.Where(x => x.SessionGuid == grp.First().SessionGuid)
						.Select(x => new Schema.Sprocs.Reporting.Instructor()
						{
							FirstName = x.FirstName,
							LastName = x.LastName
						})
						.ToList(),

					AttendingInstructorRecords = grp.GroupBy(x => x.InstructorSchoolYearGuid,
						(isyGuid, iGrp) => new PayrollAuditInstructorRecord
						{
							FirstName = iGrp.First().FirstName,
							LastName = iGrp.First().LastName,
							IsSubstitute = iGrp.First().IsSubstitute,
							TimeRecords = iGrp.Select(x => new PayrollAuditTimeRecord
							{
								StartTime = x.EntryTime,
								EndTime = x.ExitTime
							})
							.ToList()
						})
					.ToList()
				})
			.ToList();
    }

    public async Task<List<AttendanceCheckViewModel>> GetAttendanceCheckAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
    {
        List<AttendanceCheckDbModel> attendCheck = await _grantContext
            .Set<AttendanceCheckDbModel>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_AttendanceCheck {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}")
            .ToListAsync();

		return await GroupAndFillAttendanceCheckAsync(startDate, endDate, organizationGuid, attendCheck);
    }

    private async Task<List<AttendanceCheckViewModel>> GroupAndFillAttendanceCheckAsync(DateOnly StartDate, DateOnly EndDate, Guid? OrganizationGuid, List<AttendanceCheckDbModel> AttendanceChecks)
    {
        var sessions = await _grantContext.Sessions
			.AsNoTracking()
            .Where(x => OrganizationGuid == null || x.OrganizationYear.OrganizationGuid == OrganizationGuid)
            .Where(x => x.FirstSession <= EndDate)
            .Where(x => x.LastSession >= StartDate)
            .Include(x => x.OrganizationYear).ThenInclude(x => x.Organization)
            .Include(x => x.DaySchedules).ThenInclude(ds => ds.TimeSchedules)
            .Include(x => x.InstructorRegistrations).ThenInclude(ir => ir.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
            .Include(x => x.AttendanceRecords)
			.Include(s => s.BlackoutDates)
            .ToListAsync();

        var attendanceChecksBySession = sessions.Select(s =>
        {
            List<AttendanceCheckViewModel> attendances = new();

            List<DateOnly> attendanceDates = AttendanceChecks
                .Where(ac => ac.SessionGuid == s.SessionGuid)
                .Select(ac => ac.InstanceDate)
                .ToList();

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
                    if (currentDate < StartDate || s.BlackoutDates.Any(blackout => blackout.Date == currentDate))
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

        List<OrganizationBlackoutDate> orgBlackoutDates = await _organizationRepository.GetBlackoutDatesAsync(OrganizationGuid);

        return attendanceChecksBySession
            .SelectMany(x => x)
            .Where(x => !orgBlackoutDates.Any(bd => bd.OrganizationGuid == x.OrganizationGuid && bd.Date == x.InstanceDate))
            .OrderByDescending(x => x.InstanceDate)
            .ThenBy(x => x.TimeBounds.Min(x => x.StartTime))
            .ToList();
    }

    public async Task<List<TotalFamilyAttendanceViewModel>> GetFamilyAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
    {
        List<TotalFamilyAttendanceDbModel> familyAttendance = await _grantContext
            .Set<TotalFamilyAttendanceDbModel>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_FamilyAttendance {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}")
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

    public async Task<List<ProgramViewModel>> GetProgramOverviewAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
    {
        double weeksToDate = (endDate.DayNumber - startDate.DayNumber) / 7f;
        return await _grantContext
            .Set<ProgramViewModel>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_ProgramOverview {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {weeksToDate}, {organizationGuid}")
            .ToListAsync();
    }

    public async Task<List<StaffSummaryViewModel>> GetStaffSummaryAsync(Guid yearGuid, Guid? organizationGuid = null)
    {
        List<StaffSummaryDbModel> staffSummary = await _grantContext
            .Set<StaffSummaryDbModel>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_Staffing {yearGuid}, {organizationGuid}")
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

    public async Task<List<TotalStudentAttendanceViewModel>> GetStudentAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
    {
		return await _grantContext
			.Set<TotalStudentAttendanceViewModel>()
			.FromSqlInterpolated($"exec GTkr.ReportQuery_StudentAttendance {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}")
			.ToListAsync();
    }

    public async Task<List<StudentSurveyViewModel>> GetStudentSurveyAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
    {
        return await _grantContext
            .Set<StudentSurveyViewModel>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_StudentSurvey {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}")
            .ToListAsync();
    }

	public async Task<List<ClassSummaryViewModel>> GetSummaryOfClassesAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
	{
		List<ClassSummaryDbModel> summary = await _grantContext
			.Set<ClassSummaryDbModel>()
			.FromSqlInterpolated($"exec GTkr.ReportQuery_SummaryOfCLasses {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}")
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

    public async Task<List<TotalActivityViewModel>> GetTotalActivityAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
    {
        return await _grantContext
            .Set<TotalActivityViewModel>()
            .FromSqlInterpolated($"exec GTkr.ReportQuery_TotalActivity {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}")
            .ToListAsync();
    }

	public async Task<List<CCLC10ViewModel>> GetCCLC10Async(DateOnly startDate, DateOnly endDate)
	{
		return await _grantContext
			.Set<CCLC10ViewModel>()
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_AzEDS_CCLC10 {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}")
			.ToListAsync();
	}

	public async Task<List<SiteSessionViewModel>> GetSiteSessionsAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
	{
		List<SiteSessionDbModel> siteSessions = await _grantContext
			.Set<SiteSessionDbModel>()
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_SiteSessions {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}")
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

	public async Task<List<ScheduleReport>> GetScheduleReportAsync(Guid yearGuid, Guid? organizationGuid = null)
	{
		return await _grantContext.Set<ScheduleReport>()
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_Schedule {yearGuid}, {organizationGuid}")
			.AsNoTracking()
			.ToListAsync();
    }
}