//put all relavant api calls here and return whatever is required
import api from 'utils/api'
import { DateTimeFormatter, LocalDate } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import type { DropdownOption } from 'Models/Session'
import { DateOnly } from 'Models/DateOnly'
import { InstructorRecord, StudentAttendanceDto, StudentRecord, SubstituteRecord } from 'Models/StudentAttendance'

export function getOpenDates(
  sessionGuid: string | undefined, 
  dayOfWeek: number,
  callback: (result: DropdownOption[]) => void
  ) {
    if (!sessionGuid) {
      console.warn('No sessionGuid provided to getOpenDates.')
      return
    }

    api
      .get(`session/${sessionGuid}/attendance/openDates`, { params: { dayOfWeek }})
      .then(res => {
        const options: DropdownOption[] = res.data.map(date => {
          const localDate: LocalDate = DateOnly.toLocalDate(date)
          return {
            guid: localDate.toString(),
            label: localDate.format(DateTimeFormatter.ofPattern('MMMM dd').withLocale(Locale.ENGLISH))
          }
        })
        
        callback(options)
      })
}

export function getInstructorStatusOptions(callback: (result: DropdownOption[]) => void) {
  api
    .get('dropdown/view/instructorStatus')
    .then(res => callback(res.data))
}

export function postSessionAttendance(
  sessionGuid: string, 
  date: LocalDate, 
  studentRecords: StudentRecord[], 
  instructorRecords: InstructorRecord[],
  substituteRecords: SubstituteRecord[],
): Promise<void> {
  return new Promise((resolve, reject) => {

    const studentRecordsParam = studentRecords
      .filter(record => record.isPresent !== false)
      .map(record => ({
        studentSchoolYearGuid: record.studentSchoolYear?.guid,
        studentGuid: record.studentSchoolYear?.student?.guid,
        student: {
          firstName: record.studentSchoolYear.student.firstName,
          lastName: record.studentSchoolYear.student.lastName,
          matricNumber: record.studentSchoolYear.student.matricNumber,
          grade: record.studentSchoolYear.grade
        },
        attendance: record.attendance,
        familyAttendance: record.familyAttendance
      }))
    
    const instructorRecordsParam = instructorRecords
      .filter(record => record.isPresent !== false)
      .map(record => ({
        instructorSchoolYearGuid: record.instructorSchoolYear.guid,
        attendance: record.times
      }))
  
    const params = {
      sessionGuid,
      date,
      studentRecords: studentRecordsParam.filter(stu => stu),
      instructorRecords: instructorRecordsParam,
      substituteRecords: substituteRecords
    }
  
    api
      .post<StudentAttendanceDto>(`session/${sessionGuid}/attendance`, params)
      .then(res => {
        resolve()
      })
      .catch(err => {
        reject(err.response.data)
      })
  })
}
