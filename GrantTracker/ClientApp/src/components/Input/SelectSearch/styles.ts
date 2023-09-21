import styled from 'styled-components'

export const Container = styled.div`
  position: relative;
  width: max-content;
`

export const OptionList = styled.ul`
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  right: 0;
  top: 2.25rem;
  max-height: 10rem;
  min-width: 100%;
  padding: 0;
  
  border: 1px solid var(--bs-gray-400);
  border-radius: 0.25rem;

  list-style-type: none;
  background-color: white;
  z-index: 101;
  overflow-y: scroll;

  &::first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }
`

export const Option = styled.li`
  margin: 0.375rem 0.0rem;
  background-color: white;
`

export const Button = styled.button`
  width: 100%;

  border: none;
  text-align: left;
  background-color: white;
  
  
  &:hover {
    user-select: none;
    background-color: var(--bs-blue);
    text-decoration: underline 1px black;
    cursor: pointer;
  }
`