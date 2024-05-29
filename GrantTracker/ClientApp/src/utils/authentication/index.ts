import api from 'utils/api'
import { OrganizationYearView, OrganizationView, Quarter, YearView } from 'Models/OrganizationYear'

export enum IdentityClaim {
  Administrator = 0,
  Coordinator = 1,
  Teacher = 2,
  Unauthenticated = 3
}

export interface IUser {
  userGuid: string
  userOrganizationYearGuid: string
  organizationYearGuid: string

  firstName: string
  lastName: string
  badgeNumber: string
  claim: IdentityClaim

  organization: OrganizationView
  organizationYear: OrganizationYearView
}

export class User implements IUser {

  private _firstName: string = ''
  private _lastName: string = ''
  private _userGuid: string = ''
  private _userOrganizationYearGuid: string = ''
  private _badgeNumber: string = ''
  private _claim: IdentityClaim = IdentityClaim.Unauthenticated

  private _currentOrganizationYearGuid: string = ''
  private _currentOrganization: OrganizationView = {
    guid: '',
    name: '',
    organizationYears: []
  }
  private _currentYear: OrganizationYearView = {
    guid: '',
    year: {
      guid: '',
      schoolYear: '',
      quarter: Quarter.None
    }
  }

  constructor (user: IUser | null) {
    if (user) {
      this._firstName = user.firstName
      this._lastName = user.lastName
      this._userGuid = user.userGuid
      this._userOrganizationYearGuid = user.userOrganizationYearGuid
      this._badgeNumber = user.badgeNumber
      this._currentOrganizationYearGuid = user.organizationYearGuid
      this._currentOrganization = {
        guid: user.organization.guid,
        name: user.organization.name,
        organizationYears: []
      }
      this._currentYear = {...user.organizationYear, year: user.organizationYear.year},
      this._claim = user.claim
    }
  }

  public static initUserAsync (): Promise<User> {
    return new Promise((resolve, reject) => {

      api
        .get<IUser>('user')
        .then(async res => {

          const user: IUser = {
            userGuid: res.data.userGuid,
            userOrganizationYearGuid: res.data.userOrganizationYearGuid,
            organizationYearGuid: res.data.organizationYearGuid,

            firstName: res.data.firstName,
            lastName: res.data.lastName,
            badgeNumber: res.data.badgeNumber,
            claim: res.data.claim,

            organization: {
              guid: res.data.organization.guid,
              name: res.data.organization.name,
              organizationYears: []
            },

            organizationYear: res.data.organizationYear
          }

          const newUser = new User(user)

          resolve(newUser)
        })
        .catch(err => {
          console.warn('Could not fetch user data', err)
          //What should we do on an unsuccesful authentication??
          reject()
        })
    })
  }

  public getAuthorizedOrganizationsAsync (): Promise<OrganizationView[]> {
    return new Promise((resolve, reject) => {
      api
        .get<OrganizationView[]>('dropdown/organization')
        .then(res => {
          resolve(res.data)
        })
    })
  }

  public getOrganizationYearsAsync (organizationGuid: string): Promise<OrganizationYearView[]> {
    return new Promise((resolve, reject) => {
      if (organizationGuid) {
        api
          .get<OrganizationYearView[]>('dropdown/year', { params: {organizationGuid}})
          .then(res => {
            resolve(res.data)
          })
      }
      else { console.warn('No organizationGuid provided for user.getOrganizationYearsAsync')}
    })
  }

  public setYear (year: OrganizationYearView | undefined): void {
    if (year) {
      this._currentYear = year
    }
  }

  public setOrganization (organization: OrganizationView | undefined): void {
    if (organization) {
      this._currentOrganization = organization
    }
  }

  public setOrganizationYear (organizationYearGuid: string | undefined): void {
    if (organizationYearGuid) {
      this._currentOrganizationYearGuid = organizationYearGuid
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

  public get userOrganizationYearGuid (): string {
    return this._userOrganizationYearGuid
  }

  public get organizationName (): string {
    return this._currentOrganization.name
  }

  public get organizationYearGuid (): string { 
    return this._currentOrganizationYearGuid
  }

  public get organization (): OrganizationView {
    return this._currentOrganization
  }

  public get organizationYear (): OrganizationYearView {
    return this._currentYear
  }

  public get year(): YearView {
    return this._currentYear.year
  }

  public get claim (): IdentityClaim {
    return this._claim
  }

  public isAuthorized (requiredClaim: IdentityClaim): boolean {
    if (this.claim <= requiredClaim) return true

    return false
  }
}
