import React, { useEffect, useState } from 'react'
import { useSession, Context } from '../index'
import { DateTimeFormatter, LocalDate, LocalTime } from '@js-joda/core'

import { TimeInput } from 'components/TimeRangeSelector'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label' 
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable } from '@/components/DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'

import { DayOfWeek, DayOfWeekString } from 'Models/DayOfWeek'
import { WeeklySchedule, DayScheduleForm, nonEmptyDaysHaveSameSchedules } from 'Models/DaySchedule'
import { Locale } from '@js-joda/locale_en-us'
import { CalendarMinus, CalendarPlus } from 'lucide-react'

interface TimeSchedulingProps {
  today: DayScheduleForm
  dispatch: React.Dispatch<{ type: string; payload: any }>
}

const TimeScheduling = ({
  today,
  dispatch
}: TimeSchedulingProps): React.ReactNode | null => {
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

  return (
    <div className="space-y-3">
      {today?.timeSchedules?.map((timeSchedule, index) => (
        <div key={index} className='space-y-2'>
          <div className="flex items-end flex-nowrap gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Start</Label>
              <TimeInput
                value={timeSchedule.startTime}
                onChange={value => {
                  handleTimeChange(value, timeSchedule.endTime, 'start', index)
                }}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End</Label>
              <TimeInput
                value={timeSchedule.endTime}
                onChange={value => {
                  handleTimeChange(timeSchedule.startTime, value, 'end', index)
                }}
              />
            </div>

            {index === 0 ? (
              <Button
                variant="outline"
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
                aria-label='Add a time slot'
              >
                <>Add <CalendarPlus /></>
              </Button>
            ) : (
              <Button
                variant="destructive"
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
                aria-label='Remove this time slot'
              >
                <>Remove <CalendarMinus /></>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

interface WeeklyScheduleBuilderProps {
  schedule: WeeklySchedule
  dispatch: React.Dispatch<{ type: string; payload: any }>
  recurring: boolean
}

const WeeklyScheduleBuilder = ({ schedule, dispatch, recurring }: WeeklyScheduleBuilderProps): JSX.Element => {
  const [useCommonSchedule, setUseCommonSchedule] = useState(nonEmptyDaysHaveSameSchedules(schedule));
  const [commonTimeSchedules, setCommonTimeSchedules] = useState(useCommonSchedule && schedule.filter(s => s.timeSchedules.length > 0)[0] 
    ? schedule.filter(s => s.timeSchedules.length > 0)[0].timeSchedules 
    : [ { startTime: LocalTime.MIDNIGHT, endTime: LocalTime.MIDNIGHT } ]
  )

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const selectedDays = days.filter((_, index) => schedule[index].recurs)

  const applyCommonSchedule = (timeSchedules: any[]) => {
    selectedDays.forEach(day => {
      const dayIndex = DayOfWeek.toInt(day as DayOfWeekString)
      const daySchedule = { ...schedule[dayIndex], timeSchedules: [...timeSchedules] }
      dispatch({
        type: 'scheduleDayTime',
        payload: { dayIndex, day: daySchedule }
      })
    })
  }

  const handleDayToggle = (day: string, checked: boolean) => {
    const dayIndex = DayOfWeek.toInt(day as DayOfWeekString)
    const daySchedule = { ...schedule[dayIndex] }
    daySchedule.recurs = checked
    
    if (checked) {
      daySchedule.timeSchedules = useCommonSchedule ? [...commonTimeSchedules] : [
        { startTime: LocalTime.MIDNIGHT, endTime: LocalTime.MIDNIGHT }
      ]
    } else {
      daySchedule.timeSchedules = []
    }

    dispatch({
      type: 'scheduleDayTime',
      payload: { dayIndex, day: daySchedule }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Weekly Schedule</h3>
      </div>

      {/* Day Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Select Days</Label>
        <div className="flex flex-wrap gap-2">
          {days.map(day => {
            const dayIndex = DayOfWeek.toInt(day as DayOfWeekString)
            const isSelected = schedule[dayIndex].recurs
            return (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleDayToggle(day, !!checked)}
                />
                <Label htmlFor={`day-${day}`} className="cursor-pointer text-sm mb-0">
                  {day}
                </Label>
              </div>
            )
          })}
        </div>
      </div>

      {selectedDays.length > 0 && (
        <>
          {/* Schedule Type Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium mb-0">Schedule Configuration</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="common-schedule"
                  checked={useCommonSchedule}
                  onCheckedChange={(checked) => {
                    setUseCommonSchedule(!!checked)
                    if (checked) {
                      applyCommonSchedule(commonTimeSchedules)
                    }
                  }}
                />
                <Label htmlFor="common-schedule" className="cursor-pointer text-sm mb-0">
                  Use same times for all selected days
                </Label>
              </div>
            </div>
          </div>

          {useCommonSchedule ? (
            <Card className="border border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Common Schedule</CardTitle>
                <div className="text-xs text-muted-foreground">
                  Times will apply to: {selectedDays.join(', ')}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CommonTimeScheduling 
                  timeSchedules={commonTimeSchedules}
                  onChange={(schedules) => {
                    setCommonTimeSchedules(schedules)
                    applyCommonSchedule(schedules)
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDays.map(day => {
                  const dayIndex = DayOfWeek.toInt(day as DayOfWeekString)
                  const today = schedule[dayIndex]
                  return (
                    <Card key={day} className="border border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">{day}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <TimeScheduling today={today} dispatch={dispatch} />
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const CommonTimeScheduling = ({ timeSchedules, onChange }: {
  timeSchedules: any[]
  onChange: (schedules: any[]) => void
}): JSX.Element => {
  const handleTimeChange = (
    startTime: LocalTime,
    endTime: LocalTime,
    changeType: 'start' | 'end',
    index: number
  ): void => {
    const newSchedules = [...timeSchedules]
    const scheduleToAlter = newSchedules[index]

    if (changeType === 'start') {
      if (endTime.isBefore(startTime))
        scheduleToAlter.endTime = startTime
      scheduleToAlter.startTime = startTime
    } else if (changeType === 'end') {
      if (startTime.isAfter(endTime))
        scheduleToAlter.startTime = endTime
      scheduleToAlter.endTime = endTime
    }

    onChange(newSchedules)
  }

  const addTimeSlot = () => {
    onChange([...timeSchedules, { startTime: LocalTime.MIDNIGHT, endTime: LocalTime.MIDNIGHT }])
  }

  const removeTimeSlot = (index: number) => {
    onChange(timeSchedules.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {timeSchedules.map((timeSchedule, index) => (
        <div key={index} className='space-y-2'>
          <div className="flex items-end flex-nowrap gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Start</Label>
              <TimeInput
                value={timeSchedule.startTime}
                onChange={value => {
                  handleTimeChange(value, timeSchedule.endTime, 'start', index)
                }}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End</Label>
              <TimeInput
                value={timeSchedule.endTime}
                onChange={value => {
                  handleTimeChange(timeSchedule.startTime, value, 'end', index)
                }}
              />
            </div>

            {index === 0 ? (
              <Button
                variant="outline"
                onClick={addTimeSlot}
                aria-label='Add a time slot'
              >
                <>Add <CalendarPlus /></>
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => removeTimeSlot(index)}
                aria-label='Remove this time slot'
              >
                <>Remove <CalendarMinus /></>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default (): JSX.Element => {
  const { reducerDispatch, values, errors }: Context = useSession()
  document.title = `${values.guid ? 'Edit' : 'New'} Session - Scheduling`
  const schedule: WeeklySchedule = values.scheduling

  if (!values)
    return (
      <p style={{ textAlign: 'center' }}>Error in loading Session details...</p>
    )

  return (
    <div className="max-w-7xl mx-auto p-6">
      <section className='flex flex-col md:flex-row gap-6 mb-6'>
        <div className="space-y-2 min-w-fit">
          <Label htmlFor="start-date">
            {values.recurring ? 'First Session Date' : 'Session Date'}
          </Label>
          <Input
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
            className="w-fit"
          />
        </div>

        <div className="space-y-2 min-w-fit">
          <Label htmlFor="end-date">Last Session Date</Label>
          <Input
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
            className="w-fit"
          />
        </div>
      </section>

      <hr />
      
      <section className='mb-8'>
        <WeeklyScheduleBuilder 
          schedule={schedule} 
          dispatch={reducerDispatch}
          recurring={values.recurring}
        />
      </section>

      <hr />

      <section className='space-y-4'>
        <h3 className='text-lg font-medium'>Blackout Dates</h3>
        <div className='flex flex-col gap-3'>
          <div>
            <BlackoutDateForm dates={values.blackoutDates} dispatch={reducerDispatch} />
          </div>
          <div>
            <DataTable
              containerClassName='w-fit'
              columns={createBlackoutColumns((date) => reducerDispatch({type: 'setBlackoutDates', payload: values.blackoutDates.filter(blackout => blackout.date.toString() != date.toString())}))}
              data={values.blackoutDates}
              emptyMessage="No blackout dates added"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function BlackoutDateForm({dates, dispatch}): JSX.Element {
  const [date, setDate] = useState(LocalDate.now)

  function addDate(blackoutDate: LocalDate) {
    if (!dates.some(blackout => blackoutDate.isEqual(blackout.date)))
      dispatch({type: 'setBlackoutDates', payload: [...dates, { guid: undefined, sessionGuid: undefined, date}]})
  }

  return (
    <div className="flex gap-2">
      <Input 
        type='date' 
        value={date.toString()} 
        onChange={(e) => setDate(LocalDate.parse(e.target?.value))} 
        className="w-fit"
        aria-label='blackout date'
      />
      <Button 
        variant="outline" 
        type='button' 
        onClick={() => addDate(date)}
      >
        <>
          Add
          <CalendarPlus />
        </>
      </Button>
    </div>
  )
}

const createBlackoutColumns = (onDelete) => [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <div className='text-right'>
        {row.original.date.format(DateTimeFormatter.ofPattern('eeee, MMMM d, y').withLocale(Locale.ENGLISH))}
      </div>
    ),
    enableSorting: true
  },
  {
    header: '',
    cell: ({ row }) => (
      <Button 
        type='button' 
        variant='destructive' 
        size="sm"
        onClick={() => onDelete(row.original.date)}
      >
        <>Remove <CalendarMinus /></>
      </Button>
    ),
    enableSorting: false,
    id: 'actions'
  }
]