using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.SynergySchema;
using GrantTracker.Utilities;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace GrantTracker.Dal.Repositories.StudentRepository
{
	public class StudentFilter
	{
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public List<string> Grades { get; set; }
		public string MatricNumber { get; set; }
	}

	public class StudentRepository : RepositoryBase, IStudentRepository
	{
		private readonly SynergyEODContext _synergy;

		public StudentRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext, SynergyEODContext synergyContext)
			: base(devRepository, httpContext, grantContext)
		{
			_synergy = synergyContext;
		}

		private async Task CreateNewStudent(StudentDto newStudent)
		{
			Student dbStudent = new()
			{
				FirstName = newStudent.FirstName,
				LastName = newStudent.LastName,
				MatricNumber = newStudent.MatricNumber,
			};

			await _grantContext.Students.AddAsync(dbStudent);
			await CreateNewStudentSchoolYear(dbStudent.PersonGuid, newStudent.Grade);
		}

		private async Task CreateNewStudentSchoolYear(Guid studentGuid, string grade)
		{
			StudentSchoolYear dbStudentSchoolYear = new()
			{
				StudentGuid = studentGuid,
				OrganizationYearGuid = _identity.OrganizationYearGuid,
				Grade = grade
			};

			await _grantContext.StudentSchoolYears.AddAsync(dbStudentSchoolYear);
			await _grantContext.SaveChangesAsync();
		}

		public async Task AddAsync(StudentDto newStudent)
		{
			await UseDeveloperLog(async () =>
			{
				var existingStudent = await _grantContext.Students
					.Where(stu => stu.MatricNumber == newStudent.MatricNumber)
					.FirstOrDefaultAsync();

				if (existingStudent is null)
				{
					await CreateNewStudent(newStudent);
					return;
				}

				var existingStudentSchoolYear = await _grantContext.StudentSchoolYears
					.Include(ssy => ssy.OrganizationYear).ThenInclude(oy => oy.Year)
					.Include(ssy => ssy.OrganizationYear).ThenInclude(oy => oy.Organization)
					.Where(ssy => ssy.OrganizationYearGuid == _identity.OrganizationYearGuid && ssy.StudentGuid == existingStudent.PersonGuid)
					.FirstOrDefaultAsync();

				if (existingStudentSchoolYear is null)
				{
					await CreateNewStudentSchoolYear(existingStudent.PersonGuid, newStudent.Grade);
					return;
				}
			});
		}

		//todo
		//add
		public async Task<List<StudentSchoolYearView>> GetAsync(string name, Guid organizationGuid, Guid yearGuid)
		{
			return await UseDeveloperLog(async () =>
			{
				return await _grantContext.StudentSchoolYears
					.Include(ssy => ssy.Student)
					.Include(ssy => ssy.AttendanceRecords)
					.Where(ssy => ssy.OrganizationYear.OrganizationGuid == organizationGuid && ssy.OrganizationYear.YearGuid == yearGuid)
					.Select(ssy => StudentSchoolYearView.FromDatabase(ssy))
					.ToListAsync();
			});
		}

		public async Task<StudentSchoolYearWithRecordsView> GetAsync(Guid studentYearGuid, Guid organizationYearGuid = new Guid())
		{
			//change this - 9/1/2022
			if (organizationYearGuid == Guid.Empty)
				organizationYearGuid = _identity.OrganizationYearGuid;

			return await UseDeveloperLog(async () =>
			{
				return await _grantContext.StudentSchoolYears
					.Where(ssy => ssy.StudentSchoolYearGuid == studentYearGuid)
					.Include(ssy => ssy.Student)
					.Include(ssy => ssy.SessionRegistrations)
					.Include(ssy => ssy.AttendanceRecords)
					.Include(ssy => ssy.OrganizationYear).ThenInclude(oy => oy.Organization)
					.Include(ssy => ssy.OrganizationYear).ThenInclude(oy => oy.Year)
					.Include(ssy => ssy.SessionRegistrations).ThenInclude(reg => reg.DaySchedule).ThenInclude(day => day.Session)
					.Include(ssy => ssy.SessionRegistrations).ThenInclude(reg => reg.DaySchedule).ThenInclude(day => day.TimeSchedules)
					.Where(ssy => _identity.Claim == IdentityClaim.Administrator || ssy.OrganizationYearGuid == _identity.OrganizationYearGuid)
					.Select(ssy => StudentSchoolYearWithRecordsView.FromDatabase(ssy))
					.FirstOrDefaultAsync();
			});
		}

		public async Task<StudentSchoolYearWithRecordsView> GetSingleAsync(string matricNumber)
		{
			return await _grantContext.StudentSchoolYears
				.AsNoTracking()
				.Include(ssy => ssy.Student)
				.Include(ssy => ssy.SessionRegistrations)
				.Where(ssy => ssy.Student.MatricNumber == matricNumber && ssy.OrganizationYear.Year.IsCurrentSchoolYear == true)
				.Select(ssy => StudentSchoolYearWithRecordsView.FromDatabase(ssy))
				.FirstOrDefaultAsync();
		}

		public async Task<List<StudentView>> SearchSynergyAsync(StudentFilter filter)
		{
			//fetch active year
			var activeYear = await _grantContext.Years.Where(y => y.IsCurrentSchoolYear).SingleAsync();

			Expression<Func<EpcStuSchYr, bool>> filterExpression = ssy =>
				ssy.Year.SchoolYear == activeYear.SchoolYear

				&& (filter.FirstName == null || ssy.Student.Person.FirstName.Contains(filter.FirstName))
				
				&& (filter.LastName == null || ssy.Student.Person.LastName.Contains(filter.LastName))

				&& (filter.MatricNumber == null || ssy.Student.SisNumber.Contains(filter.MatricNumber))

				&& (_identity.Claim == IdentityClaim.Administrator || ssy.OrganizationYear.OrganizationGu == _identity.Organization.Guid)

				&& (filter.Grades.Count == 0 || filter.Grades.Contains(ssy.Grade));

			var synergyResults = await _synergy.RevSSY
				.Include(ssy => ssy.OrganizationYear).ThenInclude(org => org.Organization)
				.Include(ssy => ssy.Year)
				.Include(ssy => ssy.Student).ThenInclude(stu => stu.Person)
				.Where(filterExpression)
				.Select(ssy => new StudentView
				{
					MatricNumber = ssy.Student.SisNumber,
					FirstName = ssy.Student.Person.FirstName,
					LastName = ssy.Student.Person.LastName
				})
				.Take(100)
				.ToListAsync();

			var grantTrackerResults = await _grantContext.StudentSchoolYears
				.Include(ssy => ssy.Student)
				.Include(ssy => ssy.OrganizationYear)
				.Where(ssy => (
				
				(filter.FirstName == null || ssy.Student.FirstName.Contains(filter.FirstName))
				
				&& (filter.LastName == null || ssy.Student.LastName.Contains(filter.LastName))

				&& (filter.MatricNumber == null || ssy.Student.MatricNumber.Contains(filter.MatricNumber))

				&& (_identity.Claim == IdentityClaim.Administrator || ssy.OrganizationYearGuid == _identity.OrganizationYearGuid)

				&& (filter.Grades.Count == 0 || filter.Grades.Contains(ssy.Grade))))
				.Take(100)
				.ToListAsync();

			return grantTrackerResults
				.Select(ssy => StudentView.FromDatabase(ssy.Student))
				.Concat(synergyResults)
				.DistinctBy(ssy => new {ssy.FirstName, ssy.LastName, ssy.MatricNumber})
				.ToList();
		}

		public async Task SyncStudentsWithSynergyAsync()
		{
			/*
			var grantTrackerStudents = await _grantContext.StudentSchoolYears
				.Where(ssy => ssy.OrganizationYear.Year.IsCurrentSchoolYear == true)
				.Include(ssy => ssy.Student)
				.ToListAsync();

			StudentFilter filter = new()
			{
				Grades = new List<string>()
			};
			var synergyStudents = await SearchSynergyAsync(filter);

			var updatedGrantStudents = (
				from ssy in grantTrackerStudents
				join syn in synergyStudents on ssy.Student.MatricNumber equals syn.MatricNumber
				select new StudentSchoolYearView
				{
					Guid = ssy.Student.PersonGuid,
					FirstName = syn.FirstName, //sync
					LastName = syn.LastName, //sync
					MatricNumber = ssy.Student.MatricNumber,
					Grade = syn.Grade, //sync
				}
			).ToList();

			foreach (StudentSchoolYearView updatedStudent in updatedGrantStudents)
			{
				_grantContext.Entry(await _grantContext.StudentSchoolYears.FindAsync(updatedStudent.Guid)).CurrentValues.SetValues(updatedStudent);
			}

			await _grantContext.SaveChangesAsync();
			*/
		}
	}
}