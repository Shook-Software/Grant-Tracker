import { useState, useEffect, useRef } from 'react'
import { Accordion, Button, Row, Popover, Overlay, Spinner } from 'react-bootstrap'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import TimeRecordDisplay from './TimeRecordDisplay'
import Table, { Column } from 'components/BTable'

import { AttendanceTimeRecordView, AttendanceView, SimpleAttendanceView } from 'Models/StudentAttendance'
import { getAttendanceRecord } from '../api'
import FamilyMemberOps from 'Models/FamilyMember'
import paths from 'utils/routing/paths'
import { Link } from 'react-router-dom'

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
  simpleRecord: SimpleAttendanceView
  onDeleteClick
  sessionType: string
}

export default ({sessionGuid, simpleRecord, onDeleteClick, sessionType}: Props): JSX.Element => {
  const [record, setRecord] = useState<AttendanceView | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

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
        <Row className='justify-content-between'>
          {/* Button to nav to edit for another session with this attendance info*/}
          <Link 
            className='btn btn-primary my-3 mx-3'
            to={attendanceHref}
            style={{width: 'fit-content'}}
          >
            Edit Record
          </Link>
          <RemoveAttendanceRecord 
            date={record.instanceDate} 
            onChange={() => onDeleteClick(record)}
          />
        </Row>
        
        <h6 className='px-3'>Instructor(s)</h6>
        <Table tableProps={{style: {fontSize: '0.9rem'}}} columns={instructorColumns} dataset={record.instructorAttendanceRecords} />

        <h6 className='px-3'>Student(s)</h6>
        <Table tableProps={{style: {fontSize: '0.9rem', marginBottom: '0'}}} columns={studentTableColumns} dataset={record.studentAttendanceRecords} />

      </Accordion.Body>
    </Accordion.Item>
  )
}