import { useEffect, useState } from 'react'
import { Form, Container, Row, Col } from 'react-bootstrap'

import GradeSelect from 'components/Input/GradeSelect'
import CollapsibleSearchForm from '../SearchWrapper'

interface Filter {
  sessionName: string
  grades: string[]
}

interface Props {
  handleChange: (filter: Filter) => void
}

export default ({ handleChange }: Props): JSX.Element => {
  const [filter, setFilter] = useState<Filter>({
    sessionName: '',
    grades: []
  })

  function addGradeLevel (value: string): void {
    setFilter({ ...filter, grades: [...filter.grades, value] })
  }

  function removeGradeLevel (value: string): void {
    setFilter({
      ...filter,
      grades: filter.grades.filter(guid => guid !== value)
    })
  }

  useEffect(() => {
    handleChange(filter)
  }, [])

  return (
    <CollapsibleSearchForm label='Sessions'>
      <Form
        onSubmit={event => {
          event.preventDefault()
          handleChange(filter)
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
                  value={filter.sessionName}
                  onChange={(event: React.BaseSyntheticEvent) => {
                    setFilter({ ...filter, sessionName: event.target.value })
                  }}
                />
              </Form.Group>
            </Col>
            <Col />
            <Col />
          </Row>
          <Row className='mb-2' lg={1}>
            <Col className=''>
              <GradeSelect
                value={filter.grades}
                addGradeLevel={addGradeLevel}
                removeGradeLevel={removeGradeLevel}
              />
            </Col>
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
