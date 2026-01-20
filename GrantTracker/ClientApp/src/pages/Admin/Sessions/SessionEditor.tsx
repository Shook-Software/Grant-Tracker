import { useState, useReducer, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, FormikErrors } from 'formik'
import { LocalDate } from '@js-joda/core'
import { useQueryClient } from '@tanstack/react-query'

import { Spinner } from '@/components/ui/Spinner'

import Overview from './Session/Overview'
import Involved from './Session/Involved'
import Scheduling from './Session/Scheduling'
import Submit from './Session/Submit'

import { initialState, reducer, ReducerAction } from './Session/state'

import validationSchema from './validation'
import { fetchAllDropdownOptions, fetchGradeOptions, fetchSession, submitSession, DropdownOptions } from './api'
import { Session, SessionForm } from 'Models/Session'
import { OrganizationYearView } from 'Models/OrganizationYear'
import { User } from 'utils/authentication'

interface SessionEditorProps {
  sessionGuid: string | undefined
  user: User
  orgYear: OrganizationYearView | undefined
  setOrgYear: (orgYear: OrganizationYearView) => void
}

type TabKey = 'overview' | 'involved' | 'scheduling' | 'submit'

export default function SessionEditor({ sessionGuid, user, orgYear, setOrgYear }: SessionEditorProps): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [state, dispatch] = useReducer(reducer, initialState)
  const [dropdownData, setDropdowns] = useState<DropdownOptions | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState<boolean>(!sessionGuid)

  function submitForm(): void {
    if (!orgYear?.guid)
      return

    submitSession(state)
      .then(res => {
        const guid = sessionGuid ?? res;
        queryClient.invalidateQueries({ queryKey: [`session?orgYearGuid=${state.organizationYearGuid}`] })
        navigate(`/home/admin/sessions/${guid}?edit=false`)
      })
      .catch(err => console.warn(err))
  }

  useEffect(() => {
    fetchAllDropdownOptions()
      .then(res =>
        fetchGradeOptions()
          .then(res2 => {
            setDropdowns({ ...res, grades: res2 })

            dispatch({ type: 'activity', payload: res.activities[0].guid })
            dispatch({ type: 'funding', payload: res.fundingSources[0].guid })
            dispatch({ type: 'partnership', payload: res.partnershipTypes[0].guid })
            dispatch({ type: 'type', payload: res.sessionTypes.find(s => s.label === 'Student').guid })
            dispatch({ type: 'organization', payload: res.organizationTypes.find(o => o.abbreviation?.includes('N/A')).guid })

            if (sessionGuid) {
              fetchSession(sessionGuid).then(session => {
                if (session.organizationYear.guid !== orgYear?.guid) {
                  setOrgYear(session.organizationYear)
                }
                dispatch({ type: 'all', payload: session })
                setSessionLoaded(true)
              })
            } else {
              const defaultForm = Session.createDefaultForm()
              if (orgYear?.year) {
                defaultForm.organizationYearGuid = orgYear.guid
                const startDate = orgYear.year.startDate
                const endDate = orgYear.year.endDate
                defaultForm.firstSessionDate = startDate instanceof LocalDate
                  ? startDate
                  : LocalDate.of(startDate.year, startDate.month, startDate.day)
                defaultForm.lastSessionDate = endDate instanceof LocalDate
                  ? endDate
                  : LocalDate.of(endDate.year, endDate.month, endDate.day)
              }
              dispatch({ type: 'all', payload: defaultForm })
              setSessionLoaded(true)
            }
          }))
      .catch(exception => console.warn(exception))
  }, [sessionGuid])

  if (!dropdownData || !sessionLoaded)
    return (
      <div className='flex justify-center items-center p-8'>
        <Spinner size='lg' />
      </div>
    )

  const outletContext = {
    orgYearGuid: orgYear?.guid || null,
    reducerDispatch: dispatch,
    dropdownData,
    values: state,
    touched: {},
    errors: {},
    user,
    forceValidation: () => null
  }

  const handleClose = () => {
    if (sessionGuid) {
      navigate(`/home/admin/sessions/${sessionGuid}?edit=false`)
    } else {
      navigate('/home/admin/sessions?edit=false')
    }
  }

  return (
    <div className='border rounded overflow-hidden'>
      <div className='bg-blue-600 text-white px-4 py-3 flex justify-between items-center'>
        <h3 className='text-xl font-semibold'>
          {sessionGuid ? `Editing ${state.name}` : 'Creating New Session'}
        </h3>
        <button
          type='button'
          onClick={handleClose}
          className='px-4 py-2 text-sm border border-white rounded hover:bg-blue-700 transition-colors'
        >
          Close
        </button>
      </div>

      <div className='p-4'>
        <div className='mb-4'>
          <div className='flex gap-2 border-b'>
          <button
            type='button'
            className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-600 font-medium' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            type='button'
            className={`px-4 py-2 ${activeTab === 'involved' ? 'border-b-2 border-blue-600 font-medium' : ''}`}
            onClick={() => setActiveTab('involved')}
          >
            Instructor/Funding
          </button>
          <button
            type='button'
            className={`px-4 py-2 ${activeTab === 'scheduling' ? 'border-b-2 border-blue-600 font-medium' : ''}`}
            onClick={() => setActiveTab('scheduling')}
          >
            Date/Time
          </button>
          <button
            type='button'
            className={`px-4 py-2 ${activeTab === 'submit' ? 'border-b-2 border-blue-600 font-medium' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            Review and Submit
          </button>
        </div>
      </div>

      <Formik
        enableReinitialize
        initialValues={state}
        validateOnMount
        validationSchema={validationSchema}
        onSubmit={(values, actions) => {
          submitForm(values)
        }}
      >
        {({ handleSubmit, values, touched, errors, validateForm }) => {
          const context = {
            ...outletContext,
            values,
            touched,
            errors,
            handleSubmit,
          }

          const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault()
            }
          }

          const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
          }

          return (
            <form onSubmit={handleFormSubmit} onKeyDown={handleFormKeyDown}>
              {activeTab === 'overview' && <Overview context={context} />}
              {activeTab === 'involved' && <Involved context={context} />}
              {activeTab === 'scheduling' && <Scheduling context={context} />}
              {activeTab === 'submit' && <Submit context={context} />}
            </form>
          )
        }}
      </Formik>
      </div>
    </div>
  )
}

export type Context = {
  orgYearGuid: string | null
  reducerDispatch: (action: ReducerAction) => void
  dropdownData: DropdownOptions
  values: SessionForm
  touched: any
  errors: FormikErrors<SessionForm>
  user: User
  handleSubmit: () => {}
}
