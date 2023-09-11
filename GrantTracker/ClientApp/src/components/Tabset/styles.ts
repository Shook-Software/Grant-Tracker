import styled from 'styled-components'
import { Link as RouterLink } from 'react-router-dom'

//temp
const activeButton = `
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  border: 1px solid transparent;
  border-color: #dee2e6 #dee2e6 #fff;
  //Cover up border below if it exists
  box-shadow: 0 1px white;
	color: var(--color-light-blue);
	text-decoration: underline var(--color-light-blue);
	transform: unset;
	background-color: unset;
	pointer-events: none;
`

interface SetContainerProps {
  height?: string
  width?: string
}

export const TabList = styled.ul<SetContainerProps>`
  height: ${props => props.height || '40px'};
  width: ${props => props.width || '100%'};

  display: flex;

  margin: 0;
  padding: 0;

  border-bottom: 1px solid #dee2e6;
  list-style: none;

  & > li {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`


interface TabContainerProps {
  isActive: boolean
}
//go in and replace all the flex centers with a mixin sometime
export const Link = styled(RouterLink) <TabContainerProps>`
  height: 100%;
  width: 100%;
  display: block;
  padding: 0.5rem 1rem;
  margin-bottom: -1px;
  text-align: center;
  text-decoration: none;
  user-select: none;
  box-sizing: border-box;

  ${props => {
    if (props.isActive)
      return `
				${activeButton}
			`
  }}
`

