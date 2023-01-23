import { useState, useEffect } from 'react'
import { Container, Row, Button } from 'react-bootstrap'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'

import { saveCSVToFile } from '../fileSaver'
import { getSummaryOfClasses } from '../api'

import { DateOnly } from 'Models/DateOnly'
import { DayOfWeek } from 'Models/DayOfWeek'


const columns: Column[] = [
  {
    label: 'Name',
    attributeKey: 'sessionName',
    sortable: true
  },
  {
    label: 'Activity Type',
    attributeKey: 'activityType',
    sortable: true
  },
  {
    label: 'Funding Source',
    attributeKey: 'fundingSource',
    sortable: true
  },
  {
    label: 'Start Date',
    attributeKey: 'firstSession',
    sortable: true,
    transform: (date: DateOnly) => DateOnly.toLocalDate(date).format(DateTimeFormatter.ofPattern('MMMM d, yyyy').withLocale(Locale.ENGLISH))
  },
  {
    label: 'End Date',
    attributeKey: 'lastSession',
    sortable: true,
    transform: (date: DateOnly) => DateOnly.toLocalDate(date).format(DateTimeFormatter.ofPattern('MMMM d, yyyy').withLocale(Locale.ENGLISH))
  },
  {
    label: 'Instructors',
    attributeKey: 'instructors',
    sortable: false,
    transform: (instructors: any[]) => (
      <div style={{minWidth: 'fit-content'}}>
        {instructors.map((instructor, index) => (
          <>
            <p className='my-0 px-3' style={{minWidth: 'fit-content'}}>{instructor.firstName && instructor.lastName ? `${instructor.firstName} ${instructor.lastName}` : 'N/A'}</p>
            {index === instructors.length - 1 ? null : <hr className='m-1'/>}
          </>
        ))}
      </div>
    )
  },
  {
    label: 'Weeks to Date',
    attributeKey: 'weeksToDate',
    sortable: true,
    transform: (weeks: number) => (
      <div className='text-center'>{Math.floor(weeks * 10) / 10}</div>
    ),
    sortTransform: (weeks: number) => weeks
  },
  {
    label: 'Avg Hours Per Day',
    attributeKey: 'avgHoursPerDay',
    sortable: true,
    transform: (hours: number) => (
      <div className='text-center'>{Math.floor(hours * 10) / 10}</div>
    ),
    sortTransform: (hours: number) => hours
  },
  {
    label: 'Avg Attendees',
    attributeKey: 'avgDailyAttendance',
    sortable: true,
    transform: (count: number) => (
      <div className='text-center'>{Math.floor(count * 10) / 10}</div>
    ),
    sortTransform: (count: number) => count
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
            fundingSource: session.fundingSource,
            instructorLastName: i.lastName,
            instructorFirstName: i.firstName,
            instructorStatus: i.status,
            startDate: DateOnly.toLocalDate(session.startDate).toString(),
            endDate: DateOnly.toLocalDate(session.endDate).toString(),
            weeksToDate: session.weeksToDate,
            daysOfWeek: session.daysOfWeek.map(day => `${DayOfWeek.toChar(day)}`).toString(),
            avgDailyAttendance: session.avgDailyAttendance,
            avgHoursPerDay: session.avgHoursPerDay
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
          fundingSource: session.fundingSource,
          instructorLastName: '',
          instructorFirstName: '',
          instructorStatus: '',
          startDate: DateOnly.toLocalDate(session.startDate).toString(),
          endDate: DateOnly.toLocalDate(session.endDate).toString(),
          weeksToDate: session.weeksToDate,
          daysOfWeek: session.daysOfWeek.map(day => `${DayOfWeek.toChar(day)}`).toString(),
          avgDailyAttendance: session.avgDailyAttendance,
          avgHoursPerDay: session.avgHoursPerDay
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
      label: 'Session Name',
      value: 'sessionName'
    },
    {
      label: 'Activity Type',
      value: 'activityType'
    },
    {
      label: 'Funding Source',
      value: 'fundingSource'
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
      label: 'Start Date',
      value: 'startDate'
    },
    {
      label: 'End Date',
      value: 'endDate'
    },
    {
      label: 'Weeks to Date',
      value: 'weeksToDate'
    },
    {
      label: 'Days of Week',
      value: 'daysOfWeek'
    },
    {
      label: 'Average Daily Attendance',
      value: 'avgDailyAttendance'
    },
    {
      label: 'Average Hours per Day',
      value: 'avgHoursPerDay'
    }
  ]

  const options: Options<undefined> = { 
    fields, 
    excelStrings: true, 
    header: true
  }

  saveCSVToFile(flattenedData, options, `Summary_of_Classes_${parameters.schoolYear?.startDate?.toString()}-${parameters.schoolYear?.endDate?.toString()}`)
}

//thing is, an instructor may show up multiple times in a category or across categories if the date params bring in two quarters
export default ({parameters, reportIsLoading, summaryOfClassesReport}): JSX.Element => {
  //const [summary, setSummary] = useState<any[] | null>(null)
  //const [isLoading, setIsLoading] = useState<boolean>(false)

  if (Array.isArray(summaryOfClassesReport) && summaryOfClassesReport.length == 0) 
    return (
      <p>No records to display... Either no results were returned or no query has run.</p>
    )
  else if (!reportIsLoading && !summaryOfClassesReport || !Array.isArray(summaryOfClassesReport))
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
          Summary of Classes for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
        </h4>
        <Button
            onClick={() => exportToCSV(summaryOfClassesReport, parameters)}
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
          dataset={summaryOfClassesReport}
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
          tableProps={{
            size: 'sm'
          }}
        />
      </Row>
     
    </div>
  )
}