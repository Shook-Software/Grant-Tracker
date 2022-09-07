import { LocalDate } from '@js-joda/core'
import { DateOnly } from './DateOnly'
import { StudentSchoolYear, StudentSchoolYearWithRecordsView } from 'Models/Student'
import { TimeScheduleForm } from './TimeSchedule'
import { Session, SessionDomain, SessionView } from './Session'

//change to form or something
export interface StudentAttendanceDto {
  sessionGuid: string
  date: LocalDate
  studentRecords: any
}

export interface StudentRecord {
  isPresent: boolean
  attendance: TimeScheduleForm[]
  studentSchoolYear: StudentSchoolYearWithRecordsView
}

export interface AttendanceDomain {
  sessionGuid: string
  sessionName: string
  minutesAttended: number
  instanceDate: DateOnly
}

export interface AttendanceView {
  sessionGuid: string
  sessionName: string
  minutesAttended: number
  instanceDate: LocalDate
}

export abstract class Attendance {
  public static toViewModel (obj: AttendanceDomain): AttendanceView {
    return {
      ...obj,
      instanceDate: DateOnly.toLocalDate(obj.instanceDate)
    }
  }
}
