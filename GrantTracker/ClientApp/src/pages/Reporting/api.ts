import { LocalDate } from '@js-joda/core'
import { DateOnly } from 'Models/DateOnly'
import { OrganizationView, OrganizationYearView } from 'Models/OrganizationYear'
import { TimeOnly } from 'Models/TimeOnly'
import api from 'utils/api'

export function getReportsAsync(startDate: LocalDate, endDate: LocalDate, organizationYearGuid: string, organizationGuid: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('report', {
        params: {
          startDateStr: startDate.toString(),
          endDateStr: endDate.toString(),
          organizationYearGuid,
          organizationGuid: organizationGuid || null
        }
      })
      .then(res => {
        res.data.attendanceCheck = res.data.attendanceCheck.map(x => ({
          ...x,
          instanceDate: DateOnly.toLocalDate(x.instanceDate),
          timeBounds: x.timeBounds.map(t => ({
            startTime: TimeOnly.toLocalTime(t.startTime),
            endTime: TimeOnly.toLocalTime(t.endTime)
          }))
        }))

        //rather than perform some awful cross-join, we are stealing from attendanceCheck here
        res.data.payrollAudit = res.data.payrollAudit.map(audit => ({
          ...audit,
          sessionInstructors: [...res.data.attendanceCheck.find(check => check.sessionGuid == audit.sessionGuid).instructors]
        }))

        console.log(res.data.attendanceCheck)
        console.log(res.data.payrollAudit)

        resolve(res.data)
      })
  })
}
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

export function getFamilyAttendance(startDate: LocalDate, endDate: LocalDate, organizationGuid: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('report/totalFamilyAttendance', {
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
      .catch(err => {
        reject(err)
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
      .catch(err => {
        reject(err)
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