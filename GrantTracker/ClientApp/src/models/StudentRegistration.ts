import { DaySchedule, DayScheduleDomain, DayScheduleView } from './DaySchedule'
import { StudentSchoolYear, StudentSchoolYearView } from './Student'

export interface StudentRegistrationDomain {
 sessionGuid: string
 sessionName: string
 studentSchoolYear: StudentSchoolYearView
 daySchedule: DayScheduleDomain
}

export interface StudentRegistrationView {
  sessionGuid: string
  sessionName: string
  studentSchoolYear: StudentSchoolYearView
  daySchedule: DayScheduleView
}

export abstract class StudentRegistration {
  public static toViewModel (obj: StudentRegistrationDomain): StudentRegistrationView {
    return {
      ...obj,
      daySchedule: DaySchedule.toViewModel(obj.daySchedule)
    }
  }
}
