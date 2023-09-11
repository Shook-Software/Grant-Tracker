import React from 'react'
import {Container, Label} from './styles'

interface InputElementProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string
	children: React.ReactNode
}

export default ({label, children, ...props}: InputElementProps): JSX.Element => (
	<Container>
		<Label 
			htmlFor={props.id}
			error={false}
		>{label}:</Label>
		{React.cloneElement(children, {...props})}
	</Container>
)