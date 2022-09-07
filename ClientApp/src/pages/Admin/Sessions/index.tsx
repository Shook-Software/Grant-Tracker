import { useState, useEffect } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import Search from './Search'
import Button from 'components/Input/Button'
import Table, { Column } from 'components/BTable'
import { useAdminPage, Context } from 'pages/Admin'

import { DayOfWeek } from 'Models/DayOfWeek'
import { SimpleSessionView } from 'models/Session'
import { DropdownOption } from 'types/Session'

import paths from 'utils/routing/paths'
import api from 'utils/api'

function dropdownOptionTransform (value: DropdownOption): string {
  return value.label
}

const columns: Column[] = [
  {
    label: 'Name',
    attributeKey: 'name',
    sortable: true
  },
  {
    label: 'Activity',
    attributeKey: 'activity',
    sortable: true,
    transform: dropdownOptionTransform
  },
  {
    label: 'Session Type',
    attributeKey: 'sessionType',
    sortable: true,
    transform: dropdownOptionTransform
  },
  {
    label: 'Schedule',
    attributeKey: '',
    sortable: true,
    transform: (session: SimpleSessionView) => {
      if (!session.daySchedules || session.daySchedules.length === 0)
        return 'No Schedule'

      let daysOfWeek = session.daySchedules.map(day => day.dayOfWeek).sort().map((dayOfWeek, index) => 
        index !== session.daySchedules.length - 1 
        ? `${DayOfWeek.toChar(dayOfWeek)}, ` 
        : DayOfWeek.toChar(dayOfWeek)
      )

      return daysOfWeek
    }
  },
  {
    label: '',
    attributeKey: 'sessionGuid',
    sortable: false,
    transform: (value: string) => (
      <div className='d-flex justify-content-center'>
        <Link to={value} style={{ color: 'inherit' }}>
          View
        </Link>
      </div>
    )
  }
]

//Just use the organization a user is tied to on the API side, no need to send it from here.
export default (): JSX.Element => {
  document.title = 'GT - Admin / Sessions'
  const { user }: Context = useAdminPage()
  const [state, setState] = useState<SimpleSessionView[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false) //can we make a custom hook for loading?

  function fetchSessions (params) {
    if (user.organization.guid && user.year.guid) {
      setIsLoading(true)

      api
        .get('session', {
          params: { 
            sessionName: params?.sessionName, 
            grades: params?.grades,
            organizationGuid: user.organization.guid,
            yearGuid: user.year.guid
          }
        })
        .then(res => {
          const sessions: SimpleSessionView[] = res.data
          setState(sessions)
        })
        .catch(err => console.warn())
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  const handleChange = (filter): void => {
    fetchSessions(filter)
  }

  useEffect(() => {
    fetchSessions(null)
  }, [user])

  return (
    <>
      <Button
        as={Link}
        to={`${paths.Edit.path}/${paths.Edit.Sessions.path}/overview`}
      >
        Add New Session
      </Button>

      <Search handleChange={handleChange} />

      <Container className='px-3'>
        <h5>Sessions for {user.organizationName}</h5>
        {isLoading ? (
          <Spinner animation='border' />
        ) : !state || state.length === 0 ? (
          <div className='d-flex align-items-center justify-content-center'>
            <p>No sessions found...</p>
          </div>
        ) : (
          <Table columns={columns} dataset={state} rowProps={{key: 'sessionGuid'}} />
        )}
      </Container>
    </>
  )
}
