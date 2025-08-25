import React, { ReactNode } from 'react'
import { NavLinkProps } from 'react-router-dom'

import { User, IdentityClaim } from 'utils/authentication'
import { Container, Nav, Link as NavLink } from './styles'
import styled from 'styled-components'


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
      <div className='flex justify-between w-full'>
        <span>Welcome, {`${props.user.firstName} ${props.user.lastName}`}</span>
        <TechnicolorSpan><span>C</span><span>o</span><span>l</span><span>o</span><span>r</span> coming soon!</TechnicolorSpan>
      </div>
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
    <Container className='flex justify-between position-fixed' style={{zIndex: 1030}}>
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

export const TechnicolorSpan = styled.span`
  --tc1:#FF3B3B;  /* red */
  --tc2:#FF9F1C;  /* orange */
  --tc3:#2EC4B6;  /* teal */
  --tc4:#3A86FF;  /* blue */
  --tc5:#FF006E;  /* magenta */

  display:inline-block;
  text-shadow:0 .03em .03em rgba(0,0,0,.15);
  font-weight:700;
  letter-spacing:.02em;

  & > span:nth-child(1){ color:var(--tc1); }
  & > span:nth-child(2){ color:var(--tc2); }
  & > span:nth-child(3){ color:var(--tc3); }
  & > span:nth-child(4){ color:var(--tc4); }
  & > span:nth-child(5){ color:var(--tc5); }
`