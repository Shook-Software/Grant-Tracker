import { useState, useEffect } from 'react'
import { Tab, Nav, Row, Col, Modal } from 'react-bootstrap'

import Table, { Column } from 'components/BTable'
import Button from 'components/Input/Button'

import api from 'utils/api'

const columns: Column[] = [
  {
    label: 'Year',
    attributeKey: 'schoolYear',
    sortable: true
  }, 
  {
    label: 'Quarter',
    attributeKey: 'quarter',
    sortable: true
  },
  {
    label: 'Start Date',
    attributeKey: 'startDate',
    transform: (value) => `${value.month}/${value.day}/${value.year}`,
    sortable: true
  },
  {
    label: 'End Date',
    attributeKey: 'endDate',
    transform: (value) => `${value.month}/${value.day}/${value.year}`,
    sortable: true
  },
  {
    label: 'Is Current Year',
    attributeKey: 'isCurrentSchoolYear',
    transform: (value: boolean) => value 
    ? <div style={{width: '100%', height: '100%', backgroundColor: 'black', display: 'inline-block'}}>x</div> 
    : null,
    sortable: true
  }
  //extra statistics
]

export default (): JSX.Element => {
  const [schoolYears, setSchoolYears] = useState([])
  const [show, setShow] = useState<boolean>(false)

  useEffect(() => {
    api.get('developer/year')
    .then(res => {setSchoolYears(res.data)})
    .catch(err => {null})
  }, [])

  return (
    <Tab.Container defaultActiveKey='year'>

      <Row className='p-3'>
        <Col lg={3}>
          <Nav variant='pills' className='flex-column'>
            <Nav.Item>
              <Nav.Link className='user-select-none' eventKey='year'>
                School Years
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        <Col lg={9}>
          <Tab.Content>
            <Tab.Pane eventKey='year'>

              <Row>
                <Button className='' onClick={() => setShow(true)}>
                  New School Year
                </Button>
              </Row>

              <Row className='my-3'>
                <Table dataset={schoolYears} columns={columns} />
              </Row>

            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>

      <YearModal show={show} handleClose={() => setShow(false)} handleSubmit={() => null} />

    </Tab.Container>
  )
}

const modalColumns: Column[] = [
  {
    label: 'Name',
    attributeKey: 'userName',
    sortable: true
  },
  {
    label: 'Organization',
    attributeKey: 'organizationName',
    sortable: true
  },
  {
    label: 'Badge Number',
    attributeKey: 'badgeNumber',
    sortable: false
  }
]

const YearModal = ({show, handleClose, handleSubmit}): JSX.Element => {
  document.title = 'GT - Config / Controls'
  const [availableCoordinators, setCoordinators] = useState([])
  const [selectedCoordinators, setSelectedCoordindators] = useState<string[]>([])

  useEffect(() => {
    api.get('developer/authentication').then(res => {
      setCoordinators(res.data)
    })
  }, [])

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size='xl'
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>Select Coordinators</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Table dataset={availableCoordinators} columns={modalColumns}/>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={() => {
          handleSubmit()
          .then(res => {
            //dosomething
          })
          .finally(() => {
            handleClose()
          })
        }}>
          Submit New School Year
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

//create modal

//School years
//display existing years, maybe some statistics if I feel fancy and am ahead of time
//main focus: Be able to create new years