import { DateOnly } from 'Models/DateOnly'
import { AttendanceTimeRecordView, AttendanceView, StudentAttendance } from 'Models/StudentAttendance'
import api, { AxiosIdentityConfig } from 'utils/api'


export function addStudentToSession (sessionGuid, student, schedule): Promise<void> {
  return new Promise((resolve, reject) => {
    api
      .post(`session/${sessionGuid}/registration`, {
        yearGuid: AxiosIdentityConfig.identity.yearGuid,
        student: {
          firstName: student.student.firstName,
          lastName: student.student.lastName,
          matricNumber: student.student.matricNumber,
          grade: student.grade
        },
        dayScheduleGuids: schedule
      })
      .then(res => {
       resolve()
      })
      .catch(err => {
        if (err.response.statusText === 'Conflict') {
          //const conflicts: DayScheduleView[] = [] //err.response.data.map(item => DaySchedule.toViewModel(item))
          reject(err)
        }
      })
  })
}

export function getAttendanceRecords (sessionGuid): Promise<AttendanceView[]> {
  return new Promise((resolve, reject) => {
    api
      .get(`session/${sessionGuid}/attendance`)
      .then(res => {
        let records = res.data
        records = records.map(record => ({...record, studentAttendanceRecords: record.studentAttendanceRecords.map(record => StudentAttendance.toViewModel(record))}))
        records = records.map(record => ({...record, instructorAttendanceRecords: record.instructorAttendanceRecords.map(record => StudentAttendance.toViewModel(record))}))
        records = records.map(i => ({...i, instanceDate: DateOnly.toLocalDate(i.instanceDate)})) as AttendanceView[]
        records = records.sort((first: AttendanceView, second: AttendanceView) => {
          if (first.instanceDate.isBefore(second.instanceDate))
            return -1
          else if (first.instanceDate.isAfter(second.instanceDate))
            return 1
          return 0
        })

        resolve(records)
      })
      .catch(err => { 
        console.warn(err)
        reject() 
      })
  })
  
}

export function editAttendanceRecord (sessionGuid, attendanceGuid, attendanceRecord): Promise<void> {
  return new Promise((resolve, reject) => {

    attendanceRecord.studentRecords = attendanceRecord.studentRecords.filter(record => record.isPresent == true)
    attendanceRecord.studentRecords = attendanceRecord.studentRecords.map(record => ({
      studentSchoolYearGuid: record.studentSchoolYear?.guid,
      studentGuid: record.studentSchoolYear?.student?.guid,
      student: {
        firstName: record.studentSchoolYear.student.firstName,
        lastName: record.studentSchoolYear.student.lastName,
        matricNumber: record.studentSchoolYear.student.matricNumber,
        grade: record.studentSchoolYear.grade
      },
      attendance: [...record.attendance]
    }))

    attendanceRecord.instructorRecords = attendanceRecord.instructorRecords.filter(record => record.isPresent == true)
    attendanceRecord.instructorRecords = attendanceRecord.instructorRecords.map(record => ({
      instructorSchoolYearGuid: record.instructorSchoolYear.guid,
      attendance: [...record.attendance]
    }))

    api
      .patch(`session/attendance?attendanceGuid=${attendanceGuid}`, attendanceRecord)
      .then(res => {resolve()})
      .catch(err => {reject()})
  })
}

export function deleteAttendanceRecord (attendanceGuid): Promise<void> {
  return new Promise((resolve, reject) => {
    api
      .delete(`session/attendance?attendanceGuid=${attendanceGuid}`)
      .then(res => resolve())
      .catch(err => {
        console.warn(err)
        reject()
      })
  })
}