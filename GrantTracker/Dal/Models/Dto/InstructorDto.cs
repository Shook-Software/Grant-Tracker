namespace GrantTracker.Dal.Models.DTO
{
	public class InstructorDto
	{
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string? BadgeNumber { get; set; }
		public Guid StatusGuid { get; set; }
	}
}