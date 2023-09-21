import { useState, useEffect } from 'react'
import { Container, Row, Button, Col, Form } from 'react-bootstrap'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'

import { getStudentAttendance } from '../api'
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
    label: 'Matric Number',
    attributeKey: 'matricNumber',
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
    label: 'Total Days',
    attributeKey: 'totalDays',
    sortable: true,
    transform: (days: number) => (
      <div className='text-center'>{Math.floor(days * 100) / 100}</div>
    ),
    sortTransform: (days: number) => days,
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
    cellProps: {
      className: 'text-center'
    }
  },
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

  saveCSVToFile(data, options, `Student_Attendance_${parameters.schoolYear?.startDate?.toString()}-${parameters.schoolYear?.endDate?.toString()}`)
}

export default ({parameters, reportIsLoading, studentAttendanceReport}): JSX.Element => {
  const [minDaysFilter, setMinDaysFilter] = useState<number>(0)

  if (Array.isArray(studentAttendanceReport) && studentAttendanceReport.length == 0) 
    return (
      <p>No records to display... Either no results were returned or no query has run.</p>
    )
  else if (!reportIsLoading && !studentAttendanceReport || !Array.isArray(studentAttendanceReport))
    return (
        <p>An error has been encountered in loading the report.</p>
    )
  else if (reportIsLoading)
    return (
        <p>...Loading</p>
    )

  const attendance = studentAttendanceReport.filter(x => x.totalDays >= minDaysFilter);

  return (
    <div style={{width: 'fit-content'}}>
      <Row className='d-flex flex-row justify-content-center m-0'>
        <h4 className='text-center' style={{width: 'fit-content'}}>
          Total Student Attendance for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
        </h4>
        <Button
            onClick={() => exportToCSV(studentAttendanceReport, parameters)}
            style={{width: 'fit-content', height: 'fit-content'}}
            size='sm'
          >
            Save to CSV
          </Button>
      </Row>

    <Row>
      <Col md={3} className='p-0'>
        <Form.Control 
          type='number' 
          className='border-bottom-0'
          placeholder='Minimum days...'
          value={minDaysFilter} 
          onChange={(e) => setMinDaysFilter(e.target.value)}
          style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
        />
      </Col>
      <Col md={6}>
        <span className='ms-1'># of students over {minDaysFilter} days: <b>{attendance.length}</b> </span>
      </Col>
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
          dataset={attendance}
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
        />
      </Row>
    </div>
  )
}