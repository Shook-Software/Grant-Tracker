import { GradeString } from './Grade'
import { StudentRegistration, StudentRegistrationView, StudentRegistrationDomain } from './StudentRegistration'
import { Attendance, AttendanceView, AttendanceDomain } from './StudentAttendance'
import { OrganizationYearView } from './OrganizationYear'

export interface StudentView {
  guid: string
  firstName: string
  lastName: string
  matricNumber: string
}

export interface StudentSchoolYearView {
  guid: string
  student: StudentView
  organizationYear: OrganizationYearView
  grade: GradeString
  minutesAttended: number
}

export interface StudentSchoolYearWithRecordsDomain
  extends StudentSchoolYearView {
  attendance: AttendanceDomain[]
  registrations: StudentRegistrationDomain[]
}

export interface StudentSchoolYearWithRecordsView
  extends StudentSchoolYearView {
  attendance: AttendanceView[]
  registrations: StudentRegistrationView[]
}

export abstract class StudentSchoolYear {
  public static toViewModel (
    obj: StudentSchoolYearWithRecordsDomain
  ): StudentSchoolYearWithRecordsView {
    return {
      ...obj,
      attendance: obj.attendance.map(att => Attendance.toViewModel(att)),
      registrations: obj.registrations.map(reg =>
        StudentRegistration.toViewModel(reg)
      )
    }
  }
}
