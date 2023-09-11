using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Views
{
	public class EnrollmentView
	{
		public Tuple<Guid, Guid> Key { get; set; } //guid of the enrollment
		public string SessionName { get; set; }
		public List<DayScheduleView> Schedule { get; set; }

		public static EnrollmentView FromDatabase(InstructorRegistration registration) => new()
		{
			Key = Tuple.Create(registration.SessionGuid, registration.InstructorSchoolYearGuid),
			SessionName = registration.Session.Name,
			Schedule = registration.Session.DaySchedules.Select(DayScheduleView.FromDatabase).ToList()
		};
	}
}
