import { useState, useEffect } from 'react'
import { Container, Row, Button } from 'react-bootstrap'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'

import { getFamilyAttendance } from '../api'
import { saveCSVToFile } from '../fileSaver'
import FamilyMember from 'Models/FamilyMember'


const familyMemberColumns: Column[] = [
  {
    label: 'Family Member',
    attributeKey: 'familyMember',
    sortable: true,
    transform: (familyMember) => FamilyMember.toString(familyMember),
    sortTransform: (familyMember) => FamilyMember.toString(familyMember)
  },
  {
    label: 'Total Days',
    attributeKey: 'totalDays',
    sortable: true
  },
  {
    label: 'Total Hours',
    attributeKey: 'totalHours',
    sortable: true,
    transform: (hours) => Math.floor(hours * 10) / 10
  },
]

const columns: Column[] = [
  {
    label: 'Last Name',
    attributeKey: 'student.lastName',
    sortable: true
  },
  {
    label: 'First Name',
    attributeKey: 'student.firstName',
    sortable: true
  },
  {
    label: 'Grade',
    attributeKey: 'student.grade',
    sortable: true
  },
  {
    label: 'Matric Number',
    attributeKey: 'student.matricNumber',
    sortable: true
  },
  {
    label: 'Family Member',
    attributeKey: 'familyAttendance',
    sortable: false,
    cellProps: {className: 'p-0'},
    transform: (familyAttendance) => (
      <Table 
        columns={familyMemberColumns} 
        dataset={familyAttendance} 
        defaultSort={{index: 0, direction: SortDirection.Ascending}}
        tableProps={{
          size: 'sm',
          className: 'm-0'
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
        firstName: x.student.firstName,
        lastName: x.student.lastName,
        grade: x.student.grade,
        matricNumber: x.student.matricNumber,
        familyMember: FamilyMember.toString(fa.familyMember),
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

export default ({parameters}): JSX.Element => {
  const [generatedAt, setGeneratedAt] = useState(null)
  const [familyAttendance, setFamilyAttendance] = useState<any[] | null>(null) 
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)

    getFamilyAttendance(parameters.schoolYear?.startDate, parameters.schoolYear?.endDate, parameters.orgGuid)
      .then(res => {
        setGeneratedAt(res.generatedAt)
        setFamilyAttendance(res.data)
      })
      .catch(err => {
        console.warn(err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [parameters])

  if (isLoading)
    return <p>...Loading</p>

  if (!familyAttendance)
    return <p>An error occured in fetching results, please reload the page or file a report if the issue persists.</p>

  return (
    <Container>
      <Row className='d-flex flex-row justify-content-center m-0'>
        <h4 className='text-center' style={{width: 'fit-content'}}>
          Family Attendance for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
        </h4>
        <Button
            onClick={() => exportToCSV(familyAttendance, parameters)}
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
          dataset={familyAttendance}
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
          tableProps={{
            size: 'sm'
          }}
        />
      </Row>
    </Container>
  )
}