import { useState, useEffect } from 'react'
import { Container, Row, Button } from 'react-bootstrap'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'

import { getStudentSurveys } from '../api'
import { saveCSVToFile } from '../fileSaver'

const columns: Column[] = [
  {
    label: 'Last Name',
    attributeKey: 'student.lastName',
    sortable: true
  },
  {
    label: 'First Name',
    attributeKey: 'student.firstName',
    sortable: true
  },
  {
    label: 'Grade',
    attributeKey: 'student.grade',
    sortable: true
  },
  {
    label: 'Matric Number',
    attributeKey: 'student.matricNumber',
    sortable: true
  },
  {
    label: 'Activity',
    attributeKey: 'activity',
    sortable: true
  },
  {
    label: 'Total Days',
    attributeKey: 'totalDays',
    sortable: true
  },
  {
    label: 'Total Hours',
    attributeKey: 'totalHours',
    sortable: true
  }
]

function exportToCSV(data, parameters) {

  console.log(data)

  const fields = [
    {
      label: 'Organization',
      value: 'student.organizationName'
    },
    {
      label: 'Last Name',
      value: 'student.lastName'
    },
    {
      label: 'First Name',
      value: 'student.firstName'
    },
    {
      label: 'Grade',
      value: 'student.grade',
    },
    {
      label: 'Matric Number',
      value: 'student.matricNumber'
    },
    {
      label: 'Activity',
      value: 'activity'
    },
    {
      label: 'Total Days',
      value: 'totalDays'
    },
    {
      label: 'Total Hours',
      value: 'totalHours'
    },
  ]

  const options: Options<undefined> = { 
    fields, 
    excelStrings: true, 
    header: true
  }

  saveCSVToFile(data, options, `Student_Survey_${parameters.schoolYear?.startDate?.toString()}-${parameters.schoolYear?.endDate?.toString()}`)
}

//thing is, an instructor may show up multiple times in a category or across categories if the date params bring in two quarters
export default ({parameters}): JSX.Element => {
  const [studentSurvey, setStudentSurvey] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)

    getStudentSurveys(parameters.schoolYear?.startDate, parameters.schoolYear?.endDate, parameters.orgGuid)
      .then(res => {
        setStudentSurvey(res)
      })
      .catch(err => {
        console.warn(err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [parameters])

  if (isLoading)
    return <p>...Loading</p>

  if (!studentSurvey)
    return <p>An error occured in fetching results, please reload the page or file a report if the issue persists.</p>

  return (
    <Container> 
      <Row className='d-flex flex-row justify-content-center m-0'>
        <h4 className='text-center' style={{width: 'fit-content'}}>
          Student Surveys for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
        </h4>
        <Button
            onClick={() => exportToCSV(studentSurvey, parameters)}
            style={{width: 'fit-content', height: 'fit-content'}}
            size='sm'
          >
            Save to CSV
          </Button>
      </Row>

      <Row 
        style={{
          maxHeight: '25rem',
          overflowY: 'scroll'
        }}
      >
        <Table 
          className='m-0'
          columns={columns} 
          dataset={studentSurvey}
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
          tableProps={{
            size: 'sm'
          }}
        />
      </Row>
     
    </Container>
  )
}