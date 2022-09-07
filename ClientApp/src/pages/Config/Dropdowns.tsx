import { useState, useEffect } from 'react'
import { Tab, Nav, Row, Col } from 'react-bootstrap'

import Table, { Column } from 'components/BTable'

import api from 'utils/api'

const Dropdown = ({ state }): JSX.Element => {
  if (!state) return <></>

  const columns: Column[] = [
    {
      label: 'Label',
      attributeKey: 'label',
      sortable: true
    },
    {
      label: 'Abbreviation',
      attributeKey: 'abbreviation',
      sortable: true
    },
    {
      label: 'Description',
      attributeKey: 'description',
      sortable: false
    }
  ]

  return <Table dataset={state} columns={columns} />
}

export default (): JSX.Element => {
  document.title = 'GT - Config / Dropdowns'
  const [state, setState] = useState([])
  const style = { cursor: 'pointer' }

  useEffect(() => {
    api
      .get('developer/dropdowns')
      .then(res => {
        setState(res.data)
      })
  }, [])

  return (
    <Tab.Container defaultActiveKey='activities'>
      <Row className='p-3'>
        <Col lg={3}>
          <Nav variant='pills' className='flex-column'>
            <Nav.Item>
              <Nav.Link className='user-select-none' eventKey='activities'>
                Activities
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='fundingSources'
              >
                Funding Sources
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='grades'
              >
                Grades
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='instructorStatus'
              >
                Instructor Status
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='objectives'
              >
                Objectives
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='organizationTypes'
              >
                Organization Types
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='partnershipTypes'
              >
                Partnership Types
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='sessionTypes'
              >
                Session Types
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        <Col lg={9}>
          <Tab.Content>
            <Tab.Pane eventKey='activities'>
              <Dropdown state={state.activities} />
            </Tab.Pane>

            <Tab.Pane eventKey='fundingSources'>
              <Dropdown state={state.fundingSources} />
            </Tab.Pane>

            <Tab.Pane eventKey='grades'>
              <Dropdown state={state.grades} />
            </Tab.Pane>

            <Tab.Pane eventKey='instructorStatus'>
              <Dropdown state={state.instructorStatuses} />
            </Tab.Pane>

            <Tab.Pane eventKey='objectives'>
              <Dropdown state={state.objectives} />
            </Tab.Pane>

            <Tab.Pane eventKey='organizationTypes'>
              <Dropdown state={state.organizationTypes} />
            </Tab.Pane>

            <Tab.Pane eventKey='partnershipTypes'>
              <Dropdown state={state.partnershipTypes} />
            </Tab.Pane>

            <Tab.Pane eventKey='sessionTypes'>
              <Dropdown state={state.sessionTypes} />
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  )
}
