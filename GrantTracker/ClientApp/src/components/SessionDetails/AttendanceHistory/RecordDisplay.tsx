import { useState, useEffect, useRef, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Accordion, Button, Row, Popover, Overlay, Spinner, Modal } from 'react-bootstrap'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import TimeRecordDisplay from './TimeRecordDisplay'
import Table, { Column } from 'components/BTable'
import { CopyAttendanceModal } from 'components/Modals/CopyAttendanceModal'

import { AttendanceTimeRecordView, AttendanceView, SimpleAttendanceView } from 'Models/StudentAttendance'
import { getAttendanceRecord } from '../api'
import FamilyMemberOps from 'Models/FamilyMember'
import paths from 'utils/routing/paths'
import { OrgYearContext } from 'pages/Admin'

const studentColumns: Column[] = [
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
    sortable: true,
    cellProps: { className: 'text-center' }
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
    transform: (timeRecord: AttendanceTimeRecordView[]) => <TimeRecordDisplay timeRecords={timeRecord} />,
    cellProps: {className: 'py-1'},
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
      <th>
        <div className='d-flex flex-wrap'>
          <span className='w-100 text-center'>Time Records</span>
          <span className='w-50 text-center'>Entered at:</span>
          <span className='w-50 text-center'>Exited at:</span>
        </div>
      </th>
    ),
    transform: (timeRecord: AttendanceTimeRecordView[]) => <TimeRecordDisplay timeRecords={timeRecord} />,//<Table columns={tempColumns} dataset={timeRecord} className='m-0' />,
    cellProps: {className: 'py-1'},
  }
]

function addFamilyColumn (columns: Column[]): Column[] {
  return [
    ...columns,
    {
      label: 'Family Attendance',
      attributeKey: 'familyAttendance',
      key: 'familyAttendance',
      sortable: false,
      headerTransform: () => (
        <th>
          <div className='d-flex flex-wrap'> 
            <span className='w-100 text-center'>Family Attendance</span>
            <span className='w-50 text-center'>Family Member</span>
            <span className='w-50 text-center'>Count</span>
          </div>
        </th>
      ),
      transform: (familyAttendanceRecord) => 
        <div className='d-flex align-items-center flex-wrap h-100'>
          {
            familyAttendanceRecord?.map(fa => (
              <>
                <span className='w-50 text-center'>{FamilyMemberOps.toString(fa.familyMember)}</span>
                <span className='w-50 text-center'>{fa.count}</span>
              </>
            ))
          }
        </div>
    }
  ]
}

function removeStudentTimeRecords(columns: Column[]): Column[] {
  return columns.filter(x => x.label !== 'Time Records')
}

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

interface Props {
  sessionGuid: string
  sessionName: string
  simpleRecord: SimpleAttendanceView
  onDeleteClick
  sessionType: string
}

const dateFormatter = DateTimeFormatter.ofPattern('eeee, MMMM dd').withLocale(Locale.ENGLISH)

export default ({sessionGuid, sessionName, simpleRecord, onDeleteClick, sessionType}: Props): JSX.Element => {
  const [record, setRecord] = useState<AttendanceView | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)

    const { sessionsQuery } = useContext(OrgYearContext)

  function fetchAttendanceRecord(attendanceGuid: string) {
    setIsLoading(true)
    getAttendanceRecord(sessionGuid, attendanceGuid)
      .then(res => setRecord(res))
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  let studentTableColumns: Column[] = [...studentColumns]
  if (record?.studentAttendanceRecords?.length > 0) 
  {
      if (sessionType === 'family' || sessionType === 'parent')
        studentTableColumns = addFamilyColumn(studentTableColumns)

      if (sessionType === 'parent')
        studentTableColumns = removeStudentTimeRecords(studentTableColumns)
  }

  useEffect(() => {
    fetchAttendanceRecord(simpleRecord.guid)
  }, [simpleRecord])

  if (isLoading)
    return (
      <div className='d-flex justify-content-center'>
        <Spinner animation='border' role='status' />
      </div>
    )

  if (!record)
    return (
      <Accordion.Item eventKey='-1' onClick={() => !record ? fetchAttendanceRecord(simpleRecord.guid) : null}>
        <Accordion.Header>
          <div className='d-flex flex-row align-items-center'>
            <div>{simpleRecord.instanceDate.format(DateTimeFormatter.ofPattern('eeee, MMMM d').withLocale(Locale.ENGLISH))}</div>
            <ul className='m-0'>
              <li>{simpleRecord.instructorCount} Instructor Record(s)</li>
              <li>{simpleRecord.studentCount} Student Record(s)</li>
              <li>{simpleRecord.familyCount} Family Record(s)</li>
            </ul>
          </div>
        </Accordion.Header>
      </Accordion.Item>
    )
    
  const attendanceHref: string = `${paths.Admin.Attendance.path}?session=${sessionGuid}&attendanceId=${record.guid}` 

  return (
    <Accordion.Item eventKey='-1'>
      <Accordion.Header>
        <div className='d-flex flex-row align-items-center'>
          <div>{simpleRecord.instanceDate.format(DateTimeFormatter.ofPattern('eeee, MMMM d').withLocale(Locale.ENGLISH))}</div>
          <ul className='m-0'>
            <li>{simpleRecord.instructorCount} Instructor Record(s)</li>
            <li>{simpleRecord.studentCount} Student Record(s)</li>
            <li>{simpleRecord.familyCount} Family Record(s)</li>
          </ul>
        </div>
      </Accordion.Header>
      <Accordion.Body className='p-0' >
        <Row>
          {/* Button to nav to edit for another session with this attendance info*/}
          <Link 
            className='btn btn-primary col-auto my-3 mx-3'
            to={attendanceHref}
            style={{width: 'fit-content'}}
          >
            Edit Record
          </Link>
          {sessionType === 'student' ? <button className='btn btn-primary col-auto m-3' type='button' onClick={() => setShowModal(true)}>Copy</button> : null}
          <div className='col d-flex justify-content-end'>
            <RemoveAttendanceRecord 
              date={record.instanceDate} 
              onChange={() => onDeleteClick(record)}
            />
          </div>
        </Row>
        
        <h6 className='px-3'>Instructor(s)</h6>
        <Table tableProps={{style: {fontSize: '0.9rem'}}} columns={instructorColumns} dataset={record.instructorAttendanceRecords} />

        <h6 className='px-3'>Student(s)</h6>
        <Table tableProps={{style: {fontSize: '0.9rem', marginBottom: '0'}}} columns={studentTableColumns} dataset={record.studentAttendanceRecords} />

        <Modal show={showModal} size='xl'>
          <Modal.Header closeButton onHide={() => setShowModal(false)}>
              Copying Attendance for {sessionName}, {simpleRecord.instanceDate.format(dateFormatter)}
          </Modal.Header>
          <Modal.Body>
            <CopyAttendanceModal sourceSessionGuid={sessionGuid} sourceAttendanceGuid={simpleRecord.guid} sourceDate={simpleRecord.instanceDate} sessions={sessionsQuery?.data|| []} />
          </Modal.Body>
        </Modal>
      </Accordion.Body>
    </Accordion.Item>
  )
}