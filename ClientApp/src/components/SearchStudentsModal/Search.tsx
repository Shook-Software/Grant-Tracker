import { useEffect, useState } from 'react'
import { Form, Container, Row, Col } from 'react-bootstrap'

import Dropdown from 'components/Input/Dropdown'
import CollapsibleSearchForm from '../../pages/Admin/SearchWrapper'

import { DropdownOption } from 'types/Session'
import api from 'utils/api'

interface Filter {
  studentName: string
  gradeGuid: string
}

interface Props {
  handleChange: (sessions) => void
}

export default ({ handleChange }: Props): JSX.Element => {
  const [grades, setGrades] = useState<DropdownOption[]>([])
  const [filter, setFilter] = useState<Filter>({
    studentName: '',
    gradeGuid: ''
  })

  function filterStudents(): void {
    api.get('students/synergy', { params: filter })
      .then(res => handleChange(res.data))
      .catch(err => console.warn(err))
  }

  useEffect(() => {
    api.get('dropdown/view/grades')
      .then(res => setGrades(res.data))
      .catch(err => console.warn(err))
  }, [])

  return (
    <CollapsibleSearchForm label='Students'>
      <Form
        onSubmit={(event) => {
          event.preventDefault()
          filterStudents()
        }}
      >
        <Container>
          <Row className='mb-2' lg={3}>
            <Col>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type='text'
                  name='name'
                  value={filter.studentName}
                  onChange={(event: React.BaseSyntheticEvent) => { setFilter({ ...filter, studentName: event.target.value }) }}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Grade</Form.Label>
                <Dropdown
                  value={filter.gradeGuid}
                  options={grades}
                  onChange={(value: string) => { setFilter({ ...filter, gradeGuid: value }) }}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className='mb-2' lg={1}>

          </Row>
          <Row>
            <Col>
              <button type='submit'>Search</button>
            </Col>
          </Row>
        </Container>
      </Form>
    </CollapsibleSearchForm>
  )
}