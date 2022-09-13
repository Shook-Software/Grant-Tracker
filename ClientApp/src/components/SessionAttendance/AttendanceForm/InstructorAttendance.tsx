import { useState } from 'react'
import { Row, Form, Button } from 'react-bootstrap'
import { LocalTime } from '@js-joda/core'

import SubstituteModal from './SubstituteModal'
import AttendanceTimeInput, { TimeInputType } from './TimeInput'
import Table, { Column } from 'components/BTable'

import type { InstructorRecord, StudentRecord } from 'Models/StudentAttendance'
import type { AttendanceRecord } from './TimeInput'


const columnsBuilder = (dispatch): Column[] => [
  {
    label: 'Present',
    attributeKey: '',
    sortable: false,
    transform: (record: InstructorRecord) => (
      <div className='d-flex justify-content-center h-100'>
        {console.log(record)}
        <Form.Check checked={record.isPresent} onChange={(e) => {}} />
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
    label: 'Arrived at',
    attributeKey: '',
    sortable: false,
    transform: (registration: InstructorRecord) => {
      const instructorRegistrations: AttendanceRecord[] = registration.attendance.map(record => ({
        personSchoolYearGuid: registration.instructorSchoolYear.guid,
        startTime: record.startTime,
        endTime: record.endTime
      }))

      return (
        <AttendanceTimeInput
          records={instructorRegistrations}
          inputType={TimeInputType.Start}
          onChange={(guid, time) => dispatch({
            type: 'instructorEndTime',
            payload: { guid, endTime: time }
          })}
        />
      )
    }
  },
  {
    key: 'left',
    label: 'Left at',
    attributeKey: '',
    sortable: false,
    transform: (registration: InstructorRecord) => {
      const instructorRegistrations: AttendanceRecord[] = registration.attendance.map(record => ({
        personSchoolYearGuid: registration.instructorSchoolYear.guid,
        startTime: record.startTime,
        endTime: record.endTime
      }))

      return (
      <AttendanceTimeInput
          records={instructorRegistrations}
          inputType={TimeInputType.End}
          onChange={(guid, time) => dispatch({
            type: 'instructorEndTime',
            payload: { guid, endTime: time }
          })}
        />
      )
    }
  }
]

export default ({state, dispatch}): JSX.Element => {
  const [showModal, setShowModal] = useState<boolean>(false)

  const columns: Column[] = columnsBuilder(dispatch)

  return (
    <Row className='my-3  px-3'>
      <h5 className='p-1'>Instructor Attendance</h5>
      <Button 
        style={{width: 'fit-content', marginBottom: '0.5rem'}} 
        onClick={() => setShowModal(true)}
      >
        Add Substitute
      </Button>
      <Table
        columns={columns}
        dataset={state.instructorRecords}
        rowProps={{
          onClick: (event, record): void => {
            dispatch({
              type: 'instructorPresence',
              payload: {
                guid: record.instructorSchoolYear.guid,
                isPresent: !record.isPresent
              }
            })
          }
        }}
      />
      <SubstituteModal show={showModal} onClose={() => setShowModal(false)} dispatch={dispatch} />
    </Row>
  )
}