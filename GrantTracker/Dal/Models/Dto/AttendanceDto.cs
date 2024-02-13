using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Dto
{
	//Used in [Post] body
	public class SessionAttendanceDto
	{
		public DateOnly Date { get; set; }
        public List<InstructorAttendanceDto> InstructorRecords { get; set; } = new();
        public List<StudentAttendanceDto> StudentRecords { get; set; } = new();
	}

	public class InstructorAttendanceDto
	{
		public Guid Id { get; set; }
		public bool IsSubstitute { get; set; } = false;
		public List<SessionTimeSchedule> Times { get; set; } = new();
	}

	public class FamilyAttendanceDto
	{
		public FamilyMember FamilyMember { get; set; }
		public int Count { get; set; } = 0;
	}

	public class StudentAttendanceDto
	{
		public Guid Id { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public List<SessionTimeSchedule> Times { get; set; } = new();
		public List<FamilyAttendanceDto> FamilyAttendance { get; set; } = new();
	}
}