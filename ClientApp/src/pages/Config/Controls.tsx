import { useState, useEffect } from 'react'
import { Tab, Nav, Row, Col, Modal, Form } from 'react-bootstrap'

import Table, { Column } from 'components/BTable'
import Button from 'components/Input/Button'

import api from 'utils/api'
import { User } from 'utils/authentication'
import { DropdownOption } from 'Models/Session'
import { Quarter, YearView } from 'models/OrganizationYear'
import Dropdown from 'components/Input/Dropdown'
import { LocalDate, Year } from '@js-joda/core'

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
    label: 'Is Active',
    attributeKey: 'isCurrentSchoolYear',
    transform: (isCurrent: boolean) => isCurrent ? 'Yes' : 'No',
    sortable: true
  }
  //extra statistics
]

export default (): JSX.Element => {
  const [schoolYears, setSchoolYears] = useState([])
  const [show, setShow] = useState<boolean>(false)

  async function fetchYearsAsync (): Promise<void> {
    api
      .get('developer/year')
      .then(res => {setSchoolYears(res.data)})
      .catch(err => {null})
  } 

  async function createNewYearAsync (year: YearView, userList: User[]): Promise<void> {
    const users = userList.map(user => ({
      userGuid: user.userGuid,
      organizationGuid: user.organization.guid,
      claim: user.claim
    }))

    api
      .post('developer/year', {yearModel: year, users})
      .then(res => fetchYearsAsync())
  }

  useEffect(() => {
    fetchYearsAsync()
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
                <Table dataset={schoolYears} columns={columns} rowProps={{key: 'yearGuid'}} />
              </Row>

            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>

      <YearModal show={show} handleClose={() => setShow(false)} handleSubmit={(year: YearView, userList: string[]) => createNewYearAsync(year, userList)} />

    </Tab.Container>
  )
}

const createModalColumns = (onChange): Column[] => ([
  {
    label: 'Keep User',
    attributeKey: '',
    sortable: false,
    transform: (user: User) => (
    <Form.Check 
      type='checkbox' 
      checked={user.keepUser}
      onChange={(e) => onChange(user.userOrganizationYearGuid, e.target.checked)}
    />
    )
  },
  {
    label: 'Name',
    attributeKey: '',
    key: 'userOrganizationYearGuid',
    sortable: true,
    transform: (user: User) => `${user.firstName} ${user.lastName}`
  },
  {
    label: 'Organization',
    attributeKey: 'organization.name',
    sortable: true
  },
  {
    label: 'Badge Number',
    attributeKey: 'badgeNumber',
    sortable: false
  }
])

const YearModal = ({show, handleClose, handleSubmit}): JSX.Element => {
  document.title = 'GT - Config / Controls'
  const [currentUsers, setCurrentUsers] = useState<(User & {keepUser: boolean})[]>([])
  const [year, setYear] = useState<YearView>({
    guid: '',
    schoolYear: Year.now().toString(),
    startDate: LocalDate.now(), 
    endDate: LocalDate.now(),
    quarter: Quarter['Summer One']
  })

  const quarters: DropdownOption[] = [
    {
      guid: Quarter['Summer One'].toString(),
      label: 'Summer One'
    },
    {
      guid: Quarter['Summer Two'].toString(),
      label: 'Summer Two'
    },
    {
      guid: Quarter.Fall.toString(),
      label: 'Fall'
    },
    {
      guid: Quarter.Spring.toString(),
      label: 'Spring'
    }
  ]

  function handleUserChange (userGuid: string, keepUser: boolean): void {
    const users = currentUsers.map(user => {
      if (user.userOrganizationYearGuid === userGuid) {
        user.keepUser = keepUser
      }
      return user
    })
    setCurrentUsers(users)
  }

  useEffect(() => {
    api
      .get('developer/authentication')
      .then(res => {
        const users = res.data.map(user => ({...user, keepUser: true}))
        setCurrentUsers(users)
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
        <Modal.Title>Creating New Year</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row style={{marginBottom: '2rem'}}>
          <h3><u>Specify Year</u></h3>
          <Form.Group className='w-25'>
            <Form.Label>Year:</Form.Label>
            <Form.Control 
              type='number'
              value={year.schoolYear}
              onChange={(e) => {setYear({...year, schoolYear: e.target.value})}}
            />
          </Form.Group>

          <Form.Group className='w-25'>
            <Form.Label>Start Date:</Form.Label>
            <Form.Control 
              type='date'
              value={year.startDate!.toString()}
              onChange={(e) => {
                const date: number[] = e.target.value.split('-').map(i => Number(i))
                setYear({...year, startDate: LocalDate.of(date[0], date[1], date[2])})
              }}
            />
          </Form.Group>

          <Form.Group className='w-25'>
            <Form.Label>End Date:</Form.Label>
            <Form.Control 
              type='date'
              value={year.endDate!.toString()}
              onChange={(e) => {
                const date: number[] = e.target.value.split('-').map(i => Number(i))
                setYear({...year, endDate: LocalDate.of(date[0], date[1], date[2])})
              }}
            />
          </Form.Group>
          
          <Form.Group className='w-25'>
            <Form.Label>Quarter:</Form.Label>
            <Dropdown 
              options={quarters}
              value={year.quarter.toString()}
              onChange={(quarter: string) => setYear({...year, quarter: Number(quarter)})}
              disableOverlay
            />
          </Form.Group>
        </Row>

        <Row>
          <h3><u>Carry Over Users</u></h3>
          <Table 
            dataset={currentUsers} 
            columns={createModalColumns(handleUserChange)} 
            rowProps={{key: 'userOrganizationYearGuid'}}
          />
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button 
          variant='primary' 
          onClick={async () => {
            await handleSubmit(year, currentUsers)
            handleClose()
          }}
        >
          Submit New Year
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

//create modal

//School years
//display existing years, maybe some statistics if I feel fancy and am ahead of time
//main focus: Be able to create new years