import { useState, useEffect } from 'react'
import { Container, Row, Button } from 'react-bootstrap'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'

import { saveCSVToFile } from '../fileSaver'
import FamilyMember from 'Models/FamilyMember'


const familyMemberColumns: Column[] = [
  {
    label: '',
    attributeKey: 'familyMember',
    sortable: true,
    cellProps: {
      class: 'px-2',
      style: {
        width: '50%'
      }
    }
  },
  {
    label: '',
    attributeKey: 'totalDays',
    sortable: true,
    transform: (days) => <div>{Math.floor(days * 100) / 100}</div>,
    sortTransform: (days) => days,
    headerProps: {
      class: 'text-center'
    },
    cellProps: {
      class: 'text-center px-2',
      style: {
        width: '25%'
      }
    }
  },
  {
    label: '',
    attributeKey: 'totalHours',
    sortable: true,
    transform: (hours) => <div >{Math.floor(hours * 100) / 100}</div>,
    sortTransform: (hours) => hours,
    headerProps: {
      class: 'text-center'
    },
    cellProps: {
      class: 'text-center px-2',
      style: {
        width: '25%'
      }
    }
  },
]

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
    label: 'Family Member',
    attributeKey: 'familyAttendance',
    sortable: false,
    cellProps: {className: 'p-0'},
    headerTransform: () => (
      <div className='d-flex p-0 align-items-end' style={{minWidth: 'fit-content'}}>
        <div className='px-2' style={{width: '50%'}}><b>Family Member</b></div>
        <div className='px-2 text-center' style={{width: '25%'}}><b>Total Days</b></div>
        <div className='px-2 text-center' style={{width: '25%'}}><b>Total Hours</b></div>
      </div>
    ),
    transform: (familyAttendance) => (
      <Table 
        columns={familyMemberColumns} 
        dataset={familyAttendance} 
        defaultSort={{index: 0, direction: SortDirection.Ascending}}
        showHeader={false}
        tableProps={{
          size: 'sm',
          className: 'm-0',
          bordered: false,
          style: {
            border: '0px'
          }
        }}
      />
    )
  }
]


function exportToCSV(data, parameters) {
  let flattenedData: any[] = []

  data.forEach(x => {
    flattenedData = [
      ...flattenedData,
      ...x.familyAttendance.map(fa => ({
        organizationName: x.organizationName,
        firstName: x.firstName,
        lastName: x.lastName,
        grade: x.grade,
        matricNumber: x.matricNumber,
        familyMember: fa.familyMember,
        totalDays: fa.totalDays,
        totalHours: fa.totalHours
      }))
    ]
  })

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
      label: 'Family Member',
      value: 'familyMember'
    },
    {
      label: 'Total Days',
      value: 'totalDays'
    },
    {
      label: 'Total Hours',
      value: 'totalHours'
    }
  ]

  const options: Options<undefined> = { 
    fields, 
    excelStrings: true, 
    header: true
  }

  saveCSVToFile(flattenedData, options, `Family_Attendance_${parameters.schoolYear?.startDate?.toString()}-${parameters.schoolYear?.endDate?.toString()}`)
}

export default ({parameters, reportIsLoading, familyAttendanceReport}): JSX.Element => {
  //const [familyAttendance, setFamilyAttendance] = useState<any[] | null>([]) 

  if (Array.isArray(familyAttendanceReport) && familyAttendanceReport.length == 0) 
    return (
      <p>No records to display... Either no results were returned or no query has run.</p>
    )
  else if (!reportIsLoading && !familyAttendanceReport || !Array.isArray(familyAttendanceReport))
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
          Family Attendance for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
        </h4>
        <Button
            onClick={() => exportToCSV(familyAttendanceReport, parameters)}
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
          dataset={familyAttendanceReport}
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
          tableProps={{
            size: 'sm'
          }}
        />
      </Row>
    </div>
  )
}