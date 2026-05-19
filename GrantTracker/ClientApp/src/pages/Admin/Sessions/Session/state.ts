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
  | { type: 'setOrgYearGuid'; payload: string }

//add in validation
export function reducer (
  state: SessionForm,
  action: ReducerAction
): SessionForm {
  switch (action.type) {

    case 'all':
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
      let nextStartDateScheduling: typeof state.scheduling = state.scheduling
      if (!state.recurring) {
        const currentDay = state.scheduling.find(s => s.timeSchedules.length !== 0)
        const targetDayIndex = newDate.dayOfWeek().value()
        nextStartDateScheduling = state.scheduling.map(s => {
          const isTarget = targetDayIndex === DayOfWeek.toInt(s.dayOfWeek)
          if (isTarget)
            return { ...s, timeSchedules: (currentDay?.timeSchedules ?? []).map(ts => ({ ...ts })) }
          if (s === currentDay)
            return { ...s, timeSchedules: [] }
          return s
        }) as WeeklySchedule
      }

      return {
        ...state,
        firstSessionDate: newDate,
        scheduling: nextStartDateScheduling
      }

    case 'endDate':
      return {
        ...state,
        lastSessionDate: LocalDate.parse(action.payload)
      }

    case 'recurring':
      let newSchedule: WeeklySchedule
      //recurring to non-recurring
      if (state.recurring && !action.payload) {
        const targetDay = state.firstSessionDate.dayOfWeek().value()
        newSchedule = state.scheduling.map(s => {
          const isTarget = targetDay === DayOfWeek.toInt(s.dayOfWeek)
          return {
            ...s,
            timeSchedules: isTarget
              ? [{ startTime: LocalTime.MIDNIGHT, endTime: LocalTime.MIDNIGHT }]
              : []
          }
        }) as WeeklySchedule
      }
      //non-recurring to recurring
      else {
        newSchedule = DaySchedule.createWeeklySchedule()
      }

      return { ...state, recurring: action.payload, scheduling: newSchedule }

    case 'scheduleDayTime':
      return {
        ...state,
        scheduling: state.scheduling.map((schedule, index) =>
          index === action.payload.dayIndex ? action.payload.day : schedule
        ) as WeeklySchedule
      }

    case 'singleSessionTimeSchedule':
      return {
        ...state,
        scheduling: state.scheduling.map(s =>
          s.timeSchedules.length !== 0
            ? { ...s, timeSchedules: action.payload.map(ts => ({ ...ts })) }
            : s
        ) as WeeklySchedule
      }

    case 'setBlackoutDates':
      action.payload.sort((first, second) => first.date.isBefore(second.date) ? 1 : -1)
      return { ...state, blackoutDates: action.payload }

    case 'setOrgYearGuid':
      return { ...state, organizationYearGuid: action.payload }

    default:
      return state
  }
}
