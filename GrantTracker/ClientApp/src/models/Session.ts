import { LocalDate, LocalDateTime, LocalTime } from '@js-joda/core'

import { DateOnly } from './DateOnly'
import { DayOfWeek, DayOfWeekNumeric } from './DayOfWeek'
import { Grade, GradeDomain, GradeView } from './Grade'
import { Instructor, InstructorSchoolYearView, InstructorView } from './Instructor'
import * as DaySchedule from './DaySchedule'
import { TimeSchedule } from './TimeSchedule'
import { BlackoutDate, SessionBlackoutDateDomain, SessionBlackoutDateView } from './BlackoutDate'

export interface DropdownOption {
  guid: string | null
  abbreviation?: string
  label: string
  description?: string
  deactivatedAt?: LocalDateTime | null
}

export interface SimpleSessionView {
  sessionGuid: string
  name: string
  sessionType: DropdownOption
  activity: DropdownOption
  firstSessionDate: LocalDate
  lastSessionDate: LocalDate
  instructors: InstructorView[]
  daySchedules: DaySchedule.DayScheduleView[]
  sessionGrades: GradeView[]
}

export interface SessionDomain {
  guid: string
  name: string
  firstSession: DateOnly
  lastSession: DateOnly
  recurring: boolean
  organization: DropdownOption
  sessionType: DropdownOption
  activity: DropdownOption
  objectives: DropdownOption[]
  fundingSource: DropdownOption
  organizationType: DropdownOption
  partnershipType: DropdownOption
  daySchedules: DaySchedule.DayScheduleDomain[]
  instructors: InstructorSchoolYearView[]
  sessionGrades: GradeDomain[]
  blackoutDates: SessionBlackoutDateDomain[]
}

export interface SessionView {
  guid: string
  name: string
  firstSession: LocalDate
  lastSession: LocalDate
  recurring: boolean
  organization: DropdownOption
  sessionType: DropdownOption
  activity: DropdownOption
  objectives: DropdownOption[]
  fundingSource: DropdownOption
  organizationType: DropdownOption
  partnershipType: DropdownOption
  daySchedules: DaySchedule.DayScheduleView[]
  instructors: InstructorSchoolYearView[]
  grades: GradeView[]
  blackoutDates: SessionBlackoutDateView[]
}

export interface SessionForm {
  guid?: string
  name: string
  type: string
  activity: string
  objectives: string[]
  fundingSource: string
  organizationType: string
  partnershipType: string
  firstSessionDate: LocalDate
  lastSessionDate: LocalDate
  recurring: boolean
  scheduling: DaySchedule.WeeklySchedule
  grades: string[]
  instructors: { guid: string; label: string }[]
  blackoutDates: SessionBlackoutDateView[]
}

export abstract class Session {
  public static toViewModel (obj: SessionDomain): SessionView {
    return {
      ...obj,
      firstSession: DateOnly.toLocalDate(obj.firstSession),
      lastSession: DateOnly.toLocalDate(obj.lastSession),
      daySchedules: obj.daySchedules.map(day => DaySchedule.DaySchedule.toViewModel(day)),
      grades: obj.sessionGrades.map(grade => Grade.toViewModel(grade)),
      blackoutDates: obj.blackoutDates.map(date => BlackoutDate.toViewModel(date))
    }
  }

  public static toFormModel (obj: SessionDomain): SessionForm {
    const firstSession: LocalDate = DateOnly.toLocalDate(obj.firstSession)

    return {
      guid: obj.guid,
      name: obj.name,
      activity: obj.activity.guid,
      objectives: obj.objectives.map(obj => obj.guid),
      type: obj.sessionType.guid,
      instructors: obj.instructors.map(reg => ({
        guid: reg.guid,
        label: `${reg.instructor.firstName} ${reg.instructor.lastName}`
      })),
      fundingSource: obj.fundingSource.guid,
      organizationType: obj.organizationType.guid,
      partnershipType: obj.partnershipType.guid,
      firstSessionDate: firstSession,
      lastSessionDate: DateOnly.toLocalDate(obj.lastSession),
      recurring: true,
      organizationYear: {...obj.organizationYear},
      scheduling: DaySchedule.DaySchedule.createWeeklySchedule().map((day, index) => {
        const domainSchedule:
          | DaySchedule.DayScheduleDomain
          | undefined = obj.daySchedules.find(
          domainDay => DayOfWeek.toString(domainDay.dayOfWeek) === day.dayOfWeek
        )

        if (domainSchedule) {
          day.recurs = true
          day.timeSchedules = domainSchedule.timeSchedules.map(time =>
            TimeSchedule.toFormModel(time)
          )
        }
        else {
          day.recurs = false;
          day.timeSchedules = [];
        }
        return day
      }) as DaySchedule.WeeklySchedule,
      grades: obj.sessionGrades?.map(grade => grade.gradeGuid) || [],
      blackoutDates: obj.blackoutDates.map(date => BlackoutDate.toViewModel(date))
    }
  }

  public static createDefaultForm (): SessionForm {
    let baseSchedule = DaySchedule.DaySchedule.createWeeklySchedule()
    let today = LocalDate.now()
    /*baseSchedule[today.dayOfWeek().value()] = {
      dayOfWeek: DayOfWeek.toString(today.dayOfWeek().value()),
      recurs: false,
      timeSchedules: [
        {
          startTime: LocalTime.MIDNIGHT,
          endTime: LocalTime.MIDNIGHT
        }
      ]
    }*/

    return {
      name: '',
      type: '',
      activity: '',
      objectives: [],
      instructors: [],
      fundingSource: '',
      organizationType: '',
      partnershipType: '',
      firstSessionDate: today,
      lastSessionDate: today,
      recurring: true,
      scheduling: baseSchedule,
      grades: [],
      blackoutDates: []
    }
  }
}
