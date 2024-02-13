import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Row, Col, Card, Spinner, Button } from 'react-bootstrap'

import { PageContainer } from 'styles'

import BasicDetails from './BasicDetails'
import RegistrationDetails from './RegistrationDetails'
import AttendanceDetails from './AttendanceDetails'

import { Quarter } from 'Models/OrganizationYear'
import { StudentSchoolYear, StudentSchoolYearWithRecordsView, StudentSchoolYearWithRecordsDomain, StudentView } from 'Models/Student'

import api from 'utils/api'
import paths from 'utils/routing/paths'

//info needed:
//basic student info
//Student aggregates

//registrations
//attendance history, default sorted by date
//

export default ({studentGuid}): JSX.Element => {
  const [studentSchoolYear, setStudentSchoolYear] = useState<StudentSchoolYearWithRecordsView | null>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    //get student details
    setIsLoading(true)

    api
      .get<StudentSchoolYearWithRecordsDomain>(`student/${studentGuid}`)
      .then(res => {
        document.title = `GT - Admin / Student / ${res.data.student.firstName} ${res.data.student.lastName}`
        setStudentSchoolYear(StudentSchoolYear.toViewModel(res.data))
      })
      .catch()
      .finally(() => setIsLoading(false))
  }, [studentGuid])

  if (!studentSchoolYear && isLoading) 
    return (
      <div className="d-flex flex-column align-items-center">
        <Spinner animation='border' role='status' />
        <small className='text-muted'>Loading Student Details...</small>
      </div>
    )
  else if (!studentSchoolYear) return <p>An error occured while loading student details.</p>


  const student: StudentView = studentSchoolYear.student

  return (
    <PageContainer>
      <Card className='mt-3'>
        <Card.Header className='d-flex flex-column align-items-center'>
          <h2>{`${student.firstName} ${student.lastName}`}</h2>
          <h6> {studentSchoolYear.organizationYear.year.schoolYear} - {Quarter[studentSchoolYear.organizationYear.year.quarter]}</h6>
          <Link 
              className='btn btn-secondary ms-3 px-2 py-1' 
              to={`${paths.Admin.path}/${paths.Admin.Tabs.Students.path}`}
              replace
          >
            Close
          </Link>
        </Card.Header>
        <Card.Body>
          <p>{error}</p>
          <Row lg={2} className='d-flex flex-column align-items-center'>
            <Col>
              <BasicDetails studentSchoolYear={studentSchoolYear} minutes={studentSchoolYear.minutesAttended} />
            </Col>
          </Row>
          <Row>
            <RegistrationDetails registrations={studentSchoolYear.registrations} />
          </Row>
          <Row>
            <AttendanceDetails attendance={studentSchoolYear.attendance} />
          </Row>
        </Card.Body>
      </Card>
    </PageContainer>
  )
}
