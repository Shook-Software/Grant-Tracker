using GrantTracker.Dal.EmployeeDb;
using GrantTracker.Dal.Repositories.AuthRepository;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Repositories.DropdownRepository;
using GrantTracker.Dal.Repositories.LookupRepository;
using GrantTracker.Dal.Repositories.OrganizationYearRepository;
using GrantTracker.Dal.Repositories.OrganizationRepository;
using GrantTracker.Dal.Repositories.SessionRepository;
using GrantTracker.Dal.Repositories.InstructorRepository;
using GrantTracker.Dal.Repositories.AttendanceRepository;
using GrantTracker.Dal.Repositories.StudentRepository;
using GrantTracker.Dal.Repositories.StudentSchoolYearRepository;
using GrantTracker.Dal.Repositories.UserRepository;
using GrantTracker.Dal.Repositories.YearRepository;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.SynergySchema;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Utilities.OnStartup
{
	public static class DatabaseContext
	{
		public static void Setup(WebApplicationBuilder builder, IConfiguration config)
		{
			builder.Services.AddDbContext<GrantTrackerContext>(options =>
			{
				options.UseSqlServer(config.GetConnectionString("GrantTracker"));
			});

			builder.Services.AddDbContext<InterfaceDbContext>(options =>
			{
				options.UseSqlServer(config.GetConnectionString("InterfaceDb"));
			});

			builder.Services.AddDbContext<SynergyEODContext>(options =>
			{
				options.UseSqlServer(config.GetConnectionString("SynergyEOD"));
			});

			builder.Services.AddScoped<IDropdownRepository, DropdownRepository>();
			builder.Services.AddScoped<ISessionRepository, SessionRepository>();
			builder.Services.AddScoped<IRoleProvider, RoleProvider>();
			builder.Services.AddScoped<IInstructorRepository, InstructorRepository>();
			builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>();
			builder.Services.AddScoped<IStudentRepository, StudentRepository>();
			builder.Services.AddScoped<IStudentSchoolYearRepository, StudentSchoolYearRepository>();
			builder.Services.AddScoped<IAuthRepository, AuthRepository>();
			builder.Services.AddScoped<ILookupRepository, LookupRepository>();
			builder.Services.AddScoped<IDevRepository, DevRepository>();
			builder.Services.AddScoped<IYearRepository, YearRepository>();
			builder.Services.AddScoped<IOrganizationRepository, OrganizationRepository>();
			builder.Services.AddScoped<IOrganizationYearRepository, OrganizationYearRepository>();
		}
	}
}