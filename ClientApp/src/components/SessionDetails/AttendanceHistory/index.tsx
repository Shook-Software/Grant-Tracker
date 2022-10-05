import { useState, useEffect, useRef } from 'react'
import { Accordion, Button, Row, Popover, Overlay } from 'react-bootstrap'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import Table, { Column } from 'components/BTable'
import AttendanceModal from 'components/SessionAttendance'

import { DayOfWeek } from 'Models/DayOfWeek'
import { AttendanceTimeRecordView, AttendanceView } from 'Models/StudentAttendance'

import { deleteAttendanceRecord, editAttendanceRecord } from '../api'
//{console.log(props.popper.state ? props.popper.state : props.popper)}
const ConfirmDeletionPopover = ({title, onChange}): JSX.Element => (
  <Popover style={{width: '20rem'}}>
    <Popover.Header>{title}</Popover.Header>
    <Popover.Body>
      Are you sure you want to delete this record? This action is permanent.
      <Button 
        size='sm'
        onClick={onChange}
      >
        Confirm
      </Button>
    </Popover.Body>
  </Popover>
)

const RemoveAttendanceRecord = ({date, onChange}): JSX.Element => {
  const [show, setShow] = useState(false)
  const target = useRef(null)

  return (
    <>  
      <Button 
        className='my-3 mx-3'
        variant='danger'
        style={{width: 'fit-content'}}
        onClick={() => setShow(true)}
        ref={target}
      >
        Delete Attendance Record
      </Button>
      <Overlay 
        target={target.current} 
        show={show}
        placement='right'
      >
        {({placement, arrowProps, show: _show, popper, ...props}) => (
          <div {...props}>
            <ConfirmDeletionPopover 
              title={date.format(DateTimeFormatter.ofPattern('eeee, MMMM d').withLocale(Locale.ENGLISH))}
              onChange={onChange} 
            />
          </div>
        )}
      </Overlay>
    </>
  )
}

const TimeRecordDisplay = ({timeRecords}: {timeRecords: AttendanceTimeRecordView[]}): JSX.Element => {
  timeRecords = timeRecords.sort((first, second) => {
    if (first.entryTime.isBefore(second.entryTime))
      return -1
    if (first.entryTime.isAfter(second.entryTime))
      return 1
    return 0
  })

  return (
    <div className='d-flex align-items-center flex-wrap h-100'>
      { 
        timeRecords.map(record => (
          <>
            <span className='w-50 text-center'>{record.entryTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}</span>
            <span className='w-50 text-center'>{record.exitTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}</span>
          </>
        ))
      }
    </div>
  )
}

const columns: Column[] = [
  {
    label: 'First Name',
    attributeKey: 'studentSchoolYear.student.firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'studentSchoolYear.student.lastName',
    sortable: true
  },
  {
    label: 'Matric #',
    attributeKey: 'studentSchoolYear.student.matricNumber',
    sortable: true
  },
  {
    label: 'Grade',
    attributeKey: 'studentSchoolYear.grade',
    sortable: true
  },
  {
    label: 'Time Records',
    attributeKey: 'timeRecords',
    sortable: false,
    headerTransform: () => (
      <th className='d-flex flex-wrap'>
        <span className='w-100 text-center'>Time Records</span>
        <span className='w-50 text-center'>Entered at:</span>
        <span className='w-50 text-center'>Exited at:</span>
      </th>
    ),
    transform: (timeRecord: AttendanceTimeRecordView[]) => <TimeRecordDisplay timeRecords={timeRecord} />,//<Table columns={tempColumns} dataset={timeRecord} className='m-0' />,
    cellProps: {className: 'h-100 p-0'},
  }
]

const instructorColumns: Column[] = [
  {
    label: 'First Name',
    attributeKey: 'instructorSchoolYear.instructor.firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'instructorSchoolYear.instructor.lastName',
    sortable: true
  },
  {
    label: 'Badge Number',
    attributeKey: 'instructorSchoolYear.instructor.badgeNumber',
    sortable: true
  },
  {
    label: 'Time Records',
    attributeKey: 'timeRecords',
    sortable: false,
    headerTransform: () => (
      <th className='d-flex flex-wrap'>
        <span className='w-100 text-center'>Time Records</span>
        <span className='w-50 text-center'>Entered at:</span>
        <span className='w-50 text-center'>Exited at:</span>
      </th>
    ),
    transform: (timeRecord: AttendanceTimeRecordView[]) => <TimeRecordDisplay timeRecords={timeRecord} />,//<Table columns={tempColumns} dataset={timeRecord} className='m-0' />,
    cellProps: {className: 'h-100 p-0'},
  }
]

interface Props {
  sessionGuid: string
  attendanceRecords: AttendanceView[]
  onChange
}

export default ({sessionGuid, attendanceRecords, onChange}: Props): JSX.Element => {
  const [modalProps, setModalProps] = useState<any>()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!isLoading)
    {
      onChange()
    }
    
  }, [sessionGuid, isLoading])

  function handleAttendanceEditClick(record) {
    //set registrations in correct format
    //make sure copies are made, do not modify originals. Spread all arrays, etc
    let studentRecords = record.studentAttendanceRecords.map(record => ({
      isPresent: true,
      attendance: record.timeRecords.map(time => ({
        ...time,
        startTime: time.entryTime,
        endTime: time.exitTime
      })),
      studentSchoolYear: {
        ...record.studentSchoolYear,
        student: { ...record.studentSchoolYear.student }
      }
    }))

    let instructorRecords = record.instructorAttendanceRecords.map(record => ({
      isPresent: true,
      attendance: record.timeRecords.map(time => ({
        ...time,
        startTime: time.entryTime,
        endTime: time.exitTime
      })),
      instructorSchoolYear: {
        ...record.instructorSchoolYear,
        instructor: {...record.instructorSchoolYear.instructor},
        status: {...record.instructorSchoolYear.status}
      }
    }))

    setModalProps({
      date: record.instanceDate,
      dayOfWeek: DayOfWeek.toInt(record.instanceDate.dayOfWeek().toString()),
      studentRecords,
      instructorRecords,
      substituteRecords: [],
      defaultSchedule: studentRecords[0].attendance
    })

    setShowModal(true)
  }
  
  return (
    <>
      <h5>Attendance History</h5>
      {attendanceRecords.map((record, index) => {

        return (
            <Accordion className='my-3'>
              <Accordion.Item eventKey='-1'>
                <Accordion.Header>
                  <div className='d-flex flex-row align-items-center'>
                    <div>{record.instanceDate.format(DateTimeFormatter.ofPattern('eeee, MMMM d').withLocale(Locale.ENGLISH))}</div>
                    <ul className='m-0'>
                      <li>{record.instructorAttendanceRecords.length} Instructor Record(s)</li>
                      <li>{record.studentAttendanceRecords.length} Student Record(s)</li>
                    </ul>
                  </div>
                </Accordion.Header>
                <Accordion.Body className='p-0'>

                  <Row className='justify-content-between'>
                    <Button 
                      className='my-3 mx-3'
                      style={{width: 'fit-content'}}
                      onClick={() => handleAttendanceEditClick(record)}
                    >
                      Edit Attendance Record
                    </Button>
                    <RemoveAttendanceRecord 
                      date={record.instanceDate} 
                      onChange={() => {
                        deleteAttendanceRecord(record.guid)
                          .then(res => {onChange()})
                      }} 
                    />
                  </Row>
                 
                  <h6 className='px-3'>Instructor(s)</h6>
                  <Table tableProps={{style: {fontSize: '0.9rem'}}} columns={instructorColumns} dataset={record.instructorAttendanceRecords} />

                  <h6 className='px-3'>Student(s)</h6>
                  <Table tableProps={{style: {fontSize: '0.9rem', marginBottom: '0'}}} columns={columns} dataset={record.studentAttendanceRecords} />

                </Accordion.Body>
              </Accordion.Item>
              {
                showModal ? 
                <AttendanceModal 
                  props={modalProps}
                  handleClose={() => setShowModal(false)} 
                  handleSubmit={(date, studentRecords, instructorRecords, substituteRecords) => new Promise((resolve, reject) => {
                    const editedRecord = {
                      sessionGuid,
                      date,
                      studentRecords,
                      instructorRecords,
                      substituteRecords
                    }

                    setIsLoading(true)
                    setShowModal(false)
                    editAttendanceRecord(sessionGuid, record.guid, editedRecord)
                      .then(res => { resolve() })
                      .catch(err => { reject() })
                      .finally(() => { setIsLoading(false) })
                  })}
                />
              : null
              }
            </Accordion>
        )
      })}
    </>
  )
}