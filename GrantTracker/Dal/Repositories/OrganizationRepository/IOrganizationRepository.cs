using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema.Sprocs;

namespace GrantTracker.Dal.Repositories.OrganizationRepository;

public interface IOrganizationRepository
{
	Task<List<OrganizationYearView>> GetOrganizationYearsAsync();
	Task<OrganizationView> GetYearsAsync(Guid organizationGuid);
	Task<OrganizationYearView> GetOrganizationYearAsync(Guid organizationYearGuid);
	Task<List<Organization>> GetOrganizationsAsync(Guid yearGuid);
	Task<List<OrganizationView>> GetOrganizationsAsync();
    Task<List<OrganizationBlackoutDate>> GetBlackoutDatesAsync(Guid? organizationGuid = null);
    Task<List<StudentDaysAttendedDTO>> GetStudentDaysAttendedAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null);

    Task<List<OrganizationAttendanceGoal>> GetAttendanceGoalsAsync(DateOnly date);
    Task<OrganizationAttendanceGoal> GetAttendanceGoalAsync(Guid organizationGuid, DateOnly date);
    Task<List<RegularAttendeeDate>> GetRegularAttendeeThresholdDatesAsync(DateOnly startDate, DateOnly endDate, Guid? organizationGuid = null);

    Task<Guid> CreateOrganizationAttendanceGoalAsync(OrganizationAttendanceGoal goal);
    Task AddBlackoutDateAsync(Guid OrganizationGuid, DateOnly BlackoutDate);

    Task AlterOrganizationAttendanceGoalAsync(Guid attendanceGoalGuid, OrganizationAttendanceGoal goal);

    Task DeleteOrganizationAttendanceGoalAsync(Guid attendanceGoalGuid);
    Task DeleteBlackoutDateAsync(Guid BlackoutDateGuid);
    Task DeleteOrganizationAsync(Guid OrganizationGuid);

}
