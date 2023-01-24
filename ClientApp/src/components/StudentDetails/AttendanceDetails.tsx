import { Link } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { LocalDate, DateTimeFormatter, LocalTime } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import Table, { Column, SortDirection } from 'components/BTable'

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
    transform: (record: AttendanceView): string => record.instanceDate.format(DateTimeFormatter.ofPattern('MMMM, dd').withLocale(Locale.ENGLISH))
  },
  {
    label: 'Time Records',
    attributeKey: 'timeRecords',
    sortable: false,
    transform: (timeRecord: AttendanceTimeRecordView[]) => <Table columns={tempColumns} dataset={timeRecord} className='m-0' />,
    cellProps: {className: 'h-100 p-0'}
  }
]

const tempColumns: Column[] = [
  {
    label: 'Arrived at',
    attributeKey: 'startTime',
    sortable: true,
    transform: (time: LocalTime) => time.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))
  },
  {
    label: 'Left at',
    attributeKey: 'endTime',
    sortable: true,
    transform: (time: LocalTime) => time.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))
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
        defaultSort={{ index: 1, direction: SortDirection.Ascending }}
      />
    </Container>
  )
}
