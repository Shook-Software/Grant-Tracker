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
    label: 'Activity\nType',
    attributeKey: 'activityType',
    sortable: true
  },
  {
    label: 'Funding\nSource',
    attributeKey: 'fundingSource',
    sortable: true
  },
  {
    label: 'Instructors',
    attributeKey: 'instructors',
    sortable: false,
    transform: (instructors: any[]) => (
      <div style={{minWidth: 'fit-content'}}>
        {instructors.map((instructor, index) => (
          <>
            <div style={{minWidth: 'fit-content'}}>{`${instructor.firstName} ${instructor.lastName}`}</div>
            {index === instructors.length - 1 ? null : <hr className='m-1'/>}
          </>
        ))}
      </div>
    )
  },
  {
    label: 'Start Date',
    attributeKey: 'startDate',
    sortable: true,
    transform: (date: DateOnly) => DateOnly.toLocalDate(date).format(DateTimeFormatter.ofPattern('MMMM d, yyyy').withLocale(Locale.ENGLISH))
  },
  {
    label: 'End Date',
    attributeKey: 'endDate',
    sortable: true,
    transform: (date: DateOnly) => DateOnly.toLocalDate(date).format(DateTimeFormatter.ofPattern('MMMM d, yyyy').withLocale(Locale.ENGLISH))
  },
  {
    label: 'Weeks\nto Date',
    attributeKey: 'weeksToDate',
    sortable: true,
    transform: (weeks: number) => (
      <div className='text-center'>{Math.floor(weeks * 10) / 10}</div>
    )
  },
  {
    label: 'Avg\nHours\nPer Day',
    attributeKey: 'avgHoursPerDay',
    sortable: true,
    transform: (hours: number) => (
      <div className='text-center'>{Math.floor(hours * 10) / 10}</div>
    )
  },
  {
    label: 'Avg\nAttendees',
    attributeKey: 'avgDailyAttendance',
    sortable: true,
    transform: (count: number) => (
      <div className='text-center'>{Math.floor(count * 10) / 10}</div>
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
export default ({parameters}): JSX.Element => {
  const [summary, setSummary] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)

    getSummaryOfClasses(parameters.schoolYear?.startDate, parameters.schoolYear?.endDate, parameters.orgGuid)
      .then(res => {
        setSummary(res)
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

  if (!summary)
    return <p>An error occured in fetching results, please reload the page or file a report if the issue persists.</p>

  return (
    <Container>
      <Row className='d-flex flex-row justify-content-center'>
        <h4 className='text-center' style={{width: 'fit-content'}}>
          Summary of Classes for {`${parameters.schoolYear?.startDate?.toString()} to ${parameters.schoolYear?.endDate?.toString()}`}
        </h4>
        <Button
            onClick={() => exportToCSV(summary, parameters)}
            style={{width: 'fit-content', height: 'fit-content'}}
            size='sm'
          >
            Save to CSV
          </Button>
      </Row>

      <Row 
        style={{
          maxHeight: '25rem',
          overflowX: 'visible'
        }}
      >
        <Table 
          className='m-0'
          columns={columns} 
          dataset={summary}
          defaultSort={{index: 0, direction: SortDirection.Ascending}}
          tableProps={{
            size: 'sm',
            style: {
              overflowY: 'scroll',
              overflowX: 'visible'
            }
          }}
        />
      </Row>
     
    </Container>
  )
}