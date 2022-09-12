import { useState, useEffect, forwardRef } from 'react'
import { Modal, Button, Form, Popover, OverlayTrigger } from 'react-bootstrap'

import Table, { Column } from 'components/BTable'
import Dropdown from 'components/Input/Dropdown'
import Search from './Search'

import { StaffDto } from 'types/Dto'
import { DropdownOption } from 'types/Session'

import api from 'utils/api'

//An easy way to add an instructor from Synergy to the GrantTracker.
//Pop up over the table, set the instructor status, then submit.
//@ts-ignore
const InstructorPopover = forwardRef(({ values, dropdownOptions, handleAddInstructor, ...props }, ref): JSX.Element => {
  const [status, setStatus] = useState<string>('')

  const fullName: string = `${values.firstName} ${values.lastName}`
  const labelFor: string = `${fullName}-status`

  return (
    <Popover
      key={values.badgeNumber}
      {...props}
      //@ts-ignore
      ref={ref}
    >
      <Popover.Header>{fullName}</Popover.Header>
      <Popover.Body>
        <Form onSubmit={(event) => {
          event.preventDefault()
          const newInstructor: StaffDto = {
            firstName: values.firstName,
            lastName: values.lastName,
            badgeNumber: values.badgeNumber,
            statusGuid: status
          }
          handleAddInstructor(newInstructor)
        }}>
          <Form.Group>
            <Form.Label htmlFor={labelFor}>Instructor Status:</Form.Label>
            <Dropdown
              id={labelFor}
              options={dropdownOptions}
              value={status}
              onChange={(guid: string) => setStatus(guid)}
            />
          </Form.Group>
          <Button
            disabled={status === ''}
            className='my-2'
            type='submit'
          >
            Add Instructor
          </Button>
        </Form>
      </Popover.Body>
    </Popover>
  )
})

const columnsBuilder = (handleAddInstructor, dropdownOptions): Column[] => ([
  {
    label: 'First Name',
    attributeKey: 'firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'lastName',
    sortable: true
  },
  {
    label: 'Organization',
    attributeKey: 'organizationName',
    sortable: true
  },
  {
    label: 'Badge Number',
    attributeKey: 'badgeNumber',
    sortable: true
  },
  {
    key: 'addInstructor',
    label: 'Add',
    attributeKey: '',
    sortable: false,
    transform: (value: any) => {
      return (
        <div className='position-relative'>
          <OverlayTrigger
            trigger='click'
            placement='left'
            overlay={(<InstructorPopover values={value} dropdownOptions={dropdownOptions} handleAddInstructor={handleAddInstructor} />)}
            rootClose
          >
            <Button>+</Button>
          </OverlayTrigger>
        </div>
      )
    }
  }
])

//they need to be able to handle users viewing their changes on 'review changes'
// intercept and use addInstructor as a callback after pushing results to a list
export default ({ addInstructor, handleClose }): JSX.Element => {
  const [state, setState] = useState<any[]>([])
  const [dropdownOptions, setOptions] = useState<DropdownOption[]>([])

  function handleInstructorSearch (name: string, badgeNumber: string) {
    api
      .get('instructor/search', {params: {name, badgeNumber}})
      .then(res => {
        setState(res.data)
      })
      .catch(err => {})
  }

  useEffect(() => {
    api
      .get('dropdown/view/instructorStatus')
      .then(res => setOptions(res.data))
      .catch(err => console.warn(err))
  }, [])

  const columns: Column[] = columnsBuilder(addInstructor, dropdownOptions)

  return (
    <>
      <Modal.Body className='d-flex flex-column align-items-center'>
        <Search handleChange={handleInstructorSearch} />
        <Table columns={columns} dataset={state} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </>
  )
}