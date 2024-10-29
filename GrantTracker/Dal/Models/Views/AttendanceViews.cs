using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class SimpleAttendanceViewModel
	{
		public Guid AttendanceGuid { get; set; }
		public DateOnly InstanceDate { get; set; }
		public int InstructorCount { get; set; }
		public int StudentCount { get; set; }
		public int FamilyCount { get; set; }
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
			List<StudentAttendanceViewModel> studentAttendanceRecords = new();

			if (record.FamilyAttendance.Any() && record.StudentAttendance is null) //parent session
				studentAttendanceRecords = record.FamilyAttendance
					.GroupBy(fa => fa.StudentSchoolYearGuid,
						(ssyGuid, group) => new StudentAttendanceViewModel()
						{
							StudentSchoolYear = StudentSchoolYearViewModel.FromDatabase(group.First().StudentSchoolYear),
							TimeRecords = [],
							FamilyAttendance = group
								.GroupBy(fa => fa.FamilyMember,
								(familyMember, group) => new FamilyAttendanceViewModel
								{
									FamilyMember = familyMember,
									Count = group.Count()
								})
								.ToList()
						})
					.ToList();
			else if (record.FamilyAttendance.Any())
			{
				studentAttendanceRecords = record.FamilyAttendance?
					.GroupBy(fa => fa.StudentSchoolYearGuid,
						(ssyGuid, group) => new StudentAttendanceViewModel()
                        {
                            Guid = group.First().AttendanceRecordGuid,
                            StudentSchoolYear = StudentSchoolYearViewModel.FromDatabase(group.First().StudentSchoolYear),
							TimeRecords = record.StudentAttendance
								.FirstOrDefault(sa => sa.StudentSchoolYearGuid == ssyGuid)
								?.TimeRecords
								.Select(time => AttendanceTimeRecordViewModel.FromDatabase(time))
								.ToList(),
							FamilyAttendance = group
								.GroupBy(fa => fa.FamilyMember,
								(familyMember, group) => new FamilyAttendanceViewModel
								{
									FamilyMember = familyMember,
									Count = group.Count()
								})
								.ToList()
						})
					.ToList() ?? new();

				studentAttendanceRecords = record.StudentAttendance? //for students that somehow showed up with no parent
					.Where(sa => !studentAttendanceRecords.Any(sar => sar.StudentSchoolYear.Guid == sa.StudentSchoolYearGuid)) //where not already in the records
                    .Select(attend => new StudentAttendanceViewModel()
                    {
                        Guid = attend.Guid,
                        StudentSchoolYear = StudentSchoolYearViewModel.FromDatabase(attend.StudentSchoolYear),
                        TimeRecords = attend.TimeRecords.Select(time => AttendanceTimeRecordViewModel.FromDatabase(time)).ToList(),
						FamilyAttendance = record.FamilyAttendance
							.Where(fa => fa.StudentSchoolYearGuid == attend.StudentSchoolYearGuid)
                            .GroupBy(fa => fa.FamilyMember,
                            (familyMember, group) => new FamilyAttendanceViewModel
                            {
                                FamilyMember = familyMember,
                                Count = group.Count()
                            })
                            .ToList()
                    })
                    .Concat(studentAttendanceRecords)
					.ToList() ?? studentAttendanceRecords;
            }
			else
				studentAttendanceRecords = record.StudentAttendance?
					.Select(attend => new StudentAttendanceViewModel()
					{
						Guid = attend.Guid,
						StudentSchoolYear = StudentSchoolYearViewModel.FromDatabase(attend.StudentSchoolYear),
						TimeRecords = attend.TimeRecords.Select(time => AttendanceTimeRecordViewModel.FromDatabase(time)).ToList(),
						FamilyAttendance = record.FamilyAttendance
								.Where(x => x.StudentSchoolYearGuid == attend.StudentSchoolYearGuid)
								.GroupBy(fa => fa.FamilyMember,
								(familyMember, group) => new FamilyAttendanceViewModel
								{
									FamilyMember = familyMember,
									Count = group.Count()
								})
								.ToList()
					})
					.ToList() ?? new();



            return new AttendanceViewModel()
			{
				Guid = record.Guid,
				InstanceDate = record.InstanceDate,
				Session = record.Session != null ? new AttendanceSessionViewModel()
				{
					Guid = record.SessionGuid,
					Name = record.Session.Name
				} : null,
				StudentAttendanceRecords = studentAttendanceRecords,
				InstructorAttendanceRecords = record.InstructorAttendance
					.Select(attend => new InstructorAttendanceViewModel()
					{
						Guid = attend.Guid,
						IsSubstitute = attend.IsSubstitute,
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
		public TimeOnly StartTime { get; set; }
		public TimeOnly EndTime { get; set; }

		public static AttendanceTimeRecordViewModel FromDatabase(StudentAttendanceTimeRecord attendance) => new()
		{
			Guid = attendance.Guid,
			StartTime = attendance.EntryTime,
			EndTime = attendance.ExitTime
		};

		public static AttendanceTimeRecordViewModel FromDatabase(InstructorAttendanceTimeRecord attendance) => new()
		{
			Guid = attendance.Guid,
			StartTime = attendance.EntryTime,
			EndTime = attendance.ExitTime
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
        public bool IsSubstitute { get; set; }
        public AttendanceViewModel AttendanceRecord { get; set; }
		public InstructorSchoolYearViewModel InstructorSchoolYear { get; set; }
		public List<AttendanceTimeRecordViewModel> TimeRecords { get; set; }
	}
}
