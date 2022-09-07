import { useState, useRef, forwardRef, useEffect, useLayoutEffect } from 'react'
import { Modal, Button, Container, Row, Col, Form, Popover, OverlayTrigger } from 'react-bootstrap'
import { DateTimeFormatter } from "@js-joda/core"
import { Locale } from '@js-joda/locale_en-us'


import Table, { Column } from 'components/BTable'
import Alert, { ApiResult } from 'components/ApiResultAlert'
import Search from './Search'

import api from 'utils/api'
import { Schedule, ScheduleView } from 'Models/Schedule'

//@ts-ignore
const StudentPopover = forwardRef(({ values, handleAddStudent, ...props }, ref): JSX.Element => {

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
})

const columnsBuilder = (handleAddStudent): Column[] => ([
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
    sortable: true
  },
  {
    label: 'Matric Number',
    attributeKey: 'matricNumber',
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
            overlay={(<StudentPopover values={value} handleAddStudent={handleAddStudent} />)}
            rootClose
          >
            <Button>+</Button>
          </OverlayTrigger>
        </div>
      )
    }
  }
])

function getConflictResponse(conflicts: ScheduleView[], fullName: string): string[] {
  return [
    `The following registrations for ${fullName} conflict with a pre-existing registration:`,
    ...conflicts.map(conflict => (
      `
      ${conflict.dayOfWeek},
      ${conflict.startTime.format(DateTimeFormatter.ofPattern("hh:mm a").withLocale(Locale.ENGLISH))}
      to
      ${conflict.endTime.format(DateTimeFormatter.ofPattern("hh:mm a").withLocale(Locale.ENGLISH))}
      `
    ))
  ]
}

interface Props {
  show: boolean
  handleClose: () => void
  handleChange: (value: any) => void
  sessionGuid: string | undefined
  scheduling: ScheduleView[]
}

//Ask Matt about having addStudent here or passed to handleChange in the parent
export default ({ show, handleClose, handleChange, sessionGuid, scheduling }: Props): JSX.Element => {
  const [state, setState] = useState<any[]>([])
  const [schedule, setSchedule] = useState<string[]>([])
  const [apiResult, setApiResult] = useState<ApiResult>()
  const modalRef = useRef(null)

  const columns: Column[] = columnsBuilder(handleChange)

  useLayoutEffect(() => {
    modalRef.current.scrollTop = 0
  }, [apiResult])

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size='xl'
      contentClassName='h-75'
      scrollable
      ref={modalRef}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Adding New Student(s)...
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className='d-flex flex-column align-items-center'>
          <Row className='d-flex flex-column align-items-center w-50'>
            <Alert apiResult={apiResult} />
            <Search handleChange={setState} />
          </Row>
          <Row className='w-50'>
            <Form.Text>Add student to the following weekday(s)</Form.Text>
            {
              scheduling?.map(day => (
                <Form.Group controlId={day.dayOfWeek} style={{ width: 'fit-content' }}>
                  <Form.Label>{day.dayOfWeek}</Form.Label>&nbsp;
                  <Form.Check
                    inline
                    style={{ display: 'inline-block' }}
                    checked={true}
                    onChange={(event) => {
                      if (event.target.checked)
                        setSchedule([...schedule, day.guid])
                      else
                        setSchedule(schedule.filter(item => item !== day.guid))
                    }}
                  />
                </Form.Group>
              ))
            }
          </Row>
          <Row className='w-50'>
            {
              state.length === 0
                ?
                <Form.Text className='text-center' style={{ borderTop: '1px solid var(--bs-gray-300)' }}>No students found...</Form.Text>
                :
                <Table columns={columns} dataset={state} />
            }
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

//