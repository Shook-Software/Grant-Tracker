import { useState, forwardRef, useRef, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { DataTable } from 'components/DataTable'
import { HeaderCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Alert, { ApiResult } from 'components/ApiResultAlert'
import Search from './StudentSearchForm'

import { DayScheduleView } from 'Models/DaySchedule'
import api from 'utils/api'

const StudentAddConfirmation = ({ values, handleAddStudent, open, onOpenChange }): JSX.Element => {
  const fullName: string = `${values.student.firstName} ${values.student.lastName}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Add Student to Session</DialogTitle>
          <DialogDescription>
            Are you sure you want to add <strong>{fullName}</strong> to this session?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            size='sm' 
            variant='secondary' 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size='sm'
            onClick={() => {
              handleAddStudent(values)
              onOpenChange(false)
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// StudentSearchTable Component
interface StudentSearchTableProps {
  data: any[]
  onAddStudent: (student: any) => void
  scheduleLength: number
}

const StudentSearchTable = ({ data, onAddStudent, scheduleLength }: StudentSearchTableProps): JSX.Element => {
  const [confirmingStudent, setConfirmingStudent] = useState<any>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'student.firstName',
      header: () => <HeaderCell label="First Name" />,
    },
    {
      accessorKey: 'student.lastName',
      header: () => <HeaderCell label="Last Name" />,
    },
    {
      accessorKey: 'grade',
      header: () => <HeaderCell label="Grade" />,
      cell: ({ row }) => (
        <div className='text-center'>{row.original.grade}</div>
      )
    },
    {
      accessorKey: 'student.matricNumber',
      header: () => <HeaderCell label="Matric Number" />,
    },
    {
      header: 'Add',
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <Button 
            size='sm'
            disabled={scheduleLength === 0}
            onClick={() => {
              setConfirmingStudent(row.original)
              setPopoverOpen(true)
            }}
            aria-label={`Add ${row.original.student.firstName} ${row.original.student.lastName} to session`}
          >
            Add
          </Button>
        </div>
      ),
      id: 'actions'
    }
  ]

  return (
    <>
      <DataTable
        containerClassName='w-full'
        columns={columns}
        data={data}
        emptyMessage="No students found. Try adjusting your search criteria."
      />
      
      {/* Add Student Confirmation Dialog */}
      {confirmingStudent && (
        <StudentAddConfirmation
          values={confirmingStudent}
          handleAddStudent={onAddStudent}
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
        />
      )}
    </>
  )
}

const Schedule = ({scheduling, schedule, setSchedule}): JSX.Element => {
  if (!scheduling)
    return <></>

  return (
    <div className='space-y-3'>
      <Label className='text-sm font-medium'>Add student to the following weekday(s):</Label>
      <div className='flex flex-wrap gap-4 sm:gap-6'>
        {scheduling?.map(day => (
          <div key={day.dayOfWeek} className='flex items-center space-x-2 min-w-fit'>
            <Checkbox
              id={`schedule-${day.dayOfWeek}`}
              checked={schedule.includes(day.dayScheduleGuid)}
              onCheckedChange={(checked) => {
                if (checked)
                  setSchedule([...schedule, day.dayScheduleGuid])
                else
                  setSchedule(schedule.filter(item => item !== day.dayScheduleGuid))
              }}
            />
            <Label 
              htmlFor={`schedule-${day.dayOfWeek}`}
              className='cursor-pointer font-normal text-sm'
            >
              {day.dayOfWeek}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  orgYearGuid: string
  show: boolean
  handleClose: () => void
  handleChange: (value: any, ) => Promise<any>
  scheduling: DayScheduleView[] | null
}

//refactor handleChange to do something, that way we can reuse this component
export default ({
  orgYearGuid,
  show,
  handleClose,
  handleChange,
  scheduling
}: Props): JSX.Element => {
  const [state, setState] = useState<any[]>([])
  const [schedule, setSchedule] = useState<string[]>([])
  const [apiResult, setApiResult] = useState<ApiResult>()
  const tableRef: React.Ref<HTMLDivElement | null> = useRef(null)

  async function addStudent (student): Promise<void> {
    const fullName: string = `${student.student.firstName} ${student.student.lastName}`

    if (student.guid.replaceAll('-', '').replaceAll('0', '') == '') {
      var result = await api.post(`student?orgYearGuid=${orgYearGuid}`, {
        firstName: student.student.firstName,
        lastName: student.student.lastName,
        matricNumber: student.student.matricNumber,
        grade: student.grade
      })
      student.guid = result.data
    }

    handleChange({student, schedule})
      ?.then(res => {
        setApiResult({
          label: fullName,
          success: true
        })
      })
      ?.catch(err => {
        setApiResult({
          label: fullName,
          success: false
        })
      })
  }

  useEffect(() => {
    if (scheduling)
      setSchedule(scheduling.map(day => day.dayScheduleGuid))
  }, [])

  useEffect(() => {
    if (tableRef && tableRef.current) {
      tableRef.current.scrollIntoView()
    }
  }, [state.length])

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Register Students</DialogTitle>
        </DialogHeader>
        
        <div className='flex-1 overflow-auto'>
          <div className='space-y-6 px-1'>
            {/* Alert and Search Section */}
            <div className='space-y-4'>
              <Alert apiResult={apiResult} />
              <Search orgYearGuid={orgYearGuid} handleChange={setState} />
            </div>
            
            {/* Schedule Selection */}
            <div className='border-t pt-4'>
              <Schedule scheduling={scheduling} schedule={schedule} setSchedule={setSchedule} />
            </div>
            
            {/* Students Table */}
            <div className='border-t pt-4' ref={tableRef}>
              <div className='mb-4'>
                <Label className='text-sm font-medium'>Search Results</Label>
                {state.length > 0 && (
                  <p className='text-sm text-muted-foreground mt-1'>
                    Found {state.length} student{state.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <StudentSearchTable
                data={state}
                onAddStudent={addStudent}
                scheduleLength={scheduling ? schedule.length : 99}
              />
            </div>
          </div>
        </div>

        <DialogFooter className='border-t pt-4'>
          <Button variant='secondary' onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

//
