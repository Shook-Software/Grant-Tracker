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
		var record = await _grantContext
			.AttendanceRecords
			.AsNoTracking()
			.Where(record => record.Guid == attendanceGuid)
			.Include(ar => ar.FamilyAttendance)
			.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
			.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
			.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
			.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.InstructorSchoolYear).ThenInclude(isy => isy.Status)
			.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.TimeRecords)
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
			if (record.StudentSchoolYearGuid == Guid.Empty)
				throw new ArgumentException("One of the records contained an empty StudentSchoolYearGuid. StudentSchoolYearGuid cannot be empty.", nameof(sessionAttendance));
		}

		foreach (var record in sessionAttendance.InstructorRecords)
		{
			if (record.InstructorSchoolYearGuid == Guid.Empty)
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
							StudentSchoolYearGuid = sr.StudentSchoolYearGuid,
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
					InstructorSchoolYearGuid = i.InstructorSchoolYearGuid,
					AttendanceRecordGuid = attendanceGuid,
					IsSubstitute = i.IsSubstitute,
					TimeRecords = i.Attendance
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
						StudentSchoolYearGuid = sr.StudentSchoolYearGuid,
						AttendanceRecordGuid = attendanceGuid,
						TimeRecords = sr.Attendance.Select(time => new StudentAttendanceTimeRecord()
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

		await _grantContext.AttendanceRecords.AddAsync(newAttendanceRecord);
		await _grantContext.SaveChangesAsync();
	}

	public async Task<AttendanceRecord> DeleteAttendanceRecordAsync(Guid AttendanceGuid)
	{
            //Remove the existing record and all of it's components
        var existingAttendanceRecord = await _grantContext
            .AttendanceRecords
			.Include(ar => ar.FamilyAttendance)
            .Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
            .Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.TimeRecords)
            .Where(ar => ar.Guid == AttendanceGuid)
            .FirstAsync();

        _grantContext.FamilyAttendances.RemoveRange(existingAttendanceRecord.FamilyAttendance.ToList());
        _grantContext.InstructorAttendanceTimeRecords.RemoveRange(existingAttendanceRecord.InstructorAttendance.SelectMany(ia => ia.TimeRecords).ToList());
        _grantContext.InstructorAttendanceRecords.RemoveRange(existingAttendanceRecord.InstructorAttendance.ToList());
        _grantContext.StudentAttendanceTimeRecords.RemoveRange(existingAttendanceRecord.StudentAttendance.SelectMany(sa => sa.TimeRecords).ToList());
        _grantContext.StudentAttendanceRecords.RemoveRange(existingAttendanceRecord.StudentAttendance.ToList());
        _grantContext.AttendanceRecords.Remove(existingAttendanceRecord);
        _grantContext.SaveChanges();

		return existingAttendanceRecord;
    }

	public async Task EditAttendanceAsync(Guid attendanceGuid, SessionAttendanceDto sessionAttendance)
	{
		await this.AddAttendanceAsync(sessionAttendance.SessionGuid, sessionAttendance);
	}
}