import { useParams, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { Spinner, Card, Row, Col, Button, Modal } from 'react-bootstrap'

import { PageContainer } from 'styles'
import { ApiResult } from 'components/ApiResultAlert'
import SearchStudentsModal from './SearchStudentsModal' //pull this out into a component rather than subcomponent of sessionDetails
import RegistrationsView from './RegistrationsView'
import AttendanceHistory from './AttendanceHistory'

import { DayOfWeek } from 'Models/DayOfWeek'
import { Session, SessionDomain, SessionView } from 'Models/Session'
import { StudentRegistration, StudentRegistrationDomain, StudentRegistrationView } from 'Models/StudentRegistration'
import { AttendanceView, InstructorRecord, SimpleAttendanceView, StudentAttendanceDto, StudentRecord, SubstituteRecord } from 'Models/StudentAttendance'

import api from 'utils/api'
import { addStudentToSession, getSimpleAttendanceRecords, getAttendanceRecord } from './api'

////
//Refactoring imports, temporary location
import Header from './Header'
import Overview from './Overview'
import Instructors from './Instructors'
import Scheduling from './Scheduling'
import { OrgYearContext } from 'pages/Admin'


interface Props {
  sessionGuid: string
}

//Nice to have - Calender visual view, but only something to *come back to*
export default ({sessionGuid}: Props): JSX.Element => {
  const navigate = useNavigate()
  const { orgYear } = useContext(OrgYearContext)
  //const { sessionGuid } = useParams()
  const [session, setSession] = useState<SessionView | null>(null)
  const [studentRegistrations, setStudentRegistrations] = useState<StudentRegistrationView[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<SimpleAttendanceView[]>([])
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false)
  const [attendanceApiResult, setAttendanceApiResult] = useState<ApiResult | undefined>(undefined)
  const [attendanceModalParams, setAttendanceModalParams] = useState({
    show: false,
    schedule: null
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)

  /// /Temp stuff
  const [showSessionDeleteModal, setShowDeleteModal] = useState<boolean>(false)

  function addStudent(student, schedule): Promise<void> {
    return new Promise((resolve, reject) => {
      addStudentToSession(sessionGuid, student, schedule)
        .then(res => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  function handleSessionDeletion (deleteSession: boolean): void {
    if (deleteSession) {
      api
        .delete(`session/${sessionGuid}`)
        .then(() => navigate('/home/admin/sessions'))
        .catch()
    }
    setShowDeleteModal(false)
  }

  function removeStudentRegistrationsAsync (scheduleGuids: string[], studentSchoolYearGuid: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      api
        .delete('session/registration', {
          params: {
            studentSchoolYearGuid,
            dayScheduleGuid: scheduleGuids
          }
        })
        .then(res => {resolve()})
        .catch(err => {reject()})
        .finally(() => getStudentRegistrationsAsync())
    })
  }

  function getStudentRegistrationsAsync (): void {
    api
      .get<StudentRegistrationDomain[]>(`session/${sessionGuid}/registration`)
      .then(res => {
        //sorted for ease of display
        const registrations: StudentRegistrationView[] = res.data.map(item => StudentRegistration.toViewModel(item))
        setStudentRegistrations(registrations)
      })
      .catch(err => {
        console.warn(err)
      })
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
    setAttendanceApiResult(undefined)
    getSessionDetails()
    getStudentRegistrationsAsync()
    getAttendance()
  }, [sessionGuid])

  useEffect(() => {
    if (!showStudentModal) {
      getStudentRegistrationsAsync()
    }
  }, [showStudentModal])

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
            <Header session={session} attendanceApiResult={attendanceApiResult} />
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
              <Card>
                <Card.Body>
                  <Card.Title>
                    Registrations&nbsp;
                    <Button
                      variant='primary'
                      className='px-2 py-1'
                      style={{ width: 'auto' }}
                      onClick={() => {
                        setShowStudentModal(true)
                      }}
                    >
                      Add
                    </Button>
                  </Card.Title>
                  <Card.Text>
                    <RegistrationsView
                      registrations={studentRegistrations}
                      onChange={removeStudentRegistrationsAsync}
                    />
                  </Card.Text>
                </Card.Body>
              </Card>
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
      <SearchStudentsModal
        orgYearGuid={orgYear.guid}
        show={showStudentModal}
        handleClose={() => setShowStudentModal(false)}
        handleChange={({student, schedule}) => addStudent(student, schedule)}
        scheduling={session!.daySchedules}
      />
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
