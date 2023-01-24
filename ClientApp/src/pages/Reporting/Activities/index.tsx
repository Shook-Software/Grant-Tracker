import { useState, useEffect } from 'react'
import { Container, Row, Button } from 'react-bootstrap'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'

import { getActivities } from '../api'
import { saveCSVToFile } from '../fileSaver'

import { Quarter } from 'models/OrganizationYear'

const columns: Column[] = [
  {
    label: 'Activity Type',
    attributeKey: 'activity',
    sortable: true
  },
  {
    label: 'Total Attendees',
    attributeKey: 'totalAttendees',
    sortable: true,
    cellProps: {
      className: 'text-center'
    }
  },
  {
    label: 'Total Hours',
    attributeKey: 'totalHours',
    sortable: true,
    transform: (hours: number) => (
      <div className='text-center'>{Math.floor(hours * 100) / 100}</div>
    ),
    sortTransform: (hours: number) => hours,
  }
]

function exportToCSV(data, parameters) {

  const fields = [
    {
      label: 'Organization',
      value: 'organizationName'
    },
    {
      label: 'Activity Type',
      value: 'activity'
    },
    {
      label: 'Total Attendees',
      value: 'totalAttendees'
    },
    {
      label: 'Total Hours',
      value: 'totalHours',
    }
  ]

  const options: Options<undefined> = { 
    fields, 
    excelStrings: true, 
    header: true
  }

  saveCSVToFile(data, options, `Total_Activity_${parameters.schoolYear?.startDate?.toString()}-${parameters.schoolYear?.endDate?.toString()}`)
}

export default ({parameters, reportIsLoading, activityReport}): JSX.Element => {
  //const [activities, setActivities] = useState<any[] | null>([])

  if (Array.isArray(activityReport) && activityReport.length == 0) 
    return (
      <p>No records to display... Either no results were returned or no query has run.</p>
    )
  else if (!reportIsLoading && !activityReport || !Array.isArray(activityReport))
    return (
        <p>An error has been encountered in loading the report.</p>
    )
  else if (reportIsLoading)
    return (
        <p>...Loading</p>
    )
 
  return (
    <div  style={{width: 'fit-content'}}>
      <Row className='d-flex flex-row justify-content-center m-0'>
        <h4 className='text-center' style={{width: 'fit-content'}}>
          Total Activity for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
        </h4>
        <Button
            onClick={() => exportToCSV(activityReport, parameters)}
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
          dataset={activityReport} 
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
        />
      </Row>
    </div>
  )
}