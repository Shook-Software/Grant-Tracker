import { useState, useEffect } from 'react'
import { Button, CloseButton, Modal, Form, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import Table, { Column } from 'components/BTable'

import { DayOfWeek } from 'Models/DayOfWeek'
import { StudentSchoolYearWithRecordsView, StudentView } from 'Models/Student'
import { StudentRegistrationView } from 'Models/StudentRegistration'

const byStudentColumns = (handleRemoveStudent): Column[] => [
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
    label: 'Remove',
    attributeKey: '',
    sortable: false,
    transform: (value: string): JSX.Element => (
      <CloseButton
        onClick={event => {
          event.stopPropagation()
          handleRemoveStudent(value)
        }}
      />
    ),
    cellProps: { style: { width: 'min-content' } }
  }
]

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
  registrations: StudentRegistrationView[]
  onChange
}

export default ({
  registrations,
  onChange
}: Props): JSX.Element => {
  const navigate = useNavigate()
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)
  const [modalData, setModalData] = useState(null)

  function handleStudentRemoval (values): void {
    setModalIsOpen(true)
    setModalData(values)
  }

  function handleClose (scheduleGuids: string[], studentSchoolYearGuid: string) {
    if (scheduleGuids?.length !== 0) {
      onChange(scheduleGuids, studentSchoolYearGuid)
    }

    setModalIsOpen(false)
  }

  const dataset = groupRegistrationsByStudent(registrations)

  return (
    <div className='position-relative'>
      <Table
        dataset={dataset}
        columns={byStudentColumns(handleStudentRemoval)}
        rowProps={{
          onClick: (event, row) => {
            navigate(
              `/home/admin/students/${row.student.studentSchoolYearGuid}`
            )
          }
        }}
      />
      <RemoveStudentModal
        registration={modalData}
        show={modalIsOpen}
        handleClose={handleClose}
      />
    </div>
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
