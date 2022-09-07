using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;

namespace GrantTracker.Dal.Repositories.AttendanceRepository
{
	public class AttendanceRepository : RepositoryBase, IAttendanceRepository
	{

		public AttendanceRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext)
			: base(devRepository, httpContext, grantContext)
		{

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

				//get student attendance
				var studentRecords = sessionAttendance.StudentRecords
					.Select(s => new StudentAttendance()
					{
						StudentSchoolYearGuid = s.StudentSchoolYearGuid,
						SessionGuid = sessionGuid,
						MinutesAttended = (short)s.Attendance.Aggregate(0, (sum, current) => sum + (int)(current.EndTime - current.StartTime).TotalMinutes),
						InstanceDate = sessionAttendance.Date
					})
					.ToList();

				//get instructor attendance
				var instructorRecords = sessionAttendance.InstructorRecords
					.Select(s => new InstructorAttendance()
					{
						InstructorSchoolYearGuid = s.InstructorSchoolYearGuid,
						SessionGuid = sessionGuid,
						MinutesAttended = (short)s.Attendance.Aggregate(0, (sum, current) => sum + (int)(current.EndTime - current.StartTime).TotalMinutes),
						InstanceDate = sessionAttendance.Date
					})
					.ToList();

				await _grantContext.StudentAttendanceRecords.AddRangeAsync(studentRecords);
				await _grantContext.InstructorAttendanceRecords.AddRangeAsync(instructorRecords);
				await _grantContext.SaveChangesAsync();
			});
		}
	}
}