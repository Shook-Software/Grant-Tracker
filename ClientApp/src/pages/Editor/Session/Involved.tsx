import {
  Form,
  Container,
  Row,
  Col,
  ListGroup,
  CloseButton
} from 'react-bootstrap'

import { useSession } from '../index'
import SearchDropdown from 'components/Input/SearchDropdown'
import Dropdown from 'components/Input/Dropdown'

//Second Section - Instructor/Funding
////Instructor -- Searchable Dropdown
////Instructor Status -- Dropdown
////Funding Source -- Multiple Response
////Organization Type -- Dropdown
////Partnership Type -- Dropdown

export default (props): JSX.Element => {
  const { reducerDispatch, dropdownData, values } = useSession()
  document.title = `${values.guid ? 'Edit' : 'New'} Session - Involved`

  if (!values)
    return (
      <p style={{ textAlign: 'center' }}>Error in loading Session details...</p>
    )

  function handleInstructorAddition (guid: string, label: string): void {
    reducerDispatch({ type: 'addInstructor', payload: { guid, label } })
  }

  function handleInstructorRemoval (guid: string): void {
    reducerDispatch({ type: 'removeInstructor', payload: guid })
  }

  return (
    <Container>
      <Row lg={3} className='m-3'>
        <Col>
          <Form.Group>
            <Form.Label>Partnership-Type</Form.Label>
            <Dropdown
              value={values.partnershipType}
              options={dropdownData.partnershipTypes}
              onChange={(value: string) =>
                reducerDispatch({ type: 'partnership', payload: value })
              }
              disableOverlay
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Funding-Source</Form.Label>
            <Dropdown
              value={values.fundingSource}
              options={dropdownData.fundingSources}
              onChange={(value: string) =>
                reducerDispatch({ type: 'funding', payload: value })
              }
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Organization Type</Form.Label>
            <Dropdown
              value={values.organizationType}
              options={dropdownData.organizationTypes}
              onChange={(value: string) =>
                reducerDispatch({ type: 'organization', payload: value })
              }
              disableOverlay
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className='m-3 pb-5'>
        <Col>
          <Form.Group>
            <Form.Label>Instructor Name</Form.Label>
            <SearchDropdown
              values={values.instructors}
              label={'Select Instructor...'}
              onChange={handleInstructorAddition}
            />
          </Form.Group>
        </Col>
        <Col className='position-relative' lg={8} md={12} sm={12}>
          <Form.Label>Selected Instructors</Form.Label>
          <ListGroup className='d-flex flex-row flex-wrap position-absolute float-left'>
            {values.instructors.map(i => (
              <div>
                <ListGroup.Item className='d-flex flex-row p-1'>
                  <CloseButton
                    onClick={() => handleInstructorRemoval(i.guid)}
                  />
                  <div>{i.label}</div>
                </ListGroup.Item>
              </div>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  )
}
