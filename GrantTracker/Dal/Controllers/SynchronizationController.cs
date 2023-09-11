using GrantTracker.Dal.Repositories.StudentRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GrantTracker.Dal.Controllers
{
	[ApiController]
	[Authorize(Policy = "AnyAuthorizedUser")]
	[Route("config")]
	public class SynchronizationController : ControllerBase
	{
		private readonly IStudentRepository _studentRepository;

		public SynchronizationController(IStudentRepository studentRepository)
		{
			_studentRepository = studentRepository;
		}

		//in naming, the action "patch" is the verb, and we are patching students. Rename all controllers with this scheme.
		//https://restfulapi.net/resource-naming/
		[HttpPatch("students")]
		public async Task SyncStudentGradeLevels()
		{
			await _studentRepository.SyncStudentsWithSynergyAsync();
		}
	}
}