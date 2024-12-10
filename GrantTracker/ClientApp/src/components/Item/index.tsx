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
	}

	& > div {
		flex: 2;
	}

	& > label {
		margin: 0;
		text-align: left;
		font-size: 0.9rem;
		text-decoration: var(--bs-gray-500) underline;
	}
`

export default ({ label, value, subscript = undefined, editable = false, style = null }): JSX.Element => {
  if (editable)
    return <p>Not Implemented</p>

  const valueComponent = (typeof value === 'object' || typeof value === 'function')
    ? <div className='col-8 px-0'>{value}</div>
    : <p className='col-8 px-0'>{value}</p>

  return (
    <div className='container'>
      <Item style={style} className='row'>
        <p className='col-4 ps-0'>{label}</p>
        {valueComponent}
        {subscript 
          ? <small className='col-12 p-0 text-danger' style={{flexBasis: '100%'}}>{subscript}</small>
          : null}
      </Item>
    </div>
  )
}