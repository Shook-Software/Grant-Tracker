import { useState } from 'react'
import { Row, Form, Button } from 'react-bootstrap'

import AttendanceTimeInput, { TimeInputType } from './TimeInput'

import Table, {Column, SortDirection} from 'components/BTable'
import SearchStudentsModal from 'components/SessionDetails/SearchStudentsModal'

import type { AttendanceRecord } from './TimeInput'
import type { StudentRecord } from 'Models/StudentAttendance'


const columnsBuilder = (dispatch): Column[] => [
  {
    label: 'Present',
    attributeKey: '',
    sortable: false,
    transform: (record: StudentRecord) => (
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
    attributeKey: 'studentSchoolYear.student.lastName',
    sortable: true
  },
  {
    label: 'First Name',
    attributeKey: 'studentSchoolYear.student.firstName',
    sortable: true
  },
  {
    label: 'Matric Number',
    attributeKey: 'studentSchoolYear.student.matricNumber',
    sortable: true
  },
  {
    label: 'Arrived at',
    key: 'arrived',
    attributeKey: '',
    sortable: false,
    transform: (registration: StudentRecord) => {
      const studentRegistrations: AttendanceRecord[] = registration.attendance.map(record => ({
      personSchoolYearGuid: registration.studentSchoolYear.guid,
      startTime: record.startTime,
      endTime: record.endTime
    }))

    return (
      <AttendanceTimeInput
        records={studentRegistrations}
        inputType={TimeInputType.Start}
        onChange={(guid, time, index) => dispatch({
          type: 'studentStartTime',
          payload: { guid, startTime: time, index }
        })}
      />
    )}
  },
  {
    label: 'Left at',
    key: 'left',
    attributeKey: '',
    sortable: false,
    transform: (registration: StudentRecord) => {
      const studentRegistrations: AttendanceRecord[] = registration.attendance.map(record => ({
      personSchoolYearGuid: registration.studentSchoolYear.guid,
      startTime: record.startTime,
      endTime: record.endTime
    }))

    return (
      <AttendanceTimeInput
        records={studentRegistrations}
        inputType={TimeInputType.End}
        onChange={(guid, time, index) => dispatch({
          type: 'studentEndTime',
          payload: { guid, endTime: time, index }
        })}
      />
    )}
  }
]

interface Props {
  state,
  dispatch
}

export default ({state, dispatch}: Props): JSX.Element => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const columns: Column[] = columnsBuilder(dispatch)

  function addStudent(student): Promise<void> {
    return new Promise((resolve, reject) => {
      dispatch({type: 'addStudent', payload: student})
      resolve()
    })
  }

  return (
    <Row className='my-3  px-3'>
      <h5 className='p-0'>Student Attendance</h5>
      <Row>
        <Button 
          style={{width: 'fit-content', marginBottom: '0.5rem'}} 
          onClick={() => setShowModal(true)}
        >
          Add Student
        </Button>
      </Row>
      <Row> 
        <Button 
        size='sm'
        style={{width: 'fit-content', marginBottom: '0.5rem'}} 
        onClick={() => dispatch({type: 'allStudentPresence', payload: true})}
        >
          Mark all present
        </Button>
        <Button 
        size='sm'
        className='mx-2'
        style={{width: 'fit-content', marginBottom: '0.5rem'}} 
        onClick={() => dispatch({type: 'allStudentPresence', payload: false})}
        >
        Mark all absent
        </Button>
      </Row>
      <Table
        columns={columns}
        dataset={state.studentRecords}
        defaultSort={{index: 1, direction: SortDirection.Ascending}}
        rowProps={{
          onClick: (event, record): void => {
            dispatch({
              type: 'studentPresence',
              payload: {
                guid: record.studentSchoolYear.guid,
                isPresent: !record.isPresent
              }
            })
          }
        }}
      />
      <SearchStudentsModal 
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleChange={({student, _}) => addStudent(student)}
        scheduling={null}
      />
    </Row>
  )
}