import { ListGroup, Spinner } from 'react-bootstrap'

import ListItem from 'components/Item'

import { Grade } from 'Models/Grade'
import { StudentSchoolYearWithRecordsView, StudentView } from 'Models/Student'

import { minutesToTimeSpan } from 'utils/Math'

interface Props {
  studentSchoolYear: StudentSchoolYearWithRecordsView
  minutes: number
}

export default ({ studentSchoolYear, minutes }: Props): JSX.Element => {
  //why is this here and not in the parent element?
  if (!studentSchoolYear) return <Spinner animation='border' role='status' />

  const student: StudentView = studentSchoolYear.student

  return (
    <ListGroup variant='flush'>
      <ListItem label='Grade:' value={Grade.toOrdinalString(studentSchoolYear.grade)} />
      <ListItem label='Matric Number:' value={student.matricNumber} />
    </ListGroup>
  )
}

//<ListItem label='Attended For:' value={minutesToTimeSpan(minutes)} />
