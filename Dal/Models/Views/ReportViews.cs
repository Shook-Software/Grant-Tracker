namespace GrantTracker.Dal.Models.Views
{

	public class TotalStudentAttendanceViewModel
	{
		public string OrganizationName { get; set; }
		public string MatricNumber { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string Grade { get; set; }
		public int TotalDays { get; set; }
		public double TotalHours { get; set; }
	}


	public class TotalActivityViewModel
	{
		public string OrganizationName { get; set; }
		public string Activity { get; set; }
		public int TotalAttendees { get; set; }
		public double TotalHours { get; set; }
	}


	public class SiteSessionViewModel
	{
		public class InstructorViewModel
		{
			public string FirstName { get; set; }
			public string LastName { get; set; }
			public string Status { get; set; }
		}
		public string SessionName { get; set; }
		public string ActivityType { get; set; }
		public string Objective { get; set; }
		public string SessionType { get; set; }
		public string FundingSource { get; set; }
		public string PartnershipType { get; set; }
		public string OrganizationType { get; set; }
		public int AttendeeCount { get; set; }
		public List<string> Grades { get; set; }
		public List<InstructorViewModel> Instructors { get; set; }
		public DateOnly InstanceDate { get; set; }
	}


	public class ClassSummaryViewModel
	{
		public class InstructorViewModel
		{
			public string FirstName { get; set; }
			public string LastName { get; set; }
			public string Status { get; set; }
		}

		public string OrganizationName { get; set; }
		public string SessionName { get; set; }
		public string ActivityType { get; set; }
		public string FundingSource { get; set; }
		public List<InstructorViewModel> Instructors { get; set; }
		public DateOnly StartDate { get; set; }
		public DateOnly EndDate { get; set; }
		public double WeeksToDate { get; set; }
		public List<DayOfWeek> DaysOfWeek { get; set; }
		public double AvgDailyAttendance { get; set; }
		public double AvgHoursPerDay { get; set; }
	}


	public class ProgramViewModel
	{
		public string OrganizationName { get; set; }
		public int RegularStudentCount { get; set; }
		public int FamilyAttendanceCount { get; set; }
		public int StudentDaysOfferedCount { get; set; }
		public double AvgStudentAttendHoursPerWeek { get; set; }
		public double AvgStudentAttendDaysPerWeek { get; set; }
	}


	public class StaffSummaryViewModel
	{
		public class InstructorViewModel
		{
			public Guid InstructorSchoolYearGuid { get; set; }
			public string OrganizationName { get; set; }
			public string FirstName { get; set; }
			public string LastName { get; set; }
		}

		public string Status { get; set; }
		public List<InstructorViewModel> Instructors { get; set; }
	}


	public class StudentSummaryViewModel
	{
		public class StudentViewModel
		{
			public string OrganizationName { get; set; }
			public string FirstName { get; set; }
			public string LastName { get; set; }
			public string MatricNumber { get; set; }
			public string Grade { get; set; }
		}

		public string Activity { get; set; }
		public StudentViewModel Student { get; set; }
		public int TotalDays { get; set; }
		public double TotalHours { get; set; }
	}


}
