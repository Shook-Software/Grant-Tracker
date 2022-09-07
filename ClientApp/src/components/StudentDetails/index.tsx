import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Row, Col, Card } from 'react-bootstrap'

import { PageContainer } from 'styles'

import BasicDetails from './BasicDetails'
import RegistrationDetails from './RegistrationDetails'
import AttendanceDetails from './AttendanceDetails'

import { Quarter } from 'models/OrganizationYear'
import { StudentSchoolYear, StudentSchoolYearWithRecordsView, StudentSchoolYearWithRecordsDomain, StudentView } from 'Models/Student'

import api from 'utils/api'

//info needed:
//basic student info
//Student aggregates

//registrations
//attendance history, default sorted by date
//

export default (): JSX.Element => {
  const { studentGuid } = useParams()
  const [studentSchoolYear, setStudentSchoolYear] = useState<StudentSchoolYearWithRecordsView | null>()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    //get student details
    api
      .get<StudentSchoolYearWithRecordsDomain>(`student/${studentGuid}`)
      .then(res => {
        document.title = `GT - Admin / Student / ${res.data.student.firstName} ${res.data.student.lastName}`
        setStudentSchoolYear(StudentSchoolYear.toViewModel(res.data))
      })
      .catch()
  }, [])

  if (!studentGuid || !studentSchoolYear) return <></>

  const student: StudentView = studentSchoolYear.student

  return (
    <PageContainer>
      <Card>
        <Card.Header className='d-flex flex-column align-items-center'>
          <h2>{`${student.firstName} ${student.lastName}`}</h2>
          <h6> {studentSchoolYear.organizationYear.year.schoolYear} - {Quarter[studentSchoolYear.organizationYear.year.quarter]}</h6>
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
