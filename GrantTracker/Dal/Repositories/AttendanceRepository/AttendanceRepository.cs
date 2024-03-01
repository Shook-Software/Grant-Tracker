using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Dto.Attendance;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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

    public async Task<List<AttendanceConflict>> ValidateStudentAttendanceAsync(DateOnly instanceDate, List<StudentAttendanceDto> studentAttendance, Guid? ignoredAttendanceGuid = default)
    {
        List<AttendanceConflict> validationErrors = new();

        var existingAttendanceOnDay = await _grantContext
            .AttendanceRecords
            .Where(ar => ar.InstanceDate == instanceDate)
            .Where(ar => ar.Guid != ignoredAttendanceGuid)
            .Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
            .Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.StudentSchoolYear)
            .ToListAsync();

        var existingStudentAttendance = existingAttendanceOnDay
            .Where(ar => ar.StudentAttendance.Any(sa => studentAttendance.Any(record => sa.StudentSchoolYearGuid == record.Id)))
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
                foreach (SessionTimeSchedule newTime in newAttendance.Times)
                    if (HasTimeConflict(existingTime, newTime))
                    {
                        //check how the ui looks if someone conflicts every student registration on an attempted copy
                        AttendanceConflict conflict = new()
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

    private static bool HasTimeConflict(StudentAttendanceTimeRecord existingTimeSchedule, SessionTimeSchedule newTimeSchedule)
    {
		bool timesPartiallyOverlap = existingTimeSchedule.EntryTime < newTimeSchedule.EndTime && existingTimeSchedule.ExitTime > newTimeSchedule.StartTime;
		bool timesFullyOverlap = existingTimeSchedule.EntryTime == newTimeSchedule.StartTime && existingTimeSchedule.ExitTime == newTimeSchedule.EndTime;

		return timesPartiallyOverlap || timesFullyOverlap;
    }
}