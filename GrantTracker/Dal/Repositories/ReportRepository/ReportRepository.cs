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
			.Set<TotalStudentAttendanceViewModel>()
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_StudentAttendance {_processGuid}")
			.AsNoTracking()
			.ToListAsync();
			
		Task<List<TotalFamilyAttendanceDbModel>> totalFamilyAttendanceQueryTask = _grantContextFactory.CreateDbContext()
			.Set<TotalFamilyAttendanceDbModel>()
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_FamilyAttendance {_processGuid}")
			.AsNoTracking()
			.ToListAsync();
			
		Task<List<TotalActivityViewModel>> totalActivityQueryTask = _grantContextFactory.CreateDbContext()
			.Set<TotalActivityViewModel>()
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
			.Set<ClassSummaryDbModel>()
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_SummaryOfClasses {_processGuid}")
			.AsNoTracking()
			.ToListAsync();

		double weeksToDate = (endDate.DayNumber - startDate.DayNumber) / 7f;
		Task<List<ProgramViewModel>> programOverviewQueryTask = _grantContextFactory.CreateDbContext()
			.Set<ProgramViewModel>()
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_ProgramOverview {_processGuid}, {weeksToDate}")
			.AsNoTracking()
			.ToListAsync();
			
		Task<List<StaffSummaryDbModel>> staffSurveyQueryTask = _grantContextFactory.CreateDbContext()
			.Set<StaffSummaryDbModel>()
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_Staffing {(organizationGuid == new Guid() ? null : organizationGuid)}")
			.AsNoTracking()
			.ToListAsync();
			
		Task<List<StudentSurveyViewModel>> studentSurveyQueryTask = _grantContextFactory.CreateDbContext()
			.Set<StudentSurveyViewModel>()
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_StudentSurvey {_processGuid}")
			.AsNoTracking()
			.ToListAsync();
		
        Task<List<AttendanceCheckDbModel>> attendanceCheckQueryTask = _grantContextFactory.CreateDbContext()
            .Set<AttendanceCheckDbModel>()
            .FromSqlInterpolated($"EXEC [GTkr].ReportQuery_AttendanceCheck {_processGuid}")
            .AsNoTracking()
            .ToListAsync();

		Task<List<PayrollAuditDb>> payrollAuditQueryTask = _grantContextFactory.CreateDbContext().Set<PayrollAuditDb>()
			.FromSqlInterpolated($"EXEC ReportQuery_PayrollAudit {_processGuid}")
			.AsNoTracking()
			.ToListAsync();

        List<Task> awaitedTasks = new()
		{
			totalStudentAttendanceQueryTask,
			totalFamilyAttendanceQueryTask,
			totalActivityQueryTask,
			classSummaryQueryTask,
			programOverviewQueryTask,
			staffSurveyQueryTask,
			studentSurveyQueryTask,
            attendanceCheckQueryTask
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
			AttendanceCheck = await attendanceCheckQueryTask,
			PayrollAudit = await payrollAuditQueryTask
		};

		await _grantContext.Database.ExecuteSqlInterpolatedAsync($"EXEC [GTkr].ReportQuery_Cleanup {_processGuid}");

        var groupedReports = GroupReports(reports);
		groupedReports.AttendanceCheck = await GroupAndFillAttendanceCheckAsync(organizationGuid, startDate, endDate, reports.AttendanceCheck); //must be handled specially
		
		return groupedReports;
	}

	private async Task<List<AttendanceCheckViewModel>> GroupAndFillAttendanceCheckAsync(Guid? OrganizationGuid, DateOnly StartDate, DateOnly EndDate, List<AttendanceCheckDbModel> AttendanceChecks)
	{
		var sessions = await _grantContext.Sessions
			.Where(x => x.OrganizationYear.OrganizationGuid == OrganizationGuid)
			.Where(x => x.FirstSession <= EndDate)
			.Where(x => x.LastSession >= StartDate)
			.Include(x => x.OrganizationYear).ThenInclude(x => x.Organization)
			.Include(x => x.DaySchedules).ThenInclude(ds => ds.TimeSchedules)
			.Include(x => x.InstructorRegistrations).ThenInclude(ir => ir.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
			.Include(x => x.AttendanceRecords)
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
					if (currentDate < StartDate)
					{
                        currentDate = currentDate.AddDays(7);
						continue;
                    }

					bool hasAttendanceRecord = attendanceDates.Contains(currentDate);
					if (!hasAttendanceRecord)
					{
						attendances.Add(new()
						{
							SessionGuid = s.SessionGuid,
							InstanceDate = currentDate,
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
							AttendanceEntry = false
						});
					}
					else
					{
						attendances.Add(new()
						{
							SessionGuid = s.SessionGuid,
							InstanceDate = currentDate,
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
							AttendanceEntry = true
						});
					}

					currentDate = currentDate.AddDays(7);
				}
			}

			return attendances;
		})
		.ToList();

		return attendanceChecksBySession
			.SelectMany(x => x)
			.OrderByDescending(x => x.InstanceDate)
			.ThenBy(x => x.TimeBounds.Min(x => x.StartTime))
			.ToList();
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

		PayrollAudit = reports.PayrollAudit
			.GroupBy(x => new { x.School, x.ClassName, x.InstanceDate },
			(id, grp) => new PayrollAuditView
			{
				School = id.School,
				ClassName = id.ClassName,
				InstanceDate = id.InstanceDate,
				InstructorRecords = grp.GroupBy(x => x.InstructorSchoolYearGuid,
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
		.ToList()
	};

	public async Task<List<SiteSessionViewModel>> GetSiteSessionsAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null)
	{

		Guid tempProcessKey = Guid.NewGuid();

		await _grantContext.Database.ExecuteSqlInterpolatedAsync($"EXEC [GTkr].ReportQuery_Core {tempProcessKey}, {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}");

		List<SiteSessionDbModel> siteSessions = await _grantContextFactory.CreateDbContext()
			.Set<SiteSessionDbModel>()
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