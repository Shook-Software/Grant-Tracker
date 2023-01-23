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
		public Guid InstructorSchoolYearGuid { get; set; } = Guid.Empty;
		public InstructorDto Substitute { get; set; }
		public List<SessionTimeSchedule> Attendance { get; set; } = new();
		//public string BadgeNumber { get; set; } //optional - OR, offer a selection between searching existing instructors, and filling out someone that just isn't in the district
	}

	public class InstructorAttendanceDto
	{
		public Guid InstructorSchoolYearGuid { get; set; }
		public List<SessionTimeSchedule> Attendance { get; set; } = new();
	}

	public class FamilyAttendanceDto
	{
		public FamilyMember FamilyMember { get; set; }
		public int Count { get; set; } = 0;
	}

	public class StudentAttendanceDto
	{
		public Guid StudentGuid { get; set; }
		public Guid StudentSchoolYearGuid { get; set; }
		public StudentDto Student { get; set; }
		public List<SessionTimeSchedule> Attendance { get; set; } = new();
		public List<FamilyAttendanceDto> FamilyAttendance { get; set; } = new();
	}
}