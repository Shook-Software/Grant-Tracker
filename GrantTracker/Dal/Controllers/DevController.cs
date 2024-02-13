using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.AuthRepository;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Repositories.DropdownRepository;
using GrantTracker.Dal.Repositories.InstructorRepository;
using GrantTracker.Dal.Repositories.YearRepository;
using GrantTracker.Dal.Repositories.OrganizationRepository;
using GrantTracker.Dal.Repositories.OrganizationYearRepository;
using GrantTracker.Dal.Schema;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	//this should be restricted to Admin only
	[Route("developer")]
	public class DevController : ControllerBase
	{
		private readonly IDevRepository _devRepository;
		private readonly IDropdownRepository _dropdownRepository;
		private readonly IAuthRepository _authRepository;
		private readonly IInstructorRepository _instructorRepository;
		private readonly IYearRepository _yearRepository;
		private readonly IOrganizationRepository _organizationRepository;
		private readonly IOrganizationYearRepository _organizationYearRepository;
        private readonly ILogger<DevController> _logger;

        public DevController(IDevRepository devRepository, IDropdownRepository dropdownRepository, 
			IAuthRepository authRepository, IInstructorRepository staffRepository, 
			IYearRepository yearRepository, IOrganizationRepository organizationRepository, 
			IOrganizationYearRepository organizationYearRepository, ILogger<DevController> logger)
		{
			_devRepository = devRepository;
			_dropdownRepository = dropdownRepository;
			_authRepository = authRepository;
			_instructorRepository = staffRepository;
			_yearRepository = yearRepository;
			_organizationRepository = organizationRepository;
			_organizationYearRepository = organizationYearRepository;
            _logger = logger;
        }

		[HttpGet("exceptions")]
		public async Task<ActionResult<List<ExceptionLogView>>> GetExceptions()
		{
			var logs = await _devRepository.GetExceptionLogsAsync();
			return Ok(logs);
		}

		[HttpGet("dropdowns")]
		public async Task<ActionResult<DropdownOptions>> GetDropdownOptions()
		{
			var options = await _dropdownRepository.GetAllDropdownOptionsAsync();
			return Ok(options);
		}

		[HttpGet("authentication")]
		public async Task<ActionResult<List<UserIdentity>>> GetUserAuthentication(Guid yearGuid)
		{
			var users = await _authRepository.GetUsersAsync(yearGuid);
			return Ok(users);
		}

		[HttpGet("organizationYear")]
		public async Task<ActionResult<List<OrganizationYearView>>> GetOrganizations(Guid yearGuid)
		{
			var organizationYears = await _authRepository.GetOrganizationYearsForYear(yearGuid);
			return Ok(organizationYears);
		}

		#region School Year Controls

		[HttpGet("year")] 
		public async Task<ActionResult<List<Year>>> GetYears()
		{
			var schoolYears = await _yearRepository.GetAsync();
			return Ok(schoolYears);
		}

		[HttpPatch("year")]
		public async Task<IActionResult> UpdateYear([FromBody] Year yearModel)
		{
			try
            {
                if (yearModel is null)
                    throw new Exception("Parameter object cannot be null.");

                await _yearRepository.UpdateAsync(yearModel);
                return NoContent();
            }
			catch (Exception ex)
			{
				return StatusCode(500);
			}
        }

        [HttpPatch("year/{YearGuid:Guid}/grades/sync")]
		public async Task<ActionResult<int>> SynchronizeSynergyGrades(Guid YearGuid)
		{
			try
			{
				var numRecordsUpdated = await _devRepository.SynchronizeStudentGradesWithSynergyAsync(YearGuid);
				return Ok(numRecordsUpdated);
			}
			catch (Exception ex)
            {
                _logger.LogError(ex, "{Function} - An unhandled error occured.", nameof(SynchronizeSynergyGrades));
                return StatusCode(500);
			}
		}

		//Parameters
		//4 digit year
		//quarter of year
		//start date
		//end date
		//we need the coordinators to be added onto the year [taken from a list in ui of current coordinators and their locations]
		public class UserProps
		{
			public Guid UserGuid { get; set; }
			public Guid OrganizationGuid { get; set; }
			public IdentityClaim Claim { get; set; }
		}

		public class YearProps
		{
			public Year yearModel { get; set; }
			public List<UserProps> users { get; set; }
		}

		[HttpPost("year")]
		public async Task<IActionResult> AddYear(YearProps props)
		{
			throw new NotImplementedException();
			/*try
			{
				//Ensure no parameters are null, year is 4 digits, start date and end date do not intersect already existing Years
				//validation
				if (props.yearModel is null)
					throw new Exception("Parameter object cannot be null.");

				var errors = await _yearRepository.ValidateYearAsync(props.yearModel);
				if (errors.Count > 0)
					return BadRequest(errors);

				//yearGuid in model will be entered in DB
				await _yearRepository.AddAsync(props.yearModel);

				//get the newly created year, get the organizations with it's identifier, then use those to create new organizationYears
				var currentYear = (await _yearRepository.GetAsync()).Where(y => y.IsCurrentSchoolYear).First();
				var currentOrganizations = await _organizationRepository.GetOrganizationsAsync(currentYear.YearGuid); //put this into OrgYear repo and just grab the org from it, better design
				await _organizationYearRepository.CreateAsync(currentOrganizations, props.yearModel.YearGuid);

				//fetch the newly created organizationYears
				var newOrganizationYears = await _organizationYearRepository.GetAsync(props.yearModel.YearGuid);
				//fetch instructorStatuses, then grab the identifier for Administrator
				Guid administratorStatusGuid = (await _dropdownRepository.GetInstructorStatusesAsync()).Find(status => status.Label == "Administrator").Guid;


				//we need a site-user repo
				var previousCoordinators = await _yearRepository.Get(props.yearModel.YearGuid)
					.WithOrganizationYears()
					.WithInstructorSchoolYears()
					.WithCoordinatorIdentities()
					.SelectMany(x => x.Organizations)
					.Where(x => x..Identity != null)
					.ToListAsync();


                var instructorSchoolYears = previousCoordinators
                    .Select(u =>
					{
						var instructorSchoolYearGuid = Guid.NewGuid();
						return new InstructorSchoolYear()
						{
							InstructorSchoolYearGuid = instructorSchoolYearGuid,
							InstructorGuid = u.InstructorGuid,
							OrganizationYearGuid = newOrganizationYears.Find(oy => oy.OrganizationGuid == u.OrganizationGuid).OrganizationYearGuid,
							StatusGuid = administratorStatusGuid
						};
					})
					.ToList();

				var userIdentities = instructorSchoolYears
					.Select(isy =>  new Identity()
                    {
                        Guid = isy.InstructorSchoolYearGuid,
                        Claim = u.Claim
                    })
					.ToList();


				await _instructorRepository.CreateAsync(instructorSchoolYears);
				await _devRepository.CreateUsersAsync(userIdentities);

				return NoContent();
			}
			catch (Exception ex)
            {
                _logger.LogError(ex, "{Function} - An unhandled error occured.", nameof(AddYear));
				return StatusCode(500);
            }*/
		}

		#endregion School Year Controls

		[HttpPost("organizations")]
		public async Task<IActionResult> AddOrganization()
		{
			return Ok();
		}

		[HttpPatch("organizations/{organizationGuid:guid}")]
		public async Task<IActionResult> EditOrganization(Guid organizationGuid)
		{
			return Ok();
		}
	}
}