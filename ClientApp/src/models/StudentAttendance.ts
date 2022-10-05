import { LocalDate, LocalTime } from '@js-joda/core'
import { DateOnly } from './DateOnly'
import { StudentSchoolYearView, StudentSchoolYearWithRecordsView } from 'Models/Student'
import { TimeScheduleForm } from './TimeSchedule'
import { InstructorSchoolYearView } from './Instructor'
import { TimeOnly } from './TimeOnly'

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
  guid: string
  session: {
    guid: string
    name: string
  }
  instanceDate: DateOnly
  //arrays that can be null
}

export interface AttendanceView {
  guid: string
  session: {
    guid: string
    name: string
  }
  instanceDate: LocalDate
  studentAttendanceRecords: StudentAttendanceView[]
  //arrays that can be null
}

export interface StudentAttendanceDomain {
  guid: string
  attendanceRecord: AttendanceDomain | null
  studentSchoolYear: StudentSchoolYearView
  timeRecords: AttendanceTimeRecordDomain[]
}

export interface StudentAttendanceView {
  guid: string
  attendanceRecord: AttendanceView | null
  studentSchoolYear: StudentSchoolYearView
  timeRecords: AttendanceTimeRecordView[]
}

export interface AttendanceTimeRecordDomain {
  guid: string
  entryTime: TimeOnly
  exitTime: TimeOnly
}

export interface AttendanceTimeRecordView {
  guid: string
  entryTime: LocalTime
  exitTime: LocalTime
}

export abstract class StudentAttendance {
  public static toViewModel (obj: StudentAttendanceDomain): StudentAttendanceView {
    if (!obj) return obj
    
    return {
      ...obj,
      attendanceRecord: obj.attendanceRecord ? {
        guid: obj.attendanceRecord.guid,
        instanceDate: DateOnly.toLocalDate(obj.attendanceRecord.instanceDate),
        session: {...obj.attendanceRecord.session}
      } : null,
      timeRecords: obj.timeRecords.map(time => ({
        guid: time.guid,
        entryTime: TimeOnly.toLocalTime(time.entryTime),
        exitTime: TimeOnly.toLocalTime(time.exitTime)
      }))
    }
  }
}
