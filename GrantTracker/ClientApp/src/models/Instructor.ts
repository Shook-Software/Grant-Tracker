import { DropdownOption } from './Session'
import { YearView, Quarter } from './OrganizationYear'
import { StudentGroup } from './StudentGroup'

export interface InstructorView {
  guid: string
  firstName: string
  lastName: string
  badgeNumber: string
}

//not enough info
export interface InstructorSchoolYearView {
  guid: string
  title: string
  instructor: InstructorView
  year: YearView
  organizationName: string
  status: DropdownOption
  isPendingDeletion: boolean
  organizations: any[]
  enrollmentRecords: any[]
  attendanceRecords: any[]
  studentGroups: StudentGroup[]
}

export abstract class Instructor {}
