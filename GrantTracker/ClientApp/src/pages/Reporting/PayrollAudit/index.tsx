import { useState, useEffect } from 'react'
import { Container, Row, Button, Col, Form } from 'react-bootstrap'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'

import { saveCSVToFile } from '../fileSaver'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'
import { AttendanceTimeRecordView } from 'Models/InstructorAttendance'
import { DateOnly } from 'Models/DateOnly'
import { TimeOnly } from 'Models/TimeOnly'


interface PayrollInstructorAttendanceRecord {
	firstName: string
	lastName: string
	isSubstitute: boolean
	AttendanceTimeRecordView
}

const TimeRecordDisplay = ({timeRecords}: {timeRecords}): JSX.Element => {
	timeRecords = timeRecords
  .map(time => ({ startTime: TimeOnly.toLocalTime(time.startTime), endTime: TimeOnly.toLocalTime(time.endTime)}))
  .sort((first, second) => {
	  if (first.startTime.isBefore(second.startTime))
		  return -1
	  if (first.endTime.isAfter(second.endTime))
      return 1
    return 0
	})
  
	return (
	  <div className='row h-100 align-items-center'>
		{ 
		  timeRecords.map(record => (
			<>
			  <span className='col-6 p-0'>{record.startTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}</span>
			  <span className='col-6 p-0'>{record.endTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}</span>
			</>
		  ))
		}
	  </div>
	)
}


const instructorColumns: Column[] = [
  {
    label: 'First Name',
    attributeKey: 'firstName', 
    headerTransform: () => <th><small>First Name</small></th>,
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'lastName', 
    headerTransform: () => <th><small>Last Name</small></th>,
    sortable: true
  },
  {
    label: 'Sub?',
    attributeKey: 'isSubstitute', 
    headerTransform: () => <th><small>Substitute?</small></th>,
    transform: (isSub: boolean) => isSub ? <span className='text-primary'>Yes</span> : '',
    sortable: true
  },
  {
    label: 'Total Time (m)',
    attributeKey: 'totalTime', 
    headerTransform: () => <th><small>Total Time</small></th>,
    sortable: true
  },
  {
    label: 'Time Records',
    attributeKey: 'timeRecords',
    sortable: false,
    headerTransform: () => (
      <th className=''>
        <div className='d-flex'>
          <div className='w-50'><small>Entered</small></div>
          <div className='w-50'><small>Exited</small></div>
        </div>
      </th>
    ),
    transform: (timeRecord: AttendanceTimeRecordView[]) => <TimeRecordDisplay timeRecords={timeRecord} />
  }
]

const columns: Column[] = [
  {
    label: 'School',
    attributeKey: 'school',
    sortable: true
  },
  {
    label: 'Class',
    attributeKey: 'className',
    sortable: true
  },
  {
    label: 'Date',
    attributeKey: 'instanceDate',
    transform: (date: DateOnly) => DateOnly.toLocalDate(date).toString(),
    sortable: true
  },
  {
    label: 'Instructors',
    attributeKey: 'instructorRecords',
    sortable: true,
    transform: (records) => {
      return (
        <Table columns={instructorColumns} dataset={records} bordered={false} className='m-0 border-0' />
      )
    },
    cellProps: {
      className: 'p-0 text-center'
    }
  }
]

function exportToCSV(data, parameters) {

  const fields = [
    {
      label: 'Organization',
      value: 'school'
    },
    {
      label: 'Class Name',
      value: 'className'
    },
    {
      label: 'First Name',
      value: 'firstName'
    },
    {
		  label: 'Time Records',
		  attributeKey: 'timeRecords',
		  sortable: false,
		  headerTransform: () => (
        <th className='d-flex flex-wrap'>
          <span className='w-100 text-center'>Time Records</span>
          <span className='w-50 text-center'>Entered at:</span>
          <span className='w-50 text-center'>Exited at:</span>
        </th>
		  ),
		  transform: (timeRecord: AttendanceTimeRecordView[]) => <TimeRecordDisplay timeRecords={timeRecord} />,
		  cellProps: {className: 'py-1'},
    },
    {
      label: 'Matric Number',
      value: 'matricNumber'
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

  saveCSVToFile(data, options, `Payroll_Audit_${parameters.schoolYear?.startDate?.toString()}-${parameters.schoolYear?.endDate?.toString()}`)
}

export default ({parameters, reportIsLoading, payrollAuditReport}): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>('')

  if (Array.isArray(payrollAuditReport) && payrollAuditReport.length == 0) 
    return (
      <p>No records to display... Either no results were returned or no query has run.</p>
    )
  else if (!reportIsLoading && !payrollAuditReport || !Array.isArray(payrollAuditReport))
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
          Payroll Audit Report for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
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

      <Row 
        style={{
          maxHeight: '45rem',
          overflowY: 'auto'
        }}
      >
        <Table 
          className='m-0'
          columns={columns} 
          dataset={payrollAuditReport.filter(e => e.className.toLocaleLowerCase().includes(searchTerm))}
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
          tableProps={{style: {minWidth: '1100px', borderCollapse: 'collapse', borderSpacing: '0 3px'}}}
          rowProps={{ className: 'my-1' }}
        />
      </Row>
    </div>
  )
}