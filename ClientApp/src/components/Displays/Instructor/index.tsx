import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Row, Col, Card, ListGroup, Button } from 'react-bootstrap'

import { useAdminPage, Context } from 'pages/Admin'
import Dropdown from 'components/Input/Dropdown'
import Table, { Column } from 'components/BTable'
import ListItem from 'components/Item'
import EnrollmentDisplay from './Enrollment'

import { InstructorSchoolYearView, InstructorView } from 'Models/Instructor'
import { Quarter } from 'models/OrganizationYear'
import { DropdownOption } from 'Models/Session'

import api from 'utils/api'

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
}

const BasicDetails = ({instructor: instructorSchoolYear, onChange}: BasicDetailsProps): JSX.Element => {
  const instructor: InstructorView = instructorSchoolYear.instructor

  const [badgeNumberEdit, setBadgeNumberEdit] = useState({
    value: instructor.badgeNumber,
    currentlyEditing: false
  })
  const [statusEdit, setStatusEdit] = useState({
    value: instructorSchoolYear.status.guid,
    currentlyEditing: false
  })
  const [dropdownOptions, setOptions] = useState<DropdownOption[]>([])

  useEffect(() => {
    api
      .get('dropdown/view/instructorStatus')
      .then(res => setOptions(res.data))
      .catch(err => console.warn(err))
  }, [])

  return (
    <ListGroup variant='flush'>

      <ListItem 
        label='Badge Number:'
        value={
          badgeNumberEdit.currentlyEditing 
          ? 
            <span>
              <input 
                type='text' 
                value={badgeNumberEdit.value} 
                onChange={(event) => {
                  setBadgeNumberEdit({...badgeNumberEdit, value: event.target.value})
                }}
              />
              <Button
                className='my-2'
                size='sm'
                onClick={() => {
                  onChange({...instructorSchoolYear, instructor: {...instructor, badgeNumber: badgeNumberEdit.value}})
                  setStatusEdit({...badgeNumberEdit, currentlyEditing: false})
                }}
              >
                Save Changes
              </Button>
            </span>
          : 
            <span>
              {instructor.badgeNumber || 'N/A'}
              <Button 
                className='mx-3'
                size='sm'
                onClick={() => {
                  setBadgeNumberEdit({...badgeNumberEdit, currentlyEditing: true})
                  setStatusEdit({...statusEdit, currentlyEditing: false})
                }}
              >
                Edit
              </Button>
            </span>
        }
      />

      <ListItem 
        label='Status:' 
        value={
          statusEdit.currentlyEditing 
          ? 
            <span style={{width: 'min-content'}}>
              <Dropdown
                options={dropdownOptions}
                value={statusEdit.value}
                onChange={(guid: string) => setStatusEdit({...statusEdit, value: guid})}
              />
              <Button
                className='my-2'
                size='sm'
                onClick={() => {
                  onChange({...instructorSchoolYear, status: dropdownOptions.find(o => o.guid === statusEdit.value)})
                  setStatusEdit({...statusEdit, currentlyEditing: false})
                }}
              >
                Save Changes
              </Button>
            </span>
          : 
          <div>
            {instructorSchoolYear.status.label} 
            <Button 
              className='mx-3'
              size='sm'
              onClick={() => {
                setStatusEdit({...statusEdit, currentlyEditing: true})
                setBadgeNumberEdit({...badgeNumberEdit, currentlyEditing: false})
              }}
            >
              Edit
            </Button>
          </div>
        } 
      /> 

    </ListGroup>
  )
}

export default (): JSX.Element => {
  const { instructorSchoolYearGuid } = useParams()
  const { user }: Context = useAdminPage() //I should use a function in here to push Breadcrumbs
  const [instructorSchoolYear, setInstructorSchoolYear] = useState<InstructorSchoolYearView | null>(null)
  const [isPatching, setIsPatching] = useState<boolean>(false)

  function fetchInstructor(instructorSchoolYearGuid): void {
    api
      .get(`instructor/${instructorSchoolYearGuid}`)
      .then(res => {
        setInstructorSchoolYear(res.data)
      })
  }

  function handleStatusChange(instructor: InstructorSchoolYearView): void {
    setInstructorSchoolYear(instructor)
    setIsPatching(true)
  }

  //PATCHING
  //on any change of instructor, where instructor exists, send a patch request for status attribute
  useEffect(() => {
    if (!instructorSchoolYear)
      return

    api
      .patch(`staff/${instructorSchoolYear.guid}/status`, instructorSchoolYear)
      .then(res => {
        fetchInstructor(instructorSchoolYearGuid)
      })
      .finally(() => setIsPatching(false))
  }, [isPatching])

  //INITIAL LOAD
  //On any change of the guid parameter, fetch that instructor's details
  useEffect(() => {
    fetchInstructor(instructorSchoolYearGuid)
  }, [instructorSchoolYearGuid])

  if (!instructorSchoolYear) 
    return <p>Page is loading...</p>

  const organizationHistoryFlattened = flattenOrganizationHistory(instructorSchoolYear.organizations)
  const instructor: InstructorView = instructorSchoolYear.instructor

  return (
    <Card className='mt-3'>
      <Card.Header className='d-flex flex-column align-items-center'>
        <h2>{`${instructor.firstName} ${instructor.lastName}`}</h2>
        <h6>{instructorSchoolYear.organizationName}</h6>
        <h6> {instructorSchoolYear.year.schoolYear} - {Quarter[instructorSchoolYear.year.quarter]}</h6>
      </Card.Header>
      <Card.Body>
        <p>{/*error*/}</p>

        <Row lg={2} className='d-flex flex-column align-items-center'>
          <Col>
            <Card.Title><u>Instructor Info:</u></Card.Title>
            <BasicDetails instructor={instructorSchoolYear} onChange={(instructor: InstructorSchoolYearView) => handleStatusChange(instructor)}/>
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
        
      </Card.Body>
    </Card>
  )
}