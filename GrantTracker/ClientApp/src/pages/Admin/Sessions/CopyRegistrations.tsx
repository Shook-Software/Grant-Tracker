import { useState } from 'react'
import { Row, Col, Button, ListGroup, Spinner } from 'react-bootstrap'

import Dropdown from 'components/Input/Dropdown'

import { StudentRegistrationDomain } from 'Models/StudentRegistration'

import api from 'utils/api'
import { SimpleSessionView } from 'Models/Session'

interface Props {
  state: SimpleSessionView[]
}

export default ({state}: Props): JSX.Element => {
  const [conflicts, setConflicts] = useState<string[]>([])
  const [status, setStatus] = useState<string>('')
  const [firstSession, setFirstSession] = useState<string>('')
  const [secondSession, setSecondSession] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function handleCopy (): void {
    let studentSchoolYearGuids: string[] = []
    setIsLoading(true)
    setFirstSession('')
    setSecondSession('')

    api
      .get<StudentRegistrationDomain[]>(`session/${firstSession}/student/registration`)
      .then(res => {
        //sorted for ease of display
        studentSchoolYearGuids = res.data.map(i => i.studentSchoolYear.guid).filter((guid, index, self) => self.indexOf(guid) === index)

        //we should change this to post to the existing registration, and modify it here to fit the registrations, or in the modal we eventually create
        api
          .post(`session/${secondSession}/registration/copy`, studentSchoolYearGuids)
          .then(res => {
            setStatus('Attendance was successfully copied!')
            setConflicts([])
          })
          .catch(err => {
            setStatus('')
            setConflicts(err.response.data)
          })
      })
      .catch(err => {
        console.warn(err)
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <>
      <Row>
        <Col>
          <label htmlFor='from-session'>From...</label>
          <Dropdown
            id='from-session'
            value={firstSession}
            options={state.map(s => ({
              guid: s.sessionGuid,
              label: s.name
            }))}
            onChange={(guid: string) => setFirstSession(guid)}
          />
        </Col>
        <Col>
          <label htmlFor='to-session'>To...</label>
          <Dropdown
            id='to-session'
            value={secondSession}
            options={state.map(s => ({
              guid: s.sessionGuid,
              label: s.name
            }))}
            onChange={(guid: string) => setSecondSession(guid)}
          />
        </Col>
        <Col className='d-flex flex-column-reverse'>
          <Button 
            style={{width: 'fit-content'}}
            disabled={!(firstSession !== '' && secondSession !== '')}
            onClick={() => handleCopy()}
          >
            Submit
          </Button>
        </Col>
      </Row>
      <Row>
        {isLoading
          ?
            <Spinner animation='border' role='status' />
          :
            <> 
              <h5 className='text-success'><u>{status}</u></h5>
              <ConflictsDisplay conflicts={conflicts} />
            </>
        }
      </Row>
    </>
  )
}


const ConflictsDisplay = ({conflicts}: {conflicts: string[]}): JSX.Element => {
  if (!conflicts || conflicts.length === 0)
    return <></>

  return (
    <>
      <h5 className='text-danger'><u>Conflicts:</u></h5>
      <ListGroup className='px-2'>
        {conflicts.map((conflict, index) => (
          <ListGroup.Item key={index}>{conflict}</ListGroup.Item>
        ))}
      </ListGroup>
    </>
  )
}