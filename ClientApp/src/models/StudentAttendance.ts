import { LocalDate } from '@js-joda/core'
import { DateOnly } from './DateOnly'
import { StudentSchoolYearWithRecordsView } from 'Models/Student'
import { TimeScheduleForm } from './TimeSchedule'
import { InstructorSchoolYearView } from './Instructor'

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

export interface InstructorRecord {
  isPresent: boolean
  attendance: TimeScheduleForm[]
  instructorSchoolYear: InstructorSchoolYearView
}

export interface SubstituteRecord {
  substitute: {
    id: string
    firstName: string
    lastName: string
    badgeNumber: string
    statusGuid: string
  },
  attendance: TimeScheduleForm[]
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
