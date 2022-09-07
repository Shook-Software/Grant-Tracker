import { useState, useEffect } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'

import Table, { Column } from 'components/BTable'
import Dropdown from 'components/Input/Dropdown'

import { DropdownOption } from 'Models/Session'

import { User } from 'utils/authentication'
import api from 'utils/api'

const columns: Column[] = [
  {
    label: 'First Name',
    attributeKey: 'firstName',
    sortable: true
  },{
    label: 'Last Name',
    attributeKey: 'lastName',
    sortable: true
  },
  {
    label: 'Badge Number',
    attributeKey: 'badgeNumber',
    sortable: true
  },
  {
    label: 'Organization Name',
    attributeKey: 'organization.name',
    sortable: true
  },
  {
    label: 'User Type',
    attributeKey: 'claim',
    sortable: true
  }
]

function addCoordinator (organizationYearGuid, badgeNumber, claimType) {
  return new Promise((resolve, reject) => {
    api.post('user', { organizationYearGuid, badgeNumber, claimType })
    .then(res => resolve(res))
    .catch(err => reject(err))
  })
}

const AddCoordinatorModal = ({organizations, show, setShow}): JSX.Element => {
  document.title = 'GT - Config / Auth'
  const [organizationYearGuid, setOrganizationYearGuid] = useState<string>('')
  const [badgeNumber, setBadgeNumber] = useState<string>('')
  const [claimType, setClaimType] = useState<string>('1')

  const options: DropdownOption[] = organizations.map(org => ({
    guid: org.organizationYearGuid,
    label: org.name
  }))

  const claimOptions: DropdownOption[] = [
    {
      guid: '0',
      label: 'Administrator'
    },
    {
      guid: '1',
      label: 'Coordinator'
    }
  ]

  return (
    <Modal show={show}>
      <Modal.Header closeButton onHide={() => setShow(false)}>
        Add Coordinator
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label htmlFor='org-dropdown'>Organization</Form.Label>
            <Dropdown
              id='org-dropdown'
              options={options}
              value={organizationYearGuid}
              onChange={(guid: string) => setOrganizationYearGuid(guid)}
            />
          </Form.Group> <Form.Group>
            <Form.Label htmlFor='claim-dropdown'>User Type</Form.Label>
            <Dropdown
              id='claim-dropdown'
              options={claimOptions}
              value={claimType}
              onChange={(guid: string) => setClaimType(guid)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='coordinator-badge-number'>Badge Number</Form.Label>
            <Form.Control type='text' value={badgeNumber} onChange={(event) => setBadgeNumber(event.target.value)} />
            <Form.Text className='text-muted'>6 digits, including leading zeros.</Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => {
          addCoordinator(organizationYearGuid, badgeNumber, claimType)
          .finally(() => setShow(false))
          
          }}>
            Add
          </Button>
        </Modal.Footer>
    </Modal>
  )
}

export default (): JSX.Element => {
  const [coordinators, setCoordinators] = useState<User[]>([])
  const [organizations, setOrganizations] = useState<DropdownOption[]>([])
  const [show, setShow] = useState<boolean>(false)

  useEffect(() => {
    api.get<User[]>('developer/authentication').then(res => {
      setCoordinators(res.data)
    })

    api.get('dropdown/organization').then(res => {
      setOrganizations(res.data)
    })
  }, [])

  useEffect(() => {
    api.get('developer/authentication').then(res => {
      setCoordinators(res.data)
    })
  }, [show])

  return (
    <div>
      <Button className='my-3' onClick={() => setShow(true)}>Add Coordinator</Button>
      <Table dataset={coordinators} columns={columns} />
      <AddCoordinatorModal
        organizations={organizations}
        show={show}
        setShow={setShow}
      />
    </div>
  )
}
