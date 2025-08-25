import styled from 'styled-components'
import { Button } from '../../ui/button'

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
    asChild={props.as ? true : false}
    className='flex items-center w-fit'
    {...props}
  >
    {props.as ? (
      <props.as to={props.to}>
        {props.children} &nbsp;<Plus>+</Plus>
      </props.as>
    ) : (
      <>
        {props.children} &nbsp;<Plus>+</Plus>
      </>
    )}
  </Button>
)