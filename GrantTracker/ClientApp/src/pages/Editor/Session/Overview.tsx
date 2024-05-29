import React from 'react'
import { useSession, Context } from '../index'
import { Form, Container, Row, Col } from 'react-bootstrap'

import Dropdown from 'components/Input/Dropdown'

//First section - Overview
////Location - auto filled
////Grant Type - autofilled per coordinator site

////EditorSession/Class name - text input
////EditorSession Type - Multiple Response - Student, Family, Parent
////Activity Category - Dropdown - List of activity types
////Objective - Multiple Response - 1.1, 1.2, 1.3, 2.1, 2.2, 3.1
////
//Done:
//// EditorSession Name
//// EditorSession Type
//// Activity
//// Objective

export default () => {
  const { reducerDispatch, dropdownData, values }: Context = useSession()
  document.title = `${values.guid ? 'Edit' : 'New'} Session - Overview`

  if (!values)
    return (
      <p style={{ textAlign: 'center' }}>Error in loading Session details...</p>
    )
  //make a formcomponents file and handle accordingly on feedback from Liz on editing here and there
  return (
    <Container>
      <Row lg={4} className='m-3'>
        <Col>
          <Form.Group controlId='validationFormik01'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              required
              type='text'
              name='name'
              placeholder='Session Name..'
              value={values.name}
              onChange={(event: React.BaseSyntheticEvent) => {
                //handleChange(event.target.value)
                reducerDispatch({ type: 'name', payload: event.target.value })
              }}
            />
            <Form.Control.Feedback type='invalid'>
              A session name is required!
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col className={''}>
          <Form.Group>
            <Form.Label>Type</Form.Label>
            <Dropdown
              value={values.type}
              options={dropdownData.sessionTypes}
              onChange={(value: string) => {
                //handleChange(value)
                reducerDispatch({ type: 'type', payload: value })
              }}
              disableOverlay
            />
          </Form.Group>
        </Col>
        <Col className='d-flex justify-content-center'>
          <Form.Group>
            <Form.Label>Objective</Form.Label>
            <Dropdown
              width='80px'
              value={values.objectives}
              options={dropdownData.objectives}
              onChange={(value: string[]) => {
                reducerDispatch({ type: 'objective', payload: value })
              }}
              multipleSelect
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Activity</Form.Label>
            <Dropdown
              value={values.activity}
              options={dropdownData.activities}
              onChange={(value: string) => {
                reducerDispatch({ type: 'activity', payload: value })
              }}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row lg={1} className='m-3'>
        <Col>
          <Form.Group>
            <Form.Label>Grades</Form.Label>
            <Dropdown
              width='80px'
              value={values.grades}
              options={dropdownData.grades}
              onChange={(value: string[]) => {
                reducerDispatch({ type: 'grades', payload: value })
              }}
              multipleSelect
            />
          </Form.Group>
        </Col>
      </Row>
    </Container>
  )
}
