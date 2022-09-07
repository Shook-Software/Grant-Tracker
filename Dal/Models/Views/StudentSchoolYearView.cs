using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class StudentView
	{
		public Guid Guid { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string MatricNumber { get; set; }

		public static StudentView FromDatabase(Student stu) => new()
		{
			Guid = stu.PersonGuid,
			FirstName = stu.FirstName,
			LastName = stu.LastName,
			MatricNumber = stu.MatricNumber
		};
	}

	public class StudentSchoolYearView
	{
		public Guid Guid { get; set; }
		public StudentView Student { get; set; }
		public OrganizationYearView OrganizationYear { get; set; }
		public string Grade { get; set; }
		public int MinutesAttended { get; set; }

		public static StudentSchoolYearView FromDatabase(StudentSchoolYear ssy) => new()
		{
			Guid = ssy.StudentSchoolYearGuid,
			Student = StudentView.FromDatabase(ssy.Student),
			Grade = ssy.Grade,
			MinutesAttended = ssy.AttendanceRecords?.Aggregate(0, (total, next) => total + next.MinutesAttended) ?? 0,
		};
	}

	public class StudentSchoolYearWithRecordsView : StudentSchoolYearView
	{
		public List<AttendanceView> Attendance { get; set; }
		public List<StudentRegistrationView> Registrations { get; set; }

		public static new StudentSchoolYearWithRecordsView FromDatabase(StudentSchoolYear ssy)
		{
			return new()
			{
				Guid = ssy.StudentSchoolYearGuid,
				Student = StudentView.FromDatabase(ssy.Student),
				Grade = ssy.Grade,
				MinutesAttended = ssy.AttendanceRecords?.Aggregate(0, (total, next) => total + next.MinutesAttended) ?? 0,
				OrganizationYear = OrganizationYearView.FromDatabase(ssy.OrganizationYear),
				Registrations = ssy.SessionRegistrations?.Select(reg => StudentRegistrationView.FromDatabase(reg)).ToList(),
				Attendance = ssy.AttendanceRecords?.Select(AttendanceView.FromDatabase).ToList()
			};
		}
	}
}
