import { useState } from 'react'
import { Button, Container, ListGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { DateTimeFormatter, LocalDate } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import Table, { Column, SortDirection } from 'components/BTable'

import { DayScheduleView } from 'Models/DaySchedule'
import { TimeSchedule, TimeScheduleView } from 'Models/TimeSchedule'
import { StudentRegistrationView } from 'Models/StudentRegistration'
import { SessionView } from 'Models/Session'

interface Props {
  registrations: StudentRegistrationView[]
}

const columns: Column[] = [
  {
    label: 'Session',
    attributeKey: '',
    sortable: true,
    transform: (value: StudentRegistrationView): JSX.Element => (
      <Link to={`/home/admin/sessions/${value.sessionGuid}`}>
        {value.sessionName}
      </Link>
    )
  },
  {
    label: 'Day of Week',
    attributeKey: 'daySchedule.dayOfWeek',
    sortable: true
  },
  {
    label: 'Schedule',
    attributeKey: 'daySchedule',
    sortable: false,
    transform: (value: DayScheduleView): JSX.Element => (
      <>
        {value.timeSchedules?.map(schedule => (
          <p className='m-1'>
            {`${schedule.startTime.format(
              DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH)
            )} to ${schedule.endTime.format(
              DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH)
            )}`}
          </p>
        ))}
      </>
    )
  }
]

function getWeekBounds (firstDay: LocalDate): string {
  let lastDay: LocalDate = firstDay.plusDays(6)
  let firstDayNumeric: number = firstDay.dayOfYear()
  let lastDayNumeric: number = lastDay.dayOfYear()

  return `
    ${LocalDate.ofYearDay(firstDay.year(), firstDayNumeric).format(
      DateTimeFormatter.ofPattern('MM/dd').withLocale(Locale.ENGLISH)
    )}
    to 
    ${LocalDate.ofYearDay(lastDay.year(), lastDayNumeric).format(
      DateTimeFormatter.ofPattern('MM/dd').withLocale(Locale.ENGLISH)
    )}
  `
}

function setStartingDate (): LocalDate {
  let today: LocalDate = LocalDate.now()
  return today.minusDays(today.dayOfWeek().value())
}

export default ({ registrations }: Props): JSX.Element => {
  const [weekStartDate, setWeekStartDate] = useState<LocalDate>(
    setStartingDate()
  )

  function setWeekPrevious (): void {
    setWeekStartDate(weekStartDate.minusWeeks(1))
  }

  function setWeekNext (): void {
    setWeekStartDate(weekStartDate.plusWeeks(1))
  }

  function getScheduleForWeek (): void {
    //Waiting upon the weekend to do a database revision
  }

  return (
    <>
      <h3 className='mt-3'>Registrations</h3>
      <div className='d-flex align-items-center pb-3'>
        <Button
          variant='outline-dark'
          size='sm'
          onClick={() => setWeekPrevious()}
        >
          Prev
        </Button>
        <div className='mx-3'>{getWeekBounds(weekStartDate)}</div>
        <Button variant='outline-dark' size='sm' onClick={() => setWeekNext()}>
          Next
        </Button>
      </div>
      <Container>
        <Table
          columns={columns}
          dataset={registrations}
          defaultSort={{ index: 0, direction: SortDirection.Ascending }}
        />
      </Container>
    </>
  )
}
