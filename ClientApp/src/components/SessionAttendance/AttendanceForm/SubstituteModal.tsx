import { useState, useEffect } from 'react'
import { Modal, Form, Button} from 'react-bootstrap'

import Dropdown from 'components/Input/Dropdown'

import type { DropdownOption } from 'Models/Session'

import api from 'utils/api'

interface Props {
  show: boolean,
  onClose: () => void
  dispatch
}

const defaultValues = {
  firstName: '',
  lastName: '',
  badgeNumber: '',
  statusGuid: ''
}

export default ({show, onClose, dispatch}: Props): JSX.Element => {
  const [substitute, setSubstitute] = useState(defaultValues)
  const [statuses, setStatuses] = useState<DropdownOption[]>([])

  function addSubstitute (): void {
    dispatch({type: 'addSubstitute', payload: substitute})
    setSubstitute(defaultValues)
    onClose()
  }

  useEffect(() => {
    api
      .get('dropdown/view/instructorStatus')
      .then(res => setStatuses(res.data))
  }, [])

  return (
    <Modal show={show}>
      <Modal.Header closeButton onHide={() => onClose()}>
        Add Substitute
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Label htmlFor='subFirstname'>First Name</Form.Label>
          <Form.Control 
            type='text' 
            id='subFirstName'
            value={substitute.firstName}
            onChange={(e) => setSubstitute({...substitute, firstName: e.target.value})}
          />
          <Form.Label htmlFor='subLastname'>Last Name</Form.Label>
          <Form.Control 
            type='text' 
            id='subLastname' 
            value={substitute.lastName}
            onChange={(e) => setSubstitute({...substitute, lastName: e.target.value})}
          />
          <Form.Label htmlFor='subBadgeNumber'>BadgeNumber</Form.Label>
          <Form.Control
            type='text'
            id='subBadgeNumber'
            placeholder='Required only if sub has a badgenumber.'
            value={substitute.badgeNumber}
            onChange={(e) => setSubstitute({...substitute, badgeNumber: e.target.value})}
          />
          <Form.Label htmlFor='subStatus'>Status</Form.Label>
          <Dropdown 
            value={substitute.statusGuid}
            options={statuses}
            onChange={(guid: string) => setSubstitute({...substitute, statusGuid: guid})}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => addSubstitute()} style={{ width: 'fit-content' }}>
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  )
}