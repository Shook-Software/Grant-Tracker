import { LocalDate } from "@js-joda/core"

export interface OrganizationView {
  guid: string
  name: string
  organizationYears: OrganizationYearView[]
}

export interface OrganizationYearView {
  guid: string
  organization
  year: YearView
}

export enum Quarter {
  'None' = -1, //deprecated
  'Summer' = 0,
  'Summer Two' = 1, //deprecated
  'Academic Year' = 2,
  'Spring' = 3, //deprecated
  'Year to Date' = 4 //deprecated
}

export interface YearView {
  guid: string
  schoolYear: string
  quarter: Quarter
  isCurrentYear: boolean
  startDate?: LocalDate
  endDate?: LocalDate
}