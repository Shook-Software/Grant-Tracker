import { useReducer } from 'react'
import { Button, Modal } from 'react-bootstrap'
import {
  LocalDate,
  TemporalAdjusters,
  DayOfWeek as JodaDoW
} from '@js-joda/core'

import AttendanceForm from './AttendanceForm'

import { DayOfWeek } from 'Models/DayOfWeek'
import { StudentRecord } from 'Models/StudentAttendance'
import { DayScheduleView } from 'Models/DaySchedule'

import { reducer } from './state'

interface Props {
  registrations: any
  daySchedule: DayScheduleView
  handleClose: () => void
  handleSubmit: (
    date: LocalDate,
    studentRecords: StudentRecord[],
    instructorRecords: any[]
  ) => Promise<void>
}

function mutateStudents (studentRegs, daySchedule) {
  let studentRegistrations = studentRegs.filter(reg => reg.daySchedule.dayOfWeek == daySchedule.dayOfWeek)

  const studentRecords: StudentRecord[] = studentRegistrations.map(registration => ({
      isPresent: true,
      attendance: registration.daySchedule.timeSchedules,
      studentSchoolYear: registration.studentSchoolYear
    })
  )

  return studentRecords
}

function mutateInstructors (instructorRegs, daySchedule) {
  let instructorRegistrations = instructorRegs

  const instructorRecords: any[] = instructorRegistrations.map(registration => {
    let form: any = {
      isPresent: true,
      attendance: daySchedule.timeSchedules,
      instructorSchoolYear: registration
    }

    return form
  })

  return instructorRecords
}

export default ({
  registrations,
  daySchedule,
  handleClose,
  handleSubmit
}: Props): JSX.Element => {
  const today: LocalDate = LocalDate.now()
  const lastWeekdate: LocalDate =
    today.dayOfWeek() === JodaDoW.of(DayOfWeek.toInt(daySchedule.dayOfWeek))
      ? today
      : today.with(
          TemporalAdjusters.previous(
            JodaDoW.of(DayOfWeek.toInt(daySchedule.dayOfWeek))
          )
        )
  const [state, dispatch] = useReducer(reducer, {
    defaultSchedule: daySchedule.timeSchedules,
    date: lastWeekdate,
    studentRecords: mutateStudents(registrations.students, daySchedule),
    instructorRecords: mutateInstructors(registrations.instructors, daySchedule)
  })

  console.log(registrations)

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
          schedule={daySchedule}
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
              state.instructorRecords
            )
          }
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
