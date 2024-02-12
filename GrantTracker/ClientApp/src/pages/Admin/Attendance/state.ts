import { FamilyMember } from 'Models/FamilyMember'
import { StudentSchoolYearView } from 'Models/Student'
import { InstructorRecord, StudentRecord } from 'Models/StudentAttendance'
import { TimeScheduleForm, TimeScheduleView } from 'Models/TimeSchedule'
import { InstructorSchoolYearView } from 'Models/Instructor'

export interface AttendanceForm {
    defaultTimeSchedule: TimeScheduleForm[]
    studentRecords: StudentRecord[]
    instructorRecords: InstructorRecord[]
}

export type ReducerAction =
    | { type: 'setDefaultTimeSchedules', payload: TimeScheduleView[] }
    | { type: 'populateInstructors', payload: { instructors: InstructorSchoolYearView[], times: TimeScheduleView[] } }
    | { type: 'populateStudents', payload: { students: StudentSchoolYearView[], times: TimeScheduleView[] } }


    | { type: 'setAttendanceTime', payload: { personId: string, times: TimeScheduleForm[] } }

    | { type: 'addInstructor'; payload: InstructorRecord }
    | { type: 'instructorPresence'; payload: { guid: string; isPresent: boolean } }

    | { type: 'addStudent'; payload: StudentSchoolYearView }
    | { type: 'studentPresence'; payload: { guid: string; isPresent: boolean } }
    | { type: 'allStudentPresence'; payload: boolean }

    | { type: 'addFamilyMember', payload: { studentSchoolYearGuid: string, familyMember: FamilyMember } }
    | { type: 'removeFamilyMember', payload: { studentSchoolYearGuid: string, familyMember: FamilyMember } }



function getStudentRecord(state: AttendanceForm, id: string): StudentRecord | undefined {
    return state.studentRecords.find(x => x.id == id)
}

function getInstructorRecord(state: AttendanceForm, id: string): InstructorRecord | undefined {
    return state.instructorRecords.find(x => x.id == id)
}

//add in validation
export function reducer(state: AttendanceForm, action: ReducerAction): AttendanceForm {
    let substituteRecord
    let record
    let studentRecord: StudentRecord

    switch (action.type) {

        case 'setDefaultTimeSchedules':
            return { ...state, defaultTimeSchedule: action.payload }

        case 'populateInstructors':
            let instructorRecords = action.payload.instructors.map(i => ({
                id: i.guid,
                isPresent: true,
                isSubstitute: false,
                isNew: false,
                firstName: i.instructor.firstName,
                lastName: i.instructor.lastName,
                times: action.payload.times.slice()
            }) as InstructorRecord)

            return { ...state, instructorRecords }

        case 'populateStudents':
            let studentRecords = action.payload.students.map(s => ({
                id: s.guid,
                isPresent: true,
                isNew: false,
                firstName: s.student.firstName,
                lastName: s.student.lastName,
                matricNumber: s.student.matricNumber,
                times: action.payload.times.slice(),
                familyAttendance: []
            }) as StudentRecord)

            return { ...state, studentRecords }

        case 'setAttendanceTime':

            if (getStudentRecord(state, action.payload.personId)) {

            }
            else if (getInstructorRecord(state, action.payload.personId)) {
                let instructor = getInstructorRecord(state, action.payload.personId)
                instructor!.times = action.payload.times
            }

            return { ...state }

        case 'addStudent':
            let studentSchoolYear = action.payload

            const newStudentRecord: StudentRecord = {
                id: studentSchoolYear.guid,
                isPresent: true,
                times: state.defaultTimeSchedule.slice(),
                firstName: studentSchoolYear.student.firstName,
                lastName: studentSchoolYear.student.lastName,
                matricNumber: studentSchoolYear.student.matricNumber,
                familyAttendance: []
            }

            return { ...state, studentRecords: [...state.studentRecords, newStudentRecord] }
    
        case 'addInstructor':
            if (getInstructorRecord(state, action.payload.id))
                return { ...state };
            
            let instructorRecord = {
                ...action.payload,
                isSubstitute: true,
                times: state.defaultTimeSchedule.slice()
            }

            return { ...state, instructorRecords: [...state.instructorRecords, instructorRecord] }

        case 'instructorPresence':
            console.log(action)
            record = getInstructorRecord(state, action.payload.guid)
            record.isPresent = action.payload.isPresent
            return { ...state, instructorRecords: [...state.instructorRecords] }

        case 'studentPresence':
            //Might not update unless we update the reference itself to a new object
            record = getStudentRecord(state, action.payload.guid)
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

        case 'addFamilyMember':

            studentRecord = state.studentRecords.find(record => record.id == action.payload?.studentSchoolYearGuid) as StudentRecord

            if (studentRecord.familyAttendance) {
                let familyMemberIndex = studentRecord.familyAttendance.findIndex(x => x.familyMember == action.payload.familyMember)

                if (familyMemberIndex === -1)
                    studentRecord.familyAttendance = [...studentRecord.familyAttendance, { familyMember: action.payload.familyMember, count: 1 }]
                else {
                    studentRecord.familyAttendance[familyMemberIndex].count++
                }
            }
            else {
                studentRecord.familyAttendance = [{ familyMember: action.payload.familyMember, count: 1 }]
            }

            return { ...state, studentRecords: [...state.studentRecords] }

        case 'removeFamilyMember':

            studentRecord = state.studentRecords.find(record => record.id === action.payload.studentSchoolYearGuid) as StudentRecord

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

            return { ...state, studentRecords: [...state.studentRecords] }

        default:
            return state
    }
}
