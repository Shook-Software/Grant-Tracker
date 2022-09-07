using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace GrantTracker.Utilities.OnStartup
{
	public class DateOnlyJsonConverter : JsonConverter<DateOnly>
	{
		private const string DateFormat = "yyyy-MM-dd";

		public override DateOnly Read(ref Utf8JsonReader reader, Type objectType, JsonSerializerOptions options)
		{
			return DateOnly.ParseExact(reader.GetString(), DateFormat, CultureInfo.InvariantCulture);
		}

		public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions serializer)
		{
			writer.WriteStartObject();
			writer.WriteNumber("year", value.Year);
			writer.WriteNumber("month", value.Month);
			writer.WriteNumber("day", value.Day);
			writer.WriteEndObject();
		}
	}

	public class TimeOnlyJsonConverter : JsonConverter<TimeOnly>
	{
		private const string TimeFormat = "HH:mm";

		public override TimeOnly Read(ref Utf8JsonReader reader, Type objectType, JsonSerializerOptions options)
		{
			return TimeOnly.ParseExact(reader.GetString(), TimeFormat, CultureInfo.InvariantCulture);
		}

		public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions serializer)
		{
			writer.WriteStartObject();
			writer.WriteNumber("hour", value.Hour);
			writer.WriteNumber("minute", value.Minute);
			writer.WriteEndObject();
		}
	}

	public static class JSONConverters
	{
		public static void Setup(WebApplicationBuilder builder)
		{
			builder.Services.AddControllers()
				.AddJsonOptions(json =>
				{
					json.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
					json.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
					json.JsonSerializerOptions.Converters.Add(new TimeOnlyJsonConverter());
				});
		}
	}
}