import { useContext, useEffect, useState } from 'react'
import { Form, Container, Row, Col, Button, Spinner } from 'react-bootstrap'


import api from 'utils/api'
import { OrgYearContext } from 'pages/Admin'
import { DropdownOption } from 'types/Session'
import Dropdown from 'components/Input/Dropdown'

interface Filter {
  firstName: string
  lastName: string
  grades: string[]
}

interface Props {
  orgYearGuid: string
  handleChange: (sessions) => void
}

export default ({ orgYearGuid, handleChange }: Props): JSX.Element => {
  const { orgYear } = useContext(OrgYearContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [grades, setGrades] = useState<DropdownOption[]>([])
  const [filter, setFilter] = useState<Filter>({
    firstName: '',
    lastName: '',
    grades: []
  })

  function addGradeLevel(value: string): void {
    setFilter({ ...filter, grades: [...filter.grades, value] })
  }

  function removeGradeLevel(value: string): void {
    setFilter({ ...filter, grades: filter.grades.filter(guid => guid !== value) })
  }

  function filterStudents(): void {
    setIsLoading(true)
    api
      .get('student/synergy', { params: { ...filter, organizationYearGuid: orgYearGuid } })
      .then(res => handleChange(res.data))
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchGradeOptions()
      .then(res => {
        setGrades(res)
      })
  }, [])

  return (
    <Container>
      <Form
        onSubmit={(event) => {
          event.preventDefault()
          setIsLoading(true)
          filterStudents()
        }}
      >
        <Container>
          <Row lg={3}>
            <Col>
              <Form.Group>
                <Form.Label htmlFor='first-name'>First Name</Form.Label>
                <Form.Control
                  type='text'
                  id='first-name'
                  value={filter.firstName}
                  onChange={(event: React.BaseSyntheticEvent) => { setFilter({ ...filter, firstName: event.target.value }) }}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label htmlFor='last-name'>Last Name</Form.Label>
                <Form.Control
                  type='text'
                  id='last-name'
                  value={filter.lastName}
                  onChange={(event: React.BaseSyntheticEvent) => { setFilter({ ...filter, lastName: event.target.value }) }}
                />
                <Form.Text className='text-muted'>(optional)</Form.Text>
              </Form.Group>
            </Col>
            <Col className='d-flex flex-column justify-content-center'>
              <Form.Group className='pt-2'>
                <Button type='submit'>
                  {isLoading ? <Spinner className='m-1' as='span' animation='border' role='status' size='sm' aria-hidden='true'>
                    <span className='visually-hidden'>Loading...</span>
                  </Spinner> : null }
                  Search
                </Button>
              </Form.Group>
            </Col>
          </Row>
          <Row lg={1} className='mb-3'>
            <Col>
              <Form.Group>
                <Form.Label>Grades</Form.Label>
                <Dropdown
                  width='80px'
                  value={filter.grades}
                  options={grades}
                  onChange={(value: string[]) => {
                    setFilter({...filter, grades: value})
                  }}
                  multipleSelect
                />
                <Form.Text className='text-muted'>(optional)</Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Container>
      </Form>
    </Container>
  )
}

function fetchGradeOptions(): Promise<DropdownOption[]> {
  return new Promise((resolve, reject) => {
	api.get<DropdownOption[]>('dropdown/view/grades')
		.then(res => { resolve(res.data) })
		.catch(err => {
			console.warn(err)
			reject([])
		})
  })
}