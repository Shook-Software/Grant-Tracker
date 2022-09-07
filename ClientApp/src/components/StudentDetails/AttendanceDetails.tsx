import { Link } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { LocalDate, DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import Table, { Column, SortDirection } from 'components/BTable'

import { AttendanceView } from 'Models/StudentAttendance'

const columns: Column[] = [
  {
    label: 'Session',
    attributeKey: '',
    sortable: true,
    transform: (value: AttendanceView) => (
      <Link to={`/home/admin/sessions/${value.sessionGuid}`}>
        {value.sessionName}
      </Link>
    )
  },
  {
    label: 'Date',
    attributeKey: 'instanceDate',
    sortable: true,
    transform: (date: LocalDate): string =>
      date.format(
        DateTimeFormatter.ofPattern('MMM, dd').withLocale(Locale.ENGLISH)
      )
  },
  {
    label: 'Minutes Attended',
    attributeKey: 'minutesAttended',
    sortable: true
  }
]

export default ({ attendance }): JSX.Element => {
  console.log(attendance)
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
