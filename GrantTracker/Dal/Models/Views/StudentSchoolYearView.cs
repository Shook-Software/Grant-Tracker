using DocumentFormat.OpenXml.Drawing;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class StudentViewModel
	{
		public Guid Guid { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string MatricNumber { get; set; }

		public static StudentViewModel FromDatabase(Student stu) => new()
		{
			Guid = stu.PersonGuid,
			FirstName = stu.FirstName,
			LastName = stu.LastName,
			MatricNumber = stu.MatricNumber
		};
	}

	public class StudentSchoolYearViewModel
	{
		public Guid Guid { get; set; }
		public StudentViewModel Student { get; set; }
		public OrganizationYearView OrganizationYear { get; set; }
		public string Grade { get; set; }

		public static StudentSchoolYearViewModel FromDatabase(StudentSchoolYear ssy) => new()
		{
			Guid = ssy.StudentSchoolYearGuid,
			Student = ssy.Student != null ? StudentViewModel.FromDatabase(ssy.Student) : null,
			Grade = ssy.Grade,
			
			//MinutesAttended = ssy.AttendanceRecords?.Aggregate(0, (total, next) => total + next.MinutesAttended) ?? 0,
		};
	}

	public class StudentSchoolYearWithRecordsViewModel : StudentSchoolYearViewModel
	{
		public List<StudentAttendanceViewModel> AttendanceRecords { get; set; }
		public List<StudentRegistrationView> Registrations { get; set; }

		public static new StudentSchoolYearWithRecordsViewModel FromDatabase(StudentSchoolYear ssy) => new()
		{
			Guid = ssy.StudentSchoolYearGuid,
			Student = StudentViewModel.FromDatabase(ssy.Student),
			Grade = ssy.Grade,
			OrganizationYear = OrganizationYearView.FromDatabase(ssy.OrganizationYear),
			Registrations = ssy.SessionRegistrations.GroupBy(x => x.DaySchedule.SessionGuid,
				(sesGuid, regs) => {
					return StudentRegistrationView.FromDatabase(sesGuid, regs.First().DaySchedule.Session.Name, null, regs.Select(x => x.DaySchedule).ToList());
				})
			.ToList(),
			AttendanceRecords = ssy.AttendanceRecords
				.Select(ar => new StudentAttendanceViewModel()
				{
					Guid = ar.Guid,
					AttendanceRecord = new AttendanceViewModel()
					{
						Guid = ar.AttendanceRecord.Guid,
						InstanceDate = ar.AttendanceRecord.InstanceDate,
						Session = new AttendanceViewModel.AttendanceSessionViewModel()
						{
							Guid = ar.AttendanceRecord.SessionGuid,
							Name = ar.AttendanceRecord.Session.Name
						}
					},
					TimeRecords = ar.TimeRecords
						.Select(time => AttendanceTimeRecordViewModel.FromDatabase(time))
                        .OrderBy(x => x.StartTime.Hour)
						.ThenBy(x => x.StartTime.Minute).ToList()
				})
                .OrderByDescending(x => x.AttendanceRecord.InstanceDate.Year)
                .ThenByDescending(x => x.AttendanceRecord.InstanceDate.Month)
                .ThenByDescending(x => x.AttendanceRecord.InstanceDate.Day)
                .ThenBy(x => x.TimeRecords.FirstOrDefault()?.StartTime.Hour)
                .ThenBy(x => x.TimeRecords.FirstOrDefault()?.StartTime.Minute)
                .ToList()
		};
	}
}
