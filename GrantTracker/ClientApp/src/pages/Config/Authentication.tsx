import { useState, useEffect, useMemo } from 'react'
import { Alert, Button, Form, Modal, Popover } from 'react-bootstrap'

import Table, { Column } from 'components/BTable'
import Dropdown from 'components/Input/Dropdown'

import { DropdownOption } from 'Models/Session'

import { User } from 'utils/authentication'
import api, { AxiosIdentityConfig } from 'utils/api'

interface UserDeletionProps {
  user: User
  handleChange: (userIsDeleted: boolean) => void
}

const ConfirmDeletionPopover = ({user, handleChange}: UserDeletionProps): JSX.Element => (
  <Popover 
    id='popover-contained' 
    style={{left: '100%', top: '0', width: 'max-content'}}
  >
    <Popover.Header as='h3'>{user.firstName} {user.lastName}</Popover.Header>
    <Popover.Body>
      <div>
        Are you sure you want to delete this user?
      </div>
      <div className='d-flex justify-content-between mt-3'>
        <Button 
          size='sm'
          onClick={() => {handleChange(true)}}
        >
          Confirm
        </Button>
        <Button 
          size='sm'
          onClick={() => {handleChange(false)}}
        >
          Return
        </Button>
      </div>
    </Popover.Body>
  </Popover>
)

const DeleteUserComponent = ({user, onChange}) => {
  const [showPopup, setShowPopup] = useState<boolean>(false)

  const handleChange = (userIsToBeDeleted: boolean) => {
    if (userIsToBeDeleted)
      onChange(user.userOrganizationYearGuid)
    else
      setShowPopup(false)
  }
  
  return (
    <div className='position-relative'>
      <Button 
        className='w-100'
        variant='danger'
        size='sm'
        onClick={(e) => setShowPopup(!showPopup)}
      >
        Delete
      </Button>
      {showPopup ? <ConfirmDeletionPopover user={user} handleChange={(userIsDeleted: boolean) => handleChange(userIsDeleted)} /> : null}
    </div>
  )
}

const createColumns = (onChange): Column[] => ([
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
    sortable: true,
    transform: (claim: number) => claim === 0 ? 'Administrator' : 'Coordinator'
  },
  {
    label: '',
    attributeKey: '',
    key: 'userOrganizationYearGuid',
    sortable: false,
    transform: (user: User) => <DeleteUserComponent user={user} onChange={onChange} />
  }
])



const AddUserModal = ({organizationYears, show, setShow, onChange}): JSX.Element => {
  const [organizationYearGuid, setOrganizationYearGuid] = useState<string>('')
  const [badgeNumber, setBadgeNumber] = useState<string>('')
  const [claimType, setClaimType] = useState<string>('1')

  const options: DropdownOption[] = organizationYears.map(orgYear => ({
    guid: orgYear.guid,
    label: orgYear.organization.name
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
        <Button 
          onClick={() => {
            onChange(organizationYearGuid, badgeNumber, claimType)
          }}
          >
            Add
          </Button>
        </Modal.Footer>
    </Modal>
  )
}

//add something to prevent a user from removing themselves... Cause they totally could fuck it up like that
export default (): JSX.Element => {
  document.title = 'GT - Config / Auth'
  const [users, setUsers] = useState<User[]>([])
  const [organizationYears, setOrganizations] = useState<DropdownOption[]>([])
  const [show, setShow] = useState<boolean>(false)
  const [userHasChanged, setUserHasChanged] = useState<{user: string, action: 'added' | 'removed'}>() 
  const columns: Column[] = useMemo(() => createColumns(deleteUserAsync), [users])

  function fetchUsersAsync(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      api
        .get<User[]>('developer/authentication', { params: {
          yearGuid: AxiosIdentityConfig.identity.yearGuid
        }})
        .then(res => {
          resolve(res.data)
        })
        .catch(err => {reject()})
    })
  }
  
  function addUserAsync (organizationYearGuid, badgeNumber, claimType) {

    return new Promise((resolve, reject) => {
      api
        .post('user', { 
          organizationYearGuid,
          badgeNumber, 
          claimType 
        })
        .then(res => {
          resolve(res)
          setUserHasChanged({user: 'A new user', action: 'added'})
        })
        .catch(err => reject(err))
        .finally(() => setShow(false))
    })
  }

  function deleteUserAsync (userGuid: string): void {
    const user: User | undefined = users.find(user => user.userOrganizationYearGuid === userGuid)
    api
      .delete(`user?userOrganizationYearGuid=${userGuid}`)
      .then(res => {
        setUserHasChanged({user: `${user?.firstName} ${user?.lastName}`, action: 'removed'})
      })
      .catch(err => {})
  }
  
  useEffect(() => {
    fetchUsersAsync().then(res => {setUsers(res)})

      api
        .get('/developer/organizationYear', { params: {
          yearGuid: AxiosIdentityConfig.identity.yearGuid, 
        }})
        .then(res => {
          setOrganizations(res.data)
        })
  }, [AxiosIdentityConfig.identity.yearGuid])

  useEffect(() => {
    fetchUsersAsync()
      .then(res => {
        setUsers(res)
        window.scrollTo(0, 0)
      })
  }, [userHasChanged])

  return (
    <div>
      <Button className='my-3' onClick={() => setShow(true)}>Add User</Button>
      {userHasChanged?.user ? <Alert variant='success'>{userHasChanged.user} has been {userHasChanged.action}.</Alert> : null}
      <Table dataset={users} columns={columns} rowProps={{key: 'userOrganizationYearGuid'}} />
      <AddUserModal
        organizationYears={organizationYears}
        show={show}
        setShow={() => setShow(false)}
        onChange={addUserAsync}
      />
    </div>
  )
}
