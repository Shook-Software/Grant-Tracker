using Castle.Core.Internal;
using GrantTracker.Dal.EmployeeDb;
using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GrantTracker.Dal.Repositories.InstructorRepository
{
	public class InstructorRepository : IInstructorRepository
	{
		private readonly InterfaceDbContext _staffContext;
        protected readonly GrantTrackerContext _grantContext;
        protected readonly ClaimsPrincipal _user;

        public InstructorRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContextAccessor, InterfaceDbContext staffContext)
		{
			_staffContext = staffContext;
            _grantContext = grantContext;
            _user = httpContextAccessor.HttpContext.User;
        }

		public async Task<List<EmployeeDto>> SearchSynergyStaffAsync(string name, string badgeNumber)
		{
			//employee db results
			return await _staffContext
				.Employees
				.Where(e => name.IsNullOrEmpty() || (e.GivenName + " " + e.Sn).Contains(name))
				.Where(e => badgeNumber.IsNullOrEmpty() || e.EmployeeId.Contains(badgeNumber))
				.Select(e => EmployeeDto.FromDatabase(e))
				.ToListAsync();
		}

		public async Task<List<InstructorSchoolYearViewModel>> GetInstructorsAsync(Guid organizationGuid, Guid yearGuid)
		{
			return await _grantContext
				.InstructorSchoolYears
				.AsNoTracking()
				.Include(isy => isy.Instructor)
				.Include(isy => isy.Status)
				.Where(isy => isy.OrganizationYear.OrganizationGuid == organizationGuid && isy.OrganizationYear.YearGuid == yearGuid)
				.Select(isy => InstructorSchoolYearViewModel.FromDatabase(isy, null))
				.ToListAsync();
		}

		//differences between coordinator request and admin request?
		//think on it
		//have a way to see duplicated instructors for deletion around this process
		

		public async Task<Guid> CreateAsync(InstructorDto instructor, Guid organizationYearGuid)
		{
			bool badgeNumberIsNullOrEmpty = instructor.BadgeNumber.IsNullOrEmpty();
			//ensure instructor exists
			var existingInstructor = await _grantContext
				.Instructors
				.AsNoTracking()
				.Where(i => !badgeNumberIsNullOrEmpty && i.BadgeNumber == instructor.BadgeNumber)
				.FirstOrDefaultAsync();

			//if not, create the person
			if (existingInstructor is null)
			{
				var newGuid = Guid.NewGuid();
				var newInstructor = new Instructor()
				{
					PersonGuid = newGuid,
					FirstName = instructor.FirstName,
					LastName = instructor.LastName,
					BadgeNumber = instructor.BadgeNumber,
				};

				await _grantContext.Instructors.AddAsync(newInstructor);
				await _grantContext.SaveChangesAsync();
				existingInstructor = await _grantContext.Instructors.FindAsync(newGuid);
			}

			var instructorSchoolYear = await _grantContext.InstructorSchoolYears.Where(isy => isy.OrganizationYearGuid == organizationYearGuid && isy.InstructorGuid == existingInstructor.PersonGuid).SingleOrDefaultAsync();
			if (instructorSchoolYear != null)
				return instructorSchoolYear.InstructorSchoolYearGuid;
				//throw new Exception("User already exists in this organization for the current school year!");

			//Create the instructor school year for the target organization
			var newInstructorSchoolYear = new InstructorSchoolYear()
			{
				InstructorGuid = existingInstructor.PersonGuid,
				OrganizationYearGuid = organizationYearGuid,
				StatusGuid = instructor.StatusGuid
			};

			await _grantContext.InstructorSchoolYears.AddAsync(newInstructorSchoolYear);
			await _grantContext.SaveChangesAsync();

			return newInstructorSchoolYear.InstructorSchoolYearGuid;
		}

		public async Task CreateAsync(List<InstructorSchoolYear> instructorSchoolYears)
		{
			instructorSchoolYears.ForEach(isy => isy.Identity = null);
			await _grantContext.AddRangeAsync(instructorSchoolYears);
			await _grantContext.SaveChangesAsync();
		}

		public async Task UpdateInstructorAsync(Guid instructorSchoolYearGuid, InstructorSchoolYearViewModel instructorSchoolYear)
		{
			var dbInstructorSchoolYear = await _grantContext.InstructorSchoolYears.FindAsync(instructorSchoolYearGuid);

			dbInstructorSchoolYear.StatusGuid = instructorSchoolYear.Status.Guid;

			await _grantContext.SaveChangesAsync();
		}
	}
}