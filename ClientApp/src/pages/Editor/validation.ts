import * as Yup from 'yup'

export default Yup.object().shape({

  name: Yup.string()
    .min(5, 'Too short.')
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
    .required()
})