
import { ApiResult } from 'components/ApiResultAlert'
import { StaffDto } from 'types/Dto'
import api, { AxiosIdentityConfig } from 'utils/api'

export function addInstructor (instructor: StaffDto): Promise<ApiResult> {
  return new Promise((resolve, reject) => {
    const fullName: string = `${instructor.firstName} ${instructor.lastName}`
    api
      .post('instructor/add', 
        instructor, 
        { params: {
          organizationYearGuid: AxiosIdentityConfig.identity.organizationYearGuid
        }}
      )
      .then(res => {
        resolve({
          label: fullName,
          success: true
        })
      })
      .catch(err => {
        reject({
          label: fullName,
          success: false
        })
      })
  })
}

export function fetchGrantTrackerInstructors (): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('instructor', { 
          params: {
          organizationYearGuid: AxiosIdentityConfig.identity.organizationYearGuid
        }
      })
      .then(res => resolve(res.data))
      .catch(err => reject(err))
  })
}
