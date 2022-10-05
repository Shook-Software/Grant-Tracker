using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Repositories.AttendanceRepository
{
	public class AttendanceRepository : RepositoryBase, IAttendanceRepository
	{

		public AttendanceRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext)
			: base(devRepository, httpContext, grantContext)
		{

		}

		//needs auth fix
		public async Task<List<AttendanceViewModel>> GetAttendanceRecordsAsync(Guid sessionGuid)
		{
			var records = await _grantContext
				.AttendanceRecords
				.AsNoTracking()
				.Where(record => record.SessionGuid == sessionGuid)
				.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.StudentSchoolYear).ThenInclude(ssy => ssy.Student)
				.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.TimeRecords)
				.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.FamilyAttendance)
				.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.InstructorSchoolYear).ThenInclude(isy => isy.Instructor)
				.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.InstructorSchoolYear).ThenInclude(isy => isy.Status)
				.Include(ar => ar.InstructorAttendance).ThenInclude(ia => ia.TimeRecords)
				.ToListAsync();

			return records.Select(AttendanceViewModel.FromDatabase).ToList();
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

		public async Task AddAttendanceAsync(Guid sessionGuid, SessionAttendanceDto sessionAttendance)
		{
			await UseDeveloperLog(async () =>
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
						.Select(i => {
							Guid studentAttendanceRecordGuid = Guid.NewGuid();
							return new StudentAttendanceRecord()
							{
								Guid = studentAttendanceRecordGuid,
								StudentSchoolYearGuid = i.StudentSchoolYearGuid,
								AttendanceRecordGuid = attendanceGuid,
								TimeRecords = i.Attendance
								.Select(time => new StudentAttendanceTimeRecord()
								{
									Guid = Guid.NewGuid(),
									StudentAttendanceRecordGuid = studentAttendanceRecordGuid,
									EntryTime = time.StartTime,
									ExitTime = time.EndTime
								})
								.ToList()
							};
						})
					.ToList()
				};

				await _grantContext.AttendanceRecords.AddAsync(newAttendanceRecord);
				await _grantContext.SaveChangesAsync();
			});
		}

		public async Task EditAttendanceAsync(Guid attendanceGuid, SessionAttendanceDto sessionAttendance)
		{
			//Remove the existing record and all of it's components
			var existingAttendanceRecord = await _grantContext
				.AttendanceRecords
				.Include(ar => ar.StudentAttendance).ThenInclude(sa => sa.FamilyAttendance)
				.Include(ar => ar.InstructorAttendance)
				.Where(ar => ar.Guid == attendanceGuid)
				.FirstAsync();

			_grantContext.RemoveRange(existingAttendanceRecord.StudentAttendance.SelectMany(sa => sa.FamilyAttendance).ToList()); 

			if (existingAttendanceRecord.InstructorAttendance != null && existingAttendanceRecord.InstructorAttendance.Count > 0)
				_grantContext.RemoveRange(existingAttendanceRecord.InstructorAttendance);

			if (existingAttendanceRecord.StudentAttendance != null && existingAttendanceRecord.StudentAttendance.Count > 0)
				_grantContext.RemoveRange(existingAttendanceRecord.StudentAttendance);

			try
			{
				_grantContext.Remove(existingAttendanceRecord);

				await this.AddAttendanceAsync(sessionAttendance.SessionGuid, sessionAttendance);
			}
			catch (Exception e)
			{
				//re-add data if the call fails, as to not entirely lose the record without recourse.
				await _grantContext.AddAsync(existingAttendanceRecord);
				await _grantContext.SaveChangesAsync();
				throw;
			}
		}
	}
}