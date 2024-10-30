import React, { ReactNode } from 'react'
import { NavLinkProps } from 'react-router-dom'

import { User, IdentityClaim } from 'utils/authentication'
import { Container, Nav, Link as NavLink } from './styles'


interface NavigationProps {
  user: User
  children: ReactNode
}

const RenderLinks = (props: {user: User, children: ReactNode}): JSX.Element => {
  return (
    <>
      <ul className='d-flex' data-testid='nav-list'>
        {React.Children.toArray(props.children).map((child, index) => {
          return (
            <li key={`nav-item-${index}`}>
              {child}
            </li>
          )
        })}
      </ul>
      <div>Authenticated as {`${props.user.firstName} ${props.user.lastName}`}</div>
    </>
  )
}

export const Navigation = (props: NavigationProps): JSX.Element => {

  //handle the display of navigation links
  const filteredLinks = React.Children.toArray(props.children).filter((child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      if (child.props.requiredType !== undefined && !props.user.isAuthorized(child.props.requiredType)) {
        return false
      }
      return true
    }
  })

  return (
    <Container className='d-flex justify-content-between position-fixed' style={{zIndex: 1030}}>
      <Nav linkCount={filteredLinks.length}>
        <RenderLinks user={props.user} children={filteredLinks} />
      </Nav>
    </Container>
  )
}


export const Link = (props: NavLinkProps): JSX.Element => (
  <NavLink
    requiredtype={IdentityClaim.Coordinator}
    {...props}
  >
    {props.children}
  </NavLink>
)

interface ProtectedLinkProps extends NavLinkProps {
  requiredType?: IdentityClaim
}

export const ProtectedLink = ({ to, requiredType, ...props }: ProtectedLinkProps): JSX.Element => (
  <NavLink
    to={to}
    requiredtype={requiredType}
    {...props}
  >
    {props.children}
  </NavLink>
)
