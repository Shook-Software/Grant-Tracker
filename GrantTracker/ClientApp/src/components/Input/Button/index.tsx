import styled from 'styled-components'
import { Button } from 'react-bootstrap'

const Plus = styled.div`
height: 1.2rem;
width: 1.2rem;
display: inline-block;

line-height: 1rem;
border: 1px solid var(--bs-gray-400);
border-radius: 50%;
`

//props that extends button props

export default (props): JSX.Element => (
  <Button
    variant='primary'
    as={props.as}
    className='d-flex align-items-center mx-3 mt-3'
    to={props.to}
    style={{ width: 'fit-content' }}
    {...props}
  >
    {props.children} &nbsp;<Plus>+</Plus>
  </Button>
)