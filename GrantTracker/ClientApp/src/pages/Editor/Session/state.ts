import { LocalDate, LocalTime, nativeJs } from '@js-joda/core'

import { DayOfWeek, DayOfWeekNumeric } from 'Models/DayOfWeek'
import {
  WeeklySchedule,
  DayScheduleForm,
  DaySchedule
} from 'Models/DaySchedule'
import { TimeScheduleForm } from 'Models/TimeSchedule'
import { SessionForm, Session } from 'Models/Session'
import { SessionBlackoutDateView } from 'Models/BlackoutDate'

export const initialState: SessionForm = Session.createDefaultForm()

/*function handleTimeChange(bound: 'start' | 'end', time: LocalTime, state: SessionForm): SessionForm {

  if (bound === 'start') {
    state.scheduling.forEach(schedule => {
      if (!schedule.recurs || schedule.startTime.equals(state.startTime)) {
        schedule.startTime = time
        if (schedule.endTime.isBefore(time))
          schedule.endTime = time
      }
    })

    if (time.isAfter(state.endTime))
      state.endTime = time
  }
  else if (bound === 'end') {
    state.scheduling.forEach(schedule => {
      if (!schedule.recurs || schedule.endTime.equals(state.endTime)) {
        schedule.endTime = time
        if (schedule.startTime.isAfter(time))
          schedule.startTime = time
      }
    })

    if (time.isBefore(state.startTime))
      state.startTime = time
  }
  return state
}*/

export type ReducerAction =
  | { type: 'all'; payload: SessionForm }
  | { type: 'name'; payload: string }
  | { type: 'type'; payload: string }
  | { type: 'activity'; payload: string }
  | { type: 'objective'; payload: string[] }
  | { type: 'grades'; payload: string[] }
  | { type: 'addInstructor'; payload: { guid: string; label: string } }
  | { type: 'removeInstructor'; payload: string }
  | { type: 'funding'; payload: string }
  | { type: 'organization'; payload: string }
  | { type: 'partnership'; payload: string }
  | { type: 'startDate'; payload: string }
  | { type: 'endDate'; payload: string }
  | { type: 'recurring'; payload: boolean }
  | {
      type: 'scheduleDayTime'
      payload: { dayIndex: number; day: DayScheduleForm }
    }
  | { type: 'singleSessionTimeSchedule'; payload: TimeScheduleForm[] }
  | { type: 'setBlackoutDates'; payload: SessionBlackoutDateView[] }

//add in validation
export function reducer (
  state: SessionForm,
  action: ReducerAction
): SessionForm {
  switch (action.type) {

    case 'all':
      console.error(action.payload)
      return { ...action.payload }

    case 'name':
      return { ...state, name: action.payload }

    case 'type':
      return { ...state, type: action.payload }

    case 'activity':
      return { ...state, activity: action.payload }

    case 'objective':
      return { ...state, objectives: [...action.payload] }

    case 'grades':
      return { ...state, grades: [...action.payload] }

    case 'addInstructor':
      return { ...state, instructors: [...state.instructors, action.payload] }

    case 'removeInstructor':
      return {
        ...state,
        instructors: state.instructors.filter(
          instructor => instructor.guid !== action.payload
        )
      }

    case 'funding':
      return { ...state, fundingSource: action.payload }

    case 'organization':
      return { ...state, organizationType: action.payload }

    case 'partnership':
      return { ...state, partnershipType: action.payload }

    case 'startDate':
      const newDate: LocalDate = LocalDate.parse(action.payload)
      var scheduling = state.scheduling
      if (!state.recurring) {
        const currentDay = scheduling.find(s => s.timeSchedules.length !== 0)
        scheduling = scheduling.map(s => {
          if (newDate.dayOfWeek().value() === DayOfWeek.toInt(s.dayOfWeek)) {
            s.timeSchedules = currentDay?.timeSchedules
          }
          return s
        })
        currentDay?.timeSchedules = []
      }

      return {
        ...state,
        firstSessionDate: newDate,
        scheduling: [...scheduling]
      }

    case 'endDate':
      return {
        ...state,
        lastSessionDate: LocalDate.parse(action.payload)
      }

    case 'recurring':
      console.error(action.payload)
      var newSchedule: WeeklySchedule
      //recurring to non-recurring
      if (state.recurring && !action.payload) {
        newSchedule = state.scheduling.map(s => {
          if (
            state.firstSessionDate.dayOfWeek().value() ===
            DayOfWeek.toInt(s.dayOfWeek)
          ) {
            s.timeSchedules = [
              { startTime: LocalTime.MIDNIGHT, endTime: LocalTime.MIDNIGHT }
            ]
          } else {
            s.timeSchedules = []
          }
          return s
        }) as WeeklySchedule
      }
      //non-recurring to recurring
      else {
        newSchedule = DaySchedule.createWeeklySchedule()
      }

      return { ...state, recurring: action.payload, scheduling: newSchedule }

    case 'scheduleDayTime':
      console.error(action.payload)
      var newSchedule: WeeklySchedule = state.scheduling.map(
        (schedule, index) => {
          return index === action.payload.dayIndex
            ? action.payload.day
            : schedule
        }
      ) as WeeklySchedule

      return { ...state, scheduling: [...newSchedule] }

    case 'singleSessionTimeSchedule':
      console.error(action.payload)
      var newScheduling = state.scheduling.map(s => {
        if (s.timeSchedules.length !== 0) {
          s.timeSchedules = action.payload
        }
        return s
      })
      return { ...state, scheduling: [...newScheduling] }

    case 'setBlackoutDates': 
      action.payload.sort((first, second) => first.date.isBefore(second.date) ? 1 : -1)
      return { ...state, blackoutDates: action.payload }

    default:
      return state
  }
}
