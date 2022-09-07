import { ReactNode } from 'react'
import { Accordion } from 'react-bootstrap'

interface Props {
  label: 'Sessions' | 'Staff' | 'Students'
  children: ReactNode
}

//ASk coordinators what they would like to be able to filter sessions by
export default ({ label, ...props }: Props): JSX.Element => {

  return (
    <Accordion className='p-3 w-100'>
      <Accordion.Item eventKey='0' className='border-0 border-bottom bg-light'>
        <Accordion.Header className='border'>Filter {label}...</Accordion.Header>
        <Accordion.Body>
          {props.children}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}