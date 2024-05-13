using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using Microsoft.EntityFrameworkCore;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Models.Views;
using System.ComponentModel;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace GrantTracker.Dal.Repositories.DropdownRepository;

public class DropdownRepository : IDropdownRepository
{
    private readonly GrantTrackerContext _grantContext;
    private readonly IDevRepository _devRepository;

    private async Task<List<DropdownOption>> GetDropdownOptionsAsync<T>(DbSet<T> table, bool filterInactive = true) where T : class, IDropdownOption
    {
        return await table
            .AsNoTracking()
            .Where(t => !filterInactive || (t.DeactivatedAt == null || t.DeactivatedAt > DateTime.Now))
            .Select(t => new DropdownOption
            {
                Guid = t.Guid,
                Abbreviation = t.Abbreviation,
                Label = t.Label,
                Description = t.Description,
                DeactivatedAt = t.DeactivatedAt
            })
            .OrderBy(t => t.Abbreviation ?? t.Label)
            .ToListAsync();
    }

    public DropdownRepository(IDevRepository devRepository, GrantTrackerContext grantContext)
    {
        _devRepository = devRepository;
        _grantContext = grantContext;
    }

    public async Task<SessionDropdownOptions> GetAllSessionDropdownOptionsAsync(bool filterInactive = true)
    {
        return new SessionDropdownOptions()
        {
            SessionTypes = await GetDropdownOptionsAsync(_grantContext.SessionTypes, filterInactive),
            Activities = await GetDropdownOptionsAsync(_grantContext.Activities, filterInactive),
            Objectives = await GetDropdownOptionsAsync(_grantContext.Objectives, filterInactive),
            FundingSources = await GetDropdownOptionsAsync(_grantContext.FundingSources, filterInactive),
            OrganizationTypes = await GetDropdownOptionsAsync(_grantContext.OrganizationTypes, filterInactive),
            PartnershipTypes = await GetDropdownOptionsAsync(_grantContext.Partnerships, filterInactive)
        };
    }

    public async Task<DropdownOptions> GetAllDropdownOptionsAsync(bool filterInactive = false)
    {
        return new DropdownOptions()
        {
            SessionTypes = await GetDropdownOptionsAsync(_grantContext.SessionTypes, filterInactive),
            Activities = await GetDropdownOptionsAsync(_grantContext.Activities, filterInactive),
            Objectives = await GetDropdownOptionsAsync(_grantContext.Objectives, filterInactive),
            InstructorStatuses = await GetDropdownOptionsAsync(_grantContext.InstructorStatuses, filterInactive),
            FundingSources = await GetDropdownOptionsAsync(_grantContext.FundingSources, filterInactive),
            OrganizationTypes = await GetDropdownOptionsAsync(_grantContext.OrganizationTypes, filterInactive),
            PartnershipTypes = await GetDropdownOptionsAsync(_grantContext.Partnerships, filterInactive),
            Grades = await GetGradesAsync()
        };
    }

    public async Task<List<DropdownOption>> GetInstructorStatusesAsync(bool filterInactive = true)
    {
        return await GetDropdownOptionsAsync(_grantContext.InstructorStatuses, filterInactive);
    }

    public async Task<List<DropdownOption>> GetGradesAsync()
    {
        var grades = await _grantContext.LookupDefinitions
            .AsNoTracking()
            .Include(def => def.Values)
            .Where(def => def.Name == "Grade")
            .Select(def => new List<LookupValue>(def.Values))
            .FirstOrDefaultAsync();

        return grades.Select(grade => new DropdownOption()
        {
            Guid = grade.Guid,
            Abbreviation = grade.Value,
            Label = grade.Description,
            Description = ""
        })
        .OrderBy(g => g.Abbreviation, new SemiNumericComparer())
        .ToList();
    }

    //Used solely for dropdown selections
    public async Task<List<OrganizationView>> GetOrganizationsAsync(bool UserIsAdmin, List<Guid> HomeOrganizationGuids)
    {
        //Coordinators only receive their organization, administrators receive the full list
        var organizations = await _grantContext
            .Organizations
            .AsNoTracking()
                .Where(org => UserIsAdmin || HomeOrganizationGuids.Contains(org.OrganizationGuid))
                .OrderBy(org => org.Name)
            .ToListAsync();

        return organizations.Select(OrganizationView.FromDatabase).ToList();
    }

    public async Task<List<YearView>> GetYearsAsync(Guid? organizationGuid = null)
    {
        var years = await _grantContext
            .Organizations
            .AsNoTracking()
            .Where(org => organizationGuid == null || org.OrganizationGuid == organizationGuid)
            .Include(org => org.Years).ThenInclude(oy => oy.Year)
            .SelectMany(org => org.Years)
            .Select(oy => oy.Year)
            .ToListAsync();

        return years.Select(YearView.FromDatabase).ToList();
    }

    public async Task CreateAsync(DropdownOptionType optionType, DropdownOption option)
    {
        //I know, I know. This is stupid. I should've folded all dropdown options into LookupDefinition/Value from the start.
        IInfrastructure<InternalEntityEntry> _ = optionType switch
        {
            DropdownOptionType.Activity => _grantContext.Activities.Add(option.Convert<Activity>()),
            DropdownOptionType.Objective => _grantContext.Objectives.Add(option.Convert<Objective>()),
            DropdownOptionType.FundingSource => _grantContext.FundingSources.Add((FundingSource)option),
            DropdownOptionType.InstructorStatus => _grantContext.InstructorStatuses.Add((InstructorStatus)option),
            DropdownOptionType.OrganizationType => _grantContext.OrganizationTypes.Add((OrganizationType)option),
            DropdownOptionType.PartnershipType => _grantContext.Partnerships.Add((PartnershipType)option),
            DropdownOptionType.SessionType => _grantContext.SessionTypes.Add((SessionType)option),
            _ => throw new InvalidEnumArgumentException()
        };

        await _grantContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(DropdownOptionType optionType, DropdownOption option)
    {
        IInfrastructure<InternalEntityEntry> _ = optionType switch
        {
            DropdownOptionType.Activity => _grantContext.Activities.Update(option.Convert<Activity>()),
            DropdownOptionType.Objective => _grantContext.Objectives.Update(option.Convert<Objective>()),
            DropdownOptionType.FundingSource => _grantContext.FundingSources.Update((FundingSource)option),
            DropdownOptionType.InstructorStatus => _grantContext.InstructorStatuses.Update((InstructorStatus)option),
            DropdownOptionType.OrganizationType => _grantContext.OrganizationTypes.Update((OrganizationType)option),
            DropdownOptionType.PartnershipType => _grantContext.Partnerships.Update((PartnershipType)option),
            DropdownOptionType.SessionType => _grantContext.SessionTypes.Update((SessionType)option),
            _ => throw new InvalidEnumArgumentException()
        };

        await _grantContext.SaveChangesAsync();
    }

    //no delete, the update can be updated with a DeactivatedAt date if needed.
}