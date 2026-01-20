import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ComboboxDropdownMenu, ComboboxDropdownMenuItem, ComboboxDropdownMenuItemClassName } from 'components/Dropdown'
import Alert, { ApiResult } from 'components/ApiResultAlert'


import { SessionView } from 'Models/Session'
import { IdentityClaim, User } from 'utils/authentication'
import paths from 'utils/routing/paths'
import api from 'utils/api'

interface Props {
  session: SessionView
  attendanceApiResult: ApiResult
  user: User
}

export default ({ session, attendanceApiResult, user }: Props): JSX.Element => {
  const navigate = useNavigate()
  const [showDeletionModal, setShowDeletionModal] = useState<boolean>(false)

  function handleSessionDeletion (deleteSession: boolean): void {
    if (deleteSession) {
      api
        .delete(`session/${session.guid}`)
        .then(() => navigate('/home/admin/sessions'))
        .catch()
    }
    setShowDeletionModal(false)
  }

  function openDeleteDialog() {
    setShowDeletionModal(true)
  }

  function closeDeleteDialog() {
    setShowDeletionModal(false)
  }

  return (
    <header className="space-y-4">
      {/* Alert Section */}
      <div className="text-lg font-semibold">
        <Alert apiResult={attendanceApiResult} />
      </div>
      
      {/* Session Title and Actions */}
      <div className='flex justify-center items-center gap-4'>
        <h1 className='text-4xl font-bold text-center sm:text-left'>
          {session!.name}
        </h1>

        <ComboboxDropdownMenu>
          <div className={ComboboxDropdownMenuItemClassName}>
            <Link 
              className='block w-full' 
              to={`${paths.Admin.path}/${paths.Admin.Tabs.Sessions.path}`}
              aria-label="Close session details and return to sessions list"
            >
              Close
            </Link>
          </div>

          {user.claim !== IdentityClaim.Teacher && (
            <div className={ComboboxDropdownMenuItemClassName}>
              <Link
                className='block w-full'
                to={`?edit=true`}
                aria-label={`Edit ${session.name} session`}
              >
                Edit
              </Link>
            </div>
          )}
              
          <ComboboxDropdownMenuItem 
            variant='destructive'
            label='Delete'
            onClick={() => openDeleteDialog()}
          />
        </ComboboxDropdownMenu>
        
        <RemoveSessionModal 
          sessionGuid={session.guid} 
          session={session} 
          show={showDeletionModal} 
          handleClose={handleSessionDeletion} 
        />
      </div>
    </header>
  )
}

const RemoveSessionModal = ({ sessionGuid, session, show, handleClose }): JSX.Element => {
  const [deletionAllowed, setStatus] = useState<boolean>(false)

  useEffect(() => {
    if (show) {
      api
        .get(`session/${sessionGuid}/status`)
        .then(res => {
          setStatus(res.data || false)
        })
        .catch()
    }
  }, [sessionGuid, show])

  const message = deletionAllowed
    ? 'Are you sure you want to delete this session from your organization? This action cannot be undone.'
    : 'This session cannot be deleted because attendance records exist for it. Please remove all attendance records first if you wish to delete this session.'

  return (
    <Dialog open={show} onOpenChange={() => handleClose(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-red-600'>
            Delete {session?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className='py-4'>
          <p className='text-sm text-gray-700'>{message}</p>
        </div>

        <DialogFooter>
          <Button variant='secondary' onClick={() => handleClose(false)}>
            Cancel
          </Button>
          {deletionAllowed && (
            <Button 
              variant='destructive' 
              onClick={() => handleClose(true)}
            >
              Delete Session
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
