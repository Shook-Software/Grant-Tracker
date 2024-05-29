import { useState, useEffect, useContext } from 'react'
import { Button, Modal, Form, Card, Spinner, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'

import Table, { Column } from 'components/BTable'

import { DayOfWeek } from 'Models/DayOfWeek'
import { StudentSchoolYearWithRecordsView, StudentView } from 'Models/Student'
import { StudentRegistration, StudentRegistrationDomain, StudentRegistrationView } from 'Models/StudentRegistration'
import { StudentGroup, StudentGroupStudent } from 'Models/StudentGroup'
import { addStudentToSession } from './api'
import { DayScheduleView } from 'Models/DaySchedule'

import SearchStudentsModal from './SearchStudentsModal'
import { OrgYearContext } from 'pages/Admin'
import api from 'utils/api'

function groupRegistrationsByStudent (registrations: StudentRegistrationView[]): RegistrationByStudent[] {
  const registrationsByStudent: object = {}

  registrations.forEach(reg => {
    const student: StudentView = reg.studentSchoolYear.student
    const group: RegistrationByStudent | undefined = registrationsByStudent[student.guid]
    if (group) {
      group.daysOfWeek = [
        ...group.daysOfWeek,
        DayOfWeek.toChar(reg.daySchedule.dayOfWeek)
      ]
      group.days = [...group.days, reg.daySchedule]
      return
    }

    registrationsByStudent[student.guid] = {
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        studentSchoolYearGuid: reg.studentSchoolYear.guid,
        matricNumber: student.matricNumber
      },
      daysOfWeek: [DayOfWeek.toChar(reg.daySchedule.dayOfWeek)],
      days: [reg.daySchedule]
    }
  })

  return Object.keys(registrationsByStudent).map(key => {
    let student = registrationsByStudent[key]

    student.days = student.days.sort((first, second) => {
      let firstDay = DayOfWeek.toInt(first.dayOfWeek)
      let secondDay = DayOfWeek.toInt(second.dayOfWeek)

      if (firstDay < secondDay) return -1
      else if (firstDay > secondDay) return 1

      return 0
    })

    student.daysOfWeek = student.daysOfWeek.sort((first, second) => {
      let firstDay = DayOfWeek.charToInt(first)
      let secondDay = DayOfWeek.charToInt(second)
      if (firstDay < secondDay) return -1
      else if (firstDay > secondDay) return 1

      return 0
    })

    return student
  })
}

interface RegistrationByStudent {
  student: StudentSchoolYearWithRecordsView
  daysOfWeek: string[]
  days: any[]
}

interface Props {
  sessionGuid: string
  daySchedules: DayScheduleView[]
  studentGroups: StudentGroup[]
}

export default ({
  sessionGuid,
  daySchedules,
  studentGroups
}: Props): JSX.Element => {
  const navigate = useNavigate()
  const { orgYear } = useContext(OrgYearContext)
  const [modalData, setModalData] = useState(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false)
  const [registrations, setRegistrations] = useState<StudentRegistrationView[]>([])

  const [studentGroupState, setStudentGroupState] = useState({
    selectedGroup: null as StudentGroup | null,
    schedules: [] as string[]
  })
  const [studentGroupAPIState, setStudentGroupAPIState] = useState({
    isPending: false,
    issues: [] as StudentGroupStudent[]
  })

  function handleStudentRemoval (values): void {
    setShowModal(true)
    setModalData(values)
  }

  function handleClose (scheduleGuids: string[], studentSchoolYearGuid: string) {
    if (scheduleGuids?.length !== 0) {
      removeStudentRegistrationsAsync(scheduleGuids, studentSchoolYearGuid)
      .then(res => {
        getStudentRegistrationsAsync()
      })
    }

    setShowModal(false)
  }

  function addStudent(studentSchoolYearGuid: string, schedule): Promise<void> {
    return addStudentToSession(sessionGuid, studentSchoolYearGuid, schedule)
      .then(res => getStudentRegistrationsAsync())
  }

  function addStudentGroup(studentGroup: StudentGroup | null, schedule) {
    if (!studentGroup)
      return;

    setStudentGroupAPIState({ isPending: true, issues: [] })

    Promise.allSettled(studentGroup.students.map(stu => addStudent(stu.studentSchoolYearGuid, schedule)))
      .then(res => {
        setStudentGroupAPIState({ isPending: false, issues: [...res.map((r, idx) => r.status == 'rejected' ? studentGroup.students[idx] : null).filter(student => !!student)] })
      })
      .finally(() => getStudentRegistrationsAsync())
  }

  function getStudentRegistrationsAsync (): void {
    api
      .get<StudentRegistrationDomain[]>(`session/${sessionGuid}/registration`)
      .then(res => {
        const registrations: StudentRegistrationView[] = res.data.map(item => StudentRegistration.toViewModel(item))
        setRegistrations(registrations)
      })
      .catch(err => {
        console.warn(err)
      })
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

  useState(() => {
    getStudentRegistrationsAsync()
  }, [])

  console.log(studentGroupAPIState)

  const dataset = groupRegistrationsByStudent(registrations || [])
  const columns: Column[] = createStudentColumns(handleStudentRemoval)
  const distinctStudentGroups: StudentGroup[] = Array.from(new Set(studentGroups.map(g => g.groupGuid))).map(guid => studentGroups.find(g => g.groupGuid == guid) as StudentGroup)

  return ( 
    <Card>
      <Card.Body>
        <Card.Title>
            <h5>Registrations&nbsp;</h5>
          <Row>
            <Col sm={6}>
              <form className='d-flex flex-column' onSubmit={(e => {e.preventDefault(); addStudentGroup(studentGroupState.selectedGroup, studentGroupState.schedules)})}>
                <div className='input-group'>
                  <Select 
                    name='student-list'
                    className='form-control p-0'
                    options={distinctStudentGroups?.map(option => ({label: option.name, value: option.groupGuid}) || [])}
                    onChange={(option) => setStudentGroupState(state => ({...state, selectedGroup: studentGroups.find(g => g.groupGuid == option?.value) || null}))}
                  />
                  <button 
                    type='submit' 
                    className='btn btn-primary' 
                    disabled={studentGroupAPIState.isPending || !studentGroupState.selectedGroup || studentGroupState.schedules.length == 0} 
                    style={{maxHeight: '40px'}}
                  >
                    { studentGroupAPIState.isPending ? <Spinner /> : 'Add Student Group'}
                  </button>
                </div>

                <div>
                  {daySchedules?.map(day => (
                    <Form.Group
                      controlId={day.dayOfWeek}
                      style={{ width: 'fit-content' }}
                    >
                      <Form.Label className='fw-normal'><small>{day.dayOfWeek}</small></Form.Label>&nbsp;
                      <Form.Check
                        inline
                        defaultChecked={!!studentGroupState.schedules.find(guid => guid === day.dayScheduleGuid) || false}
                        style={{ display: 'inline-block' }}
                        onChange={event => {
                          if (event.target.checked)
                            setStudentGroupState(state => ({...state, schedules: Array.from(new Set([...state.schedules, day.dayScheduleGuid]))}))
                          else
                            setStudentGroupState(state => ({...state, schedules: state.schedules.filter(guid => guid != day.dayScheduleGuid)}))
                        }}
                      />
                    </Form.Group>
                  ))}
                </div>
              </form>
            </Col>
            
            <Col sm={2}>
              <button type='button' className='btn btn-primary px-2 py-1' style={{ width: 'auto' }} onClick={() => {setShowStudentModal(true)}}>Add Student</button>
            </Col>
          </Row>

          <Row className='d-flex flex-column' style={studentGroupAPIState.issues.length > 0 ? {} : { display: 'none' }}>
            {studentGroupAPIState.issues.map(issue => (
              <small className='text-danger'>{`${issue.firstName} ${issue.lastName} ${registrations.some(reg => reg.studentSchoolYear.guid == issue.studentSchoolYearGuid) ? 'is already registered' : 'cannot be added'}.`}</small>
            ))}
          </Row>
        </Card.Title>
        <Card.Text>
          <div className='position-relative'>
            <Table
              dataset={dataset}
              columns={columns}
              rowProps={{onClick: (event, row) => navigate(`/home/admin/students/${row.student.studentSchoolYearGuid}`)}}
            />
            <RemoveStudentModal
              registration={modalData}
              show={showModal}
              handleClose={handleClose}
            />
          </div>
        </Card.Text>
      </Card.Body>
      <SearchStudentsModal
        orgYearGuid={orgYear.guid}
        show={showStudentModal}
        handleClose={() => setShowStudentModal(false)}
        handleChange={({student, schedule}) => addStudent(student.guid, schedule)}
        scheduling={daySchedules}
      />
    </Card>
  )
}

const RemoveStudentModal = ({
  registration,
  show,
  handleClose
}): JSX.Element => {
  const [selectedRemovals, setRemovals] = useState<string[]>([])

  function handleChange (event, day): void {
    if (event.target.checked) {
      setRemovals([...selectedRemovals, day.dayScheduleGuid])
    } else {
      setRemovals(selectedRemovals.filter(guid => guid !== day.dayScheduleGuid))
    }
  }

  useEffect(() => {
    if (show)
      setRemovals(registration.days.map(day => day.dayScheduleGuid))
  }, [registration])

  return (
    <Modal show={show}>
      <Modal.Header closeButton onHide={() => handleClose([], '')}>
        Confirm the removal of {registration?.student?.firstName}{' '}
        {registration?.student?.lastName} from the session.
      </Modal.Header>
      <Modal.Body>
        <label>Remove from...</label>
        {registration?.days.map(day => (
          <Form>
            <Form.Check
              type='checkbox'
              defaultChecked={true}
              id={day.dayOfWeek}
              label={day.dayOfWeek}
              onChange={event => handleChange(event, day)}
            />
          </Form>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() =>
            handleClose(
              selectedRemovals,
              registration.student.studentSchoolYearGuid
            )
          }
        >
          Delete Registrations
        </Button>
      </Modal.Footer>
    </Modal>
  )
}


const createStudentColumns = (handleRemoveStudent): Column[] => [
  {
    label: 'First Name',
    attributeKey: 'student.firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'student.lastName',
    sortable: true
  },
  {
    label: 'Matric #',
    attributeKey: 'student.matricNumber',
    sortable: true
  },
  {
    label: 'Registrations',
    attributeKey: 'daysOfWeek',
    sortable: true, //subject to change,
    transform: (values: string[]): string[] =>
      values.map((value, index) =>
        index === values.length - 1 ? value : `${value}, `
      )
  },
  {
    label: '',
    attributeKey: '',
    sortable: false,
    transform: (value: string): JSX.Element => (
      <div className='d-flex justify-content-center'>
        <Button
          size='sm'
          variant='danger'
          onClick={event => {
            event.stopPropagation()
            handleRemoveStudent(value)
          }}
        >
          Remove
        </Button>
      </div>
    ),
    cellProps: { style: { width: 'min-content' } }
  }
]