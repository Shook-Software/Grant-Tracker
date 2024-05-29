import { Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import Alert, { ApiResult } from 'components/ApiResultAlert'
import { SessionView } from 'Models/Session'
import { IdentityClaim, User } from 'utils/authentication'

import paths from 'utils/routing/paths'

interface Props {
  session: SessionView
  attendanceApiResult: ApiResult
  user: User
}

export default ({ session, attendanceApiResult, user }: Props): JSX.Element => {
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
          style={{ width: 'auto', display: user.claim != IdentityClaim.Teacher ? 'auto' : 'none' }}
        >
          Edit
        </Button>
        <Button 
            variant='secondary' 
            as={Link} 
            className='ms-3 px-2 py-1' 
            to={`${paths.Admin.path}/${paths.Admin.Tabs.Sessions.path}`}
        >
          Close
        </Button>
      </Card.Title>
    </>
  )
}
