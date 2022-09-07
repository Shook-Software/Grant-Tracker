import { useEffect, useState } from 'react'
import { Container, Row, Col, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import Table, { Column } from 'components/BTable'

import { useAdminPage, Context } from '../index'

import api from 'utils/api'

const columns: Column[] = [
  {
    label: 'First Name',
    attributeKey: 'student.firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'student.lastName',
    sortable: true
  },
  {
    label: 'Matric Number',
    attributeKey: 'student.matricNumber',
    sortable: true
  },
  {
    label: 'Grade',
    attributeKey: 'grade',
    sortable: true
  },
  {
    key: 'hours',
    label: 'Time',
    attributeKey: 'minutesAttended',
    sortable: true,
    transform: (value: number) => {
      return `${Math.floor(value / 60)}h, ${value % 60}m`
    }
  },
  {
    key: 'total',
    label: 'Total Minutes',
    attributeKey: 'minutesAttended',
    sortable: true
  },
  /*{
    label: 'Latest Session',
    attributeKey: 'lastSessionDate',
    sortable: true,
    transform: value =>
      LocalDate.of(value.year, value.month, value.day).format(
        DateTimeFormatter.ofPattern('MMMM d').withLocale(Locale.ENGLISH)
      )
  },*/
  {
    label: '',
    attributeKey: 'guid',
    sortable: false,
    transform: (value: string) => (
      <div className='d-flex justify-content-center'>
        <Link to={value} style={{ color: 'inherit' }}>
          View
        </Link>
      </div>
    )
  }
]

export default (): JSX.Element => {
  document.title = 'GT - Admin / Students'
  const { user }: Context = useAdminPage()
  const [state, setState] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function getStudents (): void {
    setIsLoading(true)
    api
      .get('student', { params: {
        name: '',
        organizationGuid: user.organization.guid,
        yearGuid: user.year.guid
      }})
      .then(res => setState(res.data))
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    getStudents()
  }, [user])

  console.log(state[0])

  return (
    <Container>
      <Row className='my-3'>
        <Col>
          <h5>Students for {user.organizationName}</h5>
          {isLoading ? (
          <Spinner animation='border' />
        ) : !state || state.length === 0 ? (
          <div className='d-flex align-items-center justify-content-center'>
            <p>No students found...</p>
          </div>
        ) : (
          <Table columns={columns} dataset={state}  rowProps={{key: 'studentSchoolYearGuid'}} />
        )}
        </Col>
      </Row>
    </Container>
  )
}
