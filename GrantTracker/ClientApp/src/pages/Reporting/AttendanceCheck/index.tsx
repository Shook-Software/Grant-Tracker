import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'
import Dropdown from 'components/Input/Dropdown'

import { getStaffSummary } from '../api'
import { saveCSVToFile } from '../fileSaver'

import { Quarter } from 'models/OrganizationYear'
import { DateOnly } from 'Models/DateOnly'



const attendanceColumns: Column[] = [
	{
		label: 'Day of Week',
		attributeKey: 'dayOfWeek',
		sortable: false
	},
	{
		label: 'Date',
		attributeKey: 'instanceDate',
		sortable: false,
		transform: (date: DateOnly) => DateOnly.toLocalDate(date).toString()
	},
	{
		label: 'School',
		attributeKey: 'school',
		sortable: true
	},
	{
		label: '',
		attributeKey: '',
		sortable: false
	},
	{
		label: '',
		attributeKey: '',
		sortable: false
	}
	{
		label: '',
		attributeKey: '',
		sortable: false
	}
]

const instructorColumns: Column[] = [
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
    label: '',
    attributeKey: 'instructorSchoolYearGuid',
    sortable: false,
    transform: (guid: string) => (
      <div className='d-flex justify-content-center'>
        <Button size='sm' href={`/home/admin/staff/${guid}`}>View</Button>
      </div>
    )
  }
]

function exportToCSV(data, parameters) {
  let flattenedData: any[] = []

  data.forEach(statusGroup => {
    flattenedData = [
      ...flattenedData, 
      ...statusGroup.instructors.map(i => ({
        organizationName: i.organizationName,
        status: statusGroup.status,
        firstName: i.firstName,
        lastName: i.lastName
      }))
    ]
  })

  const fields = [
    {
      label: 'Organization',
      value: 'organizationName'
    },
    {
      label: 'Status',
      value: 'status'
    },
    {
      label: 'Last Name',
      value: 'lastName'
    },
    {
      label: 'First Name',
      value: 'firstName'
    }
  ]

  const options: Options<undefined> = { 
    fields, 
    excelStrings: true, 
    header: true
  }

  saveCSVToFile(flattenedData, options, `Staffing_${parameters.schoolYear.year}_${Quarter[parameters.schoolYear.quarter]}`)
}

//thing is, an instructor may show up multiple times in a category or across categories if the date params bring in two quarters
export default ({parameters, reportIsLoading, attendanceCheckReport, attendanceCheckSessions}): JSX.Element => {
  //const [summary, setSummary] = useState<any[] | null>(null)
	const [activeSessionGuid, setSessionGuid] = useState<string>('')
	const [dropdownOptions, setDropdownOptions] = useState<any[] | null>([])
  //const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (Array.isArray(attendanceCheckSessions) && attendanceCheckSessions.length > 0) {
		setSessionGuid(attendanceCheckSessions[0].sessionGuid)
      	setDropdownOptions(attendanceCheckSessions)
    }
  }, [attendanceCheckSessions])

  if (Array.isArray(attendanceCheckReport) && attendanceCheckReport.length == 0) 
    return (
      <p>No records to display... Either no results were returned or no query has run.</p>
    )
  else if (!reportIsLoading && !attendanceCheckReport || !Array.isArray(attendanceCheckReport))
    return (
        <p>An error has been encountered in loading the report.</p>
    )
  else if (reportIsLoading)
    return (
        <p>...Loading</p>
    )

  return (
    <div style={{width: 'fit-content'}}>
      <Row className='d-flex flex-row justify-content-center'>
        <h4 className='text-center' style={{width: 'fit-content'}}>
          Attendance Check for {`${parameters.schoolYear?.year} ${Quarter[parameters.schoolYear?.quarter]}`}
        </h4>
        <Button
            onClick={() => exportToCSV(attendanceCheckReport, parameters)}
            style={{width: 'fit-content', height: 'fit-content'}}
            size='sm'
          >
            Save to CSV
          </Button>
      </Row>

      <Row class='d-flex flex-row'>

        <Form.Group className='mb-3'>
          <Form.Label>Session</Form.Label>
          <Dropdown  
            value={activeSessionGuid}
            options={dropdownOptions}
            onChange={(status: string) => setSessionGuid(status)}
          />
        </Form.Group>

        <div
          style={{
            maxHeight: '30rem',
            overflowY: 'auto'
          }}
        >
          <Table 
            className='m-0'
            columns={instructorColumns} 
            dataset={attendanceCheckReport.find(statusGroup => statusGroup.status === activeSessionGuid)?.instructors}
            defaultSort={{index: 0, direction: SortDirection.Ascending}}
            tableProps={{
              size: 'sm'
            }}
          />
        </div>
      </Row>
    </div>
  )
}