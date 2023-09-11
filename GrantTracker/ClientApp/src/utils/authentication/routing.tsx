import {Link, LinkProps} from 'react-router-dom'

interface ProtectedLinkProps extends LinkProps {
    auth: Authentication
    requiredType: AuthUserType
}

export const ProtectedLink = ({auth, requiredType, ...props}: ProtectedLinkProps): JSX.Element | null => {
    return auth.isAuthorized(requiredType) ? <Link {...props}>{props.children}</Link> : null
}