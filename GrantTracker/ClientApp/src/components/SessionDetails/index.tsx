import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Spinner, Card, Row, Col, Button, Modal } from 'react-bootstrap'
import { LocalDate, TemporalAdjusters, DayOfWeek as JodaDoW, DateTimeFormatter } from '@js-joda/core'

import { PageContainer } from 'styles'
import { ApiResult } from 'components/ApiResultAlert'
import SearchStudentsModal from './SearchStudentsModal' //pull this out into a component rather than subcomponent of sessionDetails
import SessionAttendance from 'components/SessionAttendance'
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
import { postSessionAttendance } from 'components/SessionAttendance/api'
import { Locale } from '@js-joda/locale_en-us'


function createDefaultStudentRecords (studentRegistrations, daySchedule): StudentRecord[] {
  studentRegistrations = studentRegistrations.filter(reg => reg.daySchedule.dayOfWeek == daySchedule.dayOfWeek)

  return studentRegistrations.map(registration => ({
      isPresent: true,
      attendance: registration.daySchedule.timeSchedules,
      studentSchoolYear: registration.studentSchoolYear,
      familyAttendance: []
    })
  )
}

function createDefaultInstructorRecords (instructorRegistrations, daySchedule)/*: InstructorRecord[]*/ {
  return instructorRegistrations.map(registration => ({
      isPresent: true,
      attendance: daySchedule.timeSchedules.map(sch => ({...sch})),
      instructorSchoolYear: registration
    })
  )
}

interface Props {
  sessionGuid: string
}

//Nice to have - Calender visual view, but only something to *come back to*
export default ({sessionGuid}: Props): JSX.Element => {
  const navigate = useNavigate()
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

  function getAttendance() {
    getSimpleAttendanceRecords(sessionGuid)
      .then(records => {
        setAttendanceRecords(records)
      })
  }

  function submitAttendance (
    _: string,
    date: LocalDate, 
    studentRecords: StudentRecord[],
    instructorRecords: InstructorRecord[], 
    substituteRecords: SubstituteRecord[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
     postSessionAttendance(sessionGuid!, date, studentRecords, instructorRecords, substituteRecords)
      .then(res => {
          handleAttendanceModalClose()
          setAttendanceApiResult({
            label: `Attendance for ${date.format(DateTimeFormatter.ofPattern('eeee, MMMM d').withLocale(Locale.ENGLISH))}`,
            success: true,
            message: []
          })
      }) 
      .catch(err => {
        handleAttendanceModalClose()
        setAttendanceApiResult({
          label: 'Attendance',
          success: false,
          message: err
        })
      })
      .finally(() => {
        getAttendance()
      })
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
                      isFamilySession={session!.sessionType.label.toLowerCase() != 'student'}
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
        show={showStudentModal}
        handleClose={() => setShowStudentModal(false)}
        handleChange={({student, schedule}) => addStudent(student, schedule)}
        scheduling={session!.daySchedules}
      />
      {attendanceModalParams.show ? (
        <SessionAttendance
          props={
            {
              sessionGuid,
              date: null,
              dayOfWeek: DayOfWeek.toInt(attendanceModalParams.schedule.dayOfWeek),
              studentRecords: createDefaultStudentRecords(studentRegistrations, attendanceModalParams?.schedule),
              instructorRecords: createDefaultInstructorRecords(session?.instructors, attendanceModalParams?.schedule),
              substituteRecords: [],
              defaultSchedule: attendanceModalParams.schedule?.timeSchedules || [],
            }
          }
          handleClose={handleAttendanceModalClose}
          handleSubmit={submitAttendance}
          isFamilySession={session!.sessionType.label.toLowerCase() != 'student'}
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
