using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class SimpleAttendanceViewModel
	{
		public Guid AttendanceGuid { get; set; }
		public DateOnly InstanceDate { get; set; }
		public int InstructorCount { get; set; }
		public int StudentCount { get; set; }
	}


	public class AttendanceViewModel
	{
		public class AttendanceSessionViewModel
		{
			public Guid Guid { get; set; }
			public string Name { get; set; }
		}

		public Guid Guid { get; set; }
		public DateOnly InstanceDate { get; set; }
		public AttendanceSessionViewModel Session { get; set; }
		public List<StudentAttendanceViewModel> StudentAttendanceRecords { get; set; }
		public List<InstructorAttendanceViewModel> InstructorAttendanceRecords { get; set; }

		public static AttendanceViewModel FromDatabase(AttendanceRecord record)
		{
			return new AttendanceViewModel()
			{
				Guid = record.Guid,
				InstanceDate = record.InstanceDate,
				Session = record.Session != null ? new AttendanceSessionViewModel()
				{
					Guid = record.SessionGuid,
					Name = record.Session.Name
				} : null,
				StudentAttendanceRecords = record.StudentAttendance
					.Select(attend => new StudentAttendanceViewModel()
						{
							Guid = attend.Guid,
							StudentSchoolYear = StudentSchoolYearViewModel.FromDatabase(attend.StudentSchoolYear),
							TimeRecords = attend.TimeRecords.Select(time => AttendanceTimeRecordViewModel.FromDatabase(time)).ToList(),
							FamilyAttendance = attend.FamilyAttendance
								.GroupBy(fa => fa.FamilyMember,
								(familyMember, group) => new FamilyAttendanceViewModel
								{
									FamilyMember = familyMember,
									Count = group.Count()
								})
								.ToList()
					})
					.ToList(),
				InstructorAttendanceRecords = record.InstructorAttendance
					.Select(attend => new InstructorAttendanceViewModel()
					{
						Guid = attend.Guid,
						InstructorSchoolYear = InstructorSchoolYearViewModel.FromDatabase(attend.InstructorSchoolYear),
						TimeRecords = attend.TimeRecords.Select(time => AttendanceTimeRecordViewModel.FromDatabase(time)).ToList()
					})
					.ToList()
			};
		}
	}

	public class AttendanceTimeRecordViewModel
	{
		public Guid Guid { get; set; }
		public TimeOnly EntryTime { get; set; }
		public TimeOnly ExitTime { get; set; }

		public static AttendanceTimeRecordViewModel FromDatabase(StudentAttendanceTimeRecord attendance) => new()
		{
			Guid = attendance.Guid,
			EntryTime = attendance.EntryTime,
			ExitTime = attendance.ExitTime
		};

		public static AttendanceTimeRecordViewModel FromDatabase(InstructorAttendanceTimeRecord attendance) => new()
		{
			Guid = attendance.Guid,
			EntryTime = attendance.EntryTime,
			ExitTime = attendance.ExitTime
		};
	}

	public class FamilyAttendanceViewModel
	{
		public FamilyMember FamilyMember { get; set; }
		public int Count { get; set; }
	}

	public class StudentAttendanceViewModel
	{
		public Guid Guid { get; set; }
		public AttendanceViewModel AttendanceRecord { get; set; }
		public StudentSchoolYearViewModel StudentSchoolYear { get; set; }
		public List<AttendanceTimeRecordViewModel> TimeRecords { get; set; }
		public List<FamilyAttendanceViewModel> FamilyAttendance { get; set; }
	}

	public class InstructorAttendanceViewModel
	{
		public Guid Guid { get; set; }
		public AttendanceViewModel AttendanceRecord { get; set; }
		public InstructorSchoolYearViewModel InstructorSchoolYear { get; set; }
		public List<AttendanceTimeRecordViewModel> TimeRecords { get; set; }
	}


}
