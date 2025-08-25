import { useState, useEffect, useMemo } from 'react'

import { DataTable } from 'components/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from 'components/ui/table'
import { Button } from 'components/ui/button'
import Dropdown from 'components/Input/Dropdown'

import { DropdownOption } from 'Models/Session'

import { User } from 'utils/authentication'
import api from 'utils/api'
import { Trash } from 'lucide-react'

interface UserDeletionProps {
  user: User
  handleChange: (userIsDeleted: boolean) => void
}

const ConfirmDeletionPopover = ({user, handleChange}: UserDeletionProps): JSX.Element => (
  <div 
    className="absolute right-full top-0 w-max bg-white border border-gray-300 rounded shadow-lg p-4 z-50"
  >
    <h3 className="text-lg font-semibold mb-2">{user.firstName} {user.lastName}</h3>
    <div className="mb-3">
      <div>
        Are you sure you want to delete this user?
      </div>
      <div className='flex justify-between mt-3'>
        <Button 
          size='sm'
          onClick={() => {handleChange(true)}}
        >
          Confirm
        </Button>
        <Button 
          size='sm'
          variant='secondary'
          onClick={() => {handleChange(false)}}
        >
          Cancel
        </Button>
      </div>
    </div>
  </div>
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
    <div className='relative'>
      <Button 
        variant='destructive'
        size='sm'
        className='w-full'
        onClick={(e) => setShowPopup(!showPopup)}
        aria-label={`Delete ${user.firstName} ${user.lastName} from ${user.organizationName}`}
        aria-haspopup="dialog"
      >
        <Trash aria-hidden />
      </Button>
      {showPopup ? <ConfirmDeletionPopover user={user} handleChange={(userIsDeleted: boolean) => handleChange(userIsDeleted)} /> : null}
    </div>
  )
}

const createColumns = (onChange): ColumnDef<User, any>[] => ([
  {
    id: 'firstName',
    header: ({ column }) => (
      <HeaderCell 
        label='First Name'
        sort={column.getIsSorted() === "asc" ? "asc" : column.getIsSorted() === "desc" ? "desc" : false}
        onSortClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    accessorKey: 'firstName',
    enableSorting: true
  },{
    id: 'lastName',
    header: ({ column }) => (
      <HeaderCell 
        label='Last Name'
        sort={column.getIsSorted() === "asc" ? "asc" : column.getIsSorted() === "desc" ? "desc" : false}
        onSortClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    accessorKey: 'lastName',
    enableSorting: true
  },
  {
    id: 'badgeNumber',
    header: ({ column }) => (
      <HeaderCell 
        label='Badge Number'
        sort={column.getIsSorted() === "asc" ? "asc" : column.getIsSorted() === "desc" ? "desc" : false}
        onSortClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    accessorKey: 'badgeNumber',
    enableSorting: true
  },
  {
    id: 'organizationName',
    header: ({ column }) => (
      <HeaderCell 
        label='Organization Name'
        sort={column.getIsSorted() === "asc" ? "asc" : column.getIsSorted() === "desc" ? "desc" : false}
        onSortClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    accessorKey: 'organization.name',
    enableSorting: true
  },
  {
    id: 'userType',
    header: ({ column }) => (
      <HeaderCell 
        label='User Type'
        sort={column.getIsSorted() === "asc" ? "asc" : column.getIsSorted() === "desc" ? "desc" : false}
        onSortClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    accessorKey: 'claim',
    enableSorting: true,
    cell: ({ row }) => row.original.claim === 0 ? 'Administrator' : 'Coordinator'
  },
  {
    id: 'actions',
    header: () => <HeaderCell label='Actions' />,
    accessorKey: 'userOrganizationYearGuid',
    enableSorting: false,
    cell: ({ row }) => <DeleteUserComponent user={row.original} onChange={onChange} />
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
    <>
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h3>Add Coordinator</h3>
              <Button variant='ghost' size='sm' onClick={() => setShow(false)}>×</Button>
            </div>
            <div className="p-4">
              <form>
                <div className="mb-4">
                  <label htmlFor='org-dropdown' className="block text-sm font-medium mb-2">Organization</label>
                  <Dropdown
                    id='org-dropdown'
                    options={options}
                    value={organizationYearGuid}
                    onChange={(guid: string) => setOrganizationYearGuid(guid)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor='claim-dropdown' className="block text-sm font-medium mb-2">User Type</label>
                  <Dropdown
                    id='claim-dropdown'
                    options={claimOptions}
                    value={claimType}
                    onChange={(guid: string) => setClaimType(guid)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor='coordinator-badge-number' className="block text-sm font-medium mb-2">Badge Number</label>
                  <input type='text' className="w-full px-3 py-2 border border-gray-300 rounded-md" value={badgeNumber} onChange={(event) => setBadgeNumber(event.target.value)} />
                  <small className='text-gray-500'>6 digits, including leading zeros.</small>
                </div>
              </form>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button 
                onClick={() => {
                  onChange(organizationYearGuid, badgeNumber, claimType)
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

//add something to prevent a user from removing themselves... Cause they totally could fuck it up like that
export default (): JSX.Element => {
  document.title = 'GT - Config / Auth'
  const [users, setUsers] = useState<User[]>([])
  const [organizationYears, setOrganizations] = useState<DropdownOption[]>([])
  const [show, setShow] = useState<boolean>(false)
  const [userHasChanged, setUserHasChanged] = useState<{user: string, action: 'added' | 'removed'}>() 
  const columns: ColumnDef<User, any>[] = useMemo(() => createColumns(deleteUserAsync), [users])

  function fetchUsersAsync(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      api
        .get<User[]>('developer/authentication')
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
        .get('/developer/organizationYear')
        .then(res => {
          setOrganizations(res.data)
        })
  }, [])

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
      {userHasChanged?.user ? <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">{userHasChanged.user} has been {userHasChanged.action}.</div> : null}
      <DataTable data={users} columns={columns} initialSorting={[{ id: 'lastName', desc: false }]} className='text-sm' containerClassName='w-full' />
      <AddUserModal
        organizationYears={organizationYears}
        show={show}
        setShow={() => setShow(false)}
        onChange={addUserAsync}
      />
    </div>
  )
}