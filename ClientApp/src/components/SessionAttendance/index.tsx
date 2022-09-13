import { useReducer } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { LocalDate, TemporalAdjusters, DayOfWeek as JodaDoW } from '@js-joda/core'

import AttendanceForm from './AttendanceForm'

import { DayOfWeek } from 'Models/DayOfWeek'
import { InstructorRecord, StudentRecord, SubstituteRecord } from 'Models/StudentAttendance'
import { DayScheduleView } from 'Models/DaySchedule'

import { reducer } from './state'

interface Props {
  registrations: any
  daySchedule: DayScheduleView
  handleClose: () => void
  handleSubmit: (
    date: LocalDate,
    studentRecords: StudentRecord[],
    instructorRecords: InstructorRecord[],
    substituteRecords: SubstituteRecord[]
  ) => Promise<void>
}

function createDefaultStudentRecords (studentRegistrations, daySchedule): StudentRecord[] {
  studentRegistrations = studentRegistrations.filter(reg => reg.daySchedule.dayOfWeek == daySchedule.dayOfWeek)

  return studentRegistrations.map(registration => ({
      isPresent: true,
      attendance: registration.daySchedule.timeSchedules,
      studentSchoolYear: registration.studentSchoolYear
    })
  )
}

function createDefaultInstructorRecords (instructorRegistrations, daySchedule)/*: InstructorRecord[]*/ {
  return instructorRegistrations.map(registration => ({
      isPresent: true,
      attendance: daySchedule.timeSchedules,
      instructorSchoolYear: registration
    })
  )
}



export default ({
  registrations,
  daySchedule,
  handleClose,
  handleSubmit
}: Props): JSX.Element => {
  const today: LocalDate = LocalDate.now()
  const latestDateOnWeekday: LocalDate = today.dayOfWeek() === JodaDoW.of(DayOfWeek.toInt(daySchedule.dayOfWeek))
      ? today
      : today.with(TemporalAdjusters.previous(JodaDoW.of(DayOfWeek.toInt(daySchedule.dayOfWeek))))

  const [state, dispatch] = useReducer(reducer, {
    defaultSchedule: daySchedule.timeSchedules,
    date: latestDateOnWeekday,
    studentRecords: createDefaultStudentRecords(registrations.students, daySchedule),
    instructorRecords: createDefaultInstructorRecords(registrations.instructors, daySchedule),
    substituteRecords: []
  })

  return (
    <Modal
      show={true}
      handleClose={() => handleClose()}
      size='xl'
      centered
      contentClassName='h-75'
      scrollable
    >
      <Modal.Header>
        <Modal.Title>Attendance - {daySchedule.dayOfWeek}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AttendanceForm
          state={state}
          dispatch={dispatch}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => handleClose()}>Close</Button>
        <Button
          onClick={() =>
            handleSubmit(
              state.date,
              state.studentRecords,
              state.instructorRecords,
              state.substituteRecords
            )
          }
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
