import { useState, forwardRef, useRef, useEffect } from 'react'
import {
  Modal,
  Button,
  Container,
  Row,
  Col,
  Form,
  Popover,
  OverlayTrigger
} from 'react-bootstrap'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import Table, { Column } from 'components/BTable'
import Alert, { ApiResult } from 'components/ApiResultAlert'
import Search from './StudentSearchForm'

import { DaySchedule, DayScheduleView } from 'Models/DaySchedule'

import api from 'utils/api'

//@ts-ignore
const StudentPopover = forwardRef(
  ({ values, handleAddStudent, ...props }, ref): JSX.Element => {
    const fullName: string = `${values.firstName} ${values.lastName}`

    return (
      <Popover
        key={values.matricNumber}
        {...props}
        //@ts-ignore
        ref={ref}
      >
        <Popover.Body>
          <p>Are you sure you want to add {fullName}?</p>
          <Button
            className='my-2'
            onClick={() => {
              handleAddStudent(values)
              //add the student, successfully or not, then trigger the pop-up to be closed.
              document.body.click()
            }}
          >
            Confirm
          </Button>
        </Popover.Body>
      </Popover>
    )
  }
)

const columnsBuilder = (handleAddStudent, schedule): Column[] => [
  {
    label: 'First Name',
    attributeKey: 'firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'lastName',
    sortable: true
  },
  {
    label: 'Grade',
    attributeKey: 'grade',
    sortable: true,
    transform: (value: string) => <p className='text-center'>{value}</p>
  },
  {
    label: 'Matric Number',
    attributeKey: 'matricNumber',
    sortable: true
  },
  {
    key: 'addInstructor',
    label: 'Add',
    attributeKey: '',
    sortable: false,
    transform: (value: any) => {
      return (
        <div className='position-relative'>
          <OverlayTrigger
            trigger='click'
            placement='left'
            //@ts-ignore
            overlay={
              <StudentPopover
                values={value}
                handleAddStudent={handleAddStudent}
              />
            }
            rootClose
          >
            <Button disabled={schedule.length === 0}>+</Button>
          </OverlayTrigger>
        </div>
      )
    }
  }
]

function getConflictResponse (
  message: string,
  fullName: string
): string[] {
  return [
    'An issue was present with adding the student ',
    fullName,
    ...message.split('\n')
  ]
  //lets just return a string FROM the server.
  /*return [
    `The following registrations for ${fullName} conflict with a pre-existing registration:`,
    ...conflicts.map(conflict => (
      `
      ${conflict.dayOfWeek},
      ${conflict.startTime.format(DateTimeFormatter.ofPattern("hh:mm a").withLocale(Locale.ENGLISH))}
      to
      ${conflict.endTime.format(DateTimeFormatter.ofPattern("hh:mm a").withLocale(Locale.ENGLISH))}
      `
    ))
  ]*/
}

interface Props {
  show: boolean
  handleClose: () => void
  handleChange: (value: any) => void
  scheduling: DayScheduleView[]
}

//Ask Matt about having addStudent here or passed to handleChange in the parent
export default ({
  show,
  handleClose,
  handleChange,
  scheduling
}: Props): JSX.Element => {
  const [state, setState] = useState<any[]>([])
  const [schedule, setSchedule] = useState<string[]>([])
  const [apiResult, setApiResult] = useState<ApiResult>()
  const tableRef: React.Ref<HTMLDivElement | null> = useRef(null)

  function addStudent (student): void {
    const fullName: string = `${student.firstName} ${student.lastName}`
    api
      .post(`session/registration`, {
        student,
        dayScheduleGuids: schedule
      })
      .then(res => {
        setApiResult({
          label: fullName,
          success: true
        })
      })
      .catch(err => {
        if (err.response.statusText === 'Conflict') {
          //const conflicts: DayScheduleView[] = [] //err.response.data.map(item => DaySchedule.toViewModel(item))
          setApiResult({
            label: fullName,
            success: false,
            message: err.response.data.map(item => item.message)
          })
        }
      })
  }

  const columns: Column[] = columnsBuilder(addStudent, schedule)

  useEffect(() => {
    setSchedule(scheduling.map(day => day.dayScheduleGuid))
  }, [])

  useEffect(() => {
    if (tableRef && tableRef.current) {
      tableRef.current.scrollIntoView()
    }
  }, [state])

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size='xl'
      contentClassName='h-75'
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>Adding New Student(s)...</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className='d-flex flex-column align-items-center'>
          <Row className='d-flex flex-column align-items-center w-75'>
            <Alert apiResult={apiResult} />
            <Search handleChange={setState} />
          </Row>
          <Row className='w-50'>
            <Form.Text>Add student to the following weekday(s)</Form.Text>
            {scheduling?.map(day => (
              <Form.Group
                controlId={day.dayOfWeek}
                style={{ width: 'fit-content' }}
              >
                <Form.Label>{day.dayOfWeek}</Form.Label>&nbsp;
                <Form.Check
                  inline
                  defaultChecked={true}
                  style={{ display: 'inline-block' }}
                  onChange={event => {
                    if (event.target.checked)
                      setSchedule([...schedule, day.dayScheduleGuid])
                    else
                      setSchedule(
                        schedule.filter(item => item !== day.dayScheduleGuid)
                      )
                  }}
                />
              </Form.Group>
            ))}
          </Row>
          <Row className='w-50'  ref={tableRef}>
            {state.length === 0 ? (
              <Form.Text
                className='text-center'
                style={{ borderTop: '1px solid var(--bs-gray-300)' }}
              >
                No students found...
              </Form.Text>
            ) : (
              <Table columns={columns} dataset={state}/>
            )}
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

//
