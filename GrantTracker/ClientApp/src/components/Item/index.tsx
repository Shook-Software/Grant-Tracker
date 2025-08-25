import styled from 'styled-components'
import { ListGroupItem } from '../ui/ListGroup'

export const Item = styled(ListGroupItem)`
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
    ? <div className='px-2 flex-[2] px-0'>{value}</div>
    : <p className='px-2 flex-[2] px-0'>{value}</p>

  return (
    <div className='mx-auto px-4 max-w-7xl'>
      <Item style={style} className='flex flex-wrap -mx-2'>
        <p className='px-2 flex-1 ps-0 font-medium'>{label}</p>
        {valueComponent}
        {subscript 
          ? <small className='px-2 w-full p-0 text-red-600' style={{flexBasis: '100%'}}>{subscript}</small>
          : null}
      </Item>
    </div>
  )
}