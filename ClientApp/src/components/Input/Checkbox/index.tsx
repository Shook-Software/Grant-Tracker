import React from 'react'
import {Input, StyledCheckbox} from './styles'

interface Props {
	id: string
	label: string
	onChange?: (event: React.BaseSyntheticEvent) => void
}

export const Checkbox = ({id, label, onChange}: Props): JSX.Element => {
	return (
		<>
			<label htmlFor={id}>{label}</label>
			<Input id={id} type='checkbox' onChange={onChange} />
		</>
	)
}

export {StyledCheckbox}