using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.DTO
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
		public List<AttendTimeSchedule> Times { get; set; } = new();
	}

	public record AttendTimeSchedule
	{
		public Guid Guid { get; init; }
        public TimeOnly StartTime { get; init; }
		public TimeOnly EndTime { get; init; }
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
		public List<AttendTimeSchedule> Times { get; set; } = new();
		public List<FamilyAttendanceDto> FamilyAttendance { get; set; } = new();
	}
}