import { useState, useEffect } from 'react'
import { Container, Row, Button } from 'react-bootstrap'
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

      <Row 
        style={{
          maxHeight: '30rem',
          overflowY: 'auto'
        }}
      >
        <Table 
          className='m-0'
          columns={columns} 
          dataset={studentAttendanceReport}
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
        />
      </Row>
    </div>
  )
}