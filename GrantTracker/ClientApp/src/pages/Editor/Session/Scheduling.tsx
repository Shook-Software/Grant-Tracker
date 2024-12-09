import React, { useEffect, useState } from 'react'
import { useSession, Context } from '../index'
import { DateTimeFormatter, LocalDate, LocalTime } from '@js-joda/core'

import { TimeInput } from 'components/TimeRangeSelector'
import { Form, Container, Row, Col, InputGroup, Button, Tab } from 'react-bootstrap'

import { DayOfWeek, DayOfWeekString } from 'Models/DayOfWeek'
import { WeeklySchedule, DayScheduleForm } from 'Models/DaySchedule'
import Table, { Column } from 'components/BTable'
import { Locale } from '@js-joda/locale_en-us'

//Second Section - Date/Time

const InputGroupTextStyle = { width: '9rem' }

interface DaySchedulingProps {
  label: DayOfWeekString
  id: string
  schedule: WeeklySchedule
  dispatch: React.Dispatch<{ type: string; payload: any }>
}

interface TimeSchedulingProps {
  today: DayScheduleForm
  dispatch: React.Dispatch<{ type: string; payload: any }>
}

const TimeScheduling = ({
  today,
  dispatch
}: TimeSchedulingProps): JSX.Element[] | null => {
  const dayIndex: number = DayOfWeek.toInt(today.dayOfWeek)

  function handleTimeChange (
    startTime: LocalTime,
    endTime: LocalTime,
    changeType: 'start' | 'end',
    index
  ): void {

    let scheduleToAlter = today.timeSchedules[index]

    if (scheduleToAlter.startTime === startTime && scheduleToAlter.endTime === endTime)
      return

    if (changeType === 'start') {
      if (endTime.isBefore(startTime))
        scheduleToAlter.endTime = startTime

      scheduleToAlter.startTime = startTime
    }
    else if (changeType === 'end'){
      if (startTime.isAfter(endTime))
        scheduleToAlter.startTime = endTime

      scheduleToAlter.endTime = endTime
    }

    if (today.recurs) {
      dispatch({ type: 'scheduleDayTime', payload: { dayIndex, day: today } })
      return
    }
    

    dispatch({
      type: 'singleSessionTimeSchedule',
      payload: today.timeSchedules
    })
  }

  return today?.timeSchedules?.map((timeSchedule, index) => (
    <div className='d-flex flex-row justify-content-start mb-2'>
      <TimeInput
        value={timeSchedule.startTime}
        onChange={value => {
          handleTimeChange(value, timeSchedule.endTime, 'start', index)
        }}
        style={{ width: '200px' }}
      />
      <TimeInput
        className='mx-1'
        value={timeSchedule.endTime}
        onChange={value => {
          handleTimeChange(timeSchedule.startTime, value, 'end', index)
        }}
        style={{ width: '200px' }}
      />
      {index === today.timeSchedules.length - 1 ? (
        <Button
          style={{ width: 'max-content' }}
          onClick={() => {
            today.timeSchedules = [
              ...today.timeSchedules,
              {
                startTime: LocalTime.MIDNIGHT,
                endTime: LocalTime.MIDNIGHT
              }
            ]
            today.recurs
              ? dispatch({
                  type: 'scheduleDayTime',
                  payload: { dayIndex, day: today }
                })
              : dispatch({
                  type: 'singleSessionTimeSchedule',
                  payload: today.timeSchedules
                })
          }}
        >
          Add Another
        </Button>
      ) : (
        <Button
          style={{ width: 'max-content' }}
          onClick={() => {
            const todayClone: DayScheduleForm = {
              ...today,
              timeSchedules: today.timeSchedules.filter((_, i) => index !== i)
            }
            today.recurs
              ? dispatch({
                  type: 'scheduleDayTime',
                  payload: { dayIndex, day: todayClone }
                })
              : dispatch({
                  type: 'singleSessionTimeSchedule',
                  payload: todayClone.timeSchedules
                })
          }}
        >
          Remove
        </Button>
      )}
    </div>
  ))
}

const DayScheduling = ({
  label,
  id,
  schedule,
  dispatch
}: DaySchedulingProps): JSX.Element => {
  const dayIndex: number = DayOfWeek.toInt(label)
  const today: DayScheduleForm = schedule[dayIndex]
  return (
    <Container className='px-2 py-0'>
      <Row
        className={today.recurs ? 'py-2' : ''}
        style={{ width: 'fit-content' }}
      >
        <Col className='p-0'>
          <InputGroup>
            <InputGroup.Text style={InputGroupTextStyle}>
              <Form.Check
                label={label}
                id={id}
                checked={today.recurs}
                onChange={event => {
                  today.recurs = event.target.checked
                  if (
                    event.target.checked &&
                    today.timeSchedules.length === 0
                  ) {
                    today.timeSchedules = [
                      {
                        startTime: LocalTime.MIDNIGHT,
                        endTime: LocalTime.MIDNIGHT
                      }
                    ]
                  }
                  dispatch({
                    type: 'scheduleDayTime',
                    payload: { dayIndex, day: today }
                  })
                }}
              />
            </InputGroup.Text>
          </InputGroup>
        </Col>
        <Col>
          {today.recurs ? (
            <TimeScheduling today={today} dispatch={dispatch} />
          ) : null}
        </Col>
      </Row>
    </Container>
  )
}

export default (): JSX.Element => {
  const { reducerDispatch, values, errors }: Context = useSession()
  document.title = `${values.guid ? 'Edit' : 'New'} Session - Scheduling`
  const schedule: WeeklySchedule = values.scheduling
  let daySchedule: DayScheduleForm | undefined

  if (!values)
    return (
      <p style={{ textAlign: 'center' }}>Error in loading Session details...</p>
    )

  return (
    <Container>
      <Row className='d-flex flex-start flex-row m-3'>
        <Col sm={3}>
          <Form.Group style={{ width: 'min-content' }}>
            <Form.Label>
              {values.recurring ? 'First Session Date' : 'Session Date'}
            </Form.Label>
            <Form.Control
              required
              id='start-date'
              type='date'
              value={values.firstSessionDate.toString()}
              onChange={(event: React.BaseSyntheticEvent) => {
                reducerDispatch({
                  type: 'startDate',
                  payload: event.target.value
                })
              }}
            />
          </Form.Group>
        </Col>

        <Col sm={3}>
          <Form.Group
            className='d-flex flex-column justify-content-end'
            style={{ width: 'min-content' }}
          >
            <Form.Label>Last Session Date</Form.Label>
            <Form.Control
                required
                id='end-date'
                type='date'
                value={values.lastSessionDate.toString()}
                onChange={(event: React.BaseSyntheticEvent) => {
                  reducerDispatch({
                    type: 'endDate',
                    payload: event.target.value
                  })
                }}
              />
          </Form.Group>
        </Col>
      </Row>
      <Row className='m-3'>
        
      </Row>
      <Row className='m-3'>
        <Form.Group
            style={{ display: values.recurring || true ? 'block' : 'none' }}
            key={schedule.toString()}
          >
            <DayScheduling
              //key={`sunday-${schedule[0].startTime.toString()}-${schedule[0].endTime.toString()}}`}
              label='Sunday'
              id='reoccurs-on-sunday'
              schedule={{...schedule}}
              dispatch={reducerDispatch}
            />
            <DayScheduling
              //key={`monday-${schedule[1].startTime.toString()}-${schedule[1].endTime.toString()}}`}
              label='Monday'
              id='reoccurs-on-monday'
              schedule={{...schedule}}
              dispatch={reducerDispatch}
            />
            <DayScheduling
              //key={`tuesday-${schedule[2].startTime.toString()}-${schedule[2].endTime.toString()}}`}
              label='Tuesday'
              id='reoccurs-on-tuesday'
              schedule={{...schedule}}
              dispatch={reducerDispatch}
            />
            <DayScheduling
              //key={`wednesday-${schedule[3].startTime.toString()}-${schedule[3].endTime.toString()}}`}
              label='Wednesday'
              id='reoccurs-on-wednesday'
              schedule={{...schedule}}
              dispatch={reducerDispatch}
            />
            <DayScheduling
              //key={`thursday-${schedule[4].startTime.toString()}-${schedule[4].endTime.toString()}}`}
              label='Thursday'
              id='reoccurs-on-thursday'
              schedule={{...schedule}}
              dispatch={reducerDispatch}
            />
            <DayScheduling
              //key={`friday-${schedule[5].startTime.toString()}-${schedule[5].endTime.toString()}}`}
              label='Friday'
              id='reoccurs-on-friday'
              schedule={{...schedule}}
              dispatch={reducerDispatch}
            />
            <DayScheduling
              //key={`saturday-${schedule[6].startTime.toString()}-${schedule[6].endTime.toString()}}`}
              label='Saturday'
              id='reoccurs-on-saturday'
              schedule={{...schedule}}
              dispatch={reducerDispatch}
            />
          </Form.Group>
      </Row>

      <Row className='mt-3 ms-3'>
        <h6>Blackout Dates</h6>
        <Col sm={3} className='mb-1'>
          <BlackoutDateForm dates={values.blackoutDates} dispatch={reducerDispatch} />
        </Col>
        <Col sm={9} />
        <Col sm={6}>
          <Table
            columns={createBlackoutColumns((date) => reducerDispatch({type: 'setBlackoutDates', payload: values.blackoutDates.filter(blackout => blackout.date.toString() != date.toString())}))}
            dataset={values.blackoutDates}
          />
        </Col>
      </Row>
    </Container>
  )
}

function BlackoutDateForm({dates, dispatch}): JSX.Element {
  const [date, setDate] = useState(LocalDate.now)

  function addDate(blackoutDate: LocalDate) {
    if (!dates.some(blackout => blackoutDate.isEqual(blackout.date)))
      dispatch({type: 'setBlackoutDates', payload: [...dates, { guid: undefined, sessionGuid: undefined, date}]})
  }

  return (
      <InputGroup>
        <Form.Control type='date' value={date.toString()} onChange={(e) => setDate(LocalDate.parse(e.target?.value))} />
        <button className='btn btn-primary' type='button' onClick={() => addDate(date)}>Add</button>
      </InputGroup>
  )
}

const createBlackoutColumns = (onDelete): Column[] => [
  {
    label: 'Date',
    attributeKey: 'date',
		sortable: true,
		transform: (date: LocalDate) => <div className='text-end'>{date.format(DateTimeFormatter.ofPattern('eeee, MMMM d, y').withLocale(Locale.ENGLISH))}</div>
  },
  {
    label: '',
    attributeKey: 'date',
    sortable: false,
    transform: (date: LocalDate) => <button type='button' className='btn btn-danger' onClick={() => onDelete(date)}>Delete</button>
  }
]