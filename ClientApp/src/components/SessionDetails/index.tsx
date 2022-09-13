import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Spinner, Card, Row, Col, Button, Modal } from 'react-bootstrap'
import { LocalDate } from '@js-joda/core'

import { PageContainer } from 'styles'
import { ApiResult } from 'components/ApiResultAlert'
import SearchStudentsModal from './SearchStudentsModal' //pull this out into a component rather than subcomponent of sessionDetails
import SessionAttendance from 'components/SessionAttendance'
import RegistrationsView from './RegistrationsView'

import { DayScheduleView } from 'Models/DaySchedule'
import { Session, SessionDomain, SessionView } from 'Models/Session'
import { StudentRegistration, StudentRegistrationDomain, StudentRegistrationView } from 'Models/StudentRegistration'
import { InstructorRecord, StudentAttendanceDto, StudentRecord, SubstituteRecord } from 'Models/StudentAttendance'

import api from 'utils/api'

////
//Refactoring imports, temporary location
import Header from './Header'
import Overview from './Overview'
import Instructors from './Instructors'
import Scheduling from './Scheduling'
import { rejects } from 'assert'

//

//Nice to have - Calender visual view, but only something to *come back to*
export default ({}) => {
  const navigate = useNavigate()
  const { sessionGuid } = useParams()
  const [session, setSession] = useState<SessionView | null>(null)
  const [studentRegistrations, setStudentRegistrations] = useState<StudentRegistrationView[]>([])
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false)
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

  /// /Functions
  function handleAttendanceModalClose (): void {
    setAttendanceModalParams({
      ...attendanceModalParams,
      show: false,
      schedule: null
    })
    getStudentRegistrationsAsync()
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

  function submitAttendance (
    date: LocalDate, 
    studentRecords: StudentRecord[],
    instructorRecords: InstructorRecord[], 
    substituteRecords: SubstituteRecord[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
    
      const studentRecordsParam = studentRecords
        .filter(record => record.isPresent !== false)
        .map(record => ({
          studentSchoolYearGuid: record.studentSchoolYear.guid,
          attendance: record.attendance
        }))
        
      const instructorRecordsParam = instructorRecords
        .filter(record => record.isPresent !== false)
        .map(record => ({
          instructorSchoolYearGuid: record.instructorSchoolYear.guid,
          attendance: record.attendance
        }))

      const params = {
        sessionGuid,
        date,
        studentRecords: studentRecordsParam.filter(stu => stu),
        instructorRecords: instructorRecordsParam,
        substituteRecords: substituteRecords
      }

      api
        .post<StudentAttendanceDto>(`session/${sessionGuid}/attendance`, params)
        .then(res => {
          handleAttendanceModalClose()
          setAttendanceApiResult({
            label: `Attendance for ${date}`,
            success: true,
            reason: []
          })
          resolve()
        })
        .catch(err => {
          handleAttendanceModalClose()
          setAttendanceApiResult({
            label: 'Attendance',
            success: false,
            reason: ['Error in recording attendance, contact ethan.shook2@tusd1.org if issues persist.']
          })
          reject()
        })
    })
  }

  function getSessionDetails (): void {
    setIsLoading(true)
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
    getSessionDetails()
    getStudentRegistrationsAsync()
  }, [sessionGuid])

  useEffect(() => {
    if (!showStudentModal) {
      getStudentRegistrationsAsync()
    }
  }, [showStudentModal])

  //Spin while no data exists and no error is thrown in loading.
  //Display error if loading fails
  if (!session && isLoading) return <Spinner animation='border' role='status' />
  else if (!session && !isLoading) return <p>An error occured while loading the session.</p>

  return (
    <PageContainer>
      <Card>
        <Card.Body>
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
                    Attendance History (under construction)
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
        sessionGuid={session.guid}
        show={showStudentModal}
        handleClose={() => setShowStudentModal(false)}
        handleChange={() => null}
        scheduling={session!.daySchedules}
      />
      {attendanceModalParams.show ? (
        <SessionAttendance
          registrations={{
            instructors: session?.instructors,
            students: studentRegistrations
          }}
          daySchedule={attendanceModalParams.schedule}
          handleClose={handleAttendanceModalClose}
          handleSubmit={submitAttendance}
        />
      ) : null}
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
    : 'Sorry, this session is not able to be deleted as attendance records already exist for it. In the future, you will be able to hide unwanted and unremoveable sessions.'

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
