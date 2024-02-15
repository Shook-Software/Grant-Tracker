import { useState, useReducer, useEffect, useContext } from 'react'
import {
  Outlet,
  useOutletContext,
  useParams,
  useNavigate,
  useSearchParams
} from 'react-router-dom'
import { Formik } from 'formik'
import { Form, Spinner } from 'react-bootstrap'

import { Tabset, Tab } from 'components/Tabset'
import { PageContainer } from 'styles'

import { initialState, reducer, ReducerAction } from './Session/state'

import paths from 'utils/routing/paths'
import validationSchema from './validation'
import { fetchAllDropdownOptions, fetchSession, submitSession, DropdownOptions } from './api'
import { Session, SessionForm } from 'Models/Session'
import { User } from 'utils/authentication'
import { OrgYearContext } from 'pages/Admin'

interface TabProps {
  guid: string | undefined
}

const TabSelector = ({ guid }: TabProps): JSX.Element => (
  <Tabset>
    <Tab
      path={`/home/edit/session/${guid ? guid + '/' : ''}${
        paths.Edit.Sessions.Overview.path
      }`}
      text='Overview'
    />
    <Tab
      path={`/home/edit/session/${guid ? guid + '/' : ''}${
        paths.Edit.Sessions.Involved.path
      }`}
      text='Instructor/Funding'
    />
    <Tab
      path={`/home/edit/session/${guid ? guid + '/' : ''}${
        paths.Edit.Sessions.Scheduling.path
      }`}
      text='Date/Time'
    />
    <Tab
      path={`/home/edit/session/${guid ? guid + '/' : ''}${
        paths.Edit.Sessions.Submit.path
      }`}
      text='Review and Submit'
    />
  </Tabset>
)

//finish validation once confirmed with Liz today
//for now..
export default ({user}: {user: User}) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();
  const { sessionGuid } = useParams()
  const [orgYearGuid, setOrgYearGuid] = useState<string | null>(null)
  const [validated, setValidated] = useState<boolean>(false)
  const [state, dispatch] = useReducer(reducer, initialState)
  const [dropdownData, setDropdowns] = useState<DropdownOptions | null>(null)

  function submitForm (session: SessionForm): void {
    
    submitSession(orgYearGuid, session)
      .then(res => {
        navigate(
          `${paths.Admin.path}/${paths.Admin.Viewer.Session.path}s/${res}`
        )
      })
      .catch(err => console.warn(err))
  }

  useEffect(() => {
    const orgYearGuid: string | null = searchParams.get('orgYearGuid')
    setOrgYearGuid(orgYearGuid)

    fetchAllDropdownOptions()
      .then(res => {
        setDropdowns({
          ...res,
          instructors: []
        })

        //Get session data from the database if a guid is provided to the component, then populate fields.
        if (sessionGuid) {
          fetchSession(sessionGuid).then(session => {
            setOrgYearGuid(session.organizationYear.guid)
            dispatch({ type: 'all', payload: session })
            navigate(`overview`)
          })
        }
      })
      .catch(exception => console.warn(exception))

      dispatch({type: 'all', payload: Session.createDefaultForm()})
  }, [])

  useEffect(() => {
    const data: DropdownOptions | null = dropdownData
    if (!data) return
    //don't forget to add to this
    dispatch({ type: 'activity', payload: data.activities[0].guid })
    dispatch({ type: 'funding', payload: data.fundingSources[0].guid })
    dispatch({ type: 'objective', payload: data.objectives[0].guid })
    dispatch({ type: 'partnership', payload: data.partnershipTypes[0].guid })
    dispatch({ type: 'type', payload: data.sessionTypes.find(s => s.label === 'Student').guid })
    dispatch({ type: 'organization', payload: data.organizationTypes.find(o => o.abbreviation?.includes('N/A')).guid })
  }, [dropdownData])

  useEffect(() => {
    if (validated === true) {
      //add redirection logic, take teacher to their own session list page?
    }
  }, [validated])

  if (!dropdownData)
    return (
      <PageContainer className='d-flex justify-content-center align-items-center'>
        <Spinner animation='border' />
      </PageContainer>
    )

  return (
    <>
      <h3 className='text-center w-100'>
        {sessionGuid ? `Editing ${state.name}` : 'Creating New Session'}
      </h3>
      <PageContainer>
        <div className='w-100 p-3'>
          <TabSelector guid={sessionGuid} />
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
          {({ handleSubmit, values, touched, errors }) => (
            <Form onSubmit={handleSubmit}>
              <Outlet
                context={{
                  orgYearGuid: orgYearGuid,
                  values,
                  reducerDispatch: dispatch,
                  dropdownData,
                  touched,
                  errors,
                  user
                }}
              />
            </Form>
          )}
        </Formik>
      </PageContainer>
    </>
  )
}

export type Context = {
  orgYearGuid: string | null
  reducerDispatch: (ReducerAction) => void
  dropdownData: DropdownOptions
  values: SessionForm
  touched
  errors,
  user: User
}

export function useSession (): Context {
  return useOutletContext<Context>()
}
