import styled from 'styled-components'

const totalItems: number = 10
const optionHeight: number = 1.5 //rem
const dropdownWidth: number = 200 //px
const borderRadius: number = 10 //px

const itemStyle: string = `
  min-height: 2rem;
	height: auto;
	width: 100%;

	padding: 0.375rem 0.75rem;
  background-color: var(--bs-white);

	&:hover {
		user-select: none;
    background-color: var(--bs-blue);
    text-decoration: underline 1px black;
    cursor: pointer;
  }
`

const destroyButtonDefaultStyles: string = `
	background: none;
	color: inherit;
	border: none;
	padding: 0;
	font: inherit;
	cursor: pointer;
	outline: inherit;
`

interface DropdownProps {
  width?: number
}

export const Dropdown = styled.div<DropdownProps>`
  position: relative;
  min-height: 2em;
  width: ${props => props.width || `100%`};
  max-width: 100%;
  display: flex;
  flex-direction: column;

  text-align: left;
  border: 1px solid var(--bs-gray-400);
  border-radius: 0.25rem;
  box-sizing: border-box;
`

export const DropdownController = styled.button`
  ${destroyButtonDefaultStyles}
  ${itemStyle}
	background-color: inherit;
`

interface OptionProps {
  isActive: boolean
}

export const Option = styled.div<OptionProps>`
  ${itemStyle}
  flex: 1;

  text-align: center;
  overflow-wrap: break-word;

  ${props => {
    if (props.isActive)
      return `
				background-color: rgba(80, 175, 247, 0.95);
				text-decoration: underline 1px black;
			`
  }}

  & > p {
    margin: 0;
  }
`

interface OptionListProps {
  width?: string
  isCollapsed: boolean
  isOverflowing: boolean
}

export const OptionList = styled.div<OptionListProps>`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-height: ${0.5 + optionHeight * (totalItems - 2)}rem;

  top: 100%;
  left: 0;
  right: 0; //left and right stretch it to full width

  border: inherit;
  border-radius: 6px;
  box-sizing: border-box;
  overflow-x: visible;
  overflow-y: ${props => (props.isOverflowing ? 'scroll' : 'hidden')};
  visibility: ${props => (props.isCollapsed ? 'hidden' : 'visible')};
  z-index: 2;

  &::first-child {
    border-top-left-radius: ${borderRadius}px;
    border-top-right-radius: ${borderRadius}px;
  }
`
