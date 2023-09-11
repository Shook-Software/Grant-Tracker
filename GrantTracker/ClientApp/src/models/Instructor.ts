import { DropdownOption } from './Session'
import { YearView, Quarter } from './OrganizationYear'

export interface InstructorView {
  guid: string
  firstName: string
  lastName: string
  badgeNumber: string
}

//not enough info
export interface InstructorSchoolYearView {
  guid: string
  instructor: InstructorView
  year: YearView
  organizationName: string
  status: DropdownOption
  organizations: any[]
  enrollmentRecords: any[]
  attendanceRecords: any[]
}

export abstract class Instructor {}
