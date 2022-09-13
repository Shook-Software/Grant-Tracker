using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Dto
{
	//Used in [Post] body
	public class SessionAttendanceDto
	{
		public Guid SessionGuid { get; set; }
		public DateOnly Date { get; set; }
		public List<StudentAttendanceDto> StudentRecords { get; set; } = new();
		public List<InstructorAttendanceDto> InstructorRecords { get; set; } = new();
		public List<SubstituteAttendanceDto> SubstituteRecords { get; set; } = new();
	}

	public class SubstituteAttendanceDto
	{
		public InstructorDto Substitute { get; set; }
		public List<SessionTimeSchedule> Attendance { get; set; }
		//public string BadgeNumber { get; set; } //optional - OR, offer a selection between searching existing instructors, and filling out someone that just isn't in the district

	}

	public class InstructorAttendanceDto
	{
		public Guid InstructorSchoolYearGuid { get; set; }
		public List<SessionTimeSchedule> Attendance { get; set; }
	}

	public class StudentAttendanceDto
	{
		public Guid StudentSchoolYearGuid { get; set; }
		public List<SessionTimeSchedule> Attendance { get; set; }

	}
}