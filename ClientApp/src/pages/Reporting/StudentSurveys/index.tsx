import { useState, useEffect } from 'react'
import { Container, Row, Button } from 'react-bootstrap'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'

import { getStudentSurveys } from '../api'
import { saveCSVToFile } from '../fileSaver'

const columns: Column[] = [
  {
    label: 'Last Name',
    attributeKey: 'lastName',
    sortable: true
  },
  {
    label: 'First Name',
    attributeKey: 'firstName',
    sortable: true
  },
  {
    label: 'Grade',
    attributeKey: 'grade',
    sortable: true,
    cellProps: {
      className: 'text-center'
    }
  },
  {
    label: 'Matric Number',
    attributeKey: 'matricNumber',
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

  const fields = [
    {
      label: 'Organization',
      value: 'organizationName'
    },
    {
      label: 'Last Name',
      value: 'lastName'
    },
    {
      label: 'First Name',
      value: 'firstName'
    },
    {
      label: 'Grade',
      value: 'grade',
    },
    {
      label: 'Matric Number',
      value: 'matricNumber'
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
export default ({parameters, reportIsLoading, studentSurveyReport}): JSX.Element => {
  //const [studentSurvey, setStudentSurvey] = useState<any[] | null>(null)
  //const [isLoading, setIsLoading] = useState<boolean>(false)

  if (Array.isArray(studentSurveyReport) && studentSurveyReport.length == 0) 
    return (
      <p>No records to display... Either no results were returned or no query has run.</p>
    )
  else if (!reportIsLoading && !studentSurveyReport || !Array.isArray(studentSurveyReport))
    return (
        <p>An error has been encountered in loading the report.</p>
    )
  else if (reportIsLoading)
    return (
        <p>...Loading</p>
    )

  return (
    <div style={{width: 'fit-content'}}> 
      <Row className='d-flex flex-row justify-content-center m-0'>
        <h4 className='text-center' style={{width: 'fit-content'}}>
          Student Surveys for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
        </h4>
        <Button
            onClick={() => exportToCSV(studentSurveyReport, parameters)}
            style={{width: 'fit-content', height: 'fit-content'}}
            size='sm'
          >
            Save to CSV
          </Button>
      </Row>

      <Row 
        style={{
          maxHeight: '30rem',
          overflowY: 'auto'
        }}
      >
        <Table 
          className='m-0'
          columns={columns} 
          dataset={studentSurveyReport}
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
          tableProps={{
            size: 'sm'
          }}
        />
      </Row>
     
    </div>
  )
}