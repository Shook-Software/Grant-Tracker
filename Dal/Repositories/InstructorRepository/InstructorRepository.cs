using Castle.Core.Internal;
using GrantTracker.Dal.EmployeeDb;
using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Repositories.InstructorRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Utilities;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace GrantTracker.Dal.Repositories.InstructorRepository
{
	public class InstructorRepository : RepositoryBase, IInstructorRepository
	{
		private readonly InterfaceDbContext _staffContext;

		public InstructorRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext, InterfaceDbContext staffContext)
			: base(devRepository, httpContext, grantContext)
		{
			_staffContext = staffContext;
		}

		public async Task<List<EmployeeDto>> SearchSynergyStaffAsync(string name, string badgeNumber)
		{
			//employee db results
			var employees = await _staffContext
				.Employees
				.Where(e => name.IsNullOrEmpty() || (e.GivenName + " " + e.Sn).Contains(name))
				.Where(e => badgeNumber.IsNullOrEmpty() || e.EmployeeId.Contains(badgeNumber))
				.Select(e => EmployeeDto.FromDatabase(e))
				.ToListAsync();

			//grant tracker results
			//This might get too large after time
			var existingEmployees = await _grantContext
				.InstructorSchoolYears
				.Where(emp => emp.OrganizationYearGuid == _identity.OrganizationYearGuid)
				//.Where(isy => instructor school year equals the desired organizationYear, not just the current one) //see above
				.Include(isy => isy.Instructor)
				.ToListAsync();

			//return employees that don't already exist in grant tracker for the given organizationYear
			return employees
				.Where(emp => existingEmployees.All(existingEmp => emp.BadgeNumber?.Trim() != existingEmp.Instructor.BadgeNumber?.Trim()))
				.ToList();
		}

		public async Task<List<InstructorSchoolYearView>> GetInstructorsAsync(string name, Guid organizationGuid, Guid yearGuid)
		{
			return await _grantContext.InstructorSchoolYears
				.Include(isy => isy.Instructor)
				.Include(isy => isy.Status)
				.Where(isy => isy.OrganizationYear.OrganizationGuid == organizationGuid && isy.OrganizationYear.YearGuid == yearGuid)
				.Where(isy => name.IsNullOrEmpty() || (isy.Instructor.FirstName + " " + isy.Instructor.LastName).Contains(name))
				.Select(isy => InstructorSchoolYearView.FromDatabase(isy, null))
				.ToListAsync();
		}

		//differences between coordinator request and admin request?
		//think on it
		//have a way to see duplicated instructors for deletion around this process

		public async Task<InstructorSchoolYearView> GetInstructorSchoolYearAsync(Guid instructorSchoolYearGuid)
		{
			//we could probably put these in two different functions and connect them from there
			//all info for the given schoolYear
			var instructorSchoolYear = await _grantContext
				.InstructorSchoolYears
				.Include(isy => isy.OrganizationYear).ThenInclude(oy => oy.Organization)
				.Include(isy => isy.OrganizationYear).ThenInclude(oy => oy.Year)
				.Include(isy => isy.Instructor)
				.Include(isy => isy.Status)
				.Include(isy => isy.Identity)
				.Include(isy => isy.SessionRegistrations).ThenInclude(sr => sr.Session).ThenInclude(s => s.DaySchedules).ThenInclude(day => day.TimeSchedules)
				.Include(isy => isy.AttendanceRecords)
				.Where(isy => isy.InstructorSchoolYearGuid == instructorSchoolYearGuid)
				.SingleAsync();

			//A list of other school years
			var organizationYears = await _grantContext
				.Instructors
				.Include(i => i.InstructorSchoolYears).ThenInclude(isy => isy.OrganizationYear).ThenInclude(oy => oy.Organization)
				.Include(i => i.InstructorSchoolYears).ThenInclude(isy => isy.OrganizationYear).ThenInclude(oy => oy.Year)
				.Where(i => i.PersonGuid == instructorSchoolYear.InstructorGuid)
				.Select(i => i.InstructorSchoolYears.Select(isy => isy.OrganizationYear).ToList())
				.SingleAsync();

			return InstructorSchoolYearView.FromDatabase(instructorSchoolYear, organizationYears);
		}

		public async Task Create(InstructorDto instructor)
		{
			var existingInstructor = await _grantContext.Instructors
				.Where(i => i.BadgeNumber == instructor.BadgeNumber)
				.FirstOrDefaultAsync();

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

			if (_grantContext.InstructorSchoolYears.Any(isy => isy.OrganizationYearGuid == _identity.OrganizationYearGuid && isy.InstructorGuid == existingInstructor.PersonGuid))
				throw new Exception("User already exists in this organization for the current school year!");

			var newInstructorSchoolYear = new InstructorSchoolYear()
			{
				InstructorGuid = existingInstructor.PersonGuid,
				OrganizationYearGuid = _identity.OrganizationYearGuid,
				StatusGuid = instructor.StatusGuid
			};

			await _grantContext.InstructorSchoolYears.AddAsync(newInstructorSchoolYear);
			await _grantContext.SaveChangesAsync();
		}

		public async Task CreateAsync(List<InstructorSchoolYear> instructorSchoolYears)
		{
			instructorSchoolYears.ForEach(isy => isy.Identity = null);
			await _grantContext.AddRangeAsync(instructorSchoolYears);
			await _grantContext.SaveChangesAsync();
		}

		public async Task UpdateInstructorAsync(Guid instructorSchoolYearGuid, InstructorSchoolYearView instructorSchoolYear)
		{
			var dbInstructorSchoolYear = await _grantContext.InstructorSchoolYears.FindAsync(instructorSchoolYearGuid);

			dbInstructorSchoolYear.StatusGuid = instructorSchoolYear.Status.Guid;

			await _grantContext.SaveChangesAsync();
		}
	}
}