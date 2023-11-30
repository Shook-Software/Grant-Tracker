using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using GrantTracker.Dal.Repositories.DevRepository;
using Microsoft.EntityFrameworkCore;
using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Dal.Repositories.OrganizationRepository
{
	public class OrganizationRepository : RepositoryBase, IOrganizationRepository
	{
		public OrganizationRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext)
			: base(devRepository, httpContext, grantContext)
		{

		}

		//Used for views, any use for dropdown options will be in DropdownRepo/Controller
		public async Task<List<OrganizationYearView>> GetOrganizationYearsAsync()
		{
			var orgYears = await _grantContext
				.OrganizationYears
				.AsNoTracking()
				.Include(oy => oy.Organization)
				.Include(oy => oy.Year)
				.Where(oy => oy.YearGuid == _currentYearGuid)
				.OrderBy(oy => oy.Organization.Name)
				.ToListAsync();

			return orgYears.Select(OrganizationYearView.FromDatabase).ToList();
		}

        public async Task<OrganizationView> GetYearsAsync(Guid OrganizationGuid)
		{
            if (_identity.Claim != IdentityClaim.Administrator && _identity.Organization.Guid != OrganizationGuid)
                throw new Exception("User is not authorized to view this resource.");

            var organization = await _grantContext
				.Organizations
				.AsNoTracking()
				.Where(org => org.OrganizationGuid == OrganizationGuid)
				.Include(org => org.Years)
				.ThenInclude(oy => oy.Year)
				.SingleAsync();

			return OrganizationView.FromDatabase(organization);
		}

		public async Task<OrganizationYearView> GetOrganizationYearAsync(Guid organizationYearGuid)
		{
			Guid organizationGuid = (await _grantContext.OrganizationYears.FindAsync(organizationYearGuid)).OrganizationGuid;

			if (_identity.Claim != IdentityClaim.Administrator && _identity.Organization.Guid != organizationGuid)
				throw new Exception("User is not authorized to view this resource.");

			var organizationYear = await _grantContext
				.OrganizationYears
				.Where(oy => oy.OrganizationYearGuid == organizationYearGuid)
				.Include(oy => oy.Organization)
				.SingleAsync();

			return OrganizationYearView.FromDatabase(organizationYear);
		}

		public async Task<List<Organization>> GetOrganizationsAsync(Guid yearGuid)
		{
			return await _grantContext
				.OrganizationYears
				.Where(oy => oy.YearGuid == yearGuid)
				.Include(oy => oy.Organization)
				.Select(oy => oy.Organization)
				.ToListAsync();
        }

		//admin only
        public async Task<List<OrganizationView>> GetOrganizationsAsync()
        {
           var organizations = await _grantContext
                .Organizations
                .AsNoTracking()
                .Include(org => org.Years)
                .ThenInclude(oy => oy.Year)
				.OrderBy(o => o.Name)
                .ToListAsync();

			return organizations.Select(OrganizationView.FromDatabase).ToList();
        }

        public async Task<List<OrganizationBlackoutDate>> GetBlackoutDatesAsync(Guid OrganizationGuid)
        {
			return await _grantContext.BlackoutDates.AsNoTracking().Where(x => x.OrganizationGuid == OrganizationGuid).ToListAsync();
        }

        public async Task AddBlackoutDateAsync(Guid OrganizationGuid, DateOnly BlackoutDate)
		{
			_grantContext.BlackoutDates.Add(new OrganizationBlackoutDate()
			{
				OrganizationGuid = OrganizationGuid,
				Date = BlackoutDate
			});

			await _grantContext.SaveChangesAsync();
		}

        public async Task DeleteBlackoutDateAsync(Guid BlackoutDateGuid)
		{
			_grantContext.BlackoutDates.Remove(new OrganizationBlackoutDate() { Guid = BlackoutDateGuid });
			await _grantContext.SaveChangesAsync();
		}

        public async Task DeleteOrganizationAsync(Guid OrganizationGuid)
		{
			var orgToDelete = await _grantContext.Organizations.FindAsync(OrganizationGuid);
			_grantContext.Remove(orgToDelete);
			await _grantContext.SaveChangesAsync();
		}
    }
}
