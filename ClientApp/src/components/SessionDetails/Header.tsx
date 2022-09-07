import { Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import Alert, { ApiResult } from 'components/ApiResultAlert'
import { SessionView } from 'Models/Session'

import paths from 'utils/routing/paths'

interface Props {
  session: SessionView
  attendanceApiResult: ApiResult
}

export default ({ session, attendanceApiResult }: Props): JSX.Element => {
  return (
    <>
      <Card.Title>
        <Alert apiResult={attendanceApiResult} />
      </Card.Title>
      <Card.Title as={'h2'} className='d-flex align-items-center justify-content-center'>
        {session!.name}&nbsp;
        <Button
          variant='primary'
          as={Link}
          className='px-2 py-1'
          to={`${paths.Edit.path}/${paths.Edit.Sessions.path}/${session.guid}`}
          style={{ width: 'auto' }}
        >
          Edit
        </Button>
      </Card.Title>
    </>
  )
}
