import { useState } from 'react'
import { Form, InputGroup, ListGroup } from 'react-bootstrap'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import Table, { Column } from 'components/BTable'
import ListItem from 'components/Item'

import { DaySchedule, DayScheduleDomain, DayScheduleView } from 'Models/DaySchedule'
import { Input } from 'components/TimeRangeSelector/types'
import { DayOfWeek } from 'Models/DayOfWeek'

const enrollmentColumns: Column[] = [
  {
    label: 'Name',
    attributeKey: 'sessionName',
    sortable: true
  },
  {
    label: 'Scheduling',
    attributeKey: 'schedule',
    sortable: false,
    transform: (scheduleDomain: DayScheduleDomain[]) => {
      if (!scheduleDomain || scheduleDomain.length === 0)
        return 'No Schedule'

      let schedule: DayScheduleView[] = scheduleDomain.map(s => DaySchedule.toViewModel(s))
        
      let daysOfWeek = schedule.sort((curr, next) => {
        if (DayOfWeek.toInt(curr.dayOfWeek)  > DayOfWeek.toInt(next.dayOfWeek))
          return 1
        if (DayOfWeek.toInt(curr.dayOfWeek) < DayOfWeek.toInt(next.dayOfWeek))
          return -1
        return 0
      }).map(day => (
        <ListItem 
          label={day.dayOfWeek + ':'} 
          value={day.timeSchedules.map(t => 
              `${t.startTime
                  .format(DateTimeFormatter.ofPattern('hh:mm a')
                  .withLocale(Locale.ENGLISH))
                } to ${t.endTime
                  .format(DateTimeFormatter.ofPattern('hh:mm a')
                  .withLocale(Locale.ENGLISH))
                }`
          )} 
          style={{backgroundColor: 'inherit'}} 
        />
      ))

      return (
        <div className='d-flex flex-column'>
          {daysOfWeek.map((day, index) => 
          <ListGroup variant='flush' style={{backgroundColor: 'inherit'}}>
            {day}
          </ListGroup>
          )}
        </div>
      )
    }
  }
]

interface Props {
  enrollments: {
    key: any
    sessionName: string
    Schedule: DayScheduleDomain[]
  }[]
}

//should include simplified scheduling (make it compact)
//Day of week checkboxes to filter
export default ({enrollments}: Props): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>('')

  function handleSearchTermChange (term: string) {
    term = term.toLocaleLowerCase()
    setSearchTerm(term)
  }

  enrollments = enrollments.filter(e => e.sessionName.toLocaleLowerCase().includes(searchTerm))

  return (
    <>
      <Form.Control 
        type='text' 
        className='w-25 border-bottom-0'
        placeholder='Filter sessions...'
        value={searchTerm} 
        onChange={(e) => handleSearchTermChange(e.target.value)}
        style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
      />
      <Table 
        columns={enrollmentColumns} 
        dataset={enrollments.filter(e => e.sessionName.toLocaleLowerCase().includes(searchTerm))} 
      />
    </>
  )
}