import { FamilyMember } from 'Models/FamilyMember'
import { StudentSchoolYearView } from 'Models/Student'
import { FamilyRecord, InstructorRecord, StudentRecord } from 'Models/StudentAttendance'
import { TimeScheduleForm, TimeScheduleView } from 'Models/TimeSchedule'
import { InstructorSchoolYearView } from 'Models/Instructor'
import { TimeOnly } from 'Models/TimeOnly'

export interface AttendanceForm {
    defaultTimeSchedule: TimeScheduleForm[]
    studentRecords: StudentRecord[]
    instructorRecords: InstructorRecord[]
}

export type ReducerAction =
    | { type: 'setDefaultTimeSchedules', payload: TimeScheduleView[] }
    | { type: 'populateInstructors', payload: { instructors: InstructorSchoolYearView[], times: TimeScheduleView[] } }
    | { type: 'populateStudents', payload: { students: StudentSchoolYearView[], times: TimeScheduleView[]} }

    | { type: 'populateExistingRecords', payload: { instructorAttendance, studentAttendance }}

    | { type: 'setAttendanceStartTime', payload: { personId: string, times: TimeScheduleForm[] } }
    | { type: 'setAttendanceEndTime', payload: { personId: string, times: TimeScheduleForm[] } }

    | { type: 'addInstructor'; payload: InstructorRecord }
    | { type: 'instructorPresence'; payload: { guid: string; isPresent: boolean } }

    | { type: 'addStudent'; payload: { guid: string, firstName: string, lastName: string, matricNumber: string, grade: string } }
    | { type: 'studentPresence'; payload: { guid: string; isPresent: boolean } }
    | { type: 'allStudentPresence'; payload: boolean }
    | { type: 'applyStudentConflicts'; payload: {studentSchoolYearGuid: string, error: string}[] }

    | { type: 'familyStudentPresence', payload: { guid: string, isPresent: boolean } }
    | { type: 'setFamilyMemberCount', payload: { studentSchoolYearGuid: string, familyMember: FamilyMember, count: number } }



function getStudentRecord(state: AttendanceForm, id: string): StudentRecord | undefined {
    return state.studentRecords.find(x => x.id == id)
}

function getInstructorRecord(state: AttendanceForm, id: string): InstructorRecord | undefined {
    return state.instructorRecords.find(x => x.id == id)
}

//add in validation
export function reducer(state: AttendanceForm, action: ReducerAction): AttendanceForm {
    let record
    let studentRecord: StudentRecord
    let studentRecords: StudentRecord[]
    let instructorRecords: InstructorRecord[]

    switch (action.type) {

        case 'setDefaultTimeSchedules':
            return { ...state, defaultTimeSchedule: action.payload }

        case 'populateInstructors':
            console.log(action.payload)
            instructorRecords = action.payload.instructors.map(i => ({
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
            console.log(action.payload)
            studentRecords = action.payload.students.map(s => ({
                id: s.guid,
                isPresent: true,
                isNew: false,
                firstName: s.student.firstName,
                lastName: s.student.lastName,
                matricNumber: s.student.matricNumber,
                times: action.payload.times.slice(),
                familyAttendance: [],
                conflicts: []
            }) as StudentRecord)

            return { ...state, studentRecords }

        case 'populateExistingRecords':
            instructorRecords = action.payload.instructorAttendance.map(x => ({
                id: x.instructorSchoolYear.guid,
                isPresent: true,
                isSubstitute: x.isSubstitute,
                firstName: x.instructorSchoolYear.instructor.firstName,
                lastName: x.instructorSchoolYear.instructor.lastName,
                times: x.timeRecords.map(y => ({
                    startTime: TimeOnly.toLocalTime(y.startTime),
                    endTime: TimeOnly.toLocalTime(y.endTime)
                }))
            })) as InstructorRecord[] 

            studentRecords = action.payload.studentAttendance.map(x => ({
                id: x.studentSchoolYear.guid,
                isPresent: true,
                firstName: x.studentSchoolYear.student.firstName,
                lastName: x.studentSchoolYear.student.lastName,
                matricNumber: x.studentSchoolYear.student.matricNumber,
                times: x.timeRecords?.map(y => ({
                    startTime: TimeOnly.toLocalTime(y.startTime),
                    endTime: TimeOnly.toLocalTime(y.endTime)
                })),
                familyAttendance: x.familyAttendance?.slice() || [],
                conflicts: []
            })) as StudentRecord[]

            return {...state, instructorRecords, studentRecords }

        case 'setAttendanceStartTime':
            if (getStudentRecord(state, action.payload.personId)) {
                let student = getStudentRecord(state, action.payload.personId)
                student!.times = student!.times.map((t, idx) => ({...t, startTime: action.payload.times.at(idx).startTime}))
            }
            else if (getInstructorRecord(state, action.payload.personId)) {
                let instructor = getInstructorRecord(state, action.payload.personId)
                instructor!.times = instructor!.times.map((t, idx) => ({...t, startTime: action.payload.times.at(idx).startTime}))
            }

            return { ...state }

        case 'setAttendanceEndTime':
            if (getStudentRecord(state, action.payload.personId)) {
                let student = getStudentRecord(state, action.payload.personId)
                student!.times = student!.times.map((t, idx) => ({...t, endTime: action.payload.times.at(idx).endTime}))
            }
            else if (getInstructorRecord(state, action.payload.personId)) {
                let instructor = getInstructorRecord(state, action.payload.personId)
                instructor!.times = instructor!.times.map((t, idx) => ({...t, endTime: action.payload.times.at(idx).endTime}))
            }

            return { ...state }

        case 'addStudent':
            let student = action.payload

            const newStudentRecord: StudentRecord = {
                id: student.guid,
                isPresent: true,
                times: state.defaultTimeSchedule.slice(),
                firstName: student.firstName,
                lastName: student.lastName,
                matricNumber: student.matricNumber,
                familyAttendance: [],
                conflicts: []
            }

            return { ...state, studentRecords: [...state.studentRecords, newStudentRecord] }

        case 'applyStudentConflicts':
            state.studentRecords.forEach(sr => {
                sr.conflicts = action.payload.filter(conflict => conflict.studentSchoolYearGuid === sr.id);
            })

            return {...state}
    
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

        case 'familyStudentPresence':
            record = getStudentRecord(state, action.payload.guid)
            record.times = action.payload.isPresent ? [...state.defaultTimeSchedule] : []
            return {...state}

        case 'setFamilyMemberCount':
            console.debug(action)
            studentRecord = state.studentRecords.find(record => record.id == action.payload?.studentSchoolYearGuid) as StudentRecord

            if (studentRecord.familyAttendance) {
                let familyMemberIndex = studentRecord.familyAttendance.findIndex(x => x.familyMember == action.payload.familyMember)

                if (familyMemberIndex === -1)
                    studentRecord.familyAttendance = [...studentRecord.familyAttendance, { familyMember: action.payload.familyMember, count: action.payload.count }]
                else 
                    studentRecord.familyAttendance[familyMemberIndex].count = action.payload.count 

                if (action.payload.count <= 0)
                    studentRecord.familyAttendance = studentRecord.familyAttendance.filter(x => x.familyMember != action.payload.familyMember)
            }
            else {
                studentRecord.familyAttendance = [{ familyMember: action.payload.familyMember, count: action.payload.count }]
            }

            return { ...state, studentRecords: [...state.studentRecords] }

        default:
            return state
    }
}
