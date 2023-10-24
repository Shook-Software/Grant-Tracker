import { LocalDate, LocalTime } from '@js-joda/core'
import { FamilyMember } from 'Models/FamilyMember'
import { DayOfWeekNumeric } from 'Models/DayOfWeek'
import { StudentSchoolYearView, StudentSchoolYearWithRecordsView } from 'Models/Student'
import { InstructorRecord, StudentRecord, SubstituteRecord } from 'Models/StudentAttendance'
import { TimeScheduleView } from 'Models/TimeSchedule'

export interface AttendanceForm {
  defaultSchedule: TimeScheduleView[]
  date: LocalDate
  dayOfWeek: DayOfWeekNumeric
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
  | { type: 'instructorStartTime'; payload: { guid: string; index: number;  startTime: LocalTime } }
  | { type: 'instructorEndTime'; payload: { guid: string; index: number; endTime: LocalTime } }

  | { type: 'instanceDate'; payload: string }

  | { type: 'addStudent'; payload: StudentSchoolYearView }
  | { type: 'studentRecords'; payload: StudentRecord[] }
  | { type: 'studentPresence'; payload: { guid: string; isPresent: boolean } }
  | { type: 'allStudentPresence'; payload: boolean }
  | { type: 'studentStartTime'; payload: { guid: string; index: number; startTime: LocalTime } }
  | { type: 'studentEndTime'; payload: { guid: string; index: number; endTime: LocalTime } }

  | { type: 'addFamilyMember', payload: { studentSchoolYearGuid: string, familyMember: FamilyMember } }
  | { type: 'removeFamilyMember', payload: { studentSchoolYearGuid: string, familyMember: FamilyMember } }

//add in validation
export function reducer (state: AttendanceForm, action: ReducerAction): AttendanceForm {
  let substituteRecord
  let record
  let studentRecord: StudentRecord

  switch (action.type) {
    
    case 'addSubstitute':
      if (state.substituteRecords.some(x => x.substitute.id == action.payload.instructor.id))
        return { ...state };
      else if (state.instructorRecords.some(x => x.instructorSchoolYear.guid === action.payload.instructor.id || `${x.instructorSchoolYear.instructor.firstName.trim()}${x.instructorSchoolYear.instructor.lastName.trim()}` === action.payload.instructor.id))
        return { ...state };

      substituteRecord = {
        instructorSchoolYearGuid: action.payload.instructorSchoolYearGuid,
        substitute: {...action.payload.instructor},
        attendance: state.defaultSchedule.map(s => ({...s}))
      }
      
      return { ...state, substituteRecords: [...state.substituteRecords, substituteRecord]}

    case 'substituteStartTime':
      record = state.substituteRecords.find(record => record.substitute.id === action.payload.nameString) as SubstituteRecord
      record.attendance[action.payload.index].startTime = action.payload.startTime
      return { ...state, substituteRecords: [...state.substituteRecords] }
      
    case 'substituteEndTime':
      record = state.substituteRecords.find(record => record.substitute.id === action.payload.nameString) as SubstituteRecord
      record.attendance[action.payload.index].endTime = action.payload.endTime
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
      record.attendance[action.payload.index].startTime = action.payload.startTime
      return { ...state, instructorRecords: [...state.instructorRecords] }

    case 'instructorEndTime':
      record = state.instructorRecords.find(record => record.instructorSchoolYear.guid === action.payload.guid)  as InstructorRecord
      record.attendance[action.payload.index].endTime = action.payload.endTime
      return { ...state, instructorRecords: [...state.instructorRecords] }

    case 'instanceDate':
      return { ...state, date: LocalDate.parse(action.payload) }

    case 'addStudent':
      const newStudentRecord: StudentRecord = {
        isPresent: true,
        attendance: state.defaultSchedule.map(s => ({...s})),
        studentSchoolYear: action.payload as StudentSchoolYearWithRecordsView,
        familyAttendance: []
      }
      return { ...state, studentRecords: [...state.studentRecords, newStudentRecord] }

    case 'studentRecords':
      return { ...state, studentRecords: action.payload }

    case 'studentPresence':
      //Might not update unless we update the reference itself to a new object
      record = state.studentRecords.find(record => record.studentSchoolYear.guid === action.payload.guid) as StudentRecord
      record.isPresent = action.payload.isPresent
      return { ...state, studentRecords: [...state.studentRecords] }

    case 'allStudentPresence':
      return { 
        ...state, 
        studentRecords: state.studentRecords
          .map(record => ({
            ...record,
            isPresent: action.payload
          })) 
    }

    case 'studentStartTime':
      record = state.studentRecords.find(record => record.studentSchoolYear.guid === action.payload.guid) as StudentRecord
      record.attendance[action.payload.index].startTime = action.payload.startTime

      //if (action.payload.startTime.isAfter(record.attendance[action.payload.index].endTime))
        //record.attendance[action.payload.index].endTime = action.payload.startTime
        console.log('payload', action.payload)
        console.log('STU START', record.studentSchoolYear.student.lastName, record)

      return { ...state, studentRecords: [...state.studentRecords] }

    case 'studentEndTime':
      record = state.studentRecords.find(record => record.studentSchoolYear.guid === action.payload.guid) as StudentRecord
      record.attendance[action.payload.index].endTime = action.payload.endTime

      console.log(record)
      //if (action.payload.endTime.isBefore(record.attendance[action.payload.index].startTime))
        //record.attendance[action.payload.index].startTime = action.payload.endTime

      return { ...state, studentRecords: [...state.studentRecords] }


    case 'addFamilyMember':

      studentRecord = state.studentRecords.find(record => record.studentSchoolYear.guid == action.payload?.studentSchoolYearGuid) as StudentRecord

      if (studentRecord.familyAttendance) {
        let familyMemberIndex = studentRecord.familyAttendance.findIndex(x => x.familyMember == action.payload.familyMember)

        if (familyMemberIndex === -1)
        studentRecord.familyAttendance = [...studentRecord.familyAttendance, { familyMember: action.payload.familyMember, count: 1 } ]
        else {
          studentRecord.familyAttendance[familyMemberIndex].count++
        }
      }
      else {
        studentRecord.familyAttendance = [{ familyMember: action.payload.familyMember, count: 1 }]
      }

      return { ...state, studentRecords: [...state.studentRecords]}
      
    case 'removeFamilyMember':

      studentRecord = state.studentRecords.find(record => record.studentSchoolYear.guid === action.payload.studentSchoolYearGuid) as StudentRecord

      if (studentRecord.familyAttendance) {
        let familyMemberIndex = studentRecord.familyAttendance.findIndex(x => x.familyMember == action.payload.familyMember)

        if (familyMemberIndex === -1)
          return { ...state }
        else { //could we do else if count-- === 0 and remove? Should decrease the count, then remove it only if it's 0
          studentRecord.familyAttendance[familyMemberIndex].count--

          if (studentRecord.familyAttendance[familyMemberIndex].count == 0)
            studentRecord.familyAttendance = studentRecord.familyAttendance.filter(x => x.familyMember != action.payload.familyMember)
        }
      }

      return { ...state, studentRecords: [...state.studentRecords]}

    default:
      return state
  }
}
