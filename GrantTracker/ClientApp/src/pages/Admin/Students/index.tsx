import { useEffect, useState } from 'react'
import { Container, Row, Col, Spinner, Button, Form } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Table, { Column, SortDirection } from 'components/BTable'
import StudentDetails from 'components/StudentDetails'

import { useAdminPage, Context } from '../index'

import api from 'utils/api'
import paths from 'utils/routing/paths'

const createColumns = (): Column[] => [
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
  },/*
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
  {
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
        <Button className='p-0' size='sm'>
          <Link className='p-3' to={value} style={{ color: 'inherit' }}>
            View
          </Link>
        </Button>
      </div>
    )
  }
]

export default (): JSX.Element => {
  document.title = 'GT - Admin / Students'
  const { studentGuid } = useParams()
  const { user }: Context = useAdminPage()
  const [state, setState] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const navigate = useNavigate()

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
  
  function handleSearchTermChange(term) {
    term = term.toLocaleLowerCase()
    setSearchTerm(term)
  }

  useEffect(() => {
    getStudents()
  }, [user])
  
  let columns: Column[] = createColumns()
  let rowClick = null
  if (studentGuid != null) {
    columns = [columns[0], columns[1]]
    rowClick = (event, row) => navigate(`${paths.Admin.path}/${paths.Admin.Tabs.Students.path}/${row.guid}`)
  }

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
          <div className='pt-1'>
            <Row>
              <Col md={!studentGuid ? 12 : 3}>
                <Row>
                  <Col md={!studentGuid ? 3 : 12} className='p-0'>
                    <Form.Control 
                      type='text' 
                      className='border-bottom-0'
                      placeholder='Filter students...'
                      value={searchTerm} 
                      onChange={(e) => handleSearchTermChange(e.target.value)}
                      style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
                    />
                  </Col>
                </Row>
                <Row>
                  <Table 
                    columns={columns} 
                    dataset={state.filter(ssy => `${ssy.student.firstName} ${ssy.student.lastName}`.toLocaleLowerCase().includes(searchTerm))}  
                    defaultSort={{index: 1, direction: SortDirection.Ascending}}
                    rowProps={{key: 'studentSchoolYearGuid', onClick: rowClick}} 
                  />
                </Row>
              </Col>
              <Col md={!studentGuid ? 0 : 9}>
                {studentGuid && <StudentDetails studentGuid={studentGuid} />}
              </Col>
            </Row>
          </div>
        )}
        </Col>
      </Row>
    </Container>
  )
}
