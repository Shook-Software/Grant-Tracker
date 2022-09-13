import { LocalDate, LocalTime } from '@js-joda/core'
import { InstructorRecord, StudentRecord, SubstituteRecord } from 'Models/StudentAttendance'
import { TimeScheduleView } from 'Models/TimeSchedule'

export interface AttendanceForm {
  defaultSchedule: TimeScheduleView[]
  date: LocalDate
  studentRecords: StudentRecord[]
  instructorRecords: InstructorRecord[]
  substituteRecords: SubstituteRecord[]
}

export type ReducerAction =
  | { type: 'addSubstitute'; payload: any }
  | { type: 'substituteStartTime'; payload: { nameString: string, index: number, startTime: LocalTime }}
  | { type: 'substituteEndTime'; payload: { nameString: string, index: number, endTime: LocalTime }}

  | { type: 'scheduleStartShift'; payload: { index: number; startTime: LocalTime } }
  | { type: 'scheduleEndShift'; payload: { index: number; endTime: LocalTime } }

  | { type: 'instructorRecords'; payload: InstructorRecord[] }
  | { type: 'instructorPresence'; payload: { guid: string; isPresent: boolean }}
  | { type: 'instructorStartTime'; payload: { guid: string; startTime: LocalTime } }
  | { type: 'instructorEndTime'; payload: { guid: string; endTime: LocalTime } }

  | { type: 'instanceDate'; payload: string }

  | { type: 'studentRecords'; payload: StudentRecord[] }
  | { type: 'studentPresence'; payload: { guid: string; isPresent: boolean } }
  | { type: 'studentStartTime'; payload: { guid: string; index: number; startTime: LocalTime } }
  | { type: 'studentEndTime'; payload: { guid: string; index: number; endTime: LocalTime } }

//add in validation
export function reducer (
  state: AttendanceForm,
  action: ReducerAction
): AttendanceForm {
  let substituteRecord
  let record
  switch (action.type) {
    
    case 'addSubstitute':
      substituteRecord = {
        substitute: {
          id: action.payload.firstName + action.payload.lastName,
          ...action.payload
        },
        attendance: [...state.defaultSchedule]
      }
      
      return { ...state, substituteRecords: [...state.substituteRecords, substituteRecord]}

    case 'substituteStartTime':
      record = state.substituteRecords.find(record => record.substitute.id === action.payload.nameString) as SubstituteRecord
      record.startTime = action.payload.startTime
      return { ...state, substituteRecords: [...state.substituteRecords] }
      
    case 'substituteEndTime':
      record = state.substituteRecords.find(record => record.substitute.id === action.payload.nameString) as SubstituteRecord
      record.endTime = action.payload.endTime
      return { ...state, substituteRecords: [...state.substituteRecords] }


    case 'scheduleStartShift':
      state.defaultSchedule[action.payload.index].startTime = action.payload.startTime

      //iterate all student records and apply the new starttime to the appropriate item
      const adjustedStartTimeStudentRecords = state.studentRecords.map(record => {
        record.attendance = record.attendance.map((timeRecord, index) => {
          if (index === action.payload.index)
            timeRecord.startTime = action.payload.startTime

          return timeRecord
        })
        return record
      })

      const adjustedStartTimeInstructorRecords = state.instructorRecords.map(record => {
        record.attendance = record.attendance.map((att, index) => {
          if (index === action.payload.index)
            att.startTime = action.payload.startTime

          return att
        })
        return record
      })

      const adjustedStartTimeSubstituteRecords = state.substituteRecords.map(record => {
        record.attendance = record.attendance.map((att, index) => {
          if (index === action.payload.index)
            att.startTime = action.payload.startTime

          return att
        })
        return record
      })

      return {
        ...state,
        studentRecords: adjustedStartTimeStudentRecords,
        instructorRecords: adjustedStartTimeInstructorRecords,
        substituteRecords: adjustedStartTimeSubstituteRecords
      }

    case 'scheduleEndShift':
      state.defaultSchedule[action.payload.index].endTime = action.payload.endTime

      const adjustedEndTimeStudentRecords = state.studentRecords.map(record => {
        record.attendance = record.attendance.map((att, index) => {
          if (index === action.payload.index)
            att.endTime = action.payload.endTime

          return att
        })
        return record
      })

      const adjustedEndTimeInstructorRecords = state.instructorRecords.map(record => {
        record.attendance = record.attendance.map((att, index) => {
          if (index === action.payload.index)
            att.endTime = action.payload.endTime

          return att
        })
        return record
      })

      const adjustedEndTimeSubstituteRecords = state.substituteRecords.map(record => {
        record.attendance = record.attendance.map((att, index) => {
          if (index === action.payload.index)
            att.endTime = action.payload.endTime

          return att
        })
        return record
      })

      return {
        ...state,
        studentRecords: adjustedEndTimeStudentRecords,
        instructorRecords: adjustedEndTimeInstructorRecords,
        substituteRecords: adjustedEndTimeSubstituteRecords
      }

    case 'instructorRecords':
      return { ...state, instructorRecords: action.payload }

    case 'instructorPresence':
      record = state.instructorRecords.find(record => record.instructorSchoolYear.guid == action.payload.guid) as InstructorRecord
      record.isPresent = action.payload.isPresent
      return { ...state, instructorRecords: [...state.instructorRecords] }

    case 'instructorStartTime':
      record = state.instructorRecords.find(record => record.instructorSchoolYear.guid === action.payload.guid) as InstructorRecord
      record.startTime = action.payload.startTime
      return { ...state, instructorRecords: [...state.instructorRecords] }

    case 'instructorEndTime':
      console.log(action, state.instructorRecords)
      record = state.instructorRecords.find(record => record.instructorSchoolYear.guid === action.payload.guid)  as InstructorRecord
      record.endTime = action.payload.endTime
      return { ...state, instructorRecords: [...state.instructorRecords] }

    case 'instanceDate':
      return { ...state, date: LocalDate.parse(action.payload) }

    case 'studentRecords':
      return { ...state, studentRecords: action.payload }

    case 'studentPresence':
      //Might not update unless we update the reference itself to a new object
      record = state.studentRecords.find(record => record.studentSchoolYear.guid === action.payload.guid) as StudentRecord
      record.isPresent = action.payload.isPresent
      return { ...state, studentRecords: [...state.studentRecords] }

    case 'studentStartTime':
      record = state.studentRecords.find(record => record.studentSchoolYear.guid === action.payload.guid) as StudentRecord
      record.attendance[action.payload.index].startTime = action.payload.startTime

      if (action.payload.startTime.isAfter(record.attendance[action.payload.index].endTime))
        record.attendance[action.payload.index].endTime = action.payload.startTime

      return { ...state, studentRecords: [...state.studentRecords] }

    case 'studentEndTime':
      record = state.studentRecords.find(record => record.studentSchoolYear.guid === action.payload.guid) as StudentRecord
      record.attendance[action.payload.index].endTime = action.payload.endTime

      if (action.payload.endTime.isBefore(record.attendance[action.payload.index].startTime))
        record.attendance[action.payload.index].startTime = action.payload.endTime

      return { ...state, studentRecords: [...state.studentRecords] }

    default:
      return state
  }
}
