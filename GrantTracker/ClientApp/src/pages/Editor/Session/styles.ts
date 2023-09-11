import styled from 'styled-components'

export const Input = styled.input`
  &[type='text'] {
    height: 1.5rem;

    border: 2px solid black;
    border-radius: 8px;
  }

  &[type='checkbox'] {
    display: 'block';
    user-select: none;
  }

  &[type='date'] {
    height: 1.5rem;
    width: 150px;

    border: 2px solid black;
    border-radius: 10px;
    box-sizing: border-box;
  }

  + label {
      user-select: none;
    }
`

export const TextArea = styled.textarea`
  height: 100px;
  width: 200px;

  padding: 0px 5px 0px 5px;

  border: 2px solid black;
  border-radius: 8px;
`

export const CheckboxContainer = styled.div`
  width: 50%;
  display: grid;
  grid-template-columns: 80% 20%;
  grid-template-rows: 1fr 1fr 1fr;
`
