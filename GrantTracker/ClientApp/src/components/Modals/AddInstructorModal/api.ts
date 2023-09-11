import { DropdownOption } from 'Models/Session'
import api, { AxiosIdentityConfig } from 'utils/api'

export function fetchStatusDropdownOptions(): Promise<DropdownOption[]> {
  return new Promise((resolve, reject) => {
    api
      .get('dropdown/view/instructorStatus')
      .then(res => resolve(res.data))
      .catch(err => reject(err))
  })
}

export function fetchSynergyInstructors (name: string, badgeNumber: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('instructor/search', {params: {name, badgeNumber}})
      .then(res => resolve(res.data))
      .catch(err => reject(err))
  })
}

export function fetchGrantTrackerInstructors (): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('instructor', { 
          params: {
          organizationGuid: AxiosIdentityConfig.identity.organizationGuid,
          yearGuid: AxiosIdentityConfig.identity.yearGuid
        }
      })
      .then(res => resolve(res.data))
      .catch(err => reject(err))
  })
}