import { LocalTime } from '@js-joda/core'
import * as Yup from 'yup'

export default Yup.object().shape({

  name: Yup.string()
    .min(3, 'Too short.')
    .max(100, 'Too long.')
    .required('Required.'),

  type: Yup.string()
    .required(),

  activity: Yup.string()
    .required(),

  objective: Yup.string()
    .required(),

  fundingSource: Yup.string()
    .required(),

  partnershipType: Yup.string()
    .required(),

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
        .test((x, { createError }) => {
          if (x.startTime === x.endTime)
            return createError({
              message: `Start and end times cannot be equivalent.`,
              path: 'timeSchedules'
            })
          
          return true
        })
        )
      })
      .required()
    )
})