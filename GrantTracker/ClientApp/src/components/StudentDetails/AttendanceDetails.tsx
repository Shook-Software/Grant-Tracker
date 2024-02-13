import { Link } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { LocalDate, DateTimeFormatter, LocalTime } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import Table, { Column, SortDirection } from 'components/BTable'
import TimeRecordDisplay from 'components/SessionDetails/AttendanceHistory/TimeRecordDisplay'

import { AttendanceTimeRecordView, AttendanceView, StudentAttendanceView } from 'Models/StudentAttendance'

const columns: Column[] = [
  {
    label: 'Session',
    attributeKey: '',
    key: 'ss',
    sortable: true,
    transform: (value: StudentAttendanceView) => (
      <Link to={`/home/admin/sessions/${value.attendanceRecord?.session.guid}`}>
        {value.attendanceRecord?.session.name}
      </Link>
    )
  },
  {
    label: 'Date',
    attributeKey: 'attendanceRecord',
    sortable: true,
    transform: (record: AttendanceView): string => record.instanceDate.format(DateTimeFormatter.ofPattern('MM/dd/y').withLocale(Locale.ENGLISH))
  },
  {
    label: 'Time Records',
    attributeKey: 'timeRecords',
    sortable: false,
    headerTransform: () => (
      <th className='d-flex flex-wrap'>
        <span className='w-100 text-center'>Time Records</span>
        <span className='w-50 text-center'>Entered at:</span>
        <span className='w-50 text-center'>Exited at:</span>
      </th>
    ),
    transform: (timeRecord: AttendanceTimeRecordView[]) => <TimeRecordDisplay timeRecords={timeRecord} />,
    cellProps: {className: 'py-1'},
  }
]

export default ({ attendance }): JSX.Element => {
  if (!attendance) return <></>

  return (
    <Container>
      <h3>Attendance</h3>

      <Table
        columns={columns}
        dataset={attendance}
        defaultSort={{ index: 1, direction: SortDirection.Descending }}
      />
    </Container>
  )
}
