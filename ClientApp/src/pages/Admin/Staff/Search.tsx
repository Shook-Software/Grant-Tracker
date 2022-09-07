import { useState } from 'react'
import { Form, Container, Row, Col } from 'react-bootstrap'

import CollapsibleSearchForm from '../SearchWrapper'

interface Filter {
  name: string
  badgeNumber: string
}

interface Props {
  handleChange: (name) => void
}

export default ({ handleChange }: Props): JSX.Element => {
  const [filter, setFilter] = useState<Filter>({
    name: '',
    badgeNumber: ''
  })

  function filterStaff(): void {
    handleChange(filter.name)
  }

  return (
    <CollapsibleSearchForm label='Staff'>
      <Form
        onSubmit={(event) => {
          event.preventDefault()
          filterStaff()
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
                  value={filter.name}
                  onChange={(event: React.BaseSyntheticEvent) => { setFilter({ ...filter, name: event.target.value }) }}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Badge Number</Form.Label>
                <Form.Control
                  type='text'
                  name='Badge Number'
                  value={filter.badgeNumber}
                  onChange={(event: React.BaseSyntheticEvent) => { setFilter({ ...filter, badgeNumber: event.target.value }) }}
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