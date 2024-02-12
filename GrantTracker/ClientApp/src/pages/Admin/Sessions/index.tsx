import { useState, useEffect, useContext } from 'react'
import { Container, Spinner, Form, Button, Card, Row, Col } from 'react-bootstrap'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import CopyRegistrations from './CopyRegistrations'
import { useAdminPage, Context, OrgYearContext } from 'pages/Admin'
import AddButton from 'components/Input/Button'
import Table, { Column, SortDirection } from 'components/BTable'

import { DayOfWeek } from 'Models/DayOfWeek'
import { SimpleSessionView } from 'Models/Session'
import { DropdownOption } from 'types/Session'

import paths from 'utils/routing/paths'
import api, { AxiosIdentityConfig } from 'utils/api'
import SessionDetails from 'components/SessionDetails'
import { AttendanceRecord } from 'components/SessionAttendance/AttendanceForm/TimeInput'

function dropdownOptionTransform (value: DropdownOption): string {
  return value.label
}

const createColumns = (missingAttendanceRecords, openSessionGuid): Column[] => [
  {
    label: 'Name',
    attributeKey: '',
    transform: (session: SimpleSessionView) => {

      if (session.sessionGuid === openSessionGuid)
        var textColorClass = 'text-primary'
      else if (missingAttendanceRecords.some(x => x.sessionGuid === session.sessionGuid))
        var textColorClass = 'text-danger'
      else 
        var textColorClass = ''
      
      return (
        <div className={`${textColorClass}`}>{session.name}</div>
      )
    },
    sortable: true,
    sortTransform: (session: SimpleSessionView) => session.name
  },
  {
    label: 'Activity',
    attributeKey: 'activity',
    sortable: true,
    transform: dropdownOptionTransform
  },
  {
    label: 'Session Type',
    attributeKey: 'sessionType',
    sortable: true,
    transform: dropdownOptionTransform
  },
  {
    label: 'Schedule',
    attributeKey: '',
    sortable: true,
    transform: (session: SimpleSessionView) => {
      if (!session.daySchedules || session.daySchedules.length === 0)
        return 'No Schedule'

      let daysOfWeek = session.daySchedules.map(day => day.dayOfWeek).sort().map((dayOfWeek, index) => 
        index !== session.daySchedules.length - 1 
        ? `${DayOfWeek.toChar(dayOfWeek)}, ` 
        : DayOfWeek.toChar(dayOfWeek)
      )

      return daysOfWeek
    }
  },
  {
    label: '',
    attributeKey: 'sessionGuid',
    sortable: false,
    transform: (value: string) => (
      <div className='d-flex justify-content-center'>
        <Button className='' size='sm'>
          <Link to={value} style={{ color: 'inherit' }}>
            View
          </Link>
        </Button>
      </div>
    )
  }
]

export default (): JSX.Element => {
  document.title = 'GT - Admin / Sessions'
  const { sessionGuid } = useParams()
  const [state, setState] = useState<SimpleSessionView[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [missingAttendanceRecords, setMissingAttendanceRecords] = useState<AttendanceRecord[]>([])
  const { orgYear, setOrgYear } = useContext(OrgYearContext)
  const navigate = useNavigate()

  function fetchSessions (params) {
    if (orgYear) {
      setIsLoading(true)

      api
        .get('/session', {
          params: { 
            sessionName: params?.sessionName, 
            organizationGuid: orgYear?.organization.guid,
            yearGuid: orgYear?.year.guid
          }
        })
        .then(res => {
          var sessions: SimpleSessionView[] = res.data
          setState(sessions)

          if (sessionGuid && !sessions.some(s => s.sessionGuid === sessionGuid))
          {
            api.get(`/session/${sessionGuid}/orgYear`)
              .then(res => setOrgYear(res.data))
          }
        })
        .catch(err => console.warn(err))
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  function handleSearchTermChange(term) {
    term = term.toLocaleLowerCase()
    setSearchTerm(term)
  }

  useEffect(() => {
      fetchSessions(null)

      api
        .get(`/organizationYear/${orgYear?.guid}/Attendance/Missing`)
        .then(res => {
          setMissingAttendanceRecords(res.data)
        })
  }, [orgYear?.guid])

  let columns: Column[] = createColumns(missingAttendanceRecords, sessionGuid)
  let rowClick = null
  if (sessionGuid != null) {
    columns = [columns[0]]
    rowClick = (event, row) => navigate(`${paths.Admin.path}/${paths.Admin.Tabs.Sessions.path}/${row.sessionGuid}`)
  }

  return (
    <>
      <Container className='pt-3'>
        <div className='d-flex mb-3'>
          <div>
            <h4 className='m-0 me-3 text-align-center'>Sessions for {orgYear?.organization.name}</h4>  
            <small className='text-danger'>* Red sessions are missing attendance records</small>
          </div>
          <div>
            <AddButton
              as={Link}
              to={`${paths.Edit.path}/${paths.Edit.Sessions.path}/overview`}
            >
              Add New Session
            </AddButton>
          </div>
        </div>
       
        {isLoading ? (
          <Spinner animation='border' />
        ) : !state || state.length === 0 ? (
          <div className='d-flex align-items-center justify-content-center'>
            <p>No sessions found...</p>
          </div>
        ) : (
          <div className='pt-1'>
            <Row>
              <Col md={!sessionGuid ? 12 : 3}>
                <Row>
                  <Col md={!sessionGuid ? 3 : 12} className='p-0'>
                    <Form.Control 
                      type='text' 
                      className='border-bottom-0'
                      placeholder='Filter sessions...'
                      value={searchTerm} 
                      onChange={(e) => handleSearchTermChange(e.target.value)}
                      style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
                    />
                  </Col>
                </Row>
                <Row>
                  <Table 
                    columns={columns} 
                    dataset={state.filter(e => e.name.toLocaleLowerCase().includes(searchTerm))} 
                    defaultSort={{index: 0, direction: SortDirection.Ascending}}
                    rowProps={{key: 'sessionGuid', onClick: rowClick}} 
                  />
                </Row>
              </Col>
              <Col md={!sessionGuid ? 0 : 9}>
                {sessionGuid && <SessionDetails sessionGuid={sessionGuid} />}
              </Col>
            </Row>
          </div>
        )}
      </Container>

      <Card>
        <Card.Header className='d-flex justify-content-center'>
          <h3>Tools</h3>
        </Card.Header>
        <Card.Body>
          Copy Registrations:
          <CopyRegistrations state={state} />
        </Card.Body>
      </Card>
    </>
  )
}
