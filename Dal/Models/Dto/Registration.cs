using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Schema;

namespace GrantTracker.Dal.Models.Dto
{
	public class Registration
	{
		public Guid SchoolYearGuid { get; set; }
		public List<DayScheduleView> ScheduleAdditions { get; set; } = new List<DayScheduleView>();
		public List<DayScheduleView> Conflicts { get; set; } = new List<DayScheduleView>();


		private bool HasTimeConflict(List<TimeScheduleView> existingTimeSchedules, TimeScheduleView newTimeSchedule)
		{
			return existingTimeSchedules.Any(existingTimeSchedule =>
				{
					//if new end time is after the existing start time, and the new start time is before the existing end time
					if (existingTimeSchedule.StartTime < newTimeSchedule.EndTime && existingTimeSchedule.EndTime > newTimeSchedule.StartTime)
						return true;
					//ensure that the two sessions don't have the same start and end time
					else if (existingTimeSchedule.StartTime == newTimeSchedule.StartTime && existingTimeSchedule.EndTime == newTimeSchedule.EndTime)
						return true;
					return false;
				});
		}

		public void SetConflicts(List<DayScheduleView> existingSchedules)
		{
			List<SessionDaySchedule> conflictingSchedules = new();

			foreach (var newDaySchedule in ScheduleAdditions)
			{
				//Test if a session registration exists on the same day
				var existingSameDaySchedules = existingSchedules.Where(s => s.DayOfWeek == newDaySchedule.DayOfWeek).ToList();

				foreach (var existingSameDaySchedule in existingSameDaySchedules)
					foreach (var timeSchedule in newDaySchedule.TimeSchedules.Select((schedule, index) => (schedule, index)))
					{
						int index = timeSchedule.index;
						var newTimeSchedule = timeSchedule.schedule;

						if (existingSameDaySchedule.TimeSchedules is not null && HasTimeConflict(existingSameDaySchedule.TimeSchedules, newTimeSchedule))
							Conflicts.Add(newDaySchedule);
					}
				}
		}
	}
}