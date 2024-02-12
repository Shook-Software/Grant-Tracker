import { useState, forwardRef, useRef, useEffect } from 'react'
import {
  Modal,
  Button,
  Container,
  Row,
  Form,
  Popover,
  OverlayTrigger
} from 'react-bootstrap'

import Table, { Column } from 'components/BTable'
import Alert, { ApiResult } from 'components/ApiResultAlert'
import Search from './StudentSearchForm'

import { DayScheduleView } from 'Models/DaySchedule'

import api, { AxiosIdentityConfig } from 'utils/api'

//@ts-ignore
const StudentPopover = forwardRef(
  ({ values, handleAddStudent, ...props }, ref): JSX.Element => {
    const fullName: string = `${values.student.firstName} ${values.student.lastName}`

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
              //console.log(values)
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
    attributeKey: 'student.firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'student.lastName',
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
    attributeKey: 'student.matricNumber',
    sortable: true
  },
  {
    key: 'addStudent',
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
            <Button /*disabled={schedule.length === 0}*/>+</Button>
          </OverlayTrigger>
        </div>
      )
    }
  }
]

const Schedule = ({scheduling, schedule, setSchedule}): JSX.Element => {
  if (!scheduling)
    return <></>

  return (
    <>
    <Form.Text>Add student to the following weekday(s)</Form.Text>
      {scheduling?.map(day => (
        <Form.Group
          controlId={day.dayOfWeek}
          style={{ width: 'fit-content' }}
        >
          <Form.Label>{day.dayOfWeek}</Form.Label>&nbsp;
          <Form.Check
            inline
            defaultChecked={schedule.find(guid => guid === day.dayScheduleGuid)}
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
    </>
  )
}

interface Props {
  show: boolean
  handleClose: () => void
  handleChange: (value: any, ) => Promise<any>
  scheduling: DayScheduleView[] | null
}

//refactor handleChange to do something, that way we can reuse this component
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
    const fullName: string = `${student.student.firstName} ${student.student.lastName}`

    handleChange({student, schedule})
      .then(res => {
        setApiResult({
          label: fullName,
          success: true
        })
      })
      .catch(err => {
        console.error(err)
        setApiResult({
          label: fullName,
          success: false,
          message: err.response.data
        })
      })
  }

  const columns: Column[] = columnsBuilder(addStudent, schedule)

  useEffect(() => {
    if (scheduling)
      setSchedule(scheduling.map(day => day.dayScheduleGuid))
  }, [])

  useEffect(() => {
    if (tableRef && tableRef.current) {
      tableRef.current.scrollIntoView()
    }
  }, [state.length])

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
            <Schedule scheduling={scheduling} schedule={schedule} setSchedule={setSchedule} />
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
