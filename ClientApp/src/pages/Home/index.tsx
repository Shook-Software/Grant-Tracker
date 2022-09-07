import styled from 'styled-components'
import { Link } from 'react-router-dom'
import paths from 'utils/routing/paths'

import { ListGroup } from 'react-bootstrap'

export default (): JSX.Element => {

  document.title = 'Grant Tracker'

  return (
    <ListGroup style={{ width: '700px' }}>
      <ListGroup.Item>
        <h5 style={{ textAlign: 'center' }}>
          <p>
            Grant Tracker is the Tucson Unified School District's Nita M.
            Lowey's 21st Century Community Learning Centers (21st CCLC)
            attendance tracking portal.
          </p>
          <p>
            Data found on Grant Tracker contains sensitive, student-level
            information.
          </p>
          <p>
            By accessing the Grant Tracker site, you are agreeing to protect the
            FERPA rights of students by not distributing any information
            inappropriately.
          </p>
        </h5>
      </ListGroup.Item>
      <ListGroup.Item className='d-flex flex-column align-items-center'>
        <div className='fw-bold'>
          <Link to={`${paths.Reports.path}/${paths.Reports.Sessions.path}`}>
            Reporting
          </Link>
        </div>
        <p>View student, parent, family, and session reporting tables.</p>
      </ListGroup.Item>
      <ListGroup.Item className='d-flex flex-column align-items-center'>
        <div className='fw-bold'>
          <Link to={paths.Admin.path}>Admin</Link>
        </div>
        <p>Add sessions and responsible parties.</p>
      </ListGroup.Item>
      <ListGroup.Item className='d-flex flex-column align-items-center'>
        <div className='fw-bold'>
          <Link to={paths.Help.path}>Help</Link>
        </div>
        <p>
          View the latest changes, and get answers to commonly asked questions.
        </p>
      </ListGroup.Item>
    </ListGroup>
  )
}

/*
<p>
          Handle security, data exports, grant setup, and manage responsible
          parties.
        </p>
        */