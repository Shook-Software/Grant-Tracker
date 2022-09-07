import { LocalDate, LocalTime } from '@js-joda/core'
import { StudentRecord } from 'Models/StudentAttendance'
import { TimeScheduleView } from 'Models/TimeSchedule'

export interface AttendanceForm {
  defaultSchedule: TimeScheduleView[]
  date: LocalDate
  studentRecords: StudentRecord[]
  instructorRecords: any[]
}

export type ReducerAction =
  | {
      type: 'addSubstitute'
      payload: any
    }
  | {
      type: 'scheduleStartShift'
      payload: { index: number; startTime: LocalTime }
    }
  | {
      type: 'scheduleEndShift'
      payload: { index: number; endTime: LocalTime }
    }
  | {
      type: 'instructorRecords'
      payload: any[]
    }
  | {
      type: 'instructorPresence'
      payload: { instructorSchoolYearGuid: string; isPresent: boolean }
    }
  | {
      type: 'instructorStartTime'
      payload: { instructorSchoolYearGuid: string; startTime: LocalTime }
    }
  | {
      type: 'instructorEndTime'
      payload: { instructorSchoolYearGuid: string; endTime: LocalTime }
    }
  | { type: 'instanceDate'; payload: string }
  | { type: 'studentRecords'; payload: StudentRecord[] }
  | { type: 'studentPresence'; payload: { guid: string; isPresent: boolean } }
  | {
      type: 'studentStartTime'
      payload: { guid: string; index: number; startTime: LocalTime }
    }
  | {
      type: 'studentEndTime'
      payload: { guid: string; index: number; endTime: LocalTime }
    }

//add in validation
export function reducer (
  state: AttendanceForm,
  action: ReducerAction
): AttendanceForm {
  switch (action.type) {
    /*case 'addSubstitute':
      var newRecords = [
        ...state.substituteRecords,
        {
          ...action.payload,
          attendance: state.defaultSchedule
        }
      ]

      return { ...state, substituteRecords: newRecords }*/

    case 'scheduleStartShift':
      state.defaultSchedule[action.payload.index].startTime =
        action.payload.startTime

      var newStudentRecords = state.studentRecords.map(record => {
        record.attendance = record.attendance.map((att, index) => {
          if (index === action.payload.index)
            att.startTime = action.payload.startTime

          return att
        })
        return record
      })

      var newInstructorRecords = state.instructorRecords.map(record => {
        record.attendance = record.attendance.map((att, index) => {
          if (index === action.payload.index)
            att.startTime = action.payload.startTime

          return att
        })
        return record
      })

      /*var newSubRecords = state.substituteRecords.map(record => {
        record.attendance = record.attendance.map((att, index) => {
          if (index === action.payload.index)
            att.startTime = action.payload.startTime

          return att
        })
        return record
      })*/

      return {
        ...state,
        studentRecords: newStudentRecords,
        instructorRecords: newInstructorRecords
      }

    case 'scheduleEndShift':
      state.defaultSchedule[action.payload.index].endTime =
        action.payload.endTime

      var newStudentRecords = state.studentRecords.map(record => {
        record.attendance = record.attendance.map((att, index) => {
          if (index === action.payload.index)
            att.endTime = action.payload.endTime

          return att
        })
        return record
      })

      var newInstructorRecords = state.instructorRecords.map(record => {
        record.attendance = record.attendance.map((att, index) => {
          if (index === action.payload.index)
            att.endTime = action.payload.endTime

          return att
        })
        return record
      })

      /*var newSubRecords = state.substituteRecords.map(record => {
        record.attendance = record.attendance.map((att, index) => {
          if (index === action.payload.index)
            att.endTime = action.payload.endTime

          return att
        })
        return record
      })*/

      return {
        ...state,
        studentRecords: newStudentRecords,
        instructorRecords: newInstructorRecords
      }

    case 'instructorRecords':
      return { ...state, instructorRecords: action.payload }

    case 'instructorPresence':
      var instructorRecord = state.instructorRecords.find(
        record =>
          record.instructor.instructorSchoolYearGuid ==
          action.payload.instructorSchoolYearGuid
      )

      instructorRecord.isPresent = action.payload.isPresent
      //just rewrite this someday later
      return { ...state, instructorRecords: state.instructorRecords }

    case 'instructorStartTime':
      /*var alteredRecords: StudentRecord[] = state.studentRecords.map(record => {
        record.attendance[action.payload.index].startTime = action.payload.startTime
        return record



      return {
        ...state,
        defaultSchedule: state.defaultSchedule.map((schedule, index) => {
          if (action.payload.index === index)
            return { ...schedule, startTime: action.payload.startTime }
          return schedule
        }),
        studentRecords: alteredRecords
      }

      })*/

      var record: any = state.instructorRecords.find(
        record =>
          record.instructor.studentSchoolYearGuid ===
          action.payload.instructorSchoolYearGuid
      )

      record.startTime = action.payload.startTime
      return { ...state }

    case 'instructorEndTime':
      /*var alteredRecords: StudentRecord[] = state.studentRecords.map(record => {
        record.attendance[action.payload.index].endTime = action.payload.endTime
        return record
      })

      return {
        ...state,
        defaultSchedule: state.defaultSchedule.map((schedule, index) => {
          if (action.payload.index === index)
            return { ...schedule, endTime: action.payload.endTime }
          return schedule
        }),
        studentRecords: alteredRecords
      }*/

      var record: any = state.instructorRecords.find(
        record =>
          record.instructor.studentSchoolYearGuid ===
          action.payload.instructorSchoolYearGuid
      )

      record.endTime = action.payload.endTime
      return { ...state }

    case 'instanceDate':
      return { ...state, date: LocalDate.parse(action.payload) }

    case 'studentRecords':
      return { ...state, studentRecords: action.payload }

    case 'studentPresence':
      //Might not update unless we update the reference itself to a new object
      var record: StudentRecord = state.studentRecords.find(
        record => record.student.studentSchoolYearGuid === action.payload.guid
      )!
      record.isPresent = action.payload.isPresent
      return { ...state }

    case 'studentStartTime':
      var record: StudentRecord = state.studentRecords.find(
        record => record.student.studentSchoolYearGuid === action.payload.guid
      )!
      record.attendance[action.payload.index].startTime =
        action.payload.startTime

      if (
        action.payload.startTime.isAfter(
          record.attendance[action.payload.index].endTime
        )
      )
        record.attendance[action.payload.index].endTime =
          action.payload.startTime
      return { ...state }

    case 'studentEndTime':
      var record: StudentRecord = state.studentRecords.find(
        record => record.student.studentSchoolYearGuid === action.payload.guid
      )!
      record.attendance[action.payload.index].endTime = action.payload.endTime

      if (
        action.payload.endTime.isBefore(
          record.attendance[action.payload.index].startTime
        )
      )
        record.attendance[action.payload.index].startTime =
          action.payload.endTime

      return { ...state }

    default:
      return state
  }
}
