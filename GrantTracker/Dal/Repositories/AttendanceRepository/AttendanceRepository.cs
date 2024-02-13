using GrantTracker.Dal.Models.Dto;
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
	public async Task<AttendanceViewModel> GetAttendanceRecordAsync(Guid attendanceGuid)
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
			: await query.Include(ar => ar.FamilyAttendance)
				.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
				.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
				.SingleAsync();

        return AttendanceViewModel.FromDatabase(record);
	}

	public async Task<List<SimpleAttendanceViewModel>> GetAttendanceOverviewAsync(Guid sessionGuid)
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
				StudentCount = record.StudentAttendance.Count
			})
			.OrderByDescending(x => x.InstanceDate)
			.ToListAsync();
	}

	public async Task<List<DateOnly>> GetAttendanceDatesAsync(Guid sessionGuid)
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


    public async Task AddAttendanceAsync(AttendanceRecord Record)
	{
		_grantContext.AttendanceRecords.Add(Record);
		await _grantContext.SaveChangesAsync();
	}


    public async Task AddAttendanceAsync(Guid sessionGuid, SessionAttendanceDto sessionAttendance)
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

	public async Task DeleteAttendanceRecordAsync(Guid AttendanceGuid)
	{
		await _grantContext
			 .AttendanceRecords
			 .Where(ar => ar.Guid == AttendanceGuid)
			 .ExecuteDeleteAsync();
    }

	public async Task UpdateAttendanceAsync(Guid attendanceGuid, Guid sessionGuid, SessionAttendanceDto sessionAttendance)
    {
		using var transaction = await _grantContext.Database.BeginTransactionAsync();

		try
		{
            await DeleteAttendanceRecordAsync(attendanceGuid);
            await this.AddAttendanceAsync(sessionGuid, sessionAttendance);

			await transaction.CommitAsync();
        }
		catch (Exception ex)
		{
			await transaction.RollbackAsync();
            throw;
		}
	}
}