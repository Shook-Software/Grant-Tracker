import { Link } from 'react-router-dom'

import { DataTable } from 'components/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from '@/components/ui/table'

import { StudentRegistrationView } from 'Models/StudentRegistration'
import { Button } from '@/components/ui/button'
import { Clock, ExternalLink } from 'lucide-react'
import { DayOfWeek } from '@/Models/DayOfWeek'
import TimeRecordDisplay from '@/components/ui/TimeRecordDisplay'

interface Props {
  registrations: StudentRegistrationView[]
}

const registrationColumns: ColumnDef<StudentRegistrationView, any>[] = [
  {
    accessorKey: "sessionName",
    header: ({ column }) => (
      <HeaderCell 
        label="Session" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    cell: ({ row }) => (
      <Button variant="link" className="h-auto p-0 text-left justify-start font-normal" asChild>
        <Link 
          to={`/home/admin/sessions/${row.original.sessionGuid}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {row.original.sessionName}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </Button>
    ),
    id: 'sessionName'
  },
  {
    accessorKey: "schedule",
    header: () => (
      <div className="flex items-center gap-2 h-full">
        <Clock className="h-4 w-4" />
        Schedule
      </div>
    ),
    cell: ({ row }) => {
      const schedule = row.original.schedule
      
      if (!schedule || schedule.length === 0) {
        return (
          <div className="text-muted-foreground text-sm italic">
            No schedule configured
          </div>
        )
      }

      const sortedDays = schedule.sort((curr, next) => DayOfWeek.toInt(curr.dayOfWeek) - DayOfWeek.toInt(next.dayOfWeek))

      return (
        <div className="space-y-2">
          {sortedDays.map((day, index) => (
            <div key={index} className="flex gap-3">
              <div className="text-sm font-medium text-muted-foreground w-[80px]">
                {day.dayOfWeek}
              </div>
              <div className="flex flex-wrap gap-1">
                {day.timeSchedules.map((timeSchedule, timeIndex) => (
                  <TimeRecordDisplay timeRecords={[timeSchedule]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    },
    enableSorting: false,
    id: 'schedule'
  }
]

export default ({ registrations }: Props): JSX.Element => {
  if (!registrations || registrations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No registrations found
      </div>
    )
  }

  return (
    <DataTable
      columns={registrationColumns}
      data={registrations}
      emptyMessage="No registrations found"
      initialSorting={[{ id: 'sessionName', desc: false }]}
      containerClassName="w-full"
    />
  )
}

/*
<div className='d-flex items-center pb-3'>
        <Button
          variant='outline-dark'
          size='sm'
          onClick={() => setWeekPrevious()}
        >
          Prev
        </Button>
        <div className='mx-3'>{getWeekBounds(weekStartDate)}</div>
        <Button variant='outline-dark' size='sm' onClick={() => setWeekNext()}>
          Next
        </Button>
      </div>

*/
