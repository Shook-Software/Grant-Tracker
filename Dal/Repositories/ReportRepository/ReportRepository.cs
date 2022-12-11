using Microsoft.EntityFrameworkCore;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using GrantTracker.Dal.Repositories.DevRepository;

namespace GrantTracker.Dal.Repositories.ReportRepository
{
	public class ReportRepository : RepositoryBase, IReportRepository
	{
		public ReportRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext)
			: base(devRepository, httpContext, grantContext)
		{
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
			var attendanceRecordsByOrg = await _grantContext
				.AttendanceRecords
				.Where(ar => startDate.CompareTo(ar.InstanceDate) <= 0 && endDate.CompareTo(ar.InstanceDate) >= 0)
				.Include(ar => ar.Session).ThenInclude(s => s.OrganizationYear).ThenInclude(oy => oy.Year)
				.Include(ar => ar.Session).ThenInclude(s => s.OrganizationYear).ThenInclude(oy => oy.Organization)
				.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.FamilyAttendance)
				.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
				.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.TimeRecords)
				.ToListAsync();

			return attendanceRecordsByOrg
				.GroupBy(ar => ar.Session.OrganizationYear.Organization.Name,
				ar => ar,
				(orgName, ar) => new
				{
					OrganizationName = orgName,
					AttendanceRecords = ar.ToList()
				})
				.Select(ar => {

					var attendanceRecords = ar.AttendanceRecords;
					var studentAttendance = attendanceRecords.SelectMany(ar => ar.StudentAttendance);
					int studentDaysOffered = attendanceRecords.DistinctBy(ar => ar.InstanceDate).Count();
					int daysToDate = endDate.DayNumber - startDate.DayNumber;
					double attendanceHours = studentAttendance.Select(sa => sa.TimeRecords.Sum(time => (time.ExitTime - time.EntryTime).TotalHours)).Sum();

					int regularStudentCount = attendanceRecords
						.SelectMany(ar => ar.StudentAttendance,
						(ar, sa) => new
						{
							ar.InstanceDate,
							sa.StudentSchoolYearGuid
						})
						.GroupBy(instance => instance.StudentSchoolYearGuid,
							instance => instance.InstanceDate,
							(ssyGuid, dates) => dates
						)
						.Where(dates => dates.Count() >= 30)
						.Count();

					return new ProgramViewModel
					{
						OrganizationName = ar.OrganizationName,
						RegularStudentCount = regularStudentCount,
						FamilyAttendanceCount = studentAttendance.SelectMany(sa => sa.FamilyAttendance).Count(),
						StudentDaysOfferedCount = studentDaysOffered,
						AvgStudentAttendHoursPerWeek = attendanceHours / (daysToDate / 7d), //this must change to year end date when it is reached.. or should it?
						AvgStudentAttendDaysPerWeek = studentDaysOffered / (daysToDate / 7d)
					};
				})
				.ToList();
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
		}
	}
}
