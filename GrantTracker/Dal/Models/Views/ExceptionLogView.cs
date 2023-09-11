using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class RequestorDto
	{
		public Instructor Person { get; set; }
		public Organization Organization { get; set; }
		public Identity Identity { get; set; }
	}
}

namespace GrantTracker.Dal.Models.Dto
{
	public class ExceptionLogView
	{
		public static ExceptionLogView FromDatabase(ExceptionLog log)
		{
			return new ExceptionLogView()
			{
				Requestor = new RequestorDto()
				{
					Person = new Instructor()
					{
						FirstName = log.InstructorSchoolYear.Instructor.FirstName,
						LastName = log.InstructorSchoolYear.Instructor.LastName,
						BadgeNumber = log.InstructorSchoolYear?.Instructor.BadgeNumber
					},
					Organization = new Organization()
					{
						Name = log.InstructorSchoolYear.OrganizationYear.Organization.Name
					},
					Identity = new Identity()
					{
						Claim = log.InstructorSchoolYear.Identity.Claim
					}
				},
				Source = log.Source,
				Message = log.Message,
				InnerMessage = log.InnerMessage,
				StackTrace = log.StackTrace,
				TargetSite = log.TargetSite,
				DateTime = log.DateTime,
			};
		}

		public RequestorDto Requestor { get; set; }
		public string Source { get; set; }
		public string Message { get; set; }
		public string InnerMessage { get; set; }
		public string StackTrace { get; set; }
		public string TargetSite { get; set; }
		public DateTime DateTime { get; set; }
	}
}