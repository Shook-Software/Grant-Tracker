import styled from 'styled-components'

export const Container = styled.span`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
`

export const Label = styled.label<{
	error: boolean
}>`
	display: block;

	padding-bottom: 5px;

	text-align: left;
	text-decoration: underline;
	font-size: 18px;
	color: ${props => props.error ? 'red' : 'black'};
`