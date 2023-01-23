import { useState, useEffect } from 'react'
import { Container, Row, Button } from 'react-bootstrap'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'

import { getProgramOverview } from '../api'
import { saveCSVToFile } from '../fileSaver'

const columns: Column[] = [
  {
    label: 'Organization Name',
    attributeKey: 'organizationName',
    sortable: true
  },
  {
    label: '# of\nRegular Students',
    attributeKey: 'regularStudentCount',
    sortable: true,
    transform: (attendees: number) => (
      <div className='text-center'>{attendees}</div>
    ),
    headerProps: {
      className: 'text-center'
    }
  },
  {
    label: '# of\nFamily Attendees',
    attributeKey: 'familyAttendanceCount',
    sortable: true,
    transform: (attendees: number) => (
      <div className='text-center'>{attendees}</div>
    ),
    headerProps: {
      className: 'text-center'
    }
  },
  {
    label: 'Avg Attendance\nDays Per Week',
    attributeKey: 'avgStudentAttendDaysPerWeek',
    sortable: true,
    transform: (days: number) => (
      <div className='text-center'>{Math.floor(days * 10) / 10}</div>
    )
  },
  {
    label: 'Avg Attendance\nHours Per Week',
    attributeKey: 'avgStudentAttendHoursPerWeek',
    sortable: true,
    transform: (hours: number) => (
      <div className='text-center'>{Math.floor(hours * 10) / 10}</div>
    )
  }
]

function exportToCSV(data, parameters) {

  const fields = [
    {
      label: 'Organization Name',
      value: 'organizationName'
    },
    {
      label: '# of Regular Students',
      value: 'regularStudentCount'
    },
    {
      label: '# of Family Attendees',
      value: 'familyAttendanceCount',
    },
    {
      label: 'Avg Student Attendance Days Per Week',
      value: 'avgStudentAttendDaysPerWeek'
    },
    {
      label: 'Avg Student Attendance Hours Per Week',
      value: 'avgStudentAttendHoursPerWeek'
    }
  ]

  const options: Options<undefined> = { 
    fields, 
    excelStrings: true, 
    header: true
  }

  saveCSVToFile(data, options, `Program_Overview_${parameters.schoolYear?.startDate?.toString()}-${parameters.schoolYear?.endDate?.toString()}`)
}

//thing is, an instructor may show up multiple times in a category or across categories if the date params bring in two quarters
export default ({parameters, reportIsLoading, programOverviewReport}): JSX.Element => {
  //const [programOverview, setProgramOverview] = useState<any[] | null>(null)
  //const [isLoading, setIsLoading] = useState<boolean>(false)

  if (Array.isArray(programOverviewReport) && programOverviewReport.length == 0) 
    return (
      <p>No records to display... Either no results were returned or no query has run.</p>
    )
  else if (!reportIsLoading && !programOverviewReport || !Array.isArray(programOverviewReport))
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
          Program Overview for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
        </h4>
        <Button
            onClick={() => exportToCSV(programOverviewReport, parameters)}
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
          dataset={programOverviewReport}
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
          tableProps={{
            size: 'sm'
          }}
        />
      </Row>
    </div>
  )
}