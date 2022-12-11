import { useState } from 'react'
import { Row, Form, Button, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap'

import AttendanceTimeInput, { TimeInputType } from './TimeInput'

import Table, {Column, SortDirection} from 'components/BTable'
import SearchStudentsModal from 'components/SessionDetails/SearchStudentsModal'

import type { AttendanceRecord } from './TimeInput'
import type { FamilyRecord, StudentRecord } from 'Models/StudentAttendance'
import FamilyMemberOps, { FamilyMember } from 'Models/FamilyMember'


const columnsBuilder = (dispatch): Column[] => [
  {
    label: 'Present',
    attributeKey: '',
    sortable: false,
    transform: (record: StudentRecord) => (
      <div 
        role='button' 
        className='d-flex justify-content-center align-items-center' 
        onClick={() => dispatch({type: 'studentPresence', payload: {guid: record.studentSchoolYear.guid, isPresent: !record.isPresent}})}
        style={{minHeight: '100%'}}
      >
        <Form.Check checked={record.isPresent} onChange={(e) => {}} />
      </div>
    ),
    cellProps: {
      style: {height: '1px', padding: '0px'}
    }
  },
  {
    label: 'Last Name',
    attributeKey: 'studentSchoolYear.student.lastName',
    sortable: true
  },
  {
    label: 'First Name',
    attributeKey: 'studentSchoolYear.student.firstName',
    sortable: true
  },
  {
    label: 'Matric Number',
    attributeKey: 'studentSchoolYear.student.matricNumber',
    sortable: true
  },
  {
    label: 'Arrived at',
    key: 'arrived',
    attributeKey: '',
    sortable: false,
    transform: (registration: StudentRecord) => {
      const studentRegistrations: AttendanceRecord[] = registration.attendance.map(record => ({
      personSchoolYearGuid: registration.studentSchoolYear.guid,
      startTime: record.startTime,
      endTime: record.endTime
    }))

    return (
      <AttendanceTimeInput
        records={studentRegistrations}
        inputType={TimeInputType.Start}
        onChange={(guid, time, index) => dispatch({
          type: 'studentStartTime',
          payload: { guid, startTime: time, index }
        })}
      />
    )}
  },
  {
    label: 'Left at',
    key: 'left',
    attributeKey: '',
    sortable: false,
    transform: (registration: StudentRecord) => {
      const studentRegistrations: AttendanceRecord[] = registration.attendance.map(record => ({
      personSchoolYearGuid: registration.studentSchoolYear.guid,
      startTime: record.startTime,
      endTime: record.endTime
    }))

    return (
      <AttendanceTimeInput
        records={studentRegistrations}
        inputType={TimeInputType.End}
        onChange={(guid, time, index) => dispatch({
          type: 'studentEndTime',
          payload: { guid, endTime: time, index }
        })}
      />
    )}
  }
]

const FamilyInput = ({familyRecord, studentSchoolYearGuid, dispatch}: {familyRecord: FamilyRecord, studentSchoolYearGuid: string, dispatch: any}): JSX.Element => {
  return (
    <InputGroup size='sm' className='my-1'>
      <InputGroup.Text as='div' className='flex-fill'>{FamilyMemberOps.toString(familyRecord.familyMember)}</InputGroup.Text>
      <InputGroup.Text as='div'>{familyRecord.count}</InputGroup.Text>
      <Button 
        onClick={(e) => {
          e.stopPropagation()
          dispatch({type: 'removeFamilyMember', payload: { studentSchoolYearGuid, familyMember: familyRecord.familyMember }})
        }}
      >
        -
      </Button>
      <Button 
        onClick={(e) => {
          e.stopPropagation()
          dispatch({type: 'addFamilyMember', payload: { studentSchoolYearGuid, familyMember: familyRecord.familyMember }})
        }}
      >
        +
      </Button>
    </InputGroup>
  )
}

function addFamilyColumn(columns: Column[], dispatch): Column[] {
  return [
    ...columns,
    {
      label: 'Family Members',
      attributeKey: '',
      key: 'family',
      sortable: false,
      transform: (registration: StudentRecord) => {
        const addFamilyMember = (familyMember: FamilyMember) => dispatch({type: 'addFamilyMember', payload: { studentSchoolYearGuid: registration.studentSchoolYear.guid, familyMember }})

        return (
          <>
            <div>
            {
              registration.familyAttendance.map(fa => (
                <FamilyInput familyRecord={fa} studentSchoolYearGuid={registration.studentSchoolYear.guid} dispatch={dispatch} />
              ))
            }
            </div>
              <DropdownButton 
                title={'Add Family Member'}
                size='sm' 
                className='align-self-center'
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <Dropdown.Item href='#' onClick={() => addFamilyMember(FamilyMember.Mother)}>Mother</Dropdown.Item>
                <Dropdown.Item href='#' onClick={() => addFamilyMember(FamilyMember.Father)}>Father</Dropdown.Item>
                <Dropdown.Item href='#' onClick={() => addFamilyMember(FamilyMember.Guardian)}>Guardian</Dropdown.Item>
                <Dropdown.Item href='#' onClick={() => addFamilyMember(FamilyMember.Grandma)}>Grandmother</Dropdown.Item>
                <Dropdown.Item href='#' onClick={() => addFamilyMember(FamilyMember.Grandfather)}>Grandfather</Dropdown.Item>
                <Dropdown.Item href='#' onClick={() => addFamilyMember(FamilyMember.OtherAdult)}>Other Adult</Dropdown.Item>
              </DropdownButton>
          </>
        )
      }
    }
  ]
}

interface Props {
  state,
  dispatch,
  isFamilySession: boolean
}

export default ({state, dispatch, isFamilySession}: Props): JSX.Element => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const columns: Column[] = isFamilySession ? addFamilyColumn(columnsBuilder(dispatch), dispatch) : columnsBuilder(dispatch)


  function addStudent(student): Promise<void> {
    return new Promise((resolve, reject) => {
      dispatch({type: 'addStudent', payload: student})
      resolve()
    })
  }

  return (
    <Row className='my-3  px-3'>
      <h5 className='p-0'>Student Attendance</h5>
      <Row>
        <Button 
          style={{width: 'fit-content', marginBottom: '0.5rem'}} 
          onClick={() => setShowModal(true)}
        >
          Add Student
        </Button>
      </Row>
      <Row> 
        <Button 
        size='sm'
        style={{width: 'fit-content', marginBottom: '0.5rem'}} 
        onClick={() => dispatch({type: 'allStudentPresence', payload: true})}
        >
          Mark all present
        </Button>
        <Button 
        size='sm'
        className='mx-2'
        style={{width: 'fit-content', marginBottom: '0.5rem'}} 
        onClick={() => dispatch({type: 'allStudentPresence', payload: false})}
        >
        Mark all absent
        </Button>
      </Row>
      <Table
        columns={columns}
        dataset={state.studentRecords}
        rowProps={{}}
      />
      <SearchStudentsModal 
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleChange={({student, _}) => addStudent(student)}
        scheduling={null}
      />
    </Row>
  )
}