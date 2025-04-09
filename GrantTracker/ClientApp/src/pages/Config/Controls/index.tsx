import { Tab, Nav, Row, Col } from 'react-bootstrap'

import Years from './Years'
import Payroll from './Payroll'
import Organizations from './Organizations'
import Instructors from './Instructors'




export default (): JSX.Element => {

  return (
    <Tab.Container defaultActiveKey='year'>

      <Row className='p-3'>
        <Col lg={2}>
          <Nav variant='pills' className='flex-column'>
            <Nav.Item>
              <Nav.Link className='user-select-none' eventKey='year'>
                School Years
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className='user-select-none' eventKey='org'>
                Organizations
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className='user-select-none' eventKey='payroll'>
                Payroll Years
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className='user-select-none' eventKey='instructor'>
                Instructor Management
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        <Col lg={10}>
          <Tab.Content>

            <Tab.Pane eventKey='year'>
				      <Years />
            </Tab.Pane>
            
            <Tab.Pane eventKey='org'>
              <Organizations />
            </Tab.Pane>
            
            <Tab.Pane eventKey='payroll'>
				      <Payroll />
            </Tab.Pane>
            
            <Tab.Pane eventKey='instructor'>
				      <Instructors />
            </Tab.Pane>

          </Tab.Content>
        </Col>
      </Row>

    </Tab.Container>
  )
}

//create modal

//School years
//display existing years, maybe some statistics if I feel fancy and am ahead of time
//main focus: Be able to create new years
