import { LocalDate, LocalTime } from '@js-joda/core'
import { DateOnly } from './DateOnly'
import { StudentSchoolYearView, StudentSchoolYearWithRecordsView } from 'Models/Student'
import { TimeScheduleForm } from './TimeSchedule'
import { InstructorSchoolYearView } from './Instructor'
import { TimeOnly } from './TimeOnly'
import { FamilyMember } from './FamilyMember'

//change to form or something
export interface StudentAttendanceDto {
  sessionGuid: string
  date: LocalDate
  studentRecords: any
}

export interface FamilyRecord {
  familyMember: FamilyMember
  count: number
}

export interface StudentRecord {
  isPresent: boolean
  studentSchoolYear: StudentSchoolYearWithRecordsView
  attendance: TimeScheduleForm[]
  familyAttendance: FamilyRecord[]
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

export interface SimpleAttendanceView {
  guid: string
  instanceDate: LocalDate
  instructorCount: number
  studentCount: number
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
  startTime: TimeOnly
  endTime: TimeOnly
}

export interface AttendanceTimeRecordView {
  guid: string
  startTime: LocalTime
  endTime: LocalTime
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
        startTime: TimeOnly.toLocalTime(time.startTime),
        endTime: TimeOnly.toLocalTime(time.endTime)
      }))
    }
  }
}
