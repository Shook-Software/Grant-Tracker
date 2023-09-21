import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'
import Dropdown from 'components/Input/Dropdown'

import { saveCSVToFile } from '../fileSaver'

import { Quarter } from 'models/OrganizationYear'
import { DateOnly } from 'Models/DateOnly'
import { TimeOnly } from 'Models/TimeOnly'
import { DateTimeFormatter, LocalDate } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

const TimeRecordDisplay = ({timeRecords}: {timeRecords}): JSX.Element => {
	timeRecords = timeRecords
    .sort((first, second) => {
      if (first.startTime.isBefore(second.startTime))
        return -1
      if (first.endTime.isAfter(second.endTime))
        return 1
      return 0
    })
  
	return (
	  <div className='row'>
		{ 
		  timeRecords.map(record => (
			<>
			  <span className='col-6 p-0 text-center'>{record.startTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}</span>
			  <span className='col-6 p-0 text-center'>{record.endTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}</span>
			</>
		  ))
		}
	  </div>
	)
}

const attendanceColumns: Column[] = [
	{
		label: 'School',
		attributeKey: 'school',
		sortable: false
	},
	{
		label: 'Class',
		attributeKey: 'className',
		sortable: false
	},
  {
    label: 'Weekday',
    attributeKey: 'instanceDate',
    transform: (date: LocalDate) => date.format(DateTimeFormatter.ofPattern('eeee').withLocale(Locale.ENGLISH)),
    sortable: false
  },
	{
		label: 'Date',
		attributeKey: 'instanceDate',
		transform: (date: LocalDate) => date.toString(),
		sortable: false
	},
  {
    label: 'Time Bounds',
    attributeKey: 'timeBounds',
    transform: (bounds) => <TimeRecordDisplay timeRecords={bounds} />,
    sortable: false
  },
	{
		label: 'Instructors',
		attributeKey: 'instructors',
    transform: (instructors) => <>{instructors.map(i => <div className='d-flex justify-content-around'><span>{i.firstName}</span> &nbsp; <span>{i.lastName}</span></div>)}</>,
		sortable: false
	},
	{
		label: 'Entry?',
		attributeKey: 'attendanceEntry',
    cellProps: { className: 'text-center'},
    transform: (attendanceEntry: boolean) => attendanceEntry ? <span className='text-success fw-bold'>Y</span> : <span className='text-danger fw-bold'>N</span>,
		sortable: false
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
export default ({parameters, reportIsLoading, attendanceCheckReport }): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>('')

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

    attendanceCheckReport = attendanceCheckReport.map(x => ({
    ...x,
    instanceDate: DateOnly.toLocalDate(x.instanceDate),
    timeBounds: x.timeBounds.map(t => ({
      startTime: TimeOnly.toLocalTime(t.startTime),
      endTime: TimeOnly.toLocalTime(t.endTime)
    }))
  }))

  return (
    <div style={{width: 'fit-content'}}>
      <Row className='d-flex flex-row justify-content-center'>
        <h4 className='text-center' style={{width: 'fit-content'}}>
          Attendance Check for {`${parameters.schoolYear?.year} ${Quarter[parameters.schoolYear?.quarter]}`}
        </h4>
      </Row>

      <Row>
        <Col md={3} className='p-0'>
          <Form.Control 
            type='text' 
            className='border-bottom-0'
            placeholder='Filter sessions...'
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value.toLocaleLowerCase())}
            style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
          />
        </Col>
      </Row>

      <Row class='d-flex flex-row'>

        <div
          style={{
            maxHeight: '45rem',
            overflowY: 'auto',
            padding: 0
          }}
        >
          <Table 
            className='m-0'
            columns={attendanceColumns} 
            dataset={attendanceCheckReport.filter(e => e.className.toLocaleLowerCase().includes(searchTerm))}
            defaultSort={{index: 0, direction: SortDirection.Ascending}}
            tableProps={{
              size: 'sm',
              style: {minWidth: '1100px'}
            }}
          />
        </div>
      </Row>
    </div>
  )
}