using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using GrantTracker.Dal.Models.Views.Reporting;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using GrantTracker.Dal.Repositories.DevRepository;

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

	public async Task<ReportsViewModel> RunAllReportQueriesAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default)
	{
		await _grantContext.Database.ExecuteSqlInterpolatedAsync($"EXEC [GTkr].ReportQuery_Core {_processGuid}, {DateOnlyToSQLString(startDate)}, {DateOnlyToSQLString(endDate)}, {organizationGuid}");

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
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_Staffing {organizationGuid}")
			.AsNoTracking()
			.ToListAsync();
			
		Task<List<StudentSurveyViewModel>> studentSurveyQueryTask = _grantContextFactory.CreateDbContext()
			.ReportStudentSurvey
			.FromSqlInterpolated($"EXEC [GTkr].ReportQuery_StudentSurvey {_processGuid}")
			.AsNoTracking()
			.ToListAsync();

		ReportsDbModel reports = new()
		{
			TotalStudentAttendance = await totalStudentAttendanceQueryTask,
			TotalFamilyAttendance = await totalFamilyAttendanceQueryTask,
			TotalActivity = await totalActivityQueryTask,
			//SiteSessions = await siteSessionsQueryTask,
			ClassSummaries = await classSummaryQueryTask,
			ProgramOverviews = await programOverviewQueryTask,
			StaffSummaries = await staffSurveyQueryTask,
			StudentSurvey = await studentSurveyQueryTask
		};

		await _grantContext.Database.ExecuteSqlInterpolatedAsync($"EXEC [GTkr].ReportQuery_Cleanup {_processGuid}");

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
			.ToList()
	};

	public async Task<List<SiteSessionViewModel>> GetSiteSessionsAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default)
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

	/*public async Task RunReportQueryAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default)
	{
		await _grantContext.Database.ExecuteSqlInterpolatedAsync($"ReportQuery_Core {_processGuid}, {startDate}, {endDate}");
	}

	public async Task<List<TotalStudentAttendanceViewModel>> GetTotalStudentAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default)
	{
		var totalStudentAttendance = await _grantContext
			.StudentAttendanceRecords
			.Where(sa => (sa.StudentSchoolYear.OrganizationYear.OrganizationGuid == organizationGuid || (organizationGuid == Guid.Empty && _identity.Claim == IdentityClaim.Administrator))
				&& (startDate <= sa.AttendanceRecord.InstanceDate && sa.AttendanceRecord.InstanceDate <= endDate)) //match organization unless org is null and user is an admin
			.Include(sa => sa.StudentSchoolYear.Student)
			.Include(sa => sa.StudentSchoolYear).ThenInclude(ssy => ssy.OrganizationYear).ThenInclude(oy => oy.Organization)
			.Include(sa => sa.TimeRecords)
			.Include(sa => sa.AttendanceRecord)
			.Select(sa => new
			{
				OrgName = sa.StudentSchoolYear.OrganizationYear.Organization.Name,
				sa.StudentSchoolYear.Student.FirstName,
				sa.StudentSchoolYear.Student.LastName,
				sa.StudentSchoolYear.Student.MatricNumber,
				sa.StudentSchoolYear.Grade,
				AttendanceRecord = sa
			})
			.ToListAsync();

		return totalStudentAttendance
			.GroupBy(tsa => new { tsa.OrgName, tsa.FirstName, tsa.LastName, tsa.MatricNumber, tsa.Grade },
			tsa => tsa.AttendanceRecord,
			(student, records) => new TotalStudentAttendanceViewModel()
			{
				OrganizationName = student.OrgName,
				FirstName = student.FirstName,
				LastName = student.LastName,
				MatricNumber = student.MatricNumber,
				Grade = student.Grade,
				TotalDays = records.DistinctBy(ar => ar.AttendanceRecord.InstanceDate).Count(),
				TotalHours = records.SelectMany(sa => sa.TimeRecords).Sum(tr => (tr.ExitTime - tr.EntryTime).TotalMinutes / 60f)
			})
			.ToList();
	}

	public async Task<List<TotalFamilyAttendanceViewModel>> GetFamilyMemberAttendanceAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default)
	{
		var recordsBetweenDates = await _grantContext
			.AttendanceRecords
			.Where(ar => startDate.CompareTo(ar.InstanceDate) <= 0)
			.Where(ar => endDate.CompareTo(ar.InstanceDate) >= 0)
			.Where(ar => ar.Session.OrganizationYear.OrganizationGuid == organizationGuid || (organizationGuid == Guid.Empty && _identity.Claim == IdentityClaim.Administrator))
			.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
			.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.FamilyAttendance)
			.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
			.Include(ar => ar.StudentAttendance).ThenInclude(s => s.StudentSchoolYear).ThenInclude(oy => oy.OrganizationYear).ThenInclude(oy => oy.Organization)
			.SelectMany(x => x.StudentAttendance,
			(attendanceRecord, studentRecord) => new {
				OrganizationName = studentRecord.StudentSchoolYear.OrganizationYear.Organization.Name,
				InstanceDate = attendanceRecord.InstanceDate,
				StudentSchoolYearGuid = studentRecord.StudentSchoolYearGuid,
				Student = new TotalFamilyAttendanceViewModel.StudentViewModel()
				{
					MatricNumber = studentRecord.StudentSchoolYear.Student.MatricNumber,
					FirstName = studentRecord.StudentSchoolYear.Student.FirstName,
					LastName = studentRecord.StudentSchoolYear.Student.LastName,
					Grade = studentRecord.StudentSchoolYear.Grade
				},
				FamilyAttendance = studentRecord.FamilyAttendance.ToList(),
				TimeRecords = studentRecord.TimeRecords.ToList()
			})
			.ToListAsync();

		//we need to ditch some records as mid steps and reconnect them afterwards


		var flattenedFamilyAttendance = recordsBetweenDates
			.SelectMany(x => x.FamilyAttendance,
			(studentAttendDate, familyRecord) => new
			{
				InstanceDate = studentAttendDate.InstanceDate,
				StudentSchoolYearGuid = studentAttendDate.StudentSchoolYearGuid,
				FamilyMember = familyRecord.FamilyMember,
				TotalHours = studentAttendDate.TimeRecords.Sum(tr => (tr.ExitTime - tr.EntryTime).TotalMinutes / 60d),
			})
			.ToList();

		var familyTotalHours = flattenedFamilyAttendance
			.GroupBy(x => new { x.StudentSchoolYearGuid, x.FamilyMember },
				(studentParent, flatRecordGroup) => new
				{
					StudentSchoolYearGuid = studentParent.StudentSchoolYearGuid,
					FamilyMember = studentParent.FamilyMember,
					TotalHours = flatRecordGroup.Sum(x => x.TotalHours)
				})
			.ToList();

		var familyTotalDays = flattenedFamilyAttendance
			.DistinctBy(x => new { x.StudentSchoolYearGuid, x.FamilyMember, x.InstanceDate })
			.GroupBy(x => new { x.StudentSchoolYearGuid, x.FamilyMember },
			(studentParent, flatRecordGroup) => new
			{
				StudentSchoolYearGuid = studentParent.StudentSchoolYearGuid,
				FamilyMember = studentParent.FamilyMember,
				TotalDays = flatRecordGroup.Count()
			})
			.ToList();

		var familyAttendance = familyTotalDays
			.Join(familyTotalHours,
			days => new { days.StudentSchoolYearGuid, days.FamilyMember },
			hours => new { hours.StudentSchoolYearGuid, hours.FamilyMember },
			(days, hours) => new
			{
				days.StudentSchoolYearGuid,
				days.FamilyMember,
				days.TotalDays,
				hours.TotalHours
			})
			.GroupBy(x => x.StudentSchoolYearGuid,
				x => new TotalFamilyAttendanceViewModel.FamilyMemberAttendanceViewModel
				{
					FamilyMember = x.FamilyMember,
					TotalDays = x.TotalDays,
					TotalHours = x.TotalHours
				},
				(ssyGuid, fam) => new
				{
					StudentSchoolYearGuid = ssyGuid,
					FamilyAttendance = fam.ToList()
				})
			.ToList();

		var returnValue = recordsBetweenDates.Select(x => new
		{
			x.OrganizationName,
			x.StudentSchoolYearGuid,
			x.Student
		})
		.DistinctBy(x => x.StudentSchoolYearGuid)
		.Join(familyAttendance,
			stu => stu.StudentSchoolYearGuid,
			fam => fam.StudentSchoolYearGuid,
			(stu, fam) => new TotalFamilyAttendanceViewModel
			{
				OrganizationName = stu.OrganizationName,
				Student = stu.Student,
				FamilyAttendance = fam.FamilyAttendance.ToList()
			})
		.ToList();

		return returnValue;
	}

	//we can probably rework this one a bit, familyattendance not handled yet
	public async Task<List<TotalActivityViewModel>> GetTotalActivityAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default)
	{
		var totalActivity = await _grantContext
			.AttendanceRecords
			.Where(ar => startDate.CompareTo(ar.InstanceDate) <= 0 && endDate.CompareTo(ar.InstanceDate) >= 0
				&& (ar.Session.OrganizationYear.OrganizationGuid == organizationGuid || organizationGuid == Guid.Empty && _identity.Claim == IdentityClaim.Administrator))
			.Include(ar => ar.Session).ThenInclude(s => s.Activity)
			.Include(ar => ar.Session).ThenInclude(s => s.OrganizationYear).ThenInclude(oy => oy.Organization)
			.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
			.ToListAsync();

		return totalActivity
			.SelectMany(ar => ar.StudentAttendance,
				(ar, sa) => new
				{
					ActivityType = ar.Session.Activity.Label,
					OrganizationName = ar.Session.OrganizationYear.Organization.Name,
					AttendanceRecords = sa
				})
			.GroupBy(a => new { a.ActivityType, a.OrganizationName },
			a => a.AttendanceRecords,
			(activityByOrg, sa) => new 
			{
				OrganizationName = activityByOrg.OrganizationName, 
				Activity = activityByOrg.ActivityType,
				AttendanceRecords = sa.ToList(),
			})
			.Select(ta => new TotalActivityViewModel()
			{
				OrganizationName = ta.OrganizationName,
				Activity = ta.Activity,
				TotalAttendees = ta.AttendanceRecords.Count,
				TotalHours = ta.AttendanceRecords.SelectMany(sa => sa.TimeRecords).Sum(tr => (tr.ExitTime - tr.EntryTime).TotalMinutes / 60d)
			})
			.ToList();
	}

	public async Task<List<SiteSessionViewModel>> GetSiteSessionsAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default)
	{
		return await _grantContext
			.AttendanceRecords
			.Where(ar => startDate.CompareTo(ar.InstanceDate) <= 0 && endDate.CompareTo(ar.InstanceDate) >= 0
				&& (ar.Session.OrganizationYear.OrganizationGuid == organizationGuid || organizationGuid == Guid.Empty && _identity.Claim == IdentityClaim.Administrator))
			.Include(ar => ar.Session).ThenInclude(s => s.Activity)
			.Include(ar => ar.Session).ThenInclude(s => s.SessionType)
			.Include(ar => ar.Session).ThenInclude(s => s.Objective)
			.Include(ar => ar.Session).ThenInclude(s => s.FundingSource)
			.Include(ar => ar.Session).ThenInclude(s => s.OrganizationType)
			.Include(ar => ar.Session).ThenInclude(s => s.PartnershipType)
			.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.FamilyAttendance)
			.Include(ar => ar.Session).ThenInclude(s => s.SessionGrades).ThenInclude(sg => sg.Grade)
			.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
			.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.InstructorSchoolYear).ThenInclude(isy => isy.Status)
			.Select(ar => new SiteSessionViewModel
			{
				SessionName = ar.Session.Name,
				ActivityType = ar.Session.Activity.Abbreviation ?? ar.Session.Activity.Label,
				Objective = ar.Session.Objective.Label,
				SessionType = ar.Session.SessionType.Label,
				FundingSource = ar.Session.FundingSource.Abbreviation ?? ar.Session.FundingSource.Label,
				PartnershipType = ar.Session.PartnershipType.Abbreviation ?? ar.Session.PartnershipType.Label,
				OrganizationType = ar.Session.OrganizationType.Abbreviation ?? ar.Session.OrganizationType.Label,
				AttendeeCount = ar.StudentAttendance.Count() + ar.StudentAttendance.SelectMany(sa => sa.FamilyAttendance).Count(),
				Grades = ar.Session.SessionGrades.Select(sg => sg.Grade.Value).ToList(),
				Instructors = ar.InstructorAttendance
					.Select(ia => new SiteSessionViewModel.InstructorViewModel
					{
						FirstName = ia.InstructorSchoolYear.Instructor.FirstName.Trim(),
						LastName = ia.InstructorSchoolYear.Instructor.LastName.Trim(),
						Status = ia.InstructorSchoolYear.Status.Abbreviation ?? ia.InstructorSchoolYear.Status.Label
					})
					.ToList(),
				InstanceDate = ar.InstanceDate
			})
			.ToListAsync();
	}

	public async Task<List<ClassSummaryViewModel>> GetSummaryOfClassesAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default)
	{
		var summaryOfClasses = await _grantContext
			.Sessions
			.Where(s => s.OrganizationYear.OrganizationGuid == organizationGuid || organizationGuid == Guid.Empty && _identity.Claim == IdentityClaim.Administrator)
			.Include(s => s.Activity)
			.Include(s => s.FundingSource)
			.Include(s => s.OrganizationYear).ThenInclude(oy => oy.Organization)
			.Include(s => s.InstructorRegistrations).ThenInclude(ir => ir.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
			.Include(s => s.InstructorRegistrations).ThenInclude(ir => ir.InstructorSchoolYear).ThenInclude(isy => isy.Status)
			.Include(s => s.DaySchedules).ThenInclude(ds => ds.TimeSchedules)
			.Include(s => s.AttendanceRecords).ThenInclude(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
			.Include(s => s.AttendanceRecords).ThenInclude(ar => ar.StudentAttendance).ThenInclude(sa => sa.FamilyAttendance)
			.Select(s => new
			{
				OrganizationName = s.OrganizationYear.Organization.Name,
				SessionName = s.Name,
				ActivityType = s.Activity.Abbreviation,
				FundingSource = s.FundingSource.Abbreviation,
				StartDate = s.FirstSession,
				EndDate = s.LastSession,
				Instructors = s.InstructorRegistrations
					.Select(ir => new ClassSummaryViewModel.InstructorViewModel()
					{
						FirstName = ir.InstructorSchoolYear.Instructor.FirstName.Trim(),
						LastName = ir.InstructorSchoolYear.Instructor.LastName.Trim(),
						Status = ir.InstructorSchoolYear.Status.Label
					})
					.ToList(),
				WeeksTD = (DateOnly.FromDateTime(DateTime.Today).DayNumber - s.FirstSession.DayNumber) / 7d,
				DaysOfWeek = s.DaySchedules.Select(ds => ds.DayOfWeek).ToList(),
				AttendanceRecords = s.AttendanceRecords.ToList()
			})
			.ToListAsync();
		
			
		return summaryOfClasses
			.Select(s => {
				var attendanceRecords = s.AttendanceRecords
					.Where(ar => startDate.CompareTo(ar.InstanceDate) <= 0 && endDate.CompareTo(ar.InstanceDate) >= 0)
					.ToList();

				var studentRecords = attendanceRecords.SelectMany(ar => ar.StudentAttendance).ToList();

				var avgDailyAttendance = attendanceRecords.Count() > 0
					? (double)(studentRecords.Count + studentRecords.SelectMany(sr => sr.FamilyAttendance).Count() / s.AttendanceRecords.Count())
					: 0;

				var totalHours = attendanceRecords.SelectMany(ar => ar.StudentAttendance).SelectMany(sa => sa.TimeRecords).Sum(time => (time.ExitTime - time.EntryTime).TotalHours);
				var avgHoursPerDay = attendanceRecords.Count != 0 ? totalHours / attendanceRecords.Count : 0;
				
				return new ClassSummaryViewModel()
				{
					OrganizationName = s.OrganizationName,
					SessionName = s.SessionName,
					ActivityType = s.ActivityType,
					FundingSource = s.FundingSource,
					StartDate = s.StartDate,
					EndDate = s.EndDate,
					Instructors = s.Instructors,
					WeeksToDate = s.WeeksTD,
					DaysOfWeek = s.DaysOfWeek,
					AvgDailyAttendance = avgDailyAttendance,
					AvgHoursPerDay = avgHoursPerDay
				};
			})
			.ToList();
	}


	
	public async Task<List<ProgramViewModel>> GetProgramOverviewAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default)
	{
		Expression<Func<StudentAttendanceTimeRecord, int>> getDiff = (x) => EF.Functions.DateDiffMinute(EF.Functions.TimeFromParts(x.ExitTime.Hour, x.ExitTime.Minute, 0, 0, 2)
			, EF.Functions.TimeFromParts(x.ExitTime.Hour, x.ExitTime.Minute, 0, 0, 2));

		int daysOffered = endDate.DayNumber - startDate.DayNumber;
		double weeksOffered = daysOffered / 7d;

		var test = await _grantContext.AttendanceRecords
			.Where(ar => startDate.CompareTo(ar.InstanceDate) <= 0 && endDate.CompareTo(ar.InstanceDate) >= 0)
			.Include(ar => ar.Session).ThenInclude(s => s.OrganizationYear).ThenInclude(oy => oy.Organization)
			.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.FamilyAttendance)
			.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
			.GroupBy(x => x.Session.OrganizationYear.Organization.Name)
			.Select(x => new {
				OrganizationName = x.Key,
				FamilyAttendanceCount = x.SelectMany(x => x.StudentAttendance).SelectMany(x => x.FamilyAttendance).Count(),
				RegularStudentCount = x.SelectMany(x => x.StudentAttendance,
				(ar, sa) => new {
					ar.InstanceDate,
					sa.StudentSchoolYearGuid
				})
				.GroupBy(x => x.StudentSchoolYearGuid,
				(x, y) => y.Count())
				.Where<int>(x => x >= 30),
				Days = x.Select(x => x.InstanceDate),
				StudentDaysOfferedCount = x.Select(x => x.InstanceDate).Distinct(),
				AvgStudentAttendHoursPerWeek = x.SelectMany(x => x.StudentAttendance).SelectMany(sa => sa.TimeRecords).Select(x => new { x.EntryTime, x.ExitTime })
			})
			.ToListAsync();

		return test.Select(x => new ProgramViewModel {
			OrganizationName = x.OrganizationName,
			FamilyAttendanceCount = x.FamilyAttendanceCount,
			RegularStudentCount = x.RegularStudentCount.Count(),
			StudentDaysOfferedCount = x.StudentDaysOfferedCount.Count(),
			AvgStudentAttendHoursPerWeek = x.AvgStudentAttendHoursPerWeek.Sum(x => (x.ExitTime - x.EntryTime).TotalHours / weeksOffered),
			AvgStudentAttendDaysPerWeek = x.StudentDaysOfferedCount.Count() / weeksOffered
		})
	.ToList();

		//InstanceDate = ar.InstanceDate,
		//		StudentAttendance = ar.StudentAttendance.Select(sa => new StudentAttendanceRecord
		//		{
		//			StudentSchoolYearGuid = sa.StudentSchoolYearGuid,
		//			FamilyAttendance = sa.FamilyAttendance.Select(fa => new FamilyAttendance
		//			{
		//				FamilyMember = fa.FamilyMember
		//			})
		//			.ToList(),
		//			TimeRecords = sa.TimeRecords.Select(tr => new StudentAttendanceTimeRecord
		//			{
		//				EntryTime = tr.EntryTime,
		//				ExitTime = tr.ExitTime
		//			})
		//			.ToList()
		//		})
		//		.ToList()
		//	})
		//	.GroupBy(ar => ar.OrganizationName,
		//	ar => ar,
		//	(orgName, ar) => new
		//	{
		//		OrganizationName = orgName,
		//		AttendanceRecords = ar.ToList()
		//	})
		//	.ToListAsync();

		//return attendanceRecordsByOrg
		//	.Select(ar => {

		//		var attendanceRecords = ar.AttendanceRecords;
		//		var studentAttendance = attendanceRecords.SelectMany(ar => ar.StudentAttendance);
		//		int studentDaysOffered = attendanceRecords.DistinctBy(ar => ar.InstanceDate).Count();
		//		int daysToDate = endDate.DayNumber - startDate.DayNumber;
		//		double attendanceHours = studentAttendance.Select(sa => sa.TimeRecords.Sum(time => (time.ExitTime - time.EntryTime).TotalHours)).Sum();

		//		int regularStudentCount = attendanceRecords
		//			.SelectMany(ar => ar.StudentAttendance,
		//			(ar, sa) => new
		//			{
		//				ar.InstanceDate,
		//				sa.StudentSchoolYearGuid
		//			})
		//			.GroupBy(instance => instance.StudentSchoolYearGuid,
		//				instance => instance.InstanceDate,
		//				(ssyGuid, dates) => dates
		//			)
		//			.Where(dates => dates.Count() >= 30)
		//			.Count();

		//		return new ProgramViewModel
		//		{
		//			OrganizationName = ar.OrganizationName,
		//			RegularStudentCount = regularStudentCount,
		//			FamilyAttendanceCount = studentAttendance.SelectMany(sa => sa.FamilyAttendance).Count(),
		//			StudentDaysOfferedCount = studentDaysOffered,
		//			AvgStudentAttendHoursPerWeek = attendanceHours / (daysToDate / 7d), //this must change to year end date when it is reached.. or should it?
		//			AvgStudentAttendDaysPerWeek = studentDaysOffered / (daysToDate / 7d)
		//		};
		//	})
		//	.ToList();
	}

	public async Task<List<StaffSummaryViewModel>> GetStaffingSummaryAsync(short schoolYear, Quarter quarter, Guid organizationGuid = default)
	{
		var staffingSummary = await _grantContext
			.InstructorSchoolYears
			.Where(ssy => ssy.OrganizationYear.Year.SchoolYear == schoolYear //match school year
				&& ssy.OrganizationYear.Year.Quarter == quarter //match quarter if it != null, otherwise give all quarters
				&& (ssy.OrganizationYear.OrganizationGuid == organizationGuid || (organizationGuid == Guid.Empty && _identity.Claim == IdentityClaim.Administrator)) //match organization unless org is null and user is an admin
			)
			.Include(isy => isy.Instructor)
			.Include(isy => isy.Status)
			.Include(isy => isy.OrganizationYear).ThenInclude(oy => oy.Organization)
			.Select(isy => new
			{
				InstructorSchoolYearGuid = isy.InstructorSchoolYearGuid,
				OrganizationName = isy.OrganizationYear.Organization.Name,
				isy.Instructor.FirstName,
				isy.Instructor.LastName,
				isy.Status.Label
			})
			.ToListAsync();

		return staffingSummary
			.GroupBy(isy => isy.Label,
				isy => isy,
				(status, instructors) => new StaffSummaryViewModel()
				{
					Status = status,
					Instructors = instructors.Select(i => new StaffSummaryViewModel.InstructorViewModel()
					{
						InstructorSchoolYearGuid = i.InstructorSchoolYearGuid,
						OrganizationName = i.OrganizationName,
						FirstName = i.FirstName.Trim(),
						LastName = i.LastName.Trim()
					})
					.ToList()
				})
			.ToList();
	}

	//this might be better served with a student as the base then the hours/days for each activity in a list for each student.
	public async Task<List<StudentSummaryViewModel>> GetStudentSummaryAsync(DateOnly startDate, DateOnly endDate, Guid organizationGuid = default)
	{
		Stopwatch timer = new();
		timer.Start();

		Debug.WriteLine($"Sent off ReportQuery_Core.- {timer.ElapsedMilliseconds}.");
		await _grantContext.Database.ExecuteSqlInterpolatedAsync($"ReportQuery_Core {_processGuid}, {$"{startDate.Year}-{startDate.Month}-{startDate.Day}"}, {$"{endDate.Year}-{endDate.Month}-{endDate.Day}"}, {organizationGuid}");
		Debug.WriteLine($"Finished ReportQuery_Core = {timer.ElapsedMilliseconds}.");

		//
		//Task<List<TotalStudentAttendanceViewModel>> totalStudentAttendanceQueryTask = _grantContext.QueryModelStudentAttendance.FromSqlInterpolated($"EXEC ReportQuery_Core {_processGuid}, {startDate}, {endDate}").AsNoTracking().ToListAsync();
		Debug.WriteLine($"Sent off ReportQuery_StudentSurvey.- {timer.ElapsedMilliseconds}.");
		Task<List<StudentSummaryViewModel>> studentSurveyQueryTask = _grantContext.ReportStudentSurvey.FromSqlInterpolated($"EXEC ReportQuery_StudentSurvey {_processGuid}").AsNoTracking().ToListAsync();

		//
		var studentSummary = await studentSurveyQueryTask;

		Debug.WriteLine($"Finished ReportQuery_StudentSurvey = {timer.ElapsedMilliseconds}.");


		Debug.WriteLine($"Sent off ReportQuery_Cleanup.- {timer.ElapsedMilliseconds}.");
		await _grantContext.Database.ExecuteSqlInterpolatedAsync($"EXEC ReportQuery_Cleanup {_processGuid}");
		Debug.WriteLine($"Finished ReportQuery_Cleanup = {timer.ElapsedMilliseconds}.");

		return studentSummary;
		/*
		var studentSummary = await _grantContext
			.StudentAttendanceRecords
			.Where(sa => (sa.StudentSchoolYear.OrganizationYear.OrganizationGuid == organizationGuid || (organizationGuid == Guid.Empty && _identity.Claim == IdentityClaim.Administrator))
			&& (startDate <= sa.AttendanceRecord.InstanceDate && sa.AttendanceRecord.InstanceDate <= endDate)) //match organization unless org is null and user is an admin
			.Include(sa => sa.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
			.Include(sa => sa.StudentSchoolYear).ThenInclude(ssy => ssy.OrganizationYear).ThenInclude(oy => oy.Organization)
			.Include(sa => sa.TimeRecords)
			.Include(sa => sa.AttendanceRecord).ThenInclude(ar => ar.Session).ThenInclude(ar => ar.Activity)
			.Select(sa => new
			{
				Activity = sa.AttendanceRecord.Session.Activity.Label,
				AttendanceRecord = sa
			})
			.ToListAsync();


		return studentSummary
			.GroupBy(ss => new { ss.Activity, ss.AttendanceRecord.StudentSchoolYear.Student.MatricNumber },
			ss => ss.AttendanceRecord,
			(studentActivity, record) => {
				var studentSchoolYear = record.ElementAt(0).StudentSchoolYear;
				return new StudentSummaryViewModel()
				{
					Activity = studentActivity.Activity,
					Student = new StudentSummaryViewModel.StudentViewModel()
					{
						OrganizationName = studentSchoolYear.OrganizationYear.Organization.Name,
						FirstName = studentSchoolYear.Student.FirstName,
						LastName = studentSchoolYear.Student.LastName,
						MatricNumber = studentSchoolYear.Student.MatricNumber,
						Grade = studentSchoolYear.Grade
					},
					TotalDays = record.DistinctBy(r => r.AttendanceRecord.InstanceDate).Count(),
					TotalHours = record.SelectMany(ar => ar.TimeRecords).Sum(tr => ((tr.ExitTime - tr.EntryTime).Minutes / 60d))
				};
			})
			.ToList();
	}*/
}