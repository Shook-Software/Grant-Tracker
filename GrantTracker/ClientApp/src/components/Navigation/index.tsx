import React, { ReactNode, useState } from 'react'
import { NavLinkProps } from 'react-router-dom'

import { User, IdentityClaim } from 'utils/authentication'
import { Container, Nav, Link as NavLink } from './styles'
import styled, { css, keyframes } from 'styled-components'

interface NavigationProps {
  user: User
  children: ReactNode
}

const RenderLinks = (props: {user: User, children: ReactNode}): JSX.Element => {
  const [on, setSwitch] = useState(true);

  const isBritish = (props.user.firstName === 'Roderick' && props.user.lastName === 'Thompson');
  const showAnimation = isBritish || (props.user.firstName === 'Ethan' && props.user.lastName === 'Shook');

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
        <TechnicolorSpan showAnimation={showAnimation && on} isBritish={isBritish}>
          <span>C</span><span>o</span><span>l</span><span>o</span>{isBritish && <span>u</span>}<span>r</span> coming soon!
        </TechnicolorSpan>
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

const britishKeyframes = keyframes`
    0%   { 
      color: var(--tc1); 
    }
    16.667%  { 
      color: var(--tc2); 
    }
    33.33%  { 
      color: var(--tc3); 
    }
    50%  { 
      color: var(--tc4); 
    }
    66.66%  { 
      color: var(--tc5); 
    }
    83.33%  { 
      color: var(--tc6); 
    }
    100% { 
      color: var(--tc1); 
    }
  ` ;

const regularCarousel = keyframes`
    0%   { 
      color: var(--tc1); 
    }
    20%  { 
      color: var(--tc2); 
    }
    40%  { 
      color: var(--tc3); 
    }
    60%  { 
      color: var(--tc4); 
    }
    80%  { 
      color: var(--tc5); 
    }
    100% { 
      color: var(--tc1); 
    }
  `

const carouselAnimation = css`
  animation: ${regularCarousel} 2.5s steps(5, jump-none) infinite;
`

const britishAnimation = css`
  animation: ${britishKeyframes} 3s steps(6, jump-none) infinite;
`

export const TechnicolorSpan = styled.span<{ showAnimation: boolean, isBritish: boolean }>`
  --tc1:#FF3B3B;  /* red */
  --tc2:#FF9F1C;  /* orange */
  --tc3:#2EC4B6;  /* teal */
  --tc4:#3A86FF;  /* blue */
  --tc5:#FF006E;  /* magenta */
  --tc6:#8BC34A;  /*lime green */

  display:inline-block;
  font-weight:700;
  letter-spacing:.02em;

    ${({ showAnimation, isBritish }) =>
    showAnimation
      ? css`
          > span { 
           ${isBritish ? britishAnimation : carouselAnimation}; 
           
            text-shadow:
              0 0 0.02em rgba(255,255,255,.8),   /* tight white core */
              0 0 0.08em currentColor,
              0 0 0.16em currentColor,
              0 0 0.32em currentColor,
              0 0 0.48em currentColor;
           }

        `
      : css`
          > span:nth-child(1) { color: var(--tc1); }
          > span:nth-child(2) { color: var(--tc2); }
          > span:nth-child(3) { color: var(--tc3); }
          > span:nth-child(4) { color: var(--tc4); }
          > span:nth-child(5) { color: var(--tc5); }
          > span:nth-child(6) { color: var(--tc6); }
        `}

  > span:nth-child(1) { animation-delay: 0s }
  > span:nth-child(2) { animation-delay: 0.5s; }
  > span:nth-child(3) { animation-delay: 1s; }
  > span:nth-child(4) { animation-delay: 1.5s; }
  > span:nth-child(5) { animation-delay: 2s; }
  > span:nth-child(6) { animation-delay: 2.5s; }
`
