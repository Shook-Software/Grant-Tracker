import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { flex } from 'mixins'

interface NavProps {
  linkCount: number
}

export const Container = styled.div`
  position: relative;
  width: 100%;
`

export const Nav = styled.nav<NavProps>`
  height: inherit;
  width: 100%;
  flex: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  z-index: 10;

  background-color: #343a40;
  box-shadow: 0 12px 12px -2px rgba(0, 0, 0, 0.2);
  color: #f8f9fa;

  > ul {
    height: 100%;
    ${flex.centered}
    flex-direction: row;
    margin: 0;
    list-style: none;
    color: inherit;

    > li {
      width: 200px;
      ${flex.centered}
      color: inherit;
      font-size: 1.5rem;
    }
  }

  > div {
    flex: 1;
    padding: 0 2rem;
    color: inherit;
  }
`

interface ProtectedLinkProps {
  requiredtype?: any
}

export const Link = styled(NavLink) <ProtectedLinkProps>`
  height: 100%;
  width: 100%;
  padding: 0.5rem 0rem;

  color: inherit;
  text-decoration: none;
  text-align: center;
  font-size: inherit;

  &:hover {
    color: inherit;
    background-color: #555e68 !important;
    border: 1px solid black;
    box-sizing: border-box;
  }

  &.active {
    background-color: #555e68 !important;
    border: 1px solid black;
    box-sizing: border-box;
  }
`

