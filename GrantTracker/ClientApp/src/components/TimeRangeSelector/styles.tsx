import styled from 'styled-components'
import { standardInput, onHoverBehavior } from 'mixins'
const width: number = 200

export const Container = styled.div<{ isCollapsed: boolean, small: boolean }>`
  position: relative; 
  display: block;
  flex-wrap: none;
  width: fit-content;

  margin: 0;
  ${standardInput}

  ${props =>
    props.isCollapsed
      ? `&:focus {
          box-shadow: var(--input-box-shadow);
        }`
      : ''}
  

  &:focus-within {
    box-shadow: var(--input-box-shadow);
  }

  ${props => props.small ? 'padding: 0.15rem 0.5rem' : ''}
`

export const TextInputButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
`

export const TextInput = styled.input`
  all: unset;
  width: 2rem;
  text-align: center;

  &:focus {
    color: var(--bs-white);
    background-color: var(--bs-primary);
    caret-color: transparent;
  }
`

export const VisualInputContainer = styled.div`
  position: relative;
  top: 7px;
  display: flex;
  flex-wrap: wrap;
  margin-left: -8px;
  margin-right: -8px;
`

export const SelectionGrid = styled.div<{ isCollapsed: boolean }>`
  position: absolute;
  min-width: ${width}px;
  display: grid;
  grid-template-columns: 40% 40% 20%;

  top: 100%;
  left: 0;
  right: 0;

  background-color: white;
  ${standardInput}
	visibility: ${props => (props.isCollapsed ? 'hidden' : 'visible')};
  z-index: 2;
`

export const OptionsContainer = styled.div`
  position: relative;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;

  border-right: 1px solid black;
`

export const PeriodOptionsContainer = styled.div`
  position: relative;
  left: 0;
  right: 0;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
`

interface ItemProps {
  isActive: boolean
}

export const Option = styled.div<ItemProps>`
  text-align: center;
  ${props => {
    if (props.isActive)
      return `
        font-weight: 500;
        color: var(--bs-white);
        background-color: var(--bs-primary);
        text-decoration: underline 1px var(--bs-white);
      `
  }}

  ${onHoverBehavior}
`

export const SubgridTitle = styled.div`
  grid-column: 1/3;
  text-align: center;
  border-bottom: 1px solid black;
`
