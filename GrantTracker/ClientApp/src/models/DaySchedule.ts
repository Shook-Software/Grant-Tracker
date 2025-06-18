import { LocalDate } from '@js-joda/core'
import {
  TimeSchedule,
  TimeScheduleDomain,
  TimeScheduleView,
  TimeScheduleForm,
  timeScheduleComparer
} from './TimeSchedule'
import {
  daysOfWeekNumeric,
  DayOfWeekNumeric,
  DayOfWeekString,
  DayOfWeek
} from './DayOfWeek'

export interface DayScheduleDomain {
  dayScheduleGuid: string
  sessionGuid: string
  dayOfWeek: DayOfWeekNumeric
  timeSchedules: TimeScheduleDomain[]
}

//should I make all view model fields readonly?
export interface DayScheduleView {
  dayScheduleGuid: string
  dayOfWeek: DayOfWeekNumeric
  timeSchedules: TimeScheduleView[]
}

export interface DayScheduleForm {
  dayOfWeek: DayOfWeekString
  recurs: boolean
  timeSchedules: TimeScheduleForm[]
}

export type WeeklySchedule = [
  DayScheduleForm, //Sunday
  DayScheduleForm,
  DayScheduleForm, //Tuesday
  DayScheduleForm,
  DayScheduleForm, //Thursday
  DayScheduleForm,
  DayScheduleForm //Saturday
]

export function dayScheduleComparer (
  first: DayScheduleDomain,
  second: DayScheduleDomain
): -1 | 0 | 1 {
  if (!first || !second) return 0
  if (first.dayOfWeek > second.dayOfWeek) return 1
  if (first.dayOfWeek < second.dayOfWeek) return -1
  return 0
}

export abstract class DaySchedule {
  public static createWeeklySchedule (): WeeklySchedule {
    const today: LocalDate = LocalDate.now()

    return [...daysOfWeekNumeric.map(day => ({
      dayOfWeek: DayOfWeek.toString(day),
      recurs: false,
      timeSchedules: (day === today.dayOfWeek().value()
        ? []
        : []) as TimeScheduleForm[]
    })) as WeeklySchedule]
  }

  public static toViewModel (obj: DayScheduleDomain): DayScheduleView {
    return {
      dayScheduleGuid: obj.dayScheduleGuid,
      dayOfWeek: DayOfWeek.toString(obj.dayOfWeek),
      timeSchedules: obj.timeSchedules?.map(schedule => TimeSchedule.toViewModel(schedule))
        .sort(timeScheduleComparer)
    }
  }
}
