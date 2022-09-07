using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Schema;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Repositories.DevRepository
{
	public class DevRepository : IDevRepository
	{
		private readonly GrantTrackerContext _grantContext;

		public DevRepository(GrantTrackerContext grantContext)
		{
			_grantContext = grantContext;
		}

		public async Task AddExceptionLogAsync(Exception exception, UserIdentity requestor)
		{
			if (exception is null)
				return;

			ExceptionLog newLog = new()
			{
				Guid = Guid.NewGuid(),
				InstructorSchoolYearGuid = requestor.UserOrganizationYearGuid,
				Source = exception.Source,
				Message = exception.Message,
				InnerMessage = exception.InnerException?.Message ?? "",
				StackTrace = exception.StackTrace,
				TargetSite = exception.TargetSite.Name,
				DateTime = DateTime.Now
			};

			await _grantContext.AddAsync(newLog);
			await _grantContext.SaveChangesAsync();
		}

		public async Task<List<ExceptionLogView>> GetExceptionLogsAsync()
		{
			var domainLogs = await _grantContext.ExceptionLogs
				.Include(log => log.InstructorSchoolYear).ThenInclude(rsy => rsy.Identity)
				.Include(log => log.InstructorSchoolYear).ThenInclude(rsy => rsy.Instructor)
				.Include(log => log.InstructorSchoolYear).ThenInclude(rsy => rsy.OrganizationYear).ThenInclude(oy => oy.Organization)
				.OrderBy(log => log.DateTime)
				.ToListAsync();

			return domainLogs
				.Select(ExceptionLogView.FromDatabase)
				.ToList();
		}
	}
}