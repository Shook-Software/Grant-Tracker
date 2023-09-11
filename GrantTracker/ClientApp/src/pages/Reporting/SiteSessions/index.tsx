import { useState, useEffect } from 'react'
import { Container, Row, Button } from 'react-bootstrap'
import { LocalDate } from '@js-joda/core'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'

import { saveCSVToFile } from '../fileSaver'
import { getSiteSessions } from '../api'

import { DateOnly } from 'Models/DateOnly'
import { DayOfWeek } from 'Models/DayOfWeek'


const columns: Column[] = [
  {
    label: 'Name',
    attributeKey: 'sessionName',
    sortable: true
  },
  {
    label: 'Instance Date',
    attributeKey: 'instanceDate',
    sortable: true,
    transform: (date: DateOnly) => DateOnly.toLocalDate(date).toString()
  },
  {
    label: 'Activity\nType',
    attributeKey: 'activityType',
    sortable: true
  },
  {
    label: 'Objective',
    attributeKey: 'objective',
    sortable: true
  },
  {
    label: 'Session\nType',
    attributeKey: 'sessionType',
    sortable: true
  },
  {
    label: 'Funding\nSource',
    attributeKey: 'fundingSource',
    sortable: true
  },
  {
    label: 'Partnership\nType',
    attributeKey: 'partnershipType',
    sortable: true
  },
  {
    label: 'Organization\nType',
    attributeKey: 'organizationType',
    sortable: true
  },
  {
    label: 'Attendee\nCount',
    attributeKey: 'attendeeCount',
    sortable: true,
    cellProps: {className: 'text-center'}
  },
  {
    label: 'Grades',
    attributeKey: 'grades',
    sortable: false,
    transform: (grades: string) => grades == '{}' || grades == '{ }' ? 'N/A' : grades.substring(1, grades.length - 1),
    cellProps: {
      class: 'text-center'
    }
  },
  {
    label: 'Instructors',
    attributeKey: 'instructors',
    sortable: false,
    transform: (instructors: any[]) => (
      <div style={{minWidth: 'fit-content'}}>
        {instructors.map((instructor, index) => (
          <>
            <p className='my-0 px-3'  style={{minWidth: 'fit-content'}}>{instructor.firstName && instructor.lastName ? `${instructor.firstName} ${instructor.lastName}` : 'N/A'}</p>
            {index === instructors.length - 1 ? null : <hr className='m-1'/>}
          </>
        ))}
      </div>
    )
  }
]

function exportToCSV(data, parameters) {
  let flattenedData: any[] = []

  data.forEach(session => {

    if (session.instructors.length !== 0) {
      session.instructors.forEach(i => {
        flattenedData = [
          ...flattenedData,
          {
            organizationName: session.organizationName,
            sessionName: session.sessionName,
            activityType: session.activityType,
            sessionType: session.sessionType,
            objective: session.objective,
            fundingSource: session.fundingSource,
            partnershipType: session.partnershipType,
            organizationType: session.organizationType,
            instructorLastName: i.lastName,
            instructorFirstName: i.firstName,
            instructorStatus: i.status,
            instanceDate: DateOnly.toLocalDate(session.instanceDate).toString(),
            //endDate: DateOnly.toLocalDate(session.endDate).toString(),
            grades: session.grades == '{}' || session.grades == '{ }' ? 'N/A' : session.grades.substring(1, session.grades.length - 1),
            attendeeCount: session.attendeeCount
          }
        ]
      })
    }
    else {
      flattenedData = [
        ...flattenedData,
        {
          organizationName: session.organizationName,
          sessionName: session.sessionName,
          activityType: session.activityType,
          sessionType: session.sessionType,
          objective: session.objective,
          fundingSource: session.fundingSource,
          partnershipType: session.partnershipType,
          organizationType: session.organizationType,
          instructorLastName: '',
          instructorFirstName: '',
          instructorStatus: '',
          instanceDate: DateOnly.toLocalDate(session.instanceDate).toString(),
          //endDate: DateOnly.toLocalDate(session.endDate).toString(),
          grades: session.grades == '{}' || session.grades == '{ }' ? 'N/A' : session.grades.substring(1, session.grades.length - 1),
          attendeeCount: session.attendeeCount
        }
      ]
    }
    
  })

  const fields = [
    {
      label: 'Organization',
      value: 'organizationName'
    },
    {
      label: 'Name',
      value: 'sessionName'
    },
    {
      label: 'Activity Type',
      value: 'activityType'
    },
    {
      label: 'Objective',
      value: 'objective'
    },
    {
      label: 'Funding Source',
      value: 'fundingSource'
    },
    {
      label: 'Partnership Type',
      value: 'partnershipType'
    },
    {
      label: 'Organization Type',
      value: 'organizationType'
    },
    {
      label: 'Instructor Last Name',
      value: 'instructorLastName'
    },
    {
      label: 'Instructor First Name',
      value: 'instructorFirstName'
    },
    {
      label: 'Instructor Status',
      value: 'instructorStatus'
    },
    {
      label: 'Grades',
      value: 'grades'
    },
    {
      label: 'Number of Participants',
      value: 'attendeeCount'
    },
  ]

  const options: Options<undefined> = { 
    fields, 
    excelStrings: true, 
    header: true
  }

  saveCSVToFile(flattenedData, options, `Site_Sessions_${parameters.schoolYear?.startDate?.toString()}-${parameters.schoolYear?.endDate?.toString()}`)
}

//thing is, an instructor may show up multiple times in a category or across categories if the date params bring in two quarters
export default ({parameters, reportIsLoading, siteSessionsReport}): JSX.Element => {
  //const [siteSessions, setSiteSessions] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  if (Array.isArray(siteSessionsReport) && siteSessionsReport.length == 0) 
    return (
      <p>No records to display... Either no results were returned or no query has run.</p>
    )
  else if (!reportIsLoading && !siteSessionsReport || !Array.isArray(siteSessionsReport))
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
          Site Sessions for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
        </h4>
        <Button
            onClick={() => exportToCSV(siteSessionsReport, parameters)}
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
          dataset={siteSessionsReport}
          defaultSort={{index: 1, direction: SortDirection.Ascending}}
          tableProps={{
            size: 'sm',
            style: {
              overflowY: 'scroll',
              overflowX: 'visible'
            }
          }}
        />
      </Row>
     
    </div>
  )
}