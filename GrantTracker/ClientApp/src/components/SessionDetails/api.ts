import { DateOnly } from 'Models/DateOnly'
import { SimpleAttendanceView, AttendanceView, StudentAttendance } from 'Models/StudentAttendance'
import api from 'utils/api'


export function addStudentToSession (sessionGuid, student, schedule): Promise<void> {
  return new Promise((resolve, reject) => {
    api
      .post(`session/${sessionGuid}/registration`, {
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

export function getSimpleAttendanceRecords (sessionGuid): Promise<SimpleAttendanceView[]> {
  return new Promise((resolve, reject) => {
    api
      .get(`session/${sessionGuid}/attendance`)
      .then(res => {
        let viewModels = res.data.map(viewModel => ({
          guid: viewModel.attendanceGuid,
          instanceDate: DateOnly.toLocalDate(viewModel.instanceDate),
          instructorCount: viewModel.instructorCount,
          studentCount: viewModel.studentCount
        } as SimpleAttendanceView))

        viewModels = viewModels.sort((first: SimpleAttendanceView, second: SimpleAttendanceView) => {
          if (first.instanceDate.isBefore(second.instanceDate))
            return 1
          else if (first.instanceDate.isAfter(second.instanceDate))
            return -1
          return 0
        })

        resolve(viewModels)
      })
      .catch(err => reject(err))
  })
}

export function getAttendanceRecord (sessionGuid: string, attendanceGuid: string): Promise<AttendanceView> {
  return new Promise((resolve, reject) => {
    api
      .get(`session/${sessionGuid}/attendance/${attendanceGuid}`)
      .then(res => {
        let record = res.data
        resolve({
          ...record, 
          instanceDate: DateOnly.toLocalDate(record.instanceDate),
          studentAttendanceRecords: record.studentAttendanceRecords.map(record => StudentAttendance.toViewModel(record)),
          instructorAttendanceRecords: record.instructorAttendanceRecords.map(record => StudentAttendance.toViewModel(record))
        })
      })
      .catch(err => { 
        console.warn(err)
        reject() 
      })
  })
  
}

export function patchAttendanceRecord (sessionGuid, attendanceGuid, attendanceRecord): Promise<void> {
  return new Promise((resolve, reject) => {

    console.warn('Attendance sent for:', attendanceGuid)

    attendanceRecord.studentRecords = attendanceRecord.studentRecords.filter(record => record.isPresent == true)
    attendanceRecord.studentRecords = attendanceRecord.studentRecords.map(record => {
      return({
        studentSchoolYearGuid: record.studentSchoolYear?.guid,
        studentGuid: record.studentSchoolYear?.student?.guid,
        familyAttendance: [...record.familyAttendance],
        student: {
          firstName: record.studentSchoolYear.student.firstName,
          lastName: record.studentSchoolYear.student.lastName,
          matricNumber: record.studentSchoolYear.student.matricNumber,
          grade: record.studentSchoolYear.grade
        },
        attendance: [...record.attendance]
      })
  })

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