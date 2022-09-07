import styled from 'styled-components'
import { ListGroup } from 'react-bootstrap'

export const Item = styled(ListGroup.Item)`
  display: flex;

  & > * {
    flex: 2;
    margin: 0;
  }

	& > p:first-child {
		flex: 1;
    text-align: left;
    font-size: 0.95rem;
    text-decoration: var(--bs-gray-500) underline;
    padding-right: 1rem;
	}

	& > div {
		flex: 2;
	}

	& > label {
		flex: 1;
		margin: 0;
		text-align: left;
		font-size: 0.9rem;
		text-decoration: var(--bs-gray-500) underline;
		padding-right: 1rem;
	}
`

export default ({ label, value, editable = false }): JSX.Element => {
  if (editable)
    return <p>Not Implemented</p>

  const valueComponent = (typeof value === 'object' || typeof value === 'function')
    ? value
    : <p>{value}</p>

  return (
    <Item>
      <p>{label}</p>
      {valueComponent}
    </Item>
  )
}