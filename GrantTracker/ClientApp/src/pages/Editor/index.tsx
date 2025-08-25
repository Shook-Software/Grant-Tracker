import { useState, useReducer, useEffect, useContext } from 'react'
import {
  Outlet,
  useOutletContext,
  useParams,
  useNavigate,
  useSearchParams
} from 'react-router-dom'
import { Formik, FormikErrors } from 'formik'

import { Tabset, Tab } from 'components/Tabset'
import { PageContainer } from 'styles'
import { Spinner } from '@/components/ui/Spinner'

import { initialState, reducer, ReducerAction } from './Session/state'

import paths from 'utils/routing/paths'
import validationSchema from './validation'
import { fetchAllDropdownOptions, fetchGradeOptions, fetchSession, submitSession, DropdownOptions } from './api'
import { Session, SessionForm } from 'Models/Session'
import { User } from 'utils/authentication'

interface TabProps {
  orgYearGuid: string | undefined
  sessionGuid: string | undefined
}

const TabSelector = ({ orgYearGuid, sessionGuid }: TabProps): JSX.Element => (

  <Tabset>
    <Tab
      path={`/home/edit/session/${sessionGuid ? sessionGuid + '/' : ''}${
        paths.Edit.Sessions.Overview.path
      }${orgYearGuid ? '?orgYearGuid=' + orgYearGuid : ''}`}
      text='Overview'
    />
    <Tab
      path={`/home/edit/session/${sessionGuid ? sessionGuid + '/' : ''}${
        paths.Edit.Sessions.Involved.path
      }${orgYearGuid ? '?orgYearGuid=' + orgYearGuid : ''}`}
      text='Instructor/Funding'
    />
    <Tab
      path={`/home/edit/session/${sessionGuid ? sessionGuid + '/' : ''}${
        paths.Edit.Sessions.Scheduling.path
      }${orgYearGuid ? '?orgYearGuid=' + orgYearGuid : ''}`}
      text='Date/Time'
    />
    <Tab
      path={`/home/edit/session/${sessionGuid ? sessionGuid + '/' : ''}${
        paths.Edit.Sessions.Submit.path
      }${orgYearGuid ? '?orgYearGuid=' + orgYearGuid : ''}`}
      text='Review and Submit'
    />
  </Tabset>
)

export default ({user}: {user: User}) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();
  const { sessionGuid } = useParams()
  const [orgYearGuid, setOrgYearGuid] = useState<string | undefined>(undefined)
  const [validated, setValidated] = useState<boolean>(false)
  const [state, dispatch] = useReducer(reducer, initialState)
  const [dropdownData, setDropdowns] = useState<DropdownOptions | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState<boolean>(!sessionGuid)

  function submitForm (session: SessionForm): void {
    if (!orgYearGuid)
      return;

    submitSession(orgYearGuid, session)
      .then(res => {
        navigate(
          `${paths.Admin.path}/${paths.Admin.Viewer.Session.path}s/${res}`
        )
      })
      .catch(err => console.warn(err))
  }

  useEffect(() => {
    const orgYearGuid: string | undefined = searchParams.get('orgYearGuid') ?? undefined;
    setOrgYearGuid(orgYearGuid)

    fetchAllDropdownOptions()
      .then(res =>
        fetchGradeOptions()
        .then(res2 => {
          //Get session data from the database if a guid is provided to the component, then populate fields.
          setDropdowns({...res, grades: res2})
          
          dispatch({ type: 'activity', payload: res.activities[0].guid })
          dispatch({ type: 'funding', payload: res.fundingSources[0].guid })
          dispatch({ type: 'partnership', payload: res.partnershipTypes[0].guid })
          dispatch({ type: 'type', payload: res.sessionTypes.find(s => s.label === 'Student').guid })
          dispatch({ type: 'organization', payload: res.organizationTypes.find(o => o.abbreviation?.includes('N/A')).guid })

          if (sessionGuid) {
            fetchSession(sessionGuid).then(session => {
              setOrgYearGuid(session.organizationYear.guid)
              dispatch({ type: 'all', payload: session })
              navigate(`overview`)
              setSessionLoaded(true);
            })
          }
        }))
        .catch(exception => console.warn(exception))
  
        dispatch({type: 'all', payload: Session.createDefaultForm()})
  }, [])

  useEffect(() => {
    if (validated === true) {
      //add redirection logic, take teacher to their own session list page?
    }
  }, [validated])

  if (!dropdownData)
    return (
      <PageContainer className='flex justify-center items-center'>
        <Spinner size='lg' />
      </PageContainer>
    )

  return (
    <>
      <h3 className='text-center w-full'>
        {sessionGuid ? `Editing ${state.name}` : 'Creating New Session'}
      </h3>
      <PageContainer>
      {sessionLoaded && 
        <>
          <div className='w-full p-3'>
            <TabSelector orgYearGuid={orgYearGuid} sessionGuid={sessionGuid} />
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
            {({ handleSubmit, values, touched, errors, validateForm }) => (
              <form onSubmit={handleSubmit}>
                <Outlet
                  context={{
                    orgYearGuid: orgYearGuid,
                    values,
                    reducerDispatch: dispatch,
                    dropdownData,
                    touched,
                    errors,
                    user,
                    forceValidation: validateForm
                  }}
                />
              </form>
            )}
          </Formik>
        </>
      }
      {!sessionLoaded && <Spinner />}
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
  errors: FormikErrors<SessionForm>,
  user: User,
  forceValidation: () => null
}

export function useSession (): Context {
  return useOutletContext<Context>()
}
