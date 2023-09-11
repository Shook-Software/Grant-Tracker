import { LocalDate, LocalTime } from '@js-joda/core'
import {AttendanceDomain} from './StudentAttendance'
import { TimeOnly } from './TimeOnly'
import { DateOnly } from './DateOnly'


export interface AttendanceView {
	guid: string
	session: {
	  guid: string
	  name: string
	}
	instanceDate: LocalDate
	instructorAttendanceRecords: InstructorAttendanceView[]
	//arrays that can be null
  }
  
  export interface InstructorAttendanceDomain {
	guid: string
	attendanceRecord: AttendanceDomain | null
	//instructorSchoolYear: StudentSchoolYearView
	timeRecords: AttendanceTimeRecordDomain[]
  }
  
  export interface InstructorAttendanceView { 
	guid: string
	attendanceRecord: AttendanceView | null
	//studentSchoolYear: StudentSchoolYearView
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

export abstract class InstructorAttendance {
	public static toViewModel (obj: InstructorAttendanceDomain): InstructorAttendanceView {
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