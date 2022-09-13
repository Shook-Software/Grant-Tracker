import { Row, Form } from 'react-bootstrap'

import AttendanceTimeInput, { TimeInputType } from './TimeInput'

import Table, {Column} from 'components/BTable'

import type { AttendanceRecord } from './TimeInput'
import type { StudentRecord } from 'Models/StudentAttendance'


const columnsBuilder = (dispatch): Column[] => [
  {
    label: 'Present',
    attributeKey: '',
    sortable: false,
    transform: (record: StudentRecord) => (
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

  const columns: Column[] = columnsBuilder(dispatch)

  return (
    <Row className='my-3  px-3'>
        <h5>Student Attendance</h5>
        <Table
          columns={columns}
          dataset={state.studentRecords}
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
      </Row>
  )
}