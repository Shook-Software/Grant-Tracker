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

  public static convertToLocalDateAndSort(dates: DateOnly[]): LocalDate[] {
    return dates.map(date => DateOnly.toLocalDate(date)).sort((firstDate: LocalDate, secondDate: LocalDate) => {
      if (firstDate.isBefore(secondDate))
        return 1
      else if (firstDate.isAfter(secondDate))
        return -1

      return 0
    })
  }
}