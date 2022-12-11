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
    label: 'Grade',
    attributeKey: 'grade',
    sortable: true
  },
  {
    label: 'Matric Number',
    attributeKey: 'matricNumber',
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

export default ({parameters}): JSX.Element => {
  const [generatedAt, setGeneratedAt] = useState(null)
  const [studentAttendance, setStudentAttendance] = useState<any[]>([])

  useEffect(() => {
    getStudentAttendance(parameters.schoolYear?.startDate, parameters.schoolYear?.endDate, parameters.orgGuid)
      .then(res => {
        setGeneratedAt(res.generatedAt)
        setStudentAttendance(res.data)
      })
  }, [parameters])

  return (
    <Container>
      <Row className='d-flex flex-row justify-content-center m-0'>
        <h4 className='text-center' style={{width: 'fit-content'}}>
          Total Student Attendance for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
        </h4>
        <Button
            onClick={() => exportToCSV(studentAttendance, parameters)}
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
          dataset={studentAttendance} 
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
        />
      </Row>
    </Container>
  )
}