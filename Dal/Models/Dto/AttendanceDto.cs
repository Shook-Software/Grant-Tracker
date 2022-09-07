using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Dto
{
	//Used in [Post] body
	public class SessionAttendanceDto
	{
		public Guid SessionGuid { get; set; }
		public DateOnly Date { get; set; }
		public List<StudentAttendanceDto> StudentRecords { get; set; }
		public List<InstructorAttendanceDto> InstructorRecords { get; set; }
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