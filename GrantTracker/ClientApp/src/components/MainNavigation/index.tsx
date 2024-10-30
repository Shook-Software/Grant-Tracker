import { Navigation, Link, ProtectedLink } from 'components/Navigation'
import { IdentityClaim } from 'utils/authentication'

export default ({ paths, user}): JSX.Element => (
  <Navigation 
    user={user}
  >
    <Link
      to='/home'
      end
    >
      Grant Tracker
    </Link>

    <ProtectedLink
      to={`${paths.Reports.path}`}
      requiredType={IdentityClaim.Coordinator}
    >
      Reporting
    </ProtectedLink>

    <ProtectedLink
      to={user.claim == IdentityClaim.Teacher ? paths.Admin.path + '/' + paths.Admin.Tabs.Sessions.path : paths.Admin.path}
      requiredType={IdentityClaim.Teacher}
    >
      Admin
    </ProtectedLink>

    <ProtectedLink
      to={paths.Configuration.path + '/auth'}
      requiredType={IdentityClaim.Administrator}
    >
      Configuration
    </ProtectedLink>

    <Link
      to={paths.Help.path}
    >
      Help
    </Link>
  </Navigation>
)