import { LocalTime } from "@js-joda/core"

export interface TimeOnly {
  hour: number
  minute: number
}

export abstract class TimeOnly {
  public static toLocalTime(obj: TimeOnly): LocalTime {
    return LocalTime.of(obj.hour, obj.minute)
  }
}