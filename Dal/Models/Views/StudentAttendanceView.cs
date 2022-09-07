using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views;

public class AttendanceView
{
	public Guid SessionGuid { get; set; }
	public string SessionName { get; set; }
	public short MinutesAttended { get; set; }
	public DateOnly InstanceDate { get; set; }

	public static AttendanceView FromDatabase(StudentAttendance record)
	{
		return new AttendanceView()
		{
			SessionGuid = record.SessionGuid,
			SessionName = record.Session.Name,
			MinutesAttended = record.MinutesAttended,
			InstanceDate = record.InstanceDate
		};
	}
}
