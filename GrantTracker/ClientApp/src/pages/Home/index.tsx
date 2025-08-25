import { Link } from 'react-router-dom'
import paths from 'utils/routing/paths'

export default (): JSX.Element => {

  document.title = 'Grant Tracker'

  return (
    <div className="w-full max-w-3xl border border-gray-200 rounded-lg divide-y divide-gray-200">
      <div className="p-4">
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
      </div>
      <div className="p-4 flex flex-col items-center">
        <div className='font-bold'>
          <Link to={`${paths.Reports.path}/${paths.Reports.path}`}>
            Reporting
          </Link>
        </div>
        <p>View student, parent, family, and session reporting tables.</p>
      </div>
      <div className="p-4 flex flex-col items-center">
        <div className='font-bold'>
          <Link to={paths.Admin.path}>Admin</Link>
        </div>
        <p>Add sessions and responsible parties.</p>
      </div>
      <div className="p-4 flex flex-col items-center">
        <div className='font-bold'>
          <Link to={paths.Help.path}>Help</Link>
        </div>
        <p>
          View the latest changes, and get answers to commonly asked questions.
        </p>
      </div>
    </div>
  )
}

/*
<p>
          Handle security, data exports, grant setup, and manage responsible
          parties.
        </p>
        */