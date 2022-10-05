import { Row } from 'react-bootstrap'

import AttendanceTimeInput, { TimeInputType } from './TimeInput'
import Table, { Column, SortDirection } from 'components/BTable'
import type { AttendanceForm } from '../state'
import type { SubstituteRecord } from 'Models/StudentAttendance'

const columnsBuilder = (dispatch): Column[] => [
  {
    label: 'Last Name',
    attributeKey: 'substitute.lastName',
    sortable: true
  },
  {
    label: 'First Name',
    attributeKey: 'substitute.firstName',
    sortable: true
  },
  {
    key: 'arrived',
    label: 'Arrived at',
    attributeKey: '',
    sortable: false,
    transform: (registration: SubstituteRecord) => {
      const substituteRegistrations = registration.attendance.map(record => ({
        personSchoolYearGuid: registration.substitute.id,
        startTime: record.startTime,
        endTime: record.endTime
      }))

      return (
        <AttendanceTimeInput
          records={substituteRegistrations}
          inputType={TimeInputType.Start}
          onChange={(nameString, time, index) => dispatch({
            type: 'substituteStartTime',
            payload: { nameString, startTime: time, index }
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
    transform: (registration: SubstituteRecord) => {
      const substituteRegistrations = registration.attendance.map(record => ({
        personSchoolYearGuid: registration.substitute.id,
        startTime: record.startTime,
        endTime: record.endTime
      }))

      return (
      <AttendanceTimeInput
          records={substituteRegistrations}
          inputType={TimeInputType.End}
          onChange={(nameString, time, index) => dispatch({
            type: 'substituteEndTime',
            payload: { nameString, endTime: time, index }
          })}
        />
      )
    }
  }
]

interface Props {
  state: AttendanceForm
  dispatch
}

export default ({state, dispatch}: Props): JSX.Element => {

  const columns: Column[] = columnsBuilder(dispatch)

  if (state.substituteRecords.length === 0)
    return <></>

  return (
    <Row className='my-3  px-3'>
      <h5 className='p-0'>Substitute Attendance</h5>
      <Table
        columns={columns}
        dataset={state.substituteRecords}
        defaultSort={{index: 1, direction: SortDirection.Ascending}}
      />
    </Row>
  )
}