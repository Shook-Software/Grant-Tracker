import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Spinner, Card, Row, Col, Button, Modal } from 'react-bootstrap'

import { PageContainer } from 'styles'
import { ApiResult } from 'components/ApiResultAlert'
import RegistrationsView from './RegistrationsView'
import AttendanceHistory from './AttendanceHistory'

import { Session, SessionDomain, SessionView } from 'Models/Session'
import { SimpleAttendanceView } from 'Models/StudentAttendance'

import api from 'utils/api'
import { getSimpleAttendanceRecords } from './api'

////
//Refactoring imports, temporary location
import Header from './Header'
import Overview from './Overview'
import Instructors from './Instructors'
import Scheduling from './Scheduling'
import { User } from 'utils/authentication'
import { StudentGroup } from 'Models/StudentGroup'

interface Props {
  sessionGuid: string
  user: User
}

//Nice to have - Calender visual view, but only something to *come back to*
export default ({ sessionGuid, user }: Props): JSX.Element => {
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionView | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<SimpleAttendanceView[]>([])
  const [attendanceApiResult, setAttendanceApiResult] = useState<ApiResult | undefined>(undefined)
  const [attendanceModalParams, setAttendanceModalParams] = useState({
    show: false,
    schedule: null
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)

  /// /Temp stuff
  const [showSessionDeleteModal, setShowDeleteModal] = useState<boolean>(false)

  function handleSessionDeletion (deleteSession: boolean): void {
    if (deleteSession) {
      api
        .delete(`session/${sessionGuid}`)
        .then(() => navigate('/home/admin/sessions'))
        .catch()
    }
    setShowDeleteModal(false)
  }

  function getAttendance() {
    getSimpleAttendanceRecords(sessionGuid)
      .then(records => {
        setAttendanceRecords(records)
      })
  }

  function getSessionDetails (): void {
    setIsLoading(true)
    setSession(null)
    api
      .get<SessionDomain>(`session/${sessionGuid}`)
      .then(res => {
        const session: SessionView = Session.toViewModel(res.data)
        setSession(session)
        document.title = `GT - Admin / Session / ${session.name}`
      })
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  /// /Effects

  useEffect(() => {
    window.scrollTo(0, 0)
    setAttendanceApiResult(undefined)
    getSessionDetails()
    getAttendance()
  }, [sessionGuid])

  //Spin while no data exists and no error is thrown in loading.
  //Display error if loading fails
  if (!session && isLoading) 
    return (
      <div className="d-flex flex-column align-items-center">
        <Spinner animation='border' role='status' />
        <small className='text-muted'>Loading Session...</small>
      </div>
    )
  else if (!session && !isLoading) return <p>An error occured while loading the session.</p>

  return (
    <PageContainer>
      <Card className='border-0 p-0'>
        <Card.Body className='p-0'>
          <Row>
            <Header session={session} attendanceApiResult={attendanceApiResult} user={user} />
          </Row>
          <Row>
            <Col className='w-50'>
              <Overview session={session!} />
            </Col>
            <Col className='w-50'>
              <Scheduling session={session} onClick={setAttendanceModalParams} />
              <Instructors session={session} />
            </Col>
          </Row>
          <Row className='pt-3'>
            <Col>
              <RegistrationsView
                sessionGuid={sessionGuid}
                daySchedules={session?.daySchedules || []}
                studentGroups={session?.instructors.reduce((list, isy) => [...list, ...isy.studentGroups], [] as StudentGroup[]) || []}
              />
            </Col>
          </Row>
          <Row className='pt-3'>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>
                    <AttendanceHistory 
                      sessionGuid={sessionGuid}
                      attendanceRecords={attendanceRecords} 
                      onChange={getAttendance} 
                      sessionType={session!.sessionType.label.toLowerCase()}
                    />
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className='pt-5 d-flex flex-row justify-content-center'>
            <Button variant='danger' style={{ width: 'fit-content' }} onClick={() => setShowDeleteModal(true)}>
              Delete Session
            </Button>
          </Row>
        </Card.Body>
      </Card>
      <RemoveSessionModal sessionGuid={sessionGuid} session={session} show={showSessionDeleteModal} handleClose={handleSessionDeletion} />
    </PageContainer>
  )
}

/*
 
          */

const RemoveSessionModal = ({ sessionGuid, session, show, handleClose }): JSX.Element => {
  const [deletionAllowed, setStatus] = useState<boolean>(false)

  useEffect(() => {
    api
      .get(`session/${sessionGuid}/status`)
      .then(res => {
        setStatus(res.data || false)
      })
      .catch()
  }, [])

  const message = deletionAllowed
    ? 'Are you sure you want to delete this session from your organization?'
    : 'Sorry, this session is not able to be deleted as attendance records already exist for it. Please remove all records and reload if you wish to continue.'

  const button = deletionAllowed ? <Button onClick={() => handleClose(true)}>Delete Session</Button> : null

  return (
    <Modal show={show}>
      <Modal.Header closeButton onHide={() => handleClose(false)}>
        Deletion of {session.name}.
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>{button}</Modal.Footer>
    </Modal>
  )
}
