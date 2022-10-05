import { useState } from 'react'
import { Form, Row, Col, Button } from 'react-bootstrap'

interface Filter {
  name: string
  badgeNumber: string
}

interface Props {
  handleChange: (name: string, badgeNumber: string) => void
}

export default ({ handleChange }: Props): JSX.Element => {
  const [filter, setFilter] = useState<Filter>({
    name: '',
    badgeNumber: ''
  })

  function filterStaff(): void {
    handleChange(filter.name, filter.badgeNumber)
  }

  return (
    <Form 
      onSubmit={(event) => {
        event.preventDefault()
        filterStaff()
      }}
    >
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
        <Col className='d-flex align-items-end'> 
          <Button type='submit'>Search</Button>
        </Col>
      </Row>
    </Form>
  )
}