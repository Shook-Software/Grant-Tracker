import { useState, useReducer, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Form, Row, Col, Modal } from 'react-bootstrap'
import {
  LocalDate,
  LocalTime,
  TemporalAdjusters,
  DayOfWeek as JodaDoW,
  DateTimeFormatter
} from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import SearchStudentsModal from 'components/SearchStudentsModal'
import Table, { Column } from 'components/BTable'
import { TimeInput } from 'components/TimeRangeSelector'

import { AttendanceForm, ReducerAction } from './state'
import { StudentRecord } from 'Models/StudentAttendance'
import { dayScheduleComparer, DayScheduleView } from 'Models/DaySchedule'
import { DayOfWeek, DayOfWeekString } from 'Models/DayOfWeek'
import { StudentSchoolYearWithRecordsView } from 'Models/Student'
import { DropdownOption } from 'Models/Session'

import Dropdown from 'components/Input/Dropdown'

const StartTimeInputStack = ({ studentRecord, dispatch }): JSX.Element => (
  <>
    {studentRecord.attendance.map((schedule, index) => (
      <TimeInput
        key={`${schedule.startTime.hour()}${schedule.startTime.minute()}`}
        value={schedule.startTime}
        onChange={(value: LocalTime) =>
          dispatch({
            type: 'studentStartTime',
            payload: {
              guid: studentRecord.student.studentSchoolYearGuid,
              index,
              startTime: value
            }
          })
        }
      />
    ))}
  </>
)

const EndTimeInputStack = ({ studentRecord, dispatch }): JSX.Element => (
  <>
    {studentRecord.attendance.map((schedule, index) => (
      <TimeInput
        key={`${schedule.endTime.hour()}${schedule.endTime.minute()}`}
        value={schedule.endTime}
        onChange={(value: LocalTime) =>
          dispatch({
            type: 'studentEndTime',
            payload: {
              guid: studentRecord.student.studentSchoolYearGuid,
              index,
              endTime: value
            }
          })
        }
      />
    ))}
  </>
)

const columnsBuilder = (dispatch): Column[] => [
  {
    label: 'Present',
    attributeKey: '',
    sortable: false,
    transform: (values: StudentRecord) => (
      <div className='d-flex justify-content-center h-100'>
        <Form.Check checked={values.isPresent} onChange={() => null} />
      </div>
    ),
    cellProps: {
      role: 'button'
    }
  },
  {
    label: 'First Name',
    attributeKey: 'studentSchoolYear.student.firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'studentSchoolYear.student.lastName',
    sortable: true
  },
  {
    label: 'Matric Number',
    attributeKey: 'studentSchoolYear.student.matricNumber',
    sortable: true
  },
  {
    label: 'Arrived',
    key: 'arrived',
    attributeKey: '',
    sortable: false,
    transform: (values: StudentRecord) => (
      <StartTimeInputStack studentRecord={values} dispatch={dispatch} />
    )
  },
  {
    label: 'Left',
    key: 'left',
    attributeKey: '',
    sortable: false,
    transform: (values: StudentRecord) => (
      <EndTimeInputStack studentRecord={values} dispatch={dispatch} />
    )
  }
]

function createLatestDateOptions (
  dayOfWeek: DayOfWeekString
): DropdownOption[] {
  const dayOfWeekEnum: JodaDoW = JodaDoW.of(DayOfWeek.toInt(dayOfWeek))
  let currentDate: LocalDate = LocalDate.now()
  let options: DropdownOption[] =
    dayOfWeekEnum === currentDate.dayOfWeek()
      ? [
          {
            guid: currentDate.toString(),
            label: currentDate.format(
              DateTimeFormatter.ofPattern('MMMM d').withLocale(Locale.ENGLISH)
            )
          }
        ]
      : []

  for (let index = 0; index <= 3; index++) {
    const lastWeekday: LocalDate = currentDate.with(
      TemporalAdjusters.previous(dayOfWeekEnum)
    )
    options = [
      ...options,
      {
        guid: lastWeekday.toString(),
        label: lastWeekday.format(
          DateTimeFormatter.ofPattern('MMMM d').withLocale(Locale.ENGLISH)
        )
      }
    ]
    currentDate = lastWeekday
  }

  return options
}

/*const InstructorAttendance = ({
  instructorRegistrations,
  defaultSchedule,
  dispatch
}): JSX.Element => {
  return (
    <Row>
      {instructorRegistrations.map((reg, index) => (
        <div className='d-flex flex-row my-3'>
          <div>
            <label>
              {reg.firstName} {reg.lastName} arrived at:{' '}
            </label>
            <TimeInput
              key={''}
              value={timeSchedule.startTime}
              /*onChange={(value: LocalTime) =>
              dispatch({
                type: 'instructorStartTime',
                payload: { index, startTime: value }
              })
            }
              style={{ width: '200px' }}
            />
          </div>
          <div className='mx-3 '>
            <label>Instructor left at: </label>
            <TimeInput
              //have a min and max setting
              key={`${timeSchedule.endTime.hour()}${timeSchedule.endTime.minute()}`}
              value={timeSchedule.endTime}
              /*onChange={(value: LocalTime) =>
              dispatch({
                type: 'instructorEndTime',
                payload: { index, endTime: value }
              })
            }
              style={{ width: '200px' }}
            />
          </div>
        </div>
      ))}
    </Row>
  )
}
*/

interface Props {
  schedule: DayScheduleView
  state: AttendanceForm
  dispatch: (action: ReducerAction) => void
}

export default ({ schedule, state, dispatch }: Props): JSX.Element => {
  const { sessionGuid } = useParams()
  const [showAddStudentModal, setShowStudentModal] = useState<boolean>(false)
  const [showSubModal, setShowSubModal] = useState<boolean>(false)

  const dateOptions: DropdownOption[] = createLatestDateOptions(
    schedule.dayOfWeek
  )

  const columns: Column[] = columnsBuilder(dispatch)
  const instructorColumns: Column[] = instructorColumnsBuilder(dispatch)

  function handleSubAddition (substitute): void {
    setShowSubModal(false)
    if (!substitute) return

    dispatch({
      type: 'addSubstitute',
      payload: substitute
    })
  }

  function addStudentRecord (student: StudentSchoolYearWithRecordsView): void {
    const studentRecord: StudentRecord = {
      isPresent: true,
      attendance: state.defaultSchedule.map(schedule => ({ ...schedule })),
      student: student
    }

    dispatch({
      type: 'studentRecords',
      payload: [...state.studentRecords, studentRecord]
    })
    setShowStudentModal(false)
  }

  console.log(state)

  return (
    <>
      <Row lg={5} className='px-1'>
        <Col>
          <label htmlFor='date-select'>Session Date</label>
          <Dropdown
            id='date-select'
            options={dateOptions}
            value={state.date.format(
              DateTimeFormatter.ofPattern('MMMM, dd').withLocale(Locale.ENGLISH)
            )}
            onChange={(value: string) =>
              dispatch({ type: 'instanceDate', payload: value })
            }
            disableOverlay
          />
        </Col>
      </Row>

      <Row className='d-flex flex-row my-3 px-1'>
        <div style={{ width: 'fit-content' }}>
          <label>Set all start times:</label>
          <AllStartTimeInputStack
            defaultTimes={state.defaultSchedule}
            dispatch={dispatch}
          />
        </div>
        <div style={{ width: 'fit-content' }}>
          <label>Set all exit times:</label>
          <AllEndTimeInputStack
            defaultTimes={state.defaultSchedule}
            dispatch={dispatch}
          />
        </div>
      </Row>

      <hr />

      <Row className='my-3  px-3'>
        <h5>Instructor Attendance</h5>
        <Table
          columns={instructorColumns}
          dataset={state.instructorRecords}
          rowProps={{
            onClick: (event, values): void => {
              dispatch({
                type: 'instructorPresence',
                payload: {
                  instructorSchoolYearGuid:
                    values.instructor.instructorSchoolYearGuid,
                  isPresent: !values.isPresent
                }
              })
            }
          }}
        />
      </Row>

      <hr />

      <Row className='my-3  px-3'>
        <h5>Student Attendance</h5>
        {console.log(state.studentRecords)}
        <Table
          columns={columns}
          dataset={state.studentRecords}
          rowProps={{
            onClick: (event, values): void => {
              dispatch({
                type: 'studentPresence',
                payload: {
                  guid: values.student.studentSchoolYearGuid,
                  isPresent: !values.isPresent
                }
              })
            }
          }}
        />
      </Row>

      <Button
        onClick={() => setShowStudentModal(true)}
        style={{ width: 'fit-content' }}
      >
        Add Student
      </Button>
      <SearchStudentsModal
        show={showAddStudentModal}
        sessionGuid={sessionGuid}
        scheduling={[schedule]}
        handleClose={() => setShowStudentModal(false)}
        handleChange={(value: StudentSchoolYearWithRecordsView) =>
          addStudentRecord(value)
        }
      />
    </>
  )
}

const InstructorStartTimeInputStack = ({
  instructorRecord,
  dispatch
}): JSX.Element => (
  <>
    {instructorRecord.attendance.map((schedule, index) => (
      <TimeInput
        key={`${schedule.startTime.hour()}${schedule.startTime.minute()}`}
        value={schedule.startTime}
        onChange={(value: LocalTime) =>
          dispatch({
            type: 'instructorStartTime',
            payload: {
              guid: instructorRecord.instructor.instructorSchoolYearGuid,
              startTime: value
            }
          })
        }
      />
    ))}
  </>
)

const InstructorEndTimeInputStack = ({
  instructorRecord,
  dispatch
}): JSX.Element => (
  <>
    {instructorRecord.attendance.map((schedule, index) => (
      <TimeInput
        key={`${schedule.endTime.hour()}${schedule.endTime.minute()}`}
        value={schedule.endTime}
        onChange={(value: LocalTime) =>
          dispatch({
            type: 'instructorEndTime',
            payload: {
              guid: instructorRecord.instructor.instructorSchoolYearGuid,
              endTime: value
            }
          })
        }
      />
    ))}
  </>
)

const instructorColumnsBuilder = (dispatch): Column[] => [
  {
    label: 'Present',
    attributeKey: '',
    sortable: false,
    transform: (values: StudentRecord) => (
      <div className='d-flex justify-content-center h-100'>
        <Form.Check checked={values.isPresent} onChange={() => null} />
      </div>
    ),
    cellProps: {
      role: 'button'
    }
  },
  {
    label: 'First Name',
    attributeKey: 'instructorSchoolYear.instructor.firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'instructorSchoolYear.instructor.lastName',
    sortable: true
  },
  {
    key: 'arrived',
    label: 'Arrived',
    attributeKey: '',
    sortable: false,
    transform: (values: StudentRecord) => (
      <InstructorStartTimeInputStack
        instructorRecord={values}
        dispatch={dispatch}
      />
    )
  },
  {
    key: 'left',
    label: 'Left',
    attributeKey: '',
    sortable: false,
    transform: (values: StudentRecord) => (
      <InstructorEndTimeInputStack
        instructorRecord={values}
        dispatch={dispatch}
      />
    )
  }
]

const AllStartTimeInputStack = ({ defaultTimes, dispatch }): JSX.Element => (
  <>
    {defaultTimes.map((schedule, index) => (
      <TimeInput
        key={`${schedule.startTime.hour()}${schedule.startTime.minute()}`}
        value={schedule.startTime}
        onChange={(value: LocalTime) =>
          dispatch({
            type: 'scheduleStartShift',
            payload: {
              index,
              startTime: value
            }
          })
        }
      />
    ))}
  </>
)

const AllEndTimeInputStack = ({ defaultTimes, dispatch }): JSX.Element => (
  <>
    {defaultTimes.map((schedule, index) => (
      <TimeInput
        key={`${schedule.endTime.hour()}${schedule.endTime.minute()}`}
        value={schedule.endTime}
        onChange={(value: LocalTime) =>
          dispatch({
            type: 'scheduleEndShift',
            payload: {
              index,
              endTime: value
            }
          })
        }
      />
    ))}
  </>
)

const AddSubstituteModal = ({ show, handleClose, dispatch }) => {
  const [substitute, setSubstitute] = useState({
    firstName: '',
    lastName: '',
    badgeNumber: ''
  })

  return (
    <Modal show={show}>
      <Modal.Header closeButton onHide={() => handleClose()}>
        Add Substitute
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Label htmlFor='subFirstname'>First Name</Form.Label>
          <Form.Control type='text' id='subFirstName' />
          <Form.Label htmlFor='subLastname'>Last Name</Form.Label>
          <Form.Control type='text' id='subLastname' />
          <div className='mx-3'>or...</div>
          <Form.Label htmlFor='subBadgeNumber'>BadgeNumber</Form.Label>
          <Form.Control
            type='text'
            id='subBadgeNumber'
            placeholder='Required only if sub has one.'
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => handleClose()} style={{ width: 'fit-content' }}>
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

/*
<AddSubstituteModal
        show={showSubModal}
        handleClose={handleSubAddition}
        dispatch={dispatch}
      />
      */
