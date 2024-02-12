import { useEffect, useState, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Row, Col, Card, ListGroup, Button, Spinner } from 'react-bootstrap'

import Dropdown from 'components/Input/Dropdown'
import Table, { Column } from 'components/BTable'
import ListItem from 'components/Item'
import EnrollmentDisplay from './Enrollment'
import AttendanceDetails from './AttendanceDetails'

import { InstructorSchoolYearView, InstructorView } from 'Models/Instructor'
import { Quarter } from 'Models/OrganizationYear'
import { DropdownOption } from 'Models/Session'

import { getInstructorStatusOptions, getInstructor, patchInstructorStatus } from './api'
import paths from 'utils/routing/paths'
import { PageContainer } from 'styles'
import { OrgYearContext } from 'pages/Admin'


//name
//badge number
//status

//organization && year displayed
////org name, guid, 
////year name, quarter, guid


//Session enrollment for given year
////session name, schedule w/ time of day... maybe make a visual component if there's leftover time, # of students

//Attendance for given year

//A list of years instructor was active, with their status attached, acts as links
const organizationHistoryColumns: Column[] = [
  {
    label: 'Name',
    attributeKey: 'name',
    sortable: true
  },
  {
    label: 'School Year',
    attributeKey: 'schoolYear',
    sortable: true
  },
  {
    label: 'Quarter',
    attributeKey: 'quarter',
    sortable: true
  }
]

const flattenOrganizationHistory = (organizations: any) => {
  let flattenedHistory: any[] = []

  organizations.forEach(org => {
    org.organizationYears.forEach(oy => {
      flattenedHistory = [...flattenedHistory, {
        organizationYearGuid: oy.guid,
        name: org.name,
        schoolYear: oy.year.schoolYear,
        quarter: Quarter[oy.year.quarter]
      }]
    })
  })
  return flattenedHistory
}

interface BasicDetailsProps {
  instructor: InstructorSchoolYearView
  onChange: (instructor: InstructorSchoolYearView) => void
  editing: boolean
}

const BasicDetails = ({instructor: instructorSchoolYear, onChange, editing}: BasicDetailsProps): JSX.Element => {
  const instructor: InstructorView = instructorSchoolYear.instructor
  const [status, setStatus] = useState(instructorSchoolYear.status.guid)
  const [dropdownOptions, setOptions] = useState<DropdownOption[]>([])

  useEffect(() => {
    getInstructorStatusOptions()
      .then(res => setOptions(res))
      .catch(err => console.warn(err))
  }, [])

  return (
    <ListGroup variant='flush'>

      <ListItem 
        label='Badge Number:'
        value={instructor.badgeNumber}
      />

      <ListItem 
        label='Status:' 
        value={
          editing
          ? 
            <span style={{width: 'min-content'}}>
              <Dropdown
                options={dropdownOptions}
                value={status}
                onChange={(guid: string) => {
                  setStatus(guid)
                  onChange({...instructorSchoolYear, status: dropdownOptions.find(o => o.guid === guid)})
                }}
              />
            </span>
          : 
          <div>
            {instructorSchoolYear.status.label} 
          </div>
        } 
      /> 

    </ListGroup>
  )
}

export default ({instructorSchoolYearGuid}): JSX.Element => {
	const { orgYear } = useContext(OrgYearContext)
  const [instructorSchoolYear, setInstructorSchoolYear] = useState<InstructorSchoolYearView | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [editing, setEditing] = useState<boolean>(false)

  function fetchInstructor(instructorSchoolYearGuid): void {
    setIsLoading(true)
    setInstructorSchoolYear(null)

    getInstructor(instructorSchoolYearGuid)
      .then(res => setInstructorSchoolYear(res))
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  function handleStatusChange(instructor: InstructorSchoolYearView): void {
    setInstructorSchoolYear(instructor)
  }

  //PATCHING
  //on any change of instructor, where instructor exists, send a patch request for status attribute
  useEffect(() => {
    if (!instructorSchoolYear)
      return

    patchInstructorStatus(instructorSchoolYear)
      .then(res => {
        fetchInstructor(instructorSchoolYearGuid)
      })
      .finally(() => setEditing(false))
  }, [editing])

  //INITIAL LOAD
  //On any change of the guid parameter, fetch that instructor's details
  useEffect(() => {
    fetchInstructor(instructorSchoolYearGuid)
  }, [instructorSchoolYearGuid])
  
  if (!instructorSchoolYear && isLoading) 
    return (
      <div className="d-flex flex-column align-items-center">
        <Spinner animation='border' role='status' />
        <small className='text-muted'>Loading Instructor...</small>
      </div>
    )
  else if (!instructorSchoolYear && !isLoading) 
    return (
      <div className='d-flex justify-content-center'>
        <p className='text-danger'>An error occured while loading the instructor.</p>
      </div>
  )

  const organizationHistoryFlattened = flattenOrganizationHistory(instructorSchoolYear.organizations)
  const instructor: InstructorView = instructorSchoolYear.instructor

  return (
    <PageContainer>
      <Card className='mt-3'>
        <Card.Header className='mb-3 d-flex flex-column align-items-center'>
          <h2 className='text-center'>{`${instructor.firstName} ${instructor.lastName}`}</h2>
          <h5>{instructorSchoolYear.organizationName}</h5>
          <h5>{instructorSchoolYear.year.schoolYear} - {Quarter[instructorSchoolYear.year.quarter]}</h5>
          <div className='d-flex justify-content-center'>
            <Button 
              className='mx-3'
              size='sm'
              onClick={() => editing ? setEditing(false) : setEditing(true)}
            >
              {editing ? 'Save Changes' : 'Edit'}
            </Button>
            <Button 
                variant='secondary' 
                as={Link} 
                className='ms-3 px-2 py-1' 
                to={`${paths.Admin.path}/${paths.Admin.Tabs.Staff.path}`}
            >
              Close
            </Button>
          </div>
        </Card.Header>
        <Card.Body>

          <Row className='d-flex flex-column align-items-center'>
            <Col>
              <BasicDetails instructor={instructorSchoolYear} onChange={(instructor: InstructorSchoolYearView) => handleStatusChange(instructor)} editing={editing}/>
            </Col>
          </Row>

          <Card.Title className='mt-3'><u>History</u></Card.Title>
          <Row className='px-2'>
            <Table dataset={organizationHistoryFlattened} columns={organizationHistoryColumns} />
          </Row>

          <Card.Title className='mt-3'><u>Session Enrollment</u></Card.Title>
          <Row className='px-2'>
            <EnrollmentDisplay enrollments={instructorSchoolYear.enrollmentRecords} />
          </Row>

          <Card.Title className='mt-3'><u>Session Attendance</u></Card.Title>
          <Row className='px-2'>
            <AttendanceDetails attendance={instructorSchoolYear.attendanceRecords} />
          </Row>
          
        </Card.Body>
      </Card>
    </PageContainer>
  )
}