
import { DaySchedule, DayScheduleDomain, DayScheduleView } from './DaySchedule'

export interface RegistrationDomain {
  scheduleGuid: string
  studentGuid: string
  schedule: DayScheduleDomain
}

export interface RegistrationView {
  scheduleGuid: string
  studentGuid: string
  schedule: DayScheduleView
}

export abstract class Registration {
  public static toViewModel(obj: RegistrationDomain): RegistrationView {
    return {
      ...obj,
      schedule: DaySchedule.toViewModel(obj?.schedule) || DaySchedule.toViewModel(obj.daySchedule)
    }
  }
}