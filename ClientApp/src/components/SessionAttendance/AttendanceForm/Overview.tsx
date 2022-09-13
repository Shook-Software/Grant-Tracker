//node_modules
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'
import { DateTimeFormatter, LocalDate } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

//local components
import AttendanceTimeInput, { TimeInputType } from './TimeInput'

//custom components
import Dropdown from 'components/Input/Dropdown'

//types
import type { AttendanceRecord } from './TimeInput'
import type { DropdownOption } from 'Models/Session'

import api from 'utils/api'
import { DateOnly } from 'Models/DateOnly'


export default ({state, dispatch}): JSX.Element => {
  const { sessionGuid } = useParams()
  const [dateOptions, setDateOptions] = useState<DropdownOption[]>([])

  const defaultAttendance: AttendanceRecord[] = state.defaultSchedule.map(schedule => ({
    personGuid: '',
    startTime: schedule.startTime,
    endTime: schedule.endTime
  }))

  useEffect(() => {
    api
      .get(`session/${sessionGuid}/attendance/openDates`)
      .then(res => {
        const options: DropdownOption[] = res.data.map(date => {
          const localDate: LocalDate = DateOnly.toLocalDate(date)
          return {
            guid: localDate.toString(),
            label: localDate.format(DateTimeFormatter.ofPattern('MMMM dd').withLocale(Locale.ENGLISH))
          }
        })
        console.log(options)
        if (options.length !== 0) {
          dispatch({type: 'instanceDate', payload: options[0].guid})
          setDateOptions(options)
        }
      })
  }, [])

  return (
    <Container>
      <Row lg={5} className='px-1'>
        <Col>
          <label htmlFor='date-select'>Session Date</label>
          <Dropdown
            id='date-select'
            options={dateOptions}
            value={state.date.toString()}
            onChange={(value: string) => dispatch({ type: 'instanceDate', payload: value })}
            disableOverlay
          />
        </Col>
      </Row>

      <Row className='d-flex flex-row my-3 px-1'>
        <div style={{ width: 'fit-content' }}>
          <label>Set all start times:</label>
          <AttendanceTimeInput 
            records={defaultAttendance}
            inputType={TimeInputType.Start}
            onChange={(guid, time, index) => dispatch({
              type: 'scheduleStartShift',
              payload: { index, startTime: time }
            })}
          />
        </div>
        <div style={{ width: 'fit-content' }}>
          <label>Set all exit times:</label>
          <AttendanceTimeInput 
            records={defaultAttendance}
            inputType={TimeInputType.End}
            onChange={(guid, time, index) => dispatch({
              type: 'scheduleEndShift',
              payload: { index, endTime: time}
            })}
          />
        </div>
      </Row>
    </Container>
  )
}