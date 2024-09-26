using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Models.DTO.Attendance;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ClosedXML.Excel;
using System.Runtime.Intrinsics.X86;
using DocumentFormat.OpenXml.Spreadsheet;

namespace GrantTracker.Dal.Repositories.AttendanceRepository;

public class AttendanceRepository : IAttendanceRepository
{
    protected readonly GrantTrackerContext _grantContext;
    protected readonly ClaimsPrincipal _user;

    public AttendanceRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContextAccessor)
	{
        _grantContext = grantContext;
        _user = httpContextAccessor.HttpContext.User;
    }

    private static bool HasTimeConflict(StudentAttendanceTimeRecord existingTimeSchedule, AttendTimeSchedule newTimeSchedule)
    {

        bool timesPartiallyOverlap = existingTimeSchedule.EntryTime < newTimeSchedule.EndTime && existingTimeSchedule.ExitTime > newTimeSchedule.StartTime;
        bool timesFullyOverlap = existingTimeSchedule.EntryTime == newTimeSchedule.StartTime && existingTimeSchedule.ExitTime == newTimeSchedule.EndTime;

        return timesPartiallyOverlap || timesFullyOverlap || newTimeSchedule.StartTime == newTimeSchedule.EndTime;
    }

    //needs auth fix
    public async Task<AttendanceViewModel> GetAsync(Guid attendanceGuid)
	{
		var session = await _grantContext
			.AttendanceRecords
			.AsNoTracking()
			.Where(ar => ar.Guid == attendanceGuid)
			.Include(ar => ar.Session).ThenInclude(s => s.SessionType)
			.Select(ar => ar.Session)
			.FirstAsync();

		var query = _grantContext
			.AttendanceRecords
			.AsNoTracking()
			.Where(record => record.Guid == attendanceGuid)
			.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
			.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.InstructorSchoolYear).ThenInclude(isy => isy.Status)
			.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.TimeRecords);

		AttendanceRecord record = session.SessionType.Label == "Parent"
			? await query
				.Include(ar => ar.FamilyAttendance).ThenInclude(sa => sa.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
				.SingleAsync()
			: await query.Include(ar => ar.FamilyAttendance).ThenInclude(sa => sa.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
                .Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
				.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
				.SingleAsync();

        return AttendanceViewModel.FromDatabase(record);
	}

	public async Task<List<SimpleAttendanceViewModel>> GetOverviewAsync(Guid sessionGuid) //consider deleting this and just aggregating the above on front end tbh
	{
		return await _grantContext
			.AttendanceRecords
			.AsNoTracking()
			.Where(record => record.SessionGuid == sessionGuid)
			.Select(record => new SimpleAttendanceViewModel()
			{
				AttendanceGuid = record.Guid,
				InstanceDate = record.InstanceDate,
				InstructorCount = record.InstructorAttendance.Count,
				StudentCount = record.StudentAttendance.Count,
				FamilyCount = record.FamilyAttendance.Count
			})
			.OrderByDescending(x => x.InstanceDate)
			.ToListAsync();
	}

	public async Task<List<DateOnly>> GetDatesAsync(Guid sessionGuid)
	{
		var attendance = await _grantContext
			.AttendanceRecords
			.AsNoTracking()
			.Where(sar => sar.SessionGuid == sessionGuid)
			.Select(sar => sar.InstanceDate)
			.ToListAsync();

		return attendance
			.Distinct()
			.ToList();
	}

    public async Task AddAsync(AttendanceRecord Record)
	{
		_grantContext.AttendanceRecords.Add(Record);
		await _grantContext.SaveChangesAsync();
	}

    public async Task AddAsync(Guid sessionGuid, SessionAttendanceDto sessionAttendance)
	{
		//neither of these two should ever happen
		foreach (var record in sessionAttendance.StudentRecords)
		{
			if (record.Id == Guid.Empty)
				throw new ArgumentException("One of the records contained an empty StudentSchoolYearGuid. StudentSchoolYearGuid cannot be empty.", nameof(sessionAttendance));
		}

		foreach (var record in sessionAttendance.InstructorRecords)
		{
			if (record.Id == Guid.Empty)
				throw new ArgumentException("One of the records contained an empty InstructorSchoolYearGuid. InstructorSchoolYearGuid cannot be empty.", nameof(sessionAttendance));
		}


        Guid attendanceGuid = Guid.NewGuid();
        List<FamilyAttendanceRecord> familyAttendance = new();

		sessionAttendance.StudentRecords
			.ForEach(sr =>
			{
				sr.FamilyAttendance.ForEach(fa =>
				{
					for (int count = 0; count < fa.Count; count++)
						familyAttendance.Add(new FamilyAttendanceRecord()
						{
							Guid = Guid.NewGuid(),
							AttendanceRecordGuid = attendanceGuid,
							StudentSchoolYearGuid = sr.Id,
							FamilyMember = fa.FamilyMember
						});
				});
			});

        var newAttendanceRecord = new AttendanceRecord()
		{
			Guid = attendanceGuid,
			SessionGuid = sessionGuid,
			InstanceDate = sessionAttendance.Date,
			InstructorAttendance = sessionAttendance.InstructorRecords
			.Select(i => {
				Guid instructorAttendanceRecordGuid = Guid.NewGuid();
				return new InstructorAttendanceRecord()
				{
					Guid = instructorAttendanceRecordGuid,
					InstructorSchoolYearGuid = i.Id,
					AttendanceRecordGuid = attendanceGuid,
					IsSubstitute = i.IsSubstitute,
					TimeRecords = i.Times
					.Select(time => new InstructorAttendanceTimeRecord()
					{
						Guid = Guid.NewGuid(),
						InstructorAttendanceRecordGuid = instructorAttendanceRecordGuid,
						EntryTime = time.StartTime,
						ExitTime = time.EndTime
					})
					.ToList()
				};
			})
			.ToList(),
			StudentAttendance = sessionAttendance.StudentRecords
				.Where(sr => sr.Times.Any())
				.Select(sr => {
					Guid studentAttendanceRecordGuid = Guid.NewGuid();

                    return new StudentAttendanceRecord()
					{
						Guid = studentAttendanceRecordGuid,
						StudentSchoolYearGuid = sr.Id,
						AttendanceRecordGuid = attendanceGuid,
						TimeRecords = sr.Times.Select(time => new StudentAttendanceTimeRecord()
						{
							Guid = Guid.NewGuid(),
							StudentAttendanceRecordGuid = studentAttendanceRecordGuid,
							EntryTime = time.StartTime,
							ExitTime = time.EndTime
						})
						.ToList(),
					};
				})
			.ToList(),
			FamilyAttendance = familyAttendance
        };

		await _grantContext.AddAsync(newAttendanceRecord);
		_grantContext.SaveChanges();
	}

	public async Task DeleteAsync(Guid AttendanceGuid)
	{
		await _grantContext
			 .AttendanceRecords
			 .Where(ar => ar.Guid == AttendanceGuid)
			 .ExecuteDeleteAsync();
    }

	public async Task UpdateAsync(Guid attendanceGuid, Guid sessionGuid, SessionAttendanceDto sessionAttendance)
    {
		using var transaction = await _grantContext.Database.BeginTransactionAsync();

		try
		{
            await DeleteAsync(attendanceGuid);
            await this.AddAsync(sessionGuid, sessionAttendance);

			await transaction.CommitAsync();
        }
		catch (Exception ex)
		{
			await transaction.RollbackAsync();
            throw;
		}
	}

	public async Task<List<AttendanceIssueDTO>> GetIssuesAsync(Guid organizationGuid) => [.. (await _grantContext
		.AttendanceRecords
		.Include(ar => ar.Session)
		.Include(ar => ar.StudentAttendance).ThenInclude(sar => sar.StudentSchoolYear)
		.Where(ar => ar.Session.OrganizationYear.OrganizationGuid == organizationGuid)
		.Where(ar => ar.StudentAttendance.Any(sa => sa.TimeRecords.Any(tr => tr.EntryTime == tr.ExitTime || tr.EntryTime > tr.ExitTime)))
		.SelectMany(ar => ar.StudentAttendance, (ar, sar) => new AttendanceIssueDTO
		{
			SessionGuid = ar.SessionGuid,
			AttendanceGuid = ar.Guid,
			InstanceDate = ar.InstanceDate,
			SessionName = ar.Session.Name,
			Type = AttendanceIssue.Malformed,
			Message = $"{(sar.TimeRecords.Any(tr => tr.EntryTime == tr.ExitTime) ? "Some student time records have equivalent start and end times.\n" : "")}" +
			$"{(sar.TimeRecords.Any(tr => tr.EntryTime > tr.ExitTime) ? "Some student time records have a start time later than their end time.\n" : "")}"
		})
		.ToListAsync())
        .DistinctBy(x => x.AttendanceGuid)
        .OrderBy(x => x.SessionName).ThenBy(x => x.InstanceDate)];

    public async Task<List<AttendanceInputConflict>> ValidateStudentAttendanceAsync(DateOnly instanceDate, List<StudentAttendanceDto> studentAttendance, Guid? ignoredAttendanceGuid = default)
    {
        List<AttendanceInputConflict> validationErrors = new();

        var existingAttendanceOnDay = await _grantContext
            .AttendanceRecords
            .Where(ar => ar.InstanceDate == instanceDate)
            .Where(ar => ar.Guid != ignoredAttendanceGuid)
            .Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
            .Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.StudentSchoolYear)
            .ToListAsync();

        var existingStudentAttendance = existingAttendanceOnDay
            .Where(ar => ar.StudentAttendance.Any(sa => studentAttendance.Any(record => sa.StudentSchoolYearGuid == record.Id)))
            .Where(ar => ar.Guid != ignoredAttendanceGuid)
            .SelectMany(ar => ar.StudentAttendance)
            .Where(sa => studentAttendance.Any(record => sa.StudentSchoolYearGuid == record.Id))
            .ToList();

        foreach (StudentAttendanceDto newAttendance in studentAttendance)
        {
            List<StudentAttendanceTimeRecord> existingAttendance = existingStudentAttendance
                .Where(sa => sa.StudentSchoolYearGuid == newAttendance.Id)
                .SelectMany(sa => sa.TimeRecords)
                .ToList();

            foreach (StudentAttendanceTimeRecord existingTime in existingAttendance)
            {
                foreach (AttendTimeSchedule newTime in newAttendance.Times)
                    if (HasTimeConflict(existingTime, newTime))
                    {
                        //check how the ui looks if someone conflicts every student registration on an attempted copy
                        AttendanceInputConflict conflict = new()
                        {
                            StudentSchoolYearGuid = newAttendance.Id,
							StartTime = existingTime.EntryTime,
							ExitTime = existingTime.ExitTime
                        };
                        validationErrors.Add(conflict);
                    }
            }
        }

        return validationErrors;
    }

	public async Task<XLWorkbook> CreateExcelExportAsync(Guid sessionGuid, DateOnly startDate, DateOnly endDate)
	{
		Session session = await _grantContext.Sessions
			.AsNoTracking()
			.Where(s => s.SessionGuid == sessionGuid)
			.Include(s => s.DaySchedules).ThenInclude(ds => ds.TimeSchedules)
			.Include(s => s.OrganizationYear).ThenInclude(oy => oy.Organization)
			.Include(s => s.OrganizationYear).ThenInclude(oy => oy.Year)
			.Include(s => s.InstructorRegistrations).ThenInclude(ir => ir.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
			.FirstAsync();

		List<AttendanceRecord> attendanceRecords = await _grantContext.AttendanceRecords
			.Where(ar => ar.SessionGuid == sessionGuid)
			.Where(ar => ar.InstanceDate >= startDate && ar.InstanceDate <= endDate)
			.Include(ar => ar.StudentAttendance)
			.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
            .ToListAsync();

		List<Guid> studentSchoolYearGuids = attendanceRecords.SelectMany(ar => ar.StudentAttendance).Select(sa => sa.StudentSchoolYearGuid).Distinct().ToList();

		List<StudentSchoolYear> studentSchoolYears = await _grantContext.StudentSchoolYears
			.Where(ssy => studentSchoolYearGuids.Contains(ssy.StudentSchoolYearGuid))
			.Include(ssy => ssy.Student)
            .OrderBy(ssy => ssy.Student.LastName).ThenBy(ssy => ssy.Student.FirstName)
            .ToListAsync();

		XLWorkbook workbook = new();

		IXLWorksheet worksheet = workbook.Worksheets.Add($"{startDate.ToDateTime(new TimeOnly()):yyyy-MM-dd}-to-{endDate.ToDateTime(new TimeOnly()):yyyy-MM-dd}");

        void addTitle(string cell, string value)
        {
            worksheet.Cell(cell).Value = value;
            worksheet.Cell(cell).Style.Font.Bold = true;
        }

		worksheet.Column("A").Width = 20;
        worksheet.Column("B").Width = 20;
        worksheet.Column("C").Width = 20;
        worksheet.Column("D").Width = 20;

        addTitle("A1", "Site Name");
		worksheet.Cell("B1").Value = session.OrganizationYear.Organization.Name;

        addTitle("A2", "Semester");
        worksheet.Cell("B2").Value = $"{session.OrganizationYear.Year.Quarter.ToDisplayString()} {session.OrganizationYear.Year.SchoolYear}";

        addTitle("A3", "Date Range");
        worksheet.Cell("B3").Value = $"Start: {startDate.ToShortDateString()}";
        worksheet.Cell("C3").Value = $"End: {endDate.ToShortDateString()}";

        addTitle("A4", "Session Name");
        worksheet.Cell("B4").Value = session.Name;

        addTitle("A5", "Days of the Week");
        addTitle("A6", "Start - End Time(s)");
        foreach (var (day, idx) in session.DaySchedules.OrderBy(day => day.DayOfWeek).Select((day, idx) => (day, idx)))
        {
            worksheet.Cell($"{(char)('B' + idx)}5").Value = day.DayOfWeek.ToString();
			worksheet.Cell($"{(char)('B' + idx)}6").Value = day.TimeSchedules
				.OrderBy(ts => ts.StartTime)
				.Aggregate("", (agg, schedule) => $"{agg}{(schedule == day.TimeSchedules.OrderBy(ts => ts.StartTime).First() ? "" : Environment.NewLine)}{schedule.StartTime.ToShortTimeString()} - {schedule.EndTime.ToShortTimeString()}");
        }

        addTitle("A7", "Instructor Name(s)");

		List<Instructor> registeredInstructors = session.InstructorRegistrations
			.Select(ir => ir.InstructorSchoolYear.Instructor)
			.DistinctBy(i => i.PersonGuid)
			.ToList();

		foreach (var (instructor, idx) in registeredInstructors.Select((ri, idx) => (ri, idx)))
		{
			worksheet.Cell($"{(char)('B' + idx)}7").Value = $"{instructor.FirstName} {instructor.LastName}";
        }

        addTitle("A8", "Substitute Name(s)");

        List<Instructor> substitutes = attendanceRecords
            .SelectMany(ar => ar.InstructorAttendance)
            .Where(ia => ia.IsSubstitute)
            .Select(ia => ia.InstructorSchoolYear.Instructor)
            .DistinctBy(i => i.PersonGuid)
            .ToList();

        foreach (var (substitute, idx) in substitutes.Select((s, idx) => (s, idx)))
        {
            worksheet.Cell($"{(char)('B' + idx)}8").Value = $"{substitute.FirstName} {substitute.LastName}";
        }


        addTitle("A10", "Student Last Name");
        addTitle("B10", "Student First Name");
        addTitle("C10", "Matric #");
        addTitle("D10", "Grade");

        foreach (var (attendRecord, idx) in attendanceRecords.OrderBy(ar => ar.InstanceDate).Select((ar, idx) => (ar, idx)))
        {
            worksheet.Column($"{(char)('E' + idx)}").Width = 12;
            addTitle($"{(char)('E' + idx)}10", $"{attendRecord.InstanceDate.DayOfWeek},{Environment.NewLine}{attendRecord.InstanceDate.ToDateTime(new TimeOnly()):MM/dd}");
        }

		foreach (var (studentSY, idx) in studentSchoolYears.Select((ssy, idx) => (ssy, idx)))
        {
			int row = 11 + idx;
			worksheet.Cell($"A{row}").Value = studentSY.Student.LastName;
            worksheet.Cell($"B{row}").Value = studentSY.Student.FirstName;
            worksheet.Cell($"C{row}").Value = studentSY.Student.MatricNumber;
            worksheet.Cell($"D{row}").Value = studentSY.Grade;

            foreach (var (attendRecord, attendIdx) in attendanceRecords.OrderBy(ar => ar.InstanceDate).Select((ar, idx) => (ar, idx)))
            {
				if (attendRecord.StudentAttendance.Any(sa => sa.StudentSchoolYearGuid == studentSY.StudentSchoolYearGuid))
					worksheet.Cell($"{(char)('E' + attendIdx)}{row}").Style.Fill.SetBackgroundColor(XLColor.Black);
            }
        }

        return workbook;
    }
}
