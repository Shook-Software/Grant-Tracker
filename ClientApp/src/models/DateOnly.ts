import { LocalDate } from "@js-joda/core"

export interface DateOnly {
  year: number
  month: number
  day: number
}

export abstract class DateOnly {
  public static toLocalDate(obj: DateOnly): LocalDate {
    return LocalDate.of(obj.year, obj.month, obj.day)
  }
}