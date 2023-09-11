import { LocalTime } from '@js-joda/core'
import { Guid } from 'guid-typescript'
import { DropdownOption } from './Session'

export interface StaffDto {
  firstName: string
  lastName: string
  badgeNumber: string
  statusGuid: string
}

export interface InstructorViewDto {
  guid: Guid
  firstName: string
  lastName: string
  badgeNumber: string
  status: DropdownOption
}

export class StudentRegistrationView {
  function
}

export interface StudentRegistrationView {
  schedule: {
    guid: string
    dayOfWeek: number
    startTime: LocalTime
    endTime: LocalTime
  }
  student: {
    guid: string
    firstName: string
    lastName: string
    matricNumber: string
  }
}