import { useState, useReducer, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Modal, Spinner } from 'react-bootstrap'
import { DateTimeFormatter, LocalDate } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import AttendanceForm from './AttendanceForm'

import { InstructorRecord, StudentRecord, SubstituteRecord } from 'Models/StudentAttendance'

import { reducer } from './state'
import { TimeScheduleForm } from 'Models/TimeSchedule'
import { DayOfWeekNumeric, DayOfWeek } from 'Models/DayOfWeek'
import { DropdownOption } from 'Models/Session'

import { getOpenDates } from './api'

interface Props {
  //registrations: any
  //daySchedule: DayScheduleView
  props: {
    date: LocalDate | null,
    dayOfWeek: DayOfWeekNumeric
    studentRecords: StudentRecord[],
    instructorRecords: InstructorRecord[],
    substituteRecords: SubstituteRecord[],
    defaultTimeSchedule: TimeScheduleForm[],
  },
  handleClose: () => void
  handleSubmit: (
    date: LocalDate,
    studentRecords: StudentRecord[],
    instructorRecords: InstructorRecord[],
    substituteRecords: SubstituteRecord[]
  ) => Promise<void>
}


  /*const today: LocalDate = LocalDate.now()
                const latestDateOnWeekday: LocalDate = return
                   today.dayOfWeek() === JodaDoW.of(DayOfWeek.toInt(attendanceModalParams?.schedule?.dayOfWeek))
                    ? today
                    : today.with(TemporalAdjusters.previous(JodaDoW.of(DayOfWeek.toInt(attendanceModalParams?.schedule?.dayOfWeek))))\
                    */


export default ({
  props,
  handleClose,
  handleSubmit,
}: Props): JSX.Element => {

  const { sessionGuid } = useParams()
  const [state, dispatch] = useReducer(reducer, props)
  const [dateOptions, setDateOptions] = useState<DropdownOption[]>([])
  /*
{
      defaultSchedule: daySchedule.timeSchedules,
      date: latestDateOnWeekday,
      dayOfWeek: DayOfWeek.toInt(daySchedule.dayOfWeek),
      studentRecords: createDefaultStudentRecords(registrations.students, daySchedule),
      instructorRecords: createDefaultInstructorRecords(registrations.instructors, daySchedule),
      substituteRecords: []
    }
  */

  
  useEffect(() => {
    getOpenDates(sessionGuid, props.dayOfWeek, (options) => {
      if (Array.isArray(options) && options.length !== 0) {
        if (!props.date) 
          dispatch({type: 'instanceDate', payload: options[0].guid})
        setDateOptions(
          props.date 
          ? [...options, { guid: props.date.toString(), label: props.date.format(DateTimeFormatter.ofPattern('MMMM dd').withLocale(Locale.ENGLISH))}]
          : options
          )
      }
    })
  }, [])

  if (!state.date)
    return <Spinner animation='border' role='status' />
  
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
        <Modal.Title>Attendance - {DayOfWeek.toString(props.dayOfWeek)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AttendanceForm
          state={state}
          dispatch={dispatch}
          dateOptions={dateOptions}
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
