namespace GrantTracker.Dal.Models.DTO
{
	public class InstructorDto
	{
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string? BadgeNumber { get; set; }
		public string? Title { get; set; }  // This should now be provided per school year
		public Guid StatusGuid { get; set; }
	}
}