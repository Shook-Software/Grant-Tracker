import { LocalDate, LocalTime } from '@js-joda/core'
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

export function nonEmptyDaysHaveSameSchedules(week: WeeklySchedule): boolean {
  const toKeyTime = (t: LocalTime) => String(t); // adapt if LocalTime is an object
  const dayKey = (d: DayScheduleForm) =>
    d.timeSchedules
      .map(ts => `${toKeyTime(ts.startTime)}→${toKeyTime(ts.endTime)}`)
      .sort()                      // ignore order
      .join("|");                  // canonical string for comparison

  // Find the first non-empty day as reference
  const firstIdx = week.findIndex(d => d.timeSchedules.length > 0);
  if (firstIdx === -1) return true; // no schedules at all → true

  const ref = dayKey(week[firstIdx]);

  // Compare every other non-empty day to the reference
  return week.every((d, i) => d.timeSchedules.length === 0 || dayKey(d) === ref);
}

export abstract class DaySchedule {
  public static createWeeklySchedule (): WeeklySchedule {
    const today: LocalDate = LocalDate.now()

    return [...daysOfWeekNumeric.map(day => ({
      dayOfWeek: DayOfWeek.toString(day),
      recurs: [1, 2, 3, 4, 5].includes(day),
      timeSchedules: ([1, 2, 3, 4, 5].includes(day)
        ? [{ startTime: LocalTime.MIDNIGHT, endTime: LocalTime.MIDNIGHT }]
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
