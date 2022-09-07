using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace GrantTracker.Dal.Schema
{
	public class DateOnlyConverter : ValueConverter<DateOnly, DateTime>
	{
		public DateOnlyConverter() : base(date => date.ToDateTime(TimeOnly.MinValue), date => DateOnly.FromDateTime(date))
		{ }
	}

	public class TimeOnlyConverter : ValueConverter<TimeOnly, TimeSpan>
	{
		public TimeOnlyConverter() : base(time => time.ToTimeSpan(), time => TimeOnly.FromTimeSpan(time))
		{ }
	}

	public class DayOfWeekEnumConverter : ValueConverter<DayOfWeek, byte>
	{
		public DayOfWeekEnumConverter() : base(day => (byte)day, day => (DayOfWeek)day)
		{ }
	}

	public class IdentityClaimConverter : ValueConverter<IdentityClaim, byte>
	{
		public IdentityClaimConverter() : base(claim => (byte)claim, claim => (IdentityClaim)claim)
		{ }
	}
}