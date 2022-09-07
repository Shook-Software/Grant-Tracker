import styled from 'styled-components'

export const Input = styled.input`
  &[type='checkbox'] {
    display: 'block';
    user-select: none;
    margin-left: 0.25rem;
    margin-right: 1rem;
  }

  + label {
    user-select: none;
  }
`

export const StyledCheckbox = styled.div<{
  isChecked: boolean
}>`
	width: 80px;
  height: 24px;
  position: relative;

  background: white;
  border: 2px solid black;
  border-radius: 50px;

  box-shadow: inset 0px 1px 1px rgba(255,255,255,0.2),
										0px 1px 0px rgba(0,0,0,0.5);

  cursor: pointer;

	&:before {
    position: absolute;
    left: 10px;

		content: 'Yes';
    font: 12px/26px;
    color: black;
	}

	&:after {
    position: absolute;
    right: 10px;

		content: 'No';
    font: 12px/26px;
    color: black;
	}

	& > input[type=checkbox] {
		visibility: hidden;
	}

	& > label {
		display: block;
    width: 34px;
    height: 20px;
    position: absolute;
    top: 0px;
    left: ${props => (props.isChecked ? '43' : '0')}px;
    z-index: 1;

    transition: all .4s ease;

    border-radius: 50px;
    box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.3);
    background: gray;
	}
}
`
