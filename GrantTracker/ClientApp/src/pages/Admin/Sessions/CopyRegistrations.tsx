import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/Spinner'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'

import { StudentRegistrationDomain } from 'Models/StudentRegistration'

import api from 'utils/api'
import { SimpleSessionView } from 'Models/Session'

interface Props {
  state: SimpleSessionView[]
}

export default ({state}: Props): JSX.Element => {
  const [conflicts, setConflicts] = useState<string[]>([])
  const [status, setStatus] = useState<string>('')
  const [firstSession, setFirstSession] = useState<string>('')
  const [secondSession, setSecondSession] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function handleCopy (): void {
    let studentSchoolYearGuids: string[] = []
    setIsLoading(true)
    setFirstSession('')
    setSecondSession('')

    api
      .get<StudentRegistrationDomain[]>(`session/${firstSession}/student/registration`)
      .then(res => {
        //sorted for ease of display
        studentSchoolYearGuids = res.data.map(i => i.studentSchoolYear.guid).filter((guid, index, self) => self.indexOf(guid) === index)

        //we should change this to post to the existing registration, and modify it here to fit the registrations, or in the modal we eventually create
        api
          .post(`session/${secondSession}/registration/copy`, studentSchoolYearGuids)
          .then(res => {
            setStatus('Attendance was successfully copied!')
            setConflicts([])
          })
          .catch(err => {
            setStatus('')
            setConflicts(err.response.data)
          })
      })
      .catch(err => {
        console.warn(err)
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-12 gap-4 items-end'>
        <div className='md:col-span-4 space-y-2'>
          <Label htmlFor='from-session'>Copy From Session</Label>
          <Combobox
            id='from-session'
            value={firstSession}
            options={state.map(s => ({
              value: s.sessionGuid,
              label: s.name
            }))}
            onChange={(value: string) => setFirstSession(value)}
            placeholder='Search source session...'
            emptyText='No sessions found'
          />
        </div>
        <div className='md:col-span-4 space-y-2'>
          <Label htmlFor='to-session'>Copy To Session</Label>
          <Combobox
            id='to-session'
            value={secondSession}
            options={state.map(s => ({
              value: s.sessionGuid,
              label: s.name
            }))}
            onChange={(value: string) => setSecondSession(value)}
            placeholder='Search destination session...'
            emptyText='No sessions found'
          />
        </div>
        <div className='md:col-span-4'>
          <Button 
            className='w-full md:w-auto'
            disabled={!(firstSession !== '' && secondSession !== '')}
            onClick={() => handleCopy()}
          >
            Copy Registrations
          </Button>
        </div>
      </div>
      
      <div className='mt-4'>
        {isLoading ? (
          <div className='flex items-center gap-2'>
            <Spinner size='sm' />
            <span className='text-sm text-gray-600'>Copying registrations...</span>
          </div>
        ) : (
          <div className='space-y-3'>
            {status && (
              <div className='text-green-600 font-medium'>{status}</div>
            )}
            <ConflictsDisplay conflicts={conflicts} />
          </div>
        )}
      </div>
    </div>
  )
}


const ConflictsDisplay = ({conflicts}: {conflicts: string[]}): JSX.Element => {
  if (!conflicts || conflicts.length === 0)
    return <></>

  return (
    <div className='space-y-2'>
      <h5 className='text-red-600 font-medium'>Conflicts:</h5>
      <div className='bg-red-50 border border-red-200 rounded-md p-3 space-y-1'>
        {conflicts.map((conflict, index) => (
          <div key={index} className='text-red-700 text-sm'>{conflict}</div>
        ))}
      </div>
    </div>
  )
}