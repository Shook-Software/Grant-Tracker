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

export default ({parameters}): JSX.Element => {
  const [generatedAt, setGeneratedAt] = useState(null)
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    getActivities(parameters.schoolYear?.startDate, parameters.schoolYear?.endDate, parameters.orgGuid)
      .then(res => {
        setGeneratedAt(res.generatedAt)
        setActivities(res.data)
      })
  }, [parameters])

  console.log(activities)

  return (
    <Container>
      <Row className='d-flex flex-row justify-content-center m-0'>
        <h4 className='text-center' style={{width: 'fit-content'}}>
          Total Activity for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
        </h4>
        <Button
            onClick={() => exportToCSV(activities, parameters)}
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
          dataset={activities} 
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
        />
      </Row>
    </Container>
  )
}