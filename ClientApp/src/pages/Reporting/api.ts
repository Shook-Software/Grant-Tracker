import { LocalDate } from '@js-joda/core'
import { OrganizationView, OrganizationYearView, Quarter } from 'models/OrganizationYear'
import api from 'utils/api'

export function getStaffSummary(schoolYear: string, quarter: number, organizationGuid: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('report/staffingSummary', { 
        params: {
          schoolYear,
          quarter,
          organizationGuid: organizationGuid || null
        }
      })
      .then(res => {
        resolve(res.data)
      })
      .catch(err => reject(err))
  })
}

export function getStudentAttendance(startDate: LocalDate, endDate: LocalDate, organizationGuid: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('report/totalStudentAttendance', {
        params: {
          startDateStr: startDate.toString(),
          endDateStr: endDate.toString(),
          organizationGuid: organizationGuid || null
        }
      })
      .then(res => {
        resolve(res.data)
      })
  })
}

export function getActivities(startDate: LocalDate, endDate: LocalDate, organizationGuid: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('report/totalActivity', {
        params: {
          startDateStr: startDate.toString(),
          endDateStr: endDate.toString(),
          organizationGuid: organizationGuid || null
        }
      })
      .then(res => {
        resolve(res.data)
      })
  })
}

export function getSiteSessions(startDate: LocalDate, endDate: LocalDate, organizationGuid: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('report/siteSessions', {
        params: {
          startDateStr: startDate.toString(),
          endDateStr: endDate.toString(),
          organizationGuid: organizationGuid || null
        }
      })
      .then(res => {
        resolve(res.data)
      })
  })
}

export function getSummaryOfClasses(startDate: LocalDate, endDate: LocalDate, organizationGuid: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('report/summaryOfClasses', {
        params: {
          startDateStr: startDate.toString(),
          endDateStr: endDate.toString(),
          organizationGuid: organizationGuid || null
        }
      })
      .then(res => {
        resolve(res.data)
      })
  })
}


export function getProgramOverview(startDate: LocalDate, endDate: LocalDate, organizationGuid: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('report/programOverview', {
        params: {
          startDateStr: startDate.toString(),
          endDateStr: endDate.toString(),
          organizationGuid: organizationGuid || null
        }
      })
      .then(res => {
        resolve(res.data)
      })
  })
}

export function getStudentSurveys(startDate: LocalDate, endDate: LocalDate, organizationGuid: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('report/studentSummary', {
        params: {
          startDateStr: startDate.toString(),
          endDateStr: endDate.toString(),
          organizationGuid: organizationGuid || null
        }
      })
      .then(res => {
        resolve(res.data)
      })
  })
}

export function getAuthorizedOrganizations(): Promise<OrganizationView[]> {
  return new Promise((resolve, reject) => {
    api
      .get<OrganizationView[]>('dropdown/organization')
      .then(res => {
        resolve(res.data)
      })
  })
}

export function getOrganizationYears(organizationGuid: string): Promise<OrganizationYearView[]> {
  return new Promise((resolve, reject) => {
    api
      .get<OrganizationYearView[]>('dropdown/year', { params: {organizationGuid}})
      .then(res => {
        resolve(res.data)
      })
})
}