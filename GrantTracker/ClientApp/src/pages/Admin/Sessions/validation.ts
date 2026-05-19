import { LocalTime } from '@js-joda/core'
import * as Yup from 'yup'
import { DropdownOption } from 'Models/Session'

const FAMILY_ENGAGEMENT_SESSION_TYPE_LABELS = ['parent', 'family']

export default (sessionTypes: DropdownOption[] = []) => Yup.object().shape({

  name: Yup.string()
    .min(2, 'Session name must be at least two characters in length.')
    .max(100, 'Session name must be at less than 100 characters in length.')
    .required('Required.'),

  type: Yup.string()
    .required('Required.'),

  familyEngagementCategory: Yup.string()
    .nullable()
    .test('required-when-family-or-parent', 'Required when session type is Parent or Family.', function (value) {
      const typeGuid = (this.parent as { type?: string })?.type
      const selected = sessionTypes.find(t => t.guid === typeGuid)
      const requires = !!selected && FAMILY_ENGAGEMENT_SESSION_TYPE_LABELS.includes(selected.label?.trim().toLowerCase())
      return !requires || !!value
    }),

  activity: Yup.string()
    .required('Required.'),

  objectives: Yup.array().of(Yup.string().required())
    .min(1, 'At least one objective is required.')
    .defined()
    .required('Required.'),

  fundingSource: Yup.string()
    .required('Required.'),

  partnershipType: Yup.string()
    .required('Required.'),

  scheduling: Yup.array().of(
    Yup.object().shape({
      dayOfWeek: Yup.string(),
      recurs: Yup.boolean(),
      timeSchedules: Yup.array()
      .of(
        Yup.object().shape({
          guid: Yup.string().notRequired(),
          startTime: Yup.mixed<LocalTime>().required(),
          endTime: Yup.mixed<LocalTime>().required()
        })
        .test('start-end-differ', 'Start and end times cannot be equivalent.', (x) => {
          console.log(x)
          if (!x?.startTime || !x?.endTime) return true
          return !x.startTime.equals(x.endTime)
        })
      )
    })
    .required()
  )
  .test((x, { createError }) => {
    const sessionHasScheduledDays = x?.some(schedule => schedule.timeSchedules.length > 0)

    if (!sessionHasScheduledDays)
      return createError({
        message: 'At least one scheduled day is required.',
        path: 'scheduling'
      })

    return true
  })
})
