using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using GrantTracker.Dal.Models.Views.Reporting;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using GrantTracker.Dal.Repositories.DevRepository;
using System;

namespace GrantTracker.Dal.Repositories.ReportRepository;

public class ReportRepository : RepositoryBase, IReportRepository
{
	private Guid _processGuid = Guid.NewGuid();
	private IDbContextFactory<GrantTrackerContext> _grantContextFactory;

	public ReportRepository(IDbContextFactory<GrantTrackerContext> grantContextFactory, IDevRepository devRepository, IHttpContextAccessor httpContext)
		: base(devRepository, httpContext, grantContextFactory.CreateDbContext())
	{
		_grantContextFactory = grantContextFactory;
	}

	private string DateOnlyToSQLString(DateOnly date) => $"{date.Year}-{date.Month}-{date.Day}";

	public async Task<ReportsViewModel> RunAllReportQueriesAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
	{
		await _grantContext.Database.ExecuteSqlInterpolatedAsync($"EXEC [GTkr].ReportQuery_Core {_processGuid}, {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {(organizationGuid == new Guid() ? null : organizationGuid)}");

		Task<List<TotalStudentAttendanceViewModel>> totalStudentAttendanceQueryTask = _grantContext
			.ReportTotalStudentAttendance
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_StudentAttendance {_processGuid}")
			.AsNoTracking()
			.ToListAsync();
			
		Task<List<TotalFamilyAttendanceDbModel>> totalFamilyAttendanceQueryTask = _grantContextFactory.CreateDbContext()
			.ReportTotalFamilyAttendance
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_FamilyAttendance {_processGuid}")
			.AsNoTracking()
			.ToListAsync();
			
		Task<List<TotalActivityViewModel>> totalActivityQueryTask = _grantContextFactory.CreateDbContext()
			.ReportTotalActivity
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_TotalActivity {_processGuid}")
			.AsNoTracking()
			.ToListAsync();

		/*
		 //Until performance improves, it is seperated
		Task<List<SiteSessionDbModel>> siteSessionsQueryTask = _grantContextFactory.CreateDbContext()
			.ReportSiteSessions
			.FromSqlInterpolated($"EXEC ReportQuery_SiteSessions {_processGuid}")
			.AsNoTracking()
			.ToListAsync();
		*/
			
		Task<List<ClassSummaryDbModel>> classSummaryQueryTask = _grantContextFactory.CreateDbContext()
			.ReportClassSummary
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_SummaryOfClasses {_processGuid}")
			.AsNoTracking()
			.ToListAsync();

		double weeksToDate = (endDate.DayNumber - startDate.DayNumber) / 7f;
		Task<List<ProgramViewModel>> programOverviewQueryTask = _grantContextFactory.CreateDbContext()
			.ReportProgramOverview
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_ProgramOverview {_processGuid}, {weeksToDate}")
			.AsNoTracking()
			.ToListAsync();
			
		Task<List<StaffSummaryDbModel>> staffSurveyQueryTask = _grantContextFactory.CreateDbContext()
			.ReportStaffSurvey
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_Staffing {(organizationGuid == new Guid() ? null : organizationGuid)}")
			.AsNoTracking()
			.ToListAsync();
			
		Task<List<StudentSurveyViewModel>> studentSurveyQueryTask = _grantContextFactory.CreateDbContext()
			.ReportStudentSurvey
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_StudentSurvey {_processGuid}")
			.AsNoTracking()
			.ToListAsync();


		/*var testQuery = $"EXEC [GTkr].ReportQuery_AttendanceCheck {(organizationGuid == new Guid() ? null : organizationGuid)}, {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}";
        Task<List<AttendanceCheckDbModel>> attendanceCheckQueryTask = _grantContextFactory.CreateDbContext()
            .AttendanceCheck
            .FromSqlInterpolated($"EXEC [GTkr].ReportQuery_AttendanceCheck {(organizationGuid == new Guid() ? null : organizationGuid)}, {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}")
            .AsNoTracking()
            .ToListAsync();*/


        List<Task> awaitedTasks = new()
		{
			totalStudentAttendanceQueryTask,
			totalFamilyAttendanceQueryTask,
			totalActivityQueryTask,
			classSummaryQueryTask,
			programOverviewQueryTask,
			staffSurveyQueryTask,
			studentSurveyQueryTask,
            //attendanceCheckQueryTask
        };

		await Task.WhenAll(awaitedTasks);

		ReportsDbModel reports = new()
		{
			TotalStudentAttendance = await totalStudentAttendanceQueryTask,
			TotalFamilyAttendance = await totalFamilyAttendanceQueryTask,
			TotalActivity = await totalActivityQueryTask,
			//SiteSessions = await siteSessionsQueryTask,
			ClassSummaries = await classSummaryQueryTask,
			ProgramOverviews = await programOverviewQueryTask,
			StaffSummaries = await staffSurveyQueryTask,
			StudentSurvey = await studentSurveyQueryTask,
			//AttendanceCheck = await attendanceCheckQueryTask
		};

		await _grantContext.Database.ExecuteSqlInterpolatedAsync($"EXEC [GTkr].ReportQuery_Cleanup {_processGuid}");
        /*
        var sessionGuids = reports.AttendanceCheck.Select(x => x.SessionGuid).Distinct().ToList();
		
		var today = DateTime.Today;
		var attendSessions = _grantContext.Sessions
		.Where(s => sessionGuids.Contains(s.SessionGuid))
        .Include(s => s.DaySchedules).ThenInclude(ds => ds.TimeSchedules)
        .Include(s => s.OrganizationYear).ThenInclude(oy => oy.Organization)
        .Include(s => s.InstructorRegistrations).ThenInclude(sr => sr.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
        .Select(s => new
		{
			SessionGuid = s.SessionGuid,
			School = s.OrganizationYear.Organization.Name,
			SessionName = s.Name,
			DaySchedules = s.DaySchedules,
			StartDate = s.FirstSession,
			EndDate = s.LastSession
		})
		.ToList();

		var groupedAttendanceBySession = reports.AttendanceCheck.GroupBy(x => x.SessionGuid,
			(guid, attendance) => {

				//we need to add the missing dates w/o attendance records

				//grab first date/week for each day of week and iterate adding days or finding a match among the attendCheck
				var sessionInfo = attendSessions.First(x => x.SessionGuid == guid);

				foreach(var daySchedule in sessionInfo.DaySchedules)
                {
					var currentDate = sessionInfo.StartDate;
                    int daysToAdd = ((int)daySchedule.DayOfWeek - (int)currentDate.DayOfWeek + 7) % 7;

					currentDate = currentDate.AddDays(daysToAdd);

                    while (currentDate < sessionInfo.EndDate)
                    {
						if (!attendance.Any(x => x.InstanceDate == currentDate))
						{
							attendance.Append(new AttendanceCheckDbModel
							{
								DayOfWeek = currentDate.DayOfWeek.ToString(),
								SessionGuid = guid,
								School = sessionInfo.School,
								InstructorFirstName = string.Empty,
								InstructorLastName = string.Empty,
								ClassName = sessionInfo.SessionName
							});
						}
						currentDate = currentDate.AddDays(7);

                    }
				}

				var records = 

				return new
				{
					SessionGuid = guid,
					Records = attendance
				};
			})
			.ToList();*/


        return GroupReports(reports);
	}

	//ask liz if SiteSessions is to track hours and attendees by instructor or purely by session

	//is anything instructor centric or is their existence merely a datapoint on the session>?
	private ReportsViewModel GroupReports(ReportsDbModel reports) => new()
	{
		TotalStudentAttendance = reports.TotalStudentAttendance,
		TotalActivity = reports.TotalActivity,
		ProgramOverviews = reports.ProgramOverviews,
		StudentSurvey = reports.StudentSurvey,

		TotalFamilyAttendance = reports.TotalFamilyAttendance
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
			.ToList(),

		/*SiteSessions = reports.SiteSessions
		.GroupBy(s => new { s.OrganizationName, s.SessionName, s.InstanceDate },
			(key, s) => {
				var firstRow = s.First();
				return new SiteSessionViewModel()
				{
					OrganizationName = key.OrganizationName,
					SessionName = key.SessionName,
					ActivityType = firstRow.ActivityType,
					Objective = firstRow.Objective,
					SessionType = firstRow.SessionType,
					FundingSource = firstRow.FundingSource,
					PartnershipType = firstRow.PartnershipType,
					OrganizationType = firstRow.PartnershipType,
					Grades = firstRow.Grades,
					InstanceDate = key.InstanceDate,
					AttendeeCount = firstRow.AttendeeCount,
					Instructors = s.Select(s => new SiteSessionViewModel.InstructorViewModel()
					{
						FirstName = s.InstructorFirstName,
						LastName = s.InstructorLastName,
						Status = s.InstructorStatus
					})
					.ToList(),
				};
			})
		.ToList(),*/

        ClassSummaries = reports.ClassSummaries
		.GroupBy(s => new { s.OrganizationName, s.SessionName },
			(key, s) =>
			{
				var firstRow = s.First();

				return new ClassSummaryViewModel()
				{
					OrganizationName = key.OrganizationName,
					SessionName = key.SessionName,
					ActivityType = firstRow.ActivityType,
					FundingSource = firstRow.FundingSource,
					Objective = firstRow.Objective,
					FirstSession = firstRow.FirstSession,
					LastSession = firstRow.LastSession,
					DaysOfWeek = firstRow.DaysOfWeek,
					WeeksToDate = firstRow.WeeksToDate,
					AvgDailyAttendance = firstRow.AvgDailyAttendance,
					AvgHoursPerDay = firstRow.AvgHoursPerDay,
					Instructors = s.Select(s => new ClassSummaryViewModel.InstructorViewModel()
					{
						FirstName = s.InstructorFirstName,
						LastName = s.InstructorLastName,
						Status = s.InstructorStatus
					})
					.ToList()
				};
			})
		.ToList(),

		StaffSummaries = reports.StaffSummaries
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
			.ToList(),

		/*AttendanceCheck = reports.AttendanceCheck
		.GroupBy(x => new { x.SessionGuid, x.AttendanceGuid, x.InstructorAttendanceGuid },
			(ids, group) => new AttendanceCheckViewModel
			{
				DayOfWeek = group.First().DayOfWeek,
				SessionGuid = group.First().SessionGuid,
				InstanceDate = group.First().InstanceDate,
				School = group.First().School,
				ClassName = group.First().ClassName,
				AttendanceEntry = group.First().AttendanceEntry,
				InstructorAttendance = group.Select(x => new AttendanceCheckInstructor
				{
					FirstName = x.InstructorFirstName,
					LastName = x.InstructorLastName,
					AttendanceTimes = group.Select(x => new AttendanceCheckInstructorTime
					{
						StartTime = x.StartTime,
						EndTime = x.EndTime
					})
					.ToList()
				})
				.ToList()
			})
		.ToList(),

		AttendanceCheckSessions = reports.AttendanceCheck
		.DistinctBy(x => x.SessionGuid)
		.Select(x => new AttendanceCheckSession
		{
			SessionGuid = x.SessionGuid,
			SessionName = x.ClassName
		})
		.ToList()*/
	};

	public async Task<List<SiteSessionViewModel>> GetSiteSessionsAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
	{

		Guid tempProcessKey = Guid.NewGuid();

		await _grantContext.Database.ExecuteSqlInterpolatedAsync($"EXEC [GTkr].ReportQuery_Core {tempProcessKey}, {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}");

		List<SiteSessionDbModel> siteSessions = await _grantContextFactory.CreateDbContext()
			.ReportSiteSessions
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_SiteSessions {tempProcessKey}")
			.AsNoTracking()
			.ToListAsync();

		await _grantContext.Database.ExecuteSqlInterpolatedAsync($"EXEC [GTkr].ReportQuery_Cleanup {tempProcessKey}");

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
						Objective = firstRow.Objective,
						SessionType = firstRow.SessionType,
						FundingSource = firstRow.FundingSource,
						PartnershipType = firstRow.PartnershipType,
						OrganizationType = firstRow.PartnershipType,
						Grades = firstRow.Grades,
						InstanceDate = key.InstanceDate,
						AttendeeCount = firstRow.AttendeeCount,
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

}