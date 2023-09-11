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
		public List<string> SynergyGrades { get; set; }
		public List<string> GrantTrackerGrades { get; set; }
		public string MatricNumber { get; set; }
		public Guid OrganizationYearGuid { get; set; }
	}

	public class StudentRepository : RepositoryBase, IStudentRepository
	{
		private readonly SynergyEODContext _synergy;

		public StudentRepository(GrantTrackerContext grantContext, IDevRepository devRepository, IHttpContextAccessor httpContext, SynergyEODContext synergyContext)
			: base(devRepository, httpContext, grantContext)
		{
			_synergy = synergyContext;
		}

		public async Task<StudentViewModel> CreateIfNotExistsAsync(StudentDto newStudent)
		{
			return await UseDeveloperLog(async () =>
			{
				var student = await _grantContext
				.Students
				.AsNoTracking()
				.Where(s => s.MatricNumber == newStudent.MatricNumber)
				.FirstOrDefaultAsync();

				if (student == null)
				{
					return await this.CreateAsync(newStudent);
				}

				return StudentViewModel.FromDatabase(student);
			});
		}

		public async Task<StudentViewModel> CreateAsync(StudentDto newStudent)
		{
			return await UseDeveloperLog(async () =>
			{
				Guid PersonGuid = Guid.NewGuid();

				Student dbStudent = new()
				{
					PersonGuid = PersonGuid,
					FirstName = newStudent.FirstName,
					LastName = newStudent.LastName,
					MatricNumber = newStudent.MatricNumber,
				};

				await _grantContext.Students.AddAsync(dbStudent);
				await _grantContext.SaveChangesAsync();

				return await this.GetAsync(PersonGuid);
				


				//await CreateNewStudentSchoolYear(dbStudent.PersonGuid, newStudent.Grade);

				/*var existingStudentSchoolYear = await _grantContext.StudentSchoolYears
					.Include(ssy => ssy.OrganizationYear).ThenInclude(oy => oy.Year)
					.Include(ssy => ssy.OrganizationYear).ThenInclude(oy => oy.Organization)
					.Where(ssy => ssy.OrganizationYearGuid == _identity.OrganizationYearGuid && ssy.StudentGuid == existingStudent.PersonGuid)
					.FirstOrDefaultAsync();

				if (existingStudentSchoolYear is null)
				{
					await CreateNewStudentSchoolYear(existingStudent.PersonGuid, newStudent.Grade);
					return;
				}*/
			});
		}

		public async Task<StudentViewModel> GetAsync(Guid studentGuid)
		{
			var student = await _grantContext
				.Students
				.FindAsync(studentGuid);

			return StudentViewModel.FromDatabase(student);
		}

		//todo
		//add
		public async Task<List<StudentSchoolYearViewModel>> GetAsync(string name, Guid organizationGuid, Guid yearGuid)
		{
			return await UseDeveloperLog(async () =>
			{
				return await _grantContext.StudentSchoolYears
					.Include(ssy => ssy.Student)
					.Include(ssy => ssy.AttendanceRecords)
					.Where(ssy => ssy.OrganizationYear.OrganizationGuid == organizationGuid && ssy.OrganizationYear.YearGuid == yearGuid)
					.Select(ssy => StudentSchoolYearViewModel.FromDatabase(ssy))
					.ToListAsync();
			});
		}

		public async Task<StudentSchoolYearWithRecordsViewModel> GetAsync(Guid studentYearGuid, Guid organizationYearGuid = new Guid())
		{
			//change this - 9/1/2022
			if (organizationYearGuid == Guid.Empty)
				organizationYearGuid = _identity.OrganizationYearGuid;

			return await UseDeveloperLog(async () =>
			{
				return await _grantContext.StudentSchoolYears
					.AsNoTracking()
					.Where(ssy => ssy.StudentSchoolYearGuid == studentYearGuid)
					.Include(ssy => ssy.Student)
					.Include(ssy => ssy.SessionRegistrations)
					.Include(ssy => ssy.OrganizationYear).ThenInclude(oy => oy.Organization)
					.Include(ssy => ssy.OrganizationYear).ThenInclude(oy => oy.Year)
					.Include(ssy => ssy.SessionRegistrations).ThenInclude(reg => reg.DaySchedule).ThenInclude(day => day.Session)
					.Include(ssy => ssy.SessionRegistrations).ThenInclude(reg => reg.DaySchedule).ThenInclude(day => day.TimeSchedules)
					.Include(ssy => ssy.AttendanceRecords).ThenInclude(sa => sa.AttendanceRecord).ThenInclude(ar => ar.Session)
					.Include(ssy => ssy.AttendanceRecords).ThenInclude(sa => sa.TimeRecords)
					.Where(ssy => _identity.Claim == IdentityClaim.Administrator || ssy.OrganizationYear.OrganizationGuid == _identity.Organization.Guid || ssy.OrganizationYearGuid == organizationYearGuid)
					.Select(ssy => StudentSchoolYearWithRecordsViewModel.FromDatabase(ssy))
					.FirstOrDefaultAsync();
			});
		}

		public async Task<StudentSchoolYearWithRecordsViewModel> GetSingleAsync(string matricNumber)
		{
			return await _grantContext.StudentSchoolYears
				.AsNoTracking()
					.Include(ssy => ssy.Student)
					.Include(ssy => ssy.SessionRegistrations)
					.Include(ssy => ssy.AttendanceRecords)
					.Include(ssy => ssy.OrganizationYear).ThenInclude(oy => oy.Organization)
					.Include(ssy => ssy.OrganizationYear).ThenInclude(oy => oy.Year)
					.Include(ssy => ssy.SessionRegistrations).ThenInclude(reg => reg.DaySchedule).ThenInclude(day => day.Session)
					.Include(ssy => ssy.SessionRegistrations).ThenInclude(reg => reg.DaySchedule).ThenInclude(day => day.TimeSchedules)
					.Include(ssy => ssy.AttendanceRecords).ThenInclude(sa => sa.AttendanceRecord).ThenInclude(ar => ar.Session)
					.Include(ssy => ssy.AttendanceRecords).ThenInclude(sa => sa.TimeRecords)
				.Where(ssy => ssy.Student.MatricNumber == matricNumber && ssy.OrganizationYear.Year.IsCurrentSchoolYear == true)
				.Select(ssy => StudentSchoolYearWithRecordsViewModel.FromDatabase(ssy))
				.FirstOrDefaultAsync();
		}

		public async Task<List<StudentSchoolYearViewModel>> SearchSynergyAsync(StudentFilter filter)
		{
			//fetch active year
			//var activeYear = await _grantContext.Years.Where(y => y.IsCurrentSchoolYear).SingleAsync();
			var schoolYear = (await _grantContext
				.OrganizationYears
				.Include(oy => oy.Year)
				.FirstOrDefaultAsync(oy => oy.OrganizationYearGuid == filter.OrganizationYearGuid))
				.Year.SchoolYear;

			Expression<Func<EpcStuSchYr, bool>> filterExpression = ssy =>
				ssy.Year.SchoolYear == schoolYear
				&& (filter.FirstName == null || ssy.Student.Person.FirstName.Contains(filter.FirstName))
				&& (filter.LastName == null || ssy.Student.Person.LastName.Contains(filter.LastName))
				&& (filter.MatricNumber == null || ssy.Student.SisNumber.Contains(filter.MatricNumber))
				&& (filter.SynergyGrades.Count == 0 || filter.SynergyGrades.Contains(ssy.Grade));

            //&& (_identity.Claim == IdentityClaim.Administrator || ssy.OrganizationYear.OrganizationGu == filter.OrganizationYearGuid)

            var synergyResults = await _synergy.RevSSY
                .Include(ssy => ssy.OrganizationYear).ThenInclude(org => org.Organization)
                .Include(ssy => ssy.Year)
                .Include(ssy => ssy.Student).ThenInclude(stu => stu.Person)
                .Where(filterExpression)
                .Select(ssy => new StudentSchoolYearViewModel
                {
                    Student = new StudentViewModel()
                    {
                        MatricNumber = ssy.Student.SisNumber,
                        FirstName = ssy.Student.Person.FirstName,
                        LastName = ssy.Student.Person.LastName
                    },
                    Grade = GradeDto.FromSynergy(ssy.Grade)
                })
                .Take(100)
                .ToListAsync();


            //&& (_identity.Claim == IdentityClaim.Administrator || ssy.OrganizationYearGuid == filter.OrganizationYearGuid)
            var grantTrackerResults = await _grantContext.StudentSchoolYears
				.Include(ssy => ssy.Student)
				.Include(ssy => ssy.OrganizationYear)
				.Where(ssy => (
				(filter.FirstName == null || ssy.Student.FirstName.Contains(filter.FirstName))
				&& (filter.LastName == null || ssy.Student.LastName.Contains(filter.LastName))
				&& (filter.MatricNumber == null || ssy.Student.MatricNumber.Contains(filter.MatricNumber))
				&& (filter.GrantTrackerGrades.Count == 0 || filter.GrantTrackerGrades.Contains(ssy.Grade))))
				.Take(100)
				.ToListAsync();
			

			//return synergyResults;
				
			return grantTrackerResults
				.Select(ssy => StudentSchoolYearViewModel.FromDatabase(ssy))
				.Concat(synergyResults)
				.DistinctBy(ssy => new {ssy.Student.FirstName, ssy.Student.LastName, ssy.Student.MatricNumber})
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