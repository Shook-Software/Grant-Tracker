import { useState } from 'react'
import { Row, Form, Button } from 'react-bootstrap'

import AttendanceTimeInput, { TimeInputType } from './TimeInput'
import Table, { Column, SortDirection } from 'components/BTable'
import AddInstructorModal from 'components/Modals/AddInstructorModal'


import type { InstructorRecord } from 'Models/StudentAttendance'
import type { AttendanceRecord } from './TimeInput'
import { ApiResult } from 'components/ApiResultAlert'


const columnsBuilder = (dispatch): Column[] => [
  {
    label: 'Present',
    attributeKey: '',
    sortable: false,
    transform: (record: InstructorRecord) => (
      <div className='d-flex justify-content-center h-100'>
        <Form.Check checked={record.isPresent} onChange={(e) => {}} />
      </div>
    ),
    cellProps: {
      role: 'button'
    }
  },
  {
    label: 'Last Name',
    attributeKey: 'instructorSchoolYear.instructor.lastName',
    sortable: true
  },
  {
    label: 'First Name',
    attributeKey: 'instructorSchoolYear.instructor.firstName',
    sortable: true
  },
  {
    key: 'arrived',
    label: 'Arrived at',
    attributeKey: '',
    sortable: false,
    transform: (registration: InstructorRecord) => {
      const instructorRegistrations: AttendanceRecord[] = registration.times.map(record => ({
        personSchoolYearGuid: registration.instructorSchoolYear.guid,
        startTime: record.startTime,
        endTime: record.endTime
      }))

      return (
        <AttendanceTimeInput
          key={registration.instructorSchoolYear + 'enter'}
          id={registration.instructorSchoolYear + 'enter'}
          records={instructorRegistrations}
          inputType={TimeInputType.Start}
          onChange={(guid, time, index) => dispatch({
            type: 'instructorStartTime',
            payload: { guid, startTime: time, index }
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
      const instructorRegistrations: AttendanceRecord[] = registration.times.map(record => ({
        personSchoolYearGuid: registration.instructorSchoolYear.guid,
        startTime: record.startTime,
        endTime: record.endTime
      })) 

      return (
        <AttendanceTimeInput
          key={registration.instructorSchoolYear + 'leave'}
          id={registration.instructorSchoolYear + 'leave'}
          records={instructorRegistrations}
          inputType={TimeInputType.End}
          onChange={(guid, time, index) => dispatch({
            type: 'instructorEndTime',
            payload: { guid, endTime: time, index }
          })}
        />
      )
    }
  }
]

export default ({state, dispatch}): JSX.Element => {
  const [showModal, setShowModal] = useState<boolean>(false)

  const columns: Column[] = columnsBuilder(dispatch)

  function addInternalInstructor (instructor, instructorSchoolYearGuid): Promise<ApiResult> {

    return new Promise((resolve, reject) => {
      instructor.id = instructorSchoolYearGuid || `${instructor.firstName.trim()}${instructor.lastName.trim()}`
      const payload = instructorSchoolYearGuid ? { instructor, instructorSchoolYearGuid } :  { instructor }
      dispatch({type: 'addSubstitute', payload})
      resolve({
        label: `${instructor.firstName} ${instructor.lastName}`,
        success: true
      })
    })
  }
  
  function addExternalInstructor (instructor): Promise<ApiResult> {
    return new Promise((resolve, reject) => {
      instructor.id = `${instructor.firstName}${instructor.lastName}`
      dispatch({type: 'addSubstitute', payload: { instructor }})
      resolve({
        label: `${instructor.firstName} ${instructor.lastName}`,
        success: true
      })
    })
  }

  return (
    <Row className='my-3  px-3'>
      <h5 className='p-0'>Instructor Attendance</h5>
      <Button 
        style={{width: 'fit-content', marginBottom: '0.5rem'}} 
        onClick={() => setShowModal(true)}
      >
        Add Substitute
      </Button>
      <Table
        columns={columns}
        dataset={state.instructorRecords}
        defaultSort={{index: 1, direction: SortDirection.Ascending}}
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
      <AddInstructorModal 
        show={showModal} 
        handleClose={() => setShowModal(false)} 
        onInternalChange={addInternalInstructor} 
        onExternalChange={addExternalInstructor}
        variant='attendance'
      />
    </Row>
  )
}