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
  'None' = -1,
  'Summer One' = 0,
  'Summer Two' = 1,
  'Fall' = 2,
  'Spring' = 3
}

export interface YearView {
  guid: string
  schoolYear: string
  quarter: Quarter
  startDate?: LocalDate
  endDate?: LocalDate
}