namespace GrantTracker.Dal.Models.DTO.ActionCenter
{
	public class TodayAttendanceDTO
	{
		public Guid SessionGuid { get; set; }
		public string SessionName { get; set; }
		public DateOnly InstanceDate { get; set; }
		public bool HasAttendance { get; set; }
	}

	public class OutstandingAttendanceDTO
	{
		public Guid SessionGuid { get; set; }
		public string SessionName { get; set; }
		public DateOnly InstanceDate { get; set; }
	}
}
