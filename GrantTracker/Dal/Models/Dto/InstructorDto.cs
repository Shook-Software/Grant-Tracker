namespace GrantTracker.Dal.Models.Dto
{
	public class InstructorDto
	{
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string BadgeNumber { get; set; }
		public Guid StatusGuid { get; set; }
	}
}