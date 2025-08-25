import { LocalDateTime } from "@js-joda/core"

export interface DateTime {
	day: number
	hour: number
	minute: number
	month: number
	year: number
}

export abstract class DateTime {
	public static toLocalTime(obj: DateTime): LocalDateTime {
		if (obj instanceof LocalDateTime)
			return obj;

	  	return LocalDateTime.of(obj.year, obj.month, obj.day, obj.hour, obj.minute)
	}
  }