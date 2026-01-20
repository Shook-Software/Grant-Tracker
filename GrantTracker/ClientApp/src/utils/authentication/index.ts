import api from 'utils/api'
import { OrganizationYearView, OrganizationView, Quarter, YearView, OrganizationYear } from 'Models/OrganizationYear'
import { QueryObserverResult } from '@tanstack/react-query'

export enum IdentityClaim {
  Administrator = 0,
  Coordinator = 1,
  Teacher = 2,
  Unauthenticated = 3
}

export interface IUser {
  userGuid: string

  firstName: string
  lastName: string
  badgeNumber: string
  claim: IdentityClaim

  organization: OrganizationView
  organizationYear: OrganizationYearView
  year: YearView
}

export class User implements IUser {

  private _firstName: string = ''
  private _lastName: string = ''
  private _userGuid: string = ''
  private _badgeNumber: string = ''
  private _claim: IdentityClaim = IdentityClaim.Unauthenticated

  private _currentOrganizationYear: OrganizationYearView

  private _currentOrganization: OrganizationView = {
    guid: '',
    name: '',
    organizationYears: []
  }

  private _currentYear: YearView = {
      guid: '',
      schoolYear: '',
      quarter: Quarter.None
  }

  private _organizationYears: OrganizationYearView[] = []
  private _organizations: OrganizationView[] = []
  private _years: YearView[] = []

  constructor (user: IUser | null) {
    if (user) {
      this._firstName = user.firstName
      this._lastName = user.lastName
      this._userGuid = user.userGuid
      this._badgeNumber = user.badgeNumber
      this._currentOrganization = {
        guid: user.organization.guid,
        name: user.organization.name,
        organizationYears: []
      }
      this._currentOrganizationYear = {...user.organizationYear},
      this._claim = user.claim
    }
  }

  public setYear (year: YearView | undefined): void {
    if (year) {
      this._currentYear = year
    }
  }

  public setOrganization (organization: OrganizationView | undefined): void {
    if (organization) {
      this._currentOrganization = organization
    }
  }

  public setOrganizationYear (organizationYear: OrganizationYearView | undefined): void {
    if (!!organizationYear) {
      this._currentOrganizationYear = organizationYear
    }

    if (!!organizationYear?.organization) {
      this._currentOrganization = organizationYear.organization
    }

    if (!!organizationYear?.year) {
      this._currentYear = organizationYear.year
    }
  }

  public setOrganizationYears(organizationYears: OrganizationYearView[]): void {
    if (!!organizationYears) {
      this._organizationYears = organizationYears

      this._organizations = [...new Map(organizationYears.map(oy => [oy.organization['guid'], oy.organization])).values()]
      this._years = [...new Map(organizationYears.map(oy => [oy.year['guid'], oy.year])).values()]
    }
  }

  public get userGuid (): string {
    return this._userGuid
  }

  public get firstName (): string {
   return this._firstName
  } 
  
  public get lastName (): string {
    return this._lastName
  }

  public get badgeNumber (): string {
    return this._badgeNumber
  }

  public get organizationName (): string {
    return this._currentOrganization.name
  }

  public get organization (): OrganizationView {
    return this._currentOrganization
  }

  public get organizationYear (): OrganizationYearView {
    return this._currentOrganizationYear
  }

  public get year(): YearView {
    return this._currentYear
  }

  public get claim (): IdentityClaim {
    return this._claim
  }

  public get years() : YearView[] {
    return this._years
  }

  public get organizations() : OrganizationView[] {
    return this._organizations
  }

  public get organizationYears (): OrganizationYearView[] {
    return this._organizationYears
  }

  public isAuthenticated (): boolean {
    return this?.claim != IdentityClaim.Unauthenticated
  }

  public isAuthorized (requiredClaim: IdentityClaim): boolean {
    if (this.claim <= requiredClaim) return true

    return false
  }
}
