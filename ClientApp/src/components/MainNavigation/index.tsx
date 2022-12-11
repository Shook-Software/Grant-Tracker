import { Navigation, Link, ProtectedLink } from 'components/Navigation'
import { IdentityClaim } from 'utils/authentication'

export default ({ paths, user, orgYearChange }): JSX.Element => (
  <Navigation 
    user={user}
    orgYearChange={orgYearChange}
  >
    <Link
      to='/home'
      end
    >
      Grant Tracker
    </Link>

    <Link
      to={`${paths.Reports.path}/${paths.Reports.Sessions.path}`}
    >
      Reporting
    </Link>

    <ProtectedLink
      to={paths.Admin.path}
      requiredType={IdentityClaim.Coordinator}
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