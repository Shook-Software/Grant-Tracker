import { InstructorSchoolYearView } from 'Models/Instructor'
import { DropdownOption } from 'Models/Session'
import api from 'utils/api'

export function getInstructorStatusOptions(): Promise<DropdownOption[]> {
  return new Promise((resolve, reject) => {
    api
      .get('dropdown/view/instructorStatus')
      .then(res => resolve(res.data))
      .catch(err => reject(err))
  })
}

export function getInstructor(instructorSchoolYearGuid: string): Promise<InstructorSchoolYearView> {
  return new Promise((resolve, reject) => {
    api
      .get(`instructor/${instructorSchoolYearGuid}`)
      .then(res => resolve(res.data))
      .catch(err => reject(err))
  })
}

export function patchInstructorStatus(instructorSchoolYear: InstructorSchoolYearView): Promise<void> {
  return new Promise((resolve, reject) => {
    api
      .patch(`instructor/${instructorSchoolYear.guid}/status`, {
        instructor: instructorSchoolYear.instructor,
        status: instructorSchoolYear.status
      })
  })
}