import { LocalDate } from "@js-joda/core"
import { DateOnly } from "Models/DateOnly"

export interface OrganizationView {
  guid: string
  name: string
  organizationYears: OrganizationYearView[]
}

export interface OrganizationYearDomain {
  guid: string
  organization
  year: YearDomain
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

export interface YearDomain {
  yearGuid: string
  schoolYear: string
  quarter: number
  isCurrentYear: boolean
  startDate: DateOnly
  endDate: DateOnly
}

export interface YearView {
  yearGuid: string
  schoolYear: string
  quarter: Quarter
  isCurrentYear: boolean
  startDate: LocalDate
  endDate: LocalDate
}


export abstract class Year {
  public static toViewModel (obj: YearDomain): YearView {
    return {
      ...obj,
      startDate: DateOnly.toLocalDate(obj.startDate),
      endDate: DateOnly.toLocalDate(obj.endDate)
    }
  }
}

export abstract class OrganizationYear {
  public static toViewModel (obj: OrganizationYearDomain): OrganizationYearView {
    return {
      ...obj,
      year: Year.toViewModel(obj.year)
    }
  }
}