
import { ApiResult } from 'components/ApiResultAlert'
import { StaffDto } from 'types/Dto'
import api from 'utils/api'



export function fetchGrantTrackerInstructors(orgYearGuid): Promise<any[]> {
  return new Promise((resolve, reject) => {
    api
      .get('instructor', {
        params: {
          orgYearGuid
        }
      })
      .then(res => resolve(res.data))
      .catch(err => reject(err))
  })
}


export function addInstructor(orgYearGuid: string, instructor: StaffDto): Promise<ApiResult> {
  return new Promise((resolve, reject) => {
    const fullName: string = `${instructor.firstName} ${instructor.lastName}`
    api
      .post('instructor/add',
        instructor,
        {
          params: {
            organizationYearGuid: orgYearGuid
          }
        }
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
