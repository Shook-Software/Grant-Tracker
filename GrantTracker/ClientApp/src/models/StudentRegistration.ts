import { DaySchedule, DayScheduleDomain, DayScheduleView } from './DaySchedule'
import { StudentSchoolYear, StudentSchoolYearView } from './Student'

export interface StudentRegistrationDomain {
 sessionGuid: string
 sessionName: string
 studentSchoolYear: StudentSchoolYearView
 schedule: DayScheduleDomain[]
}

export interface StudentRegistrationView {
  sessionGuid: string
  sessionName: string
  studentSchoolYear: StudentSchoolYearView
  schedule: DayScheduleView[]
}

export abstract class StudentRegistration {
  public static toViewModel (obj: StudentRegistrationDomain): StudentRegistrationView {
    return {
      ...obj,
      schedule: obj.schedule.map(day => DaySchedule.toViewModel(day))
    }
  }
}
